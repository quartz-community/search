import FlexSearch from "flexsearch";
import {
  removeAllChildren,
  normalizeRelativeURLs,
  registerEscapeHandler,
} from "@quartz-community/utils";

interface Item {
  id: number;
  slug: string;
  title: string;
  content: string;
  tags: string[];
  [key: string]: any;
}

type SearchType = "basic" | "tags";
let searchType: SearchType = "basic";
let currentSearchTerm: string = "";
const numSearchResults = 8;
const numTagResults = 5;
const contextWindowWords = 30;

const encoder = (str: string): string[] => {
  const tokens: string[] = [];
  let bufferStart = -1;
  let bufferEnd = -1;
  const lower = str.toLowerCase();
  let i = 0;

  for (const char of lower) {
    const code = char.codePointAt(0)!;

    const isCJK =
      (code >= 0x3040 && code <= 0x309f) ||
      (code >= 0x30a0 && code <= 0x30ff) ||
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0xac00 && code <= 0xd7af) ||
      (code >= 0x20000 && code <= 0x2a6df);

    const isWhitespace = code === 32 || code === 9 || code === 10 || code === 13;

    if (isCJK) {
      if (bufferStart !== -1) {
        tokens.push(lower.slice(bufferStart, bufferEnd));
        bufferStart = -1;
      }
      tokens.push(char);
    } else if (isWhitespace) {
      if (bufferStart !== -1) {
        tokens.push(lower.slice(bufferStart, bufferEnd));
        bufferStart = -1;
      }
    } else {
      if (bufferStart === -1) bufferStart = i;
      bufferEnd = i + 1;
    }
    i += char.length;
  }

  if (bufferStart !== -1) {
    tokens.push(lower.slice(bufferStart));
  }

  return tokens;
};

const index = new FlexSearch.Document({
  encode: encoder,
  document: {
    id: "id",
    tag: "tags",
    index: [
      { field: "title", tokenize: "forward" },
      { field: "content", tokenize: "forward" },
      { field: "tags", tokenize: "forward" },
    ],
  },
});

let contentData: Record<string, Item> | null = null;
let idDataMap: string[] = [];
const fetchContentCache = new Map<string, Element[]>();
const parser = new DOMParser();

async function fetchContent(slug: string): Promise<Element[]> {
  if (fetchContentCache.has(slug)) {
    return fetchContentCache.get(slug) as Element[];
  }
  const targetUrl = new URL("/" + slug, window.location.origin).toString();
  const contents = await fetch(targetUrl)
    .then((res) => res.text())
    .then((contents) => {
      const html = parser.parseFromString(contents ?? "", "text/html");
      normalizeRelativeURLs(html, targetUrl);
      return Array.from(html.getElementsByClassName("popover-hint"));
    });
  fetchContentCache.set(slug, contents);
  return contents;
}

const cleanupFns: Array<() => void> = [];

function addCleanup(fn: () => void) {
  cleanupFns.push(fn);
}

function runCleanups() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns.length = 0;
}

async function setupSearch() {
  const searchElements = document.querySelectorAll(".search");

  for (const searchEl of Array.from(searchElements)) {
    const container = searchEl.querySelector(".search-container") as HTMLElement | null;
    const searchButton = searchEl.querySelector(".search-button");
    const searchBar = searchEl.querySelector(".search-bar") as HTMLInputElement;
    const searchLayout = searchEl.querySelector(".search-layout");

    if (!container || !searchButton || !searchBar || !searchLayout) continue;

    const enablePreview = searchLayout.getAttribute("data-preview") === "true";

    let results = searchLayout.querySelector(".results-container") as HTMLDivElement | null;
    if (!results) {
      results = document.createElement("div");
      results.className = "results-container";
      searchLayout.appendChild(results);
    }

    let preview = searchLayout.querySelector(".preview-container") as HTMLDivElement | null;
    if (enablePreview && !preview) {
      preview = document.createElement("div");
      preview.className = "preview-container";
      searchLayout.appendChild(preview);
    }

    let currentHover: HTMLElement | null = null;
    let previewToken = 0;

    const hideSearch = () => {
      console.log("[Search] hideSearch called, stack:", new Error().stack);
      container.classList.remove("active");
      searchBar.value = "";
      removeAllChildren(results!);
      if (preview) removeAllChildren(preview);
      searchLayout.classList.remove("display-results");
      searchType = "basic";
      currentHover = null;
    };

    const showSearch = (type: SearchType) => {
      console.log("[Search] showSearch called, type:", type);
      searchType = type;
      container.classList.add("active");
      console.log("[Search] container.classList after add:", container.classList.toString());
      searchBar.focus();
      console.log(
        "[Search] focus called, container active:",
        container.classList.contains("active"),
      );
    };

    const displayResults = async (finalResults: any[]) => {
      removeAllChildren(results);

      if (finalResults.length === 0) {
        results.innerHTML =
          '<a class="result-card no-match"><h3>No results.</h3><p>Try another search term?</p></a>';
        currentHover = null;
        if (preview) removeAllChildren(preview);
      } else {
        for (const item of finalResults) {
          const htmlTags =
            item.tags.length > 0 ? '<ul class="tags">' + item.tags.join("") + "</ul>" : "";
          const itemTile = document.createElement("a");
          itemTile.className = "result-card";
          itemTile.id = item.slug;
          itemTile.href = "/" + item.slug;
          itemTile.innerHTML =
            '<h3 class="card-title">' +
            item.title +
            "</h3>" +
            htmlTags +
            '<p class="card-description">' +
            item.content +
            "</p>";
          itemTile.addEventListener("click", (e) => {
            if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
            hideSearch();
          });
          itemTile.addEventListener("mouseenter", () => {
            setFocus(itemTile);
          });
          results.appendChild(itemTile);
        }
      }
    };

    const getResultElements = (): HTMLElement[] => {
      return Array.from(results.querySelectorAll<HTMLElement>(".result-card:not(.no-match)"));
    };

    const highlightTerm = () => {
      return searchType === "tags" ? currentSearchTerm.substring(1).trim() : currentSearchTerm;
    };

    const updatePreview = async (el: HTMLElement | null) => {
      if (!preview) return;
      removeAllChildren(preview);
      if (!el) return;
      const slug = el.id;
      const token = ++previewToken;
      const contents = await fetchContent(slug);
      if (token !== previewToken) return;
      const term = highlightTerm();
      for (const contentEl of contents) {
        const cloned = contentEl.cloneNode(true) as HTMLElement;
        if (term.trim() !== "") {
          cloned.innerHTML = highlightHTML(term, cloned);
        }
        preview.appendChild(cloned);
      }
    };

    const setFocus = (el: HTMLElement | null) => {
      if (currentHover) currentHover.classList.remove("focus");
      currentHover = el;
      if (currentHover) currentHover.classList.add("focus");
      updatePreview(currentHover);
    };

    const focusByIndex = (index: number) => {
      const resultElements = getResultElements();
      if (resultElements.length === 0) {
        setFocus(null);
        return;
      }
      const clamped = Math.min(Math.max(index, 0), resultElements.length - 1);
      setFocus(resultElements[clamped] ?? null);
    };

    const focusNext = () => {
      const resultElements = getResultElements();
      if (resultElements.length === 0) return;
      const currentIndex = currentHover ? resultElements.indexOf(currentHover) : -1;
      focusByIndex(currentIndex + 1);
    };

    const focusPrevious = () => {
      const resultElements = getResultElements();
      if (resultElements.length === 0) return;
      const currentIndex = currentHover
        ? resultElements.indexOf(currentHover)
        : resultElements.length;
      focusByIndex(currentIndex - 1);
    };

    const onType = async (e: Event) => {
      currentSearchTerm = (e.target as HTMLInputElement).value;
      searchLayout.classList.toggle("display-results", currentSearchTerm !== "");
      searchType = currentSearchTerm.startsWith("#") ? "tags" : "basic";

      if (currentSearchTerm === "") {
        removeAllChildren(results);
        if (preview) removeAllChildren(preview);
        currentHover = null;
        return;
      }

      const query = currentSearchTerm;
      let searchResults: any[];

      if (searchType === "tags") {
        const tagQuery = currentSearchTerm.substring(1).trim();
        searchResults = await index.searchAsync({
          query: tagQuery,
          limit: numSearchResults,
          index: ["tags"],
        });
      } else {
        searchResults = await index.searchAsync({
          query,
          limit: numSearchResults,
          index: ["title", "content"],
        });
      }

      const allIds = new Set<number>();
      for (const fieldResult of searchResults) {
        if (fieldResult && fieldResult.result) {
          for (const id of fieldResult.result) {
            allIds.add(id as number);
          }
        }
      }

      const finalResults: any[] = [];
      allIds.forEach((id) => {
        finalResults.push(formatForDisplay(currentSearchTerm, id));
      });

      await displayResults(finalResults.slice(0, numSearchResults));
      const resultElements = getResultElements();
      setFocus(resultElements[0] ?? null);
    };

    const onButtonClick = (e: Event) => {
      console.log(
        "[Search] Button click event, target:",
        e.target,
        "currentTarget:",
        e.currentTarget,
      );
      e.stopPropagation();
      showSearch("basic");
    };
    searchButton.addEventListener("click", onButtonClick);
    addCleanup(() => searchButton.removeEventListener("click", onButtonClick));

    searchBar.addEventListener("input", onType);
    addCleanup(() => searchBar.removeEventListener("input", onType));

    const onSearchBarKeydown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || (e.shiftKey && e.key === "Tab")) {
        e.preventDefault();
        focusPrevious();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "Tab") {
        e.preventDefault();
        focusNext();
        return;
      }
      if (e.key === "Enter") {
        const focused = currentHover;
        if (focused instanceof HTMLAnchorElement) {
          hideSearch();
          window.location.href = focused.href;
        }
      }
    };
    searchBar.addEventListener("keydown", onSearchBarKeydown);
    addCleanup(() => searchBar.removeEventListener("keydown", onSearchBarKeydown));

    const onDocumentKeydown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        container.classList.contains("active") ? hideSearch() : showSearch("basic");
      } else if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        showSearch("tags");
        searchBar.value = "#";
      }
    };
    document.addEventListener("keydown", onDocumentKeydown);
    addCleanup(() => document.removeEventListener("keydown", onDocumentKeydown));

    const cleanupEscapeHandler = registerEscapeHandler(container, hideSearch);
    addCleanup(cleanupEscapeHandler);
  }
}

function tokenizeTerm(term: string): string[] {
  const tokens = term.split(/\s+/).filter((t) => t.trim() !== "");
  const tokenLen = tokens.length;
  if (tokenLen > 1) {
    for (let i = 1; i < tokenLen; i++) {
      tokens.push(tokens.slice(0, i + 1).join(" "));
    }
  }
  return tokens.sort((a, b) => b.length - a.length);
}

function highlightHTML(searchTerm: string, el: HTMLElement): string {
  const tokenizedTerms = tokenizeTerm(searchTerm).filter((term) => term.trim() !== "");
  if (tokenizedTerms.length === 0) return el.innerHTML;
  const html = parser.parseFromString(el.innerHTML, "text/html");
  const combined = tokenizedTerms
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  if (combined === "") return el.innerHTML;
  const regex = new RegExp(combined, "gi");
  const walker = html.createTreeWalker(html.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Text | null = walker.nextNode() as Text | null;
  while (node) {
    nodes.push(node);
    node = walker.nextNode() as Text | null;
  }
  for (const textNode of nodes) {
    const text = textNode.nodeValue ?? "";
    regex.lastIndex = 0;
    if (!regex.test(text)) continue;
    regex.lastIndex = 0;
    const fragment = html.createDocumentFragment();
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        fragment.appendChild(html.createTextNode(text.slice(lastIndex, match.index)));
      }
      const span = html.createElement("span");
      span.className = "highlight";
      span.textContent = match[0];
      fragment.appendChild(span);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      fragment.appendChild(html.createTextNode(text.slice(lastIndex)));
    }
    textNode.parentNode?.replaceChild(fragment, textNode);
  }
  return html.body.innerHTML;
}

function highlight(searchTerm: string, text: string, trim?: boolean): string {
  const tokenizedTerms = tokenizeTerm(searchTerm);
  const tokenizedText = text.split(/\s+/).filter((t) => t !== "");

  let startIndex = 0;
  let endIndex = tokenizedText.length - 1;

  if (trim) {
    const includesCheck = (tok: string) => {
      return tokenizedTerms.some((term) => tok.toLowerCase().startsWith(term.toLowerCase()));
    };
    const occurrencesIndices = tokenizedText.map(includesCheck);

    let bestSum = 0;
    let bestIndex = 0;
    for (let i = 0; i < Math.max(tokenizedText.length - contextWindowWords, 0); i++) {
      const window = occurrencesIndices.slice(i, i + contextWindowWords);
      const windowSum = window.reduce((total, cur) => total + (cur ? 1 : 0), 0);
      if (windowSum >= bestSum) {
        bestSum = windowSum;
        bestIndex = i;
      }
    }

    startIndex = Math.max(bestIndex - contextWindowWords / 2, 0);
    endIndex = Math.min(startIndex + contextWindowWords, tokenizedText.length - 1);
  }

  const slice = tokenizedText
    .map((tok) => {
      let result = tok;
      for (const searchTok of tokenizedTerms) {
        if (tok.toLowerCase().includes(searchTok.toLowerCase())) {
          const regex = new RegExp(searchTok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
          result = tok.replace(regex, (match) => `<span class="highlight">${match}</span>`);
          break;
        }
      }
      return result;
    })
    .join(" ");

  return (
    (startIndex === 0 ? "" : "...") + slice + (endIndex === tokenizedText.length - 1 ? "" : "...")
  );
}

function highlightTags(term: string, tags?: string[]): string[] {
  if (!tags || searchType !== "tags") return [];
  return tags
    .map((tag) => {
      if (tag.toLowerCase().includes(term.toLowerCase())) {
        return `<li><p class="match-tag">#${tag}</p></li>`;
      } else {
        return `<li><p>#${tag}</p></li>`;
      }
    })
    .slice(0, numTagResults);
}

function formatForDisplay(term: string, id: number): any {
  const slug = idDataMap[id];
  if (!slug || !contentData) {
    return {
      id,
      slug: "",
      title: "",
      content: "",
      tags: [],
    };
  }
  const data = contentData[slug];
  if (!data) {
    return {
      id,
      slug,
      title: "",
      content: "",
      tags: [],
    };
  }
  return {
    id: id,
    slug: slug,
    title: searchType === "tags" ? data.title : highlight(term, data.title || ""),
    content: highlight(term, data.content || "", true),
    tags: highlightTags(term.substring(1), data.tags),
  };
}

async function fillDocument() {
  if (!contentData) return;
  let id = 0;
  for (const slug of Object.keys(contentData)) {
    const fileData = contentData[slug];
    if (!fileData) continue;
    idDataMap[id] = slug;
    await index.addAsync(id, {
      id: id,
      slug: slug,
      title: fileData.title || "",
      content: fileData.content || "",
      tags: fileData.tags || [],
    });
    id++;
  }
}

async function fetchContentIndex(): Promise<Record<string, Item>> {
  const response = await fetch("/static/contentIndex.json");
  const data = await response.json();
  return data.content || data;
}

let indexInitialized = false;

async function initIndex() {
  if (indexInitialized) return;
  contentData = await fetchContentIndex();
  await fillDocument();
  indexInitialized = true;
}

document.addEventListener("nav", async () => {
  runCleanups();
  await initIndex();
  await setupSearch();
});
