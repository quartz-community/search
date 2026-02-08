import FlexSearch from "flexsearch";
import { removeAllChildren } from "../util";

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

async function setupSearch() {
  const searchElements = document.querySelectorAll(".search");

  for (const searchEl of searchElements) {
    const container = searchEl.querySelector(".search-container");
    const searchButton = searchEl.querySelector(".search-button");
    const searchBar = searchEl.querySelector(".search-bar") as HTMLInputElement;
    const searchLayout = searchEl.querySelector(".search-layout");

    if (!container || !searchButton || !searchBar || !searchLayout) continue;

    const enablePreview = searchLayout.getAttribute("data-preview") === "true";
    const results = document.createElement("div");
    results.className = "results-container";
    searchLayout.appendChild(results);

    let preview: HTMLDivElement | null = null;
    if (enablePreview) {
      preview = document.createElement("div");
      preview.className = "preview-container";
      searchLayout.appendChild(preview);
    }

    const hideSearch = () => {
      container.classList.remove("active");
      searchBar.value = "";
      removeAllChildren(results);
      if (preview) removeAllChildren(preview);
      searchLayout.classList.remove("display-results");
      searchType = "basic";
    };

    const showSearch = (type: SearchType) => {
      searchType = type;
      container.classList.add("active");
      searchBar.focus();
    };

    const displayResults = async (finalResults: any[]) => {
      removeAllChildren(results);

      if (finalResults.length === 0) {
        results.innerHTML =
          '<a class="result-card no-match"><h3>No results.</h3><p>Try another search term?</p></a>';
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
          results.appendChild(itemTile);
        }
      }
    };

    const onType = async (e: Event) => {
      currentSearchTerm = (e.target as HTMLInputElement).value;
      searchLayout.classList.toggle("display-results", currentSearchTerm !== "");
      searchType = currentSearchTerm.startsWith("#") ? "tags" : "basic";

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
    };

    searchButton.addEventListener("click", () => showSearch("basic"));
    searchBar.addEventListener("input", onType);

    document.addEventListener("keydown", (e) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        container.classList.contains("active") ? hideSearch() : showSearch("basic");
      } else if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        showSearch("tags");
        searchBar.value = "#";
      } else if (e.key === "Escape" && container.classList.contains("active")) {
        hideSearch();
      }
    });
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
  const data = contentData![slug];
  return {
    id: id,
    slug: slug,
    title: searchType === "tags" ? data.title : highlight(term, data.title || ""),
    content: highlight(term, data.content || "", true),
    tags: highlightTags(term.substring(1), data.tags),
  };
}

async function fillDocument() {
  let id = 0;
  for (const slug in contentData) {
    const fileData = contentData![slug];
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

async function init() {
  contentData = await fetchContentIndex();
  await fillDocument();
  await setupSearch();
}

init();
