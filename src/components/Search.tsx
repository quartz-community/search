import type { VNode, JSX } from "preact";

export interface SearchOptions {
  enablePreview?: boolean;
  placeholder?: string;
  title?: string;
}

export type QuartzComponentProps = {
  ctx: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  externalResources: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  fileData: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  cfg: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  children: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  tree: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  allFiles: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  displayClass?: "mobile-only" | "desktop-only";
} & JSX.IntrinsicAttributes & {
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };

export interface QuartzComponent {
  (props: QuartzComponentProps): VNode;
  css?: string;
  beforeDOMLoaded?: string;
  afterDOMLoaded?: string;
}

const defaultOptions: SearchOptions = {
  enablePreview: true,
  placeholder: "Search for something",
  title: "Search",
};

function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

const searchCSS = `
.search {
  min-width: fit-content;
  max-width: 14rem;
}
@media all and (max-width: 800px) {
  .search {
    flex-grow: 0.3;
  }
}

.search > .search-button {
  background-color: transparent;
  border: 1px var(--lightgray) solid;
  border-radius: 4px;
  font-family: inherit;
  font-size: inherit;
  height: 2rem;
  padding: 0 1rem 0 0;
  display: flex;
  align-items: center;
  text-align: inherit;
  cursor: pointer;
  white-space: nowrap;
  width: 100%;
}

.search > .search-button > p {
  display: inline;
  color: var(--gray);
  text-wrap: unset;
}

.search > .search-button svg {
  cursor: pointer;
  width: 18px;
  min-width: 18px;
  margin: 0 0.5rem;
}

.search > .search-button svg .search-path {
  stroke: var(--darkgray);
  stroke-width: 1.5px;
  transition: stroke 0.5s ease;
}

.search > .search-container {
  position: fixed;
  contain: layout;
  z-index: 999;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  display: none;
  backdrop-filter: blur(4px);
}

.search > .search-container.active {
  display: inline-block;
}

.search > .search-container > .search-space {
  width: 65%;
  margin-top: 12vh;
  margin-left: auto;
  margin-right: auto;
}

@media all and not (min-width: 1200px) {
  .search > .search-container > .search-space {
    width: 90%;
  }
}

.search > .search-container > .search-space > * {
  width: 100%;
  border-radius: 7px;
  background: var(--light);
  box-shadow: 0 14px 50px rgba(27, 33, 48, 0.12), 0 10px 30px rgba(27, 33, 48, 0.16);
  margin-bottom: 2em;
}

.search > .search-container > .search-space > input {
  box-sizing: border-box;
  padding: 0.5em 1em;
  font-family: var(--bodyFont);
  color: var(--dark);
  font-size: 1.1em;
  border: 1px solid var(--lightgray);
}

.search > .search-container > .search-space > input:focus {
  outline: none;
}

.search > .search-container > .search-space > .search-layout {
  display: none;
  flex-direction: row;
  border: 1px solid var(--lightgray);
  flex: 0 0 100%;
  box-sizing: border-box;
}

.search > .search-container > .search-space > .search-layout.display-results {
  display: flex;
}

.search > .search-container > .search-space > .search-layout[data-preview] > .results-container {
  flex: 0 0 min(30%, 450px);
}

@media all and not (max-width: 800px) {
  .search > .search-container > .search-space > .search-layout[data-preview] .result-card > p.preview {
    display: none;
  }

  .search > .search-container > .search-space > .search-layout[data-preview] > div:first-child {
    border-right: 1px solid var(--lightgray);
    border-top-right-radius: unset;
    border-bottom-right-radius: unset;
  }

  .search > .search-container > .search-space > .search-layout[data-preview] > div:last-child {
    border-top-left-radius: unset;
    border-bottom-left-radius: unset;
  }
}

.search > .search-container > .search-space > .search-layout > div {
  height: calc(75vh - 12vh);
  border-radius: 5px;
}

@media all and (max-width: 800px) {
  .search > .search-container > .search-space > .search-layout {
    flex-direction: column;
  }

  .search > .search-container > .search-space > .search-layout > .preview-container {
    display: none !important;
  }

  .search > .search-container > .search-space > .search-layout[data-preview] > .results-container {
    width: 100%;
    height: auto;
    flex: 0 0 100%;
  }
}

.search > .search-container > .search-space > .search-layout .highlight {
  background: color-mix(in srgb, var(--tertiary) 60%, rgba(255, 255, 255, 0));
  border-radius: 5px;
  scroll-margin-top: 2rem;
}

.search > .search-container > .search-space > .search-layout > .preview-container {
  flex-grow: 1;
  display: block;
  overflow: hidden;
  font-family: inherit;
  color: var(--dark);
  line-height: 1.5em;
  font-weight: 400;
  overflow-y: auto;
  padding: 0 2rem;
}

.search > .search-container > .search-space > .search-layout > .preview-container .preview-inner {
  margin: 0 auto;
  width: min(100%, 100%);
}

.search > .search-container > .search-space > .search-layout > .preview-container a[role="anchor"] {
  background-color: transparent;
}

.search > .search-container > .search-space > .search-layout > .results-container {
  overflow-y: auto;
}

.search > .search-container > .search-space > .search-layout > .results-container .result-card {
  overflow: hidden;
  padding: 1em;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid var(--lightgray);
  width: 100%;
  display: block;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
  text-transform: none;
  text-align: left;
  outline: none;
  font-weight: inherit;
}

.search > .search-container > .search-space > .search-layout > .results-container .result-card:hover,
.search > .search-container > .search-space > .search-layout > .results-container .result-card:focus,
.search > .search-container > .search-space > .search-layout > .results-container .result-card.focus {
  background: var(--lightgray);
}

.search > .search-container > .search-space > .search-layout > .results-container .result-card > h3 {
  margin: 0;
}

@media all and not (max-width: 800px) {
  .search > .search-container > .search-space > .search-layout > .results-container .result-card > p.card-description {
    display: none;
  }
}

.search > .search-container > .search-space > .search-layout > .results-container .result-card > ul.tags {
  margin-top: 0.45rem;
  margin-bottom: 0;
}

.search > .search-container > .search-space > .search-layout > .results-container .result-card > ul > li > p {
  border-radius: 8px;
  background-color: var(--highlight);
  padding: 0.2rem 0.4rem;
  margin: 0 0.1rem;
  line-height: 1.4rem;
  font-weight: 700;
  color: var(--secondary);
}

.search > .search-container > .search-space > .search-layout > .results-container .result-card > ul > li > p.match-tag {
  color: var(--tertiary);
}

.search > .search-container > .search-space > .search-layout > .results-container .result-card > p {
  margin-bottom: 0;
}
`;

const searchScript = `
(function() {
  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      var script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  loadScript("https://cdn.jsdelivr.net/npm/flexsearch@0.7.31/dist/flexsearch.bundle.min.js").then(function() {
    initSearch();
  }).catch(function(err) {
    console.error("[Search] Failed to load FlexSearch:", err);
  });

  function initSearch() {
    var FlexSearch = window.FlexSearch;
    if (!FlexSearch) {
      console.error("[Search] FlexSearch not loaded");
      return;
    }

    var index = new FlexSearch.Document({
      document: {
        id: "id",
        index: ["title", "content"]
      }
    });

    var numSearchResults = 8;
    var searchContainer = null;
    var searchBar = null;
    var searchLayout = null;
    var resultsContainer = null;
    var previewContainer = null;
    var currentResults = [];
    var currentIndex = -1;
    var contentData = null;

    function removeAllChildren(el) {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    }

    function highlightMatch(text, term) {
      if (!term || !text) return text;
      var lowerTerm = term.toLowerCase();
      var lowerText = text.toLowerCase();
      var result = "";
      var lastIndex = 0;
      var index = lowerText.indexOf(lowerTerm);
      while (index !== -1) {
        result += text.substring(lastIndex, index);
        result += '<span class="highlight">' + text.substring(index, index + term.length) + '</span>';
        lastIndex = index + term.length;
        index = lowerText.indexOf(lowerTerm, lastIndex);
      }
      result += text.substring(lastIndex);
      return result;
    }

    function fetchContent(slug) {
      if (!contentData) return null;
      return contentData[slug] || null;
    }

    async function initIndex() {
      try {
        console.log("[Search] Fetching content index...");
        var response = await fetch("/static/contentIndex.json");
        var data = await response.json();
        contentData = data.content || data;
        console.log("[Search] Content data loaded, entries:", Object.keys(contentData).length);
        
        var id = 0;
        for (var slug in contentData) {
          var item = contentData[slug];
          index.add({
            id: id++,
            slug: slug,
            title: item.title || slug,
            content: item.content || ""
          });
        }
      } catch (err) {
        console.error("[Search] Error loading index:", err);
      }
    }

    function displayResults(results, term) {
      console.log("[Search] Displaying", results.length, "results");
      removeAllChildren(resultsContainer);
      currentResults = [];
      currentIndex = -1;

      if (!results || results.length === 0) {
        console.log("[Search] No results to display");
        var noResults = document.createElement("div");
        noResults.className = "result-card";
        noResults.textContent = "No results found";
        resultsContainer.appendChild(noResults);
        return;
      }

      for (var i = 0; i < Math.min(results.length, numSearchResults); i++) {
        var result = results[i];
        if (!result || !result.slug) continue;
        var item = fetchContent(result.slug);
        if (!item) continue;

        var card = document.createElement("button");
        card.className = "result-card";
        card.dataset.slug = result.slug;
        card.dataset.index = i;

        var title = document.createElement("h3");
        title.innerHTML = highlightMatch(item.title || result.slug, term);
        card.appendChild(title);

        if (item.description) {
          var desc = document.createElement("p");
          desc.className = "card-description";
          desc.textContent = item.description;
          card.appendChild(desc);
        }

        card.addEventListener("click", function() {
          window.location.href = "/" + this.dataset.slug;
        });

        card.addEventListener("mouseenter", function() {
          currentIndex = parseInt(this.dataset.index);
          updateFocus();
          if (previewContainer) {
            showPreview(this.dataset.slug);
          }
        });

        resultsContainer.appendChild(card);
        currentResults.push(card);
      }
    }

    function showPreview(slug) {
      removeAllChildren(previewContainer);
      var item = fetchContent(slug);
      if (!item) return;

      var inner = document.createElement("div");
      inner.className = "preview-inner";
      
      var title = document.createElement("h1");
      title.textContent = item.title || slug;
      inner.appendChild(title);

      if (item.content) {
        var content = document.createElement("div");
        content.innerHTML = item.content.substring(0, 2000);
        inner.appendChild(content);
      }

      previewContainer.appendChild(inner);
    }

    function updateFocus() {
      for (var i = 0; i < currentResults.length; i++) {
        if (i === currentIndex) {
          currentResults[i].classList.add("focus");
        } else {
          currentResults[i].classList.remove("focus");
        }
      }
    }

    function performSearch(term) {
      console.log("[Search] Performing search for:", term);
      if (!term || term.trim() === "") {
        searchLayout.classList.remove("display-results");
        return;
      }

      if (!contentData) {
        console.log("[Search] Content data not loaded yet");
        return;
      }

      var results = index.search(term, { limit: numSearchResults, enrich: true });
      console.log("[Search] Raw results count:", results ? results.length : 0);
      console.log("[Search] Raw results[0]:", results && results[0] ? JSON.stringify(results[0]).substring(0, 200) : "none");
      var flatResults = [];
      var seenIds = new Set();
      
      for (var i = 0; i < results.length; i++) {
        var fieldResult = results[i];
        console.log("[Search] Processing field:", fieldResult.field, "results:", fieldResult.result ? fieldResult.result.length : 0);
        var fieldResults = fieldResult.result;
        if (!fieldResults || !Array.isArray(fieldResults)) continue;
        for (var j = 0; j < fieldResults.length; j++) {
          var resultItem = fieldResults[j];
          console.log("[Search] Result item", j, ":", JSON.stringify(resultItem).substring(0, 100));
          if (!resultItem) continue;
          var doc = resultItem.doc;
          var id = resultItem.id;
          if (!doc || id === undefined) {
            console.log("[Search] Skipping - no doc or id");
            continue;
          }
          if (!seenIds.has(id)) {
            seenIds.add(id);
            flatResults.push(doc);
          }
        }
      }

      searchLayout.classList.add("display-results");
      displayResults(flatResults, term);
    }

    function openSearch() {
      console.log("[Search] Opening search modal");
      if (!searchContainer) {
        console.error("[Search] Search container not found");
        return;
      }
      searchContainer.classList.add("active");
      document.documentElement.classList.add("search-open");
      if (searchBar) {
        searchBar.focus();
        searchBar.value = "";
      }
      currentIndex = -1;
    }

    function closeSearch() {
      searchContainer.classList.remove("active");
      document.documentElement.classList.remove("search-open");
      if (searchBar) {
        searchBar.value = "";
        searchBar.blur();
      }
      searchLayout.classList.remove("display-results");
      currentIndex = -1;
    }

    function setupSearch() {
      console.log("[Search] Setting up event listeners");
      var searchButtons = document.querySelectorAll(".search-button");
      console.log("[Search] Found", searchButtons.length, "search buttons");
      for (var i = 0; i < searchButtons.length; i++) {
        searchButtons[i].addEventListener("click", function(e) {
          console.log("[Search] Button clicked");
          e.preventDefault();
          e.stopPropagation();
          openSearch();
        });
      }

      searchContainer = document.querySelector(".search-container");
      console.log("[Search] Search container found:", !!searchContainer);
      if (!searchContainer) return;

      searchBar = searchContainer.querySelector(".search-bar");
      searchLayout = searchContainer.querySelector(".search-layout");
      resultsContainer = searchContainer.querySelector(".results-container");
      previewContainer = searchContainer.querySelector(".preview-container");

      if (searchBar) {
        searchBar.addEventListener("input", function(e) {
          performSearch(e.target.value);
        });

        searchBar.addEventListener("keydown", function(e) {
          if (e.key === "Escape") {
            closeSearch();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            currentIndex = Math.min(currentIndex + 1, currentResults.length - 1);
            updateFocus();
            if (currentIndex >= 0 && previewContainer) {
              showPreview(currentResults[currentIndex].dataset.slug);
            }
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            currentIndex = Math.max(currentIndex - 1, -1);
            updateFocus();
            if (currentIndex >= 0 && previewContainer) {
              showPreview(currentResults[currentIndex].dataset.slug);
            }
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (currentIndex >= 0 && currentResults[currentIndex]) {
              window.location.href = "/" + currentResults[currentIndex].dataset.slug;
            }
          }
        });
      }

      document.addEventListener("click", function(e) {
        if (e.target.closest(".search-space")) return;
        closeSearch();
      });

      document.addEventListener("keydown", function(e) {
        if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          if (searchContainer.classList.contains("active")) {
            closeSearch();
          } else {
            openSearch();
          }
        }
      });
    }

    console.log("[Search] Initializing...");
    initIndex().then(function() {
      console.log("[Search] Index built, setting up UI");
      setupSearch();
      console.log("[Search] Setup complete");
    }).catch(function(err) {
      console.error("[Search] Initialization failed:", err);
    });
  }

})();
`;

export const Search = (userOpts?: Partial<SearchOptions>) => {
  const opts = { ...defaultOptions, ...userOpts };

  const SearchComponent: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const locale = cfg?.locale || "en-US";

    const translations: Record<string, { title: string; placeholder: string }> = {
      "ar-SA": { title: "بحث", placeholder: "ابحث عن شيء" },
      "ca-ES": { title: "Cerca", placeholder: "Cerca quelcom" },
      "cs-CZ": { title: "Hledat", placeholder: "Hledat" },
      "de-DE": { title: "Suche", placeholder: "Suche nach etwas" },
      "en-GB": { title: "Search", placeholder: "Search for something" },
      "en-US": { title: "Search", placeholder: "Search for something" },
      "es-ES": { title: "Buscar", placeholder: "Buscar algo" },
      "fa-IR": { title: "جستجو", placeholder: "جستجو برای چیزی" },
      "fi-FI": { title: "Haku", placeholder: "Hae jotain" },
      "fr-FR": { title: "Recherche", placeholder: "Rechercher quelque chose" },
      "he-IL": { title: "חיפוש", placeholder: "חפש משהו" },
      "hu-HU": { title: "Keresés", placeholder: "Keress valamit" },
      "id-ID": { title: "Cari", placeholder: "Cari sesuatu" },
      "it-IT": { title: "Cerca", placeholder: "Cerca qualcosa" },
      "ja-JP": { title: "検索", placeholder: "何かを検索" },
      "kk-KZ": { title: "Іздеу", placeholder: "Бір нәрсе іздеу" },
      "ko-KR": { title: "검색", placeholder: "무언가를 검색" },
      "lt-LT": { title: "Paieška", placeholder: "Ieškoti kažko" },
      "nb-NO": { title: "Søk", placeholder: "Søk etter noe" },
      "nl-NL": { title: "Zoeken", placeholder: "Zoek naar iets" },
      "pl-PL": { title: "Szukaj", placeholder: "Szukaj czegoś" },
      "pt-BR": { title: "Buscar", placeholder: "Buscar algo" },
      "ro-RO": { title: "Căutare", placeholder: "Caută ceva" },
      "ru-RU": { title: "Поиск", placeholder: "Искать что-то" },
      "th-TH": { title: "ค้นหา", placeholder: "ค้นหาบางอย่าง" },
      "tr-TR": { title: "Ara", placeholder: "Bir şey ara" },
      "uk-UA": { title: "Пошук", placeholder: "Шукати щось" },
      "vi-VN": { title: "Tìm kiếm", placeholder: "Tìm kiếm thứ gì đó" },
      "zh-CN": { title: "搜索", placeholder: "搜索内容" },
      "zh-TW": { title: "搜尋", placeholder: "搜尋內容" },
    };

    const t = translations[locale] ||
      translations["en-US"] || { title: "Search", placeholder: "Search for something" };
    const enablePreview = opts.enablePreview ?? true;

    return (
      <div class={classNames(displayClass, "search")}>
        <button class="search-button">
          <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.9 19.7">
            <title>{t.title}</title>
            <g class="search-path" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="square" d="M18.5 18.3l-5.4-5.4" />
              <circle cx="8" cy="8" r="7" />
            </g>
          </svg>
          <p>{t.title}</p>
        </button>
        <div class="search-container">
          <div class="search-space">
            <input
              autocomplete="off"
              class="search-bar"
              name="search"
              type="text"
              aria-label={t.placeholder}
              placeholder={t.placeholder}
            />
            <div class="search-layout" data-preview={enablePreview}>
              <div class="results-container"></div>
              {enablePreview && <div class="preview-container"></div>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  SearchComponent.css = searchCSS;
  SearchComponent.afterDOMLoaded = searchScript;

  return SearchComponent;
};

export default Search;
