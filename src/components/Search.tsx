import type { VNode, JSX } from "preact";

export interface SearchOptions {
  enablePreview?: boolean;
}

export type QuartzComponentProps = {
  ctx: any;
  externalResources: any;
  fileData: any;
  cfg: any;
  children: any;
  tree: any;
  allFiles: any[];
  displayClass?: "mobile-only" | "desktop-only";
} & JSX.IntrinsicAttributes & {
    [key: string]: any;
  };

export interface QuartzComponent {
  (props: QuartzComponentProps): VNode;
  css?: string;
  beforeDOMLoaded?: string;
  afterDOMLoaded?: string;
}

const defaultOptions: SearchOptions = {
  enablePreview: true,
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
  text-decoration: none;
  color: var(--dark);
}

.search > .search-container > .search-space > .search-layout > .results-container .result-card:hover,
.search > .search-container > .search-space > .search-layout > .results-container .result-card:focus,
.search > .search-container > .search-space > .search-layout > .results-container .result-card.focus {
  background: var(--lightgray);
}

.search > .search-container > .search-space > .search-layout > .results-container .result-card > h3 {
  margin: 0;
  color: var(--secondary);
}

.search > .search-container > .search-space > .search-layout > .results-container .result-card > ul.tags {
  margin-top: 0.45rem;
  margin-bottom: 0;
  padding: 0;
  list-style: none;
}

.search > .search-container > .search-space > .search-layout > .results-container .result-card > ul.tags > li {
  display: inline-block;
  margin-right: 0.3rem;
}

.search > .search-container > .search-space > .search-layout > .results-container .result-card > ul > li > p {
  border-radius: 8px;
  background-color: var(--highlight);
  padding: 0.2rem 0.4rem;
  margin: 0;
  line-height: 1.4rem;
  font-weight: 700;
  color: var(--secondary);
  font-size: 0.85rem;
}

.search > .search-container > .search-space > .search-layout > .results-container .result-card > ul > li > p.match-tag {
  color: var(--tertiary);
}

.search > .search-container > .search-space > .search-layout > .results-container .result-card > p {
  margin-bottom: 0;
  margin-top: 0.5em;
  font-size: 0.9em;
  color: var(--gray);
}

.search > .search-container > .search-space > .search-layout > .results-container .result-card.no-match {
  cursor: default;
}
`;

const searchScript = `
(function() {
  var numSearchResults = 8;
  var numTagResults = 5;
  var contextWindowWords = 30;
  
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

    var encoder = function(str) {
      var tokens = [];
      var bufferStart = -1;
      var bufferEnd = -1;
      var lower = str.toLowerCase();
      var i = 0;
      
      for (var idx = 0; idx < lower.length; idx++) {
        var code = lower.charCodeAt(idx);
        var isCJK = (code >= 0x3040 && code <= 0x309f) ||
                    (code >= 0x30a0 && code <= 0x30ff) ||
                    (code >= 0x4e00 && code <= 0x9fff) ||
                    (code >= 0xac00 && code <= 0xd7af);
        var isWhitespace = code === 32 || code === 9 || code === 10 || code === 13;
        
        if (isCJK) {
          if (bufferStart !== -1) {
            tokens.push(lower.slice(bufferStart, bufferEnd));
            bufferStart = -1;
          }
          tokens.push(lower.charAt(idx));
        } else if (isWhitespace) {
          if (bufferStart !== -1) {
            tokens.push(lower.slice(bufferStart, bufferEnd));
            bufferStart = -1;
          }
        } else {
          if (bufferStart === -1) bufferStart = idx;
          bufferEnd = idx + 1;
        }
        i += lower.charAt(idx).length;
      }
      
      if (bufferStart !== -1) {
        tokens.push(lower.slice(bufferStart));
      }
      
      return tokens;
    };

    var index = new FlexSearch.Document({
      encode: encoder,
      document: {
        id: "id",
        tag: "tags",
        index: [
          { field: "title", tokenize: "forward" },
          { field: "content", tokenize: "forward" },
          { field: "tags", tokenize: "forward" }
        ]
      }
    });

    var contentData = null;
    var idDataMap = [];
    var currentSearchTerm = "";
    var searchType = "basic";

    function removeAllChildren(el) {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    }

    function tokenizeTerm(term) {
      var tokens = term.split(/\\s+/).filter(function(t) { return t.trim() !== ""; });
      var tokenLen = tokens.length;
      if (tokenLen > 1) {
        for (var i = 1; i < tokenLen; i++) {
          tokens.push(tokens.slice(0, i + 1).join(" "));
        }
      }
      return tokens.sort(function(a, b) { return b.length - a.length; });
    }

    function highlight(searchTerm, text, trim) {
      var tokenizedTerms = tokenizeTerm(searchTerm);
      var tokenizedText = text.split(/\\s+/).filter(function(t) { return t !== ""; });
      
      var startIndex = 0;
      var endIndex = tokenizedText.length - 1;
      
      if (trim) {
        var includesCheck = function(tok) {
          return tokenizedTerms.some(function(term) {
            return tok.toLowerCase().startsWith(term.toLowerCase());
          });
        };
        var occurrencesIndices = tokenizedText.map(includesCheck);
        
        var bestSum = 0;
        var bestIndex = 0;
        for (var i = 0; i < Math.max(tokenizedText.length - contextWindowWords, 0); i++) {
          var window = occurrencesIndices.slice(i, i + contextWindowWords);
          var windowSum = window.reduce(function(total, cur) { return total + (cur ? 1 : 0); }, 0);
          if (windowSum >= bestSum) {
            bestSum = windowSum;
            bestIndex = i;
          }
        }
        
        startIndex = Math.max(bestIndex - contextWindowWords / 2, 0);
        endIndex = Math.min(startIndex + contextWindowWords, tokenizedText.length - 1);
        tokenizedText = tokenizedText.slice(startIndex, endIndex);
      }
      
      var slice = tokenizedText.map(function(tok) {
        var result = tok;
        for (var j = 0; j < tokenizedTerms.length; j++) {
          var searchTok = tokenizedTerms[j].toLowerCase();
          var tokLower = tok.toLowerCase();
          var idx = tokLower.indexOf(searchTok);
          if (idx !== -1) {
            var before = tok.substring(0, idx);
            var match = tok.substring(idx, idx + searchTok.length);
            var after = tok.substring(idx + searchTok.length);
            result = before + '<span class="highlight">' + match + '</span>' + after;
            break;
          }
        }
        return result;
      }).join(" ");
      
      return (startIndex === 0 ? "" : "...") + slice + (endIndex === tokenizedText.length - 1 ? "" : "...");
    }

    function highlightTags(term, tags) {
      if (!tags || searchType !== "tags") return [];
      return tags.map(function(tag) {
        if (tag.toLowerCase().includes(term.toLowerCase())) {
          return '<li><p class="match-tag">#' + tag + '</p></li>';
        } else {
          return '<li><p>#' + tag + '</p></li>';
        }
      }).slice(0, numTagResults);
    }

    function formatForDisplay(term, id) {
      var slug = idDataMap[id];
      var data = contentData[slug];
      return {
        id: id,
        slug: slug,
        title: searchType === "tags" ? data.title : highlight(term, data.title || ""),
        content: highlight(term, data.content || "", true),
        tags: highlightTags(term.substring(1), data.tags)
      };
    }

    async function setupSearch() {
      var searchElements = document.querySelectorAll(".search");
      
      for (var i = 0; i < searchElements.length; i++) {
        var searchEl = searchElements[i];
        var container = searchEl.querySelector(".search-container");
        var searchButton = searchEl.querySelector(".search-button");
        var searchBar = searchEl.querySelector(".search-bar");
        var searchLayout = searchEl.querySelector(".search-layout");
        
        if (!container || !searchButton || !searchBar || !searchLayout) continue;
        
        var enablePreview = searchLayout.dataset.preview === "true";
        var results = document.createElement("div");
        results.className = "results-container";
        searchLayout.appendChild(results);
        
        var preview = null;
        if (enablePreview) {
          preview = document.createElement("div");
          preview.className = "preview-container";
          searchLayout.appendChild(preview);
        }

        function hideSearch() {
          container.classList.remove("active");
          searchBar.value = "";
          removeAllChildren(results);
          if (preview) removeAllChildren(preview);
          searchLayout.classList.remove("display-results");
          searchType = "basic";
        }

        function showSearch(type) {
          searchType = type;
          container.classList.add("active");
          searchBar.focus();
        }

        async function displayResults(finalResults) {
          removeAllChildren(results);
          
          if (finalResults.length === 0) {
            results.innerHTML = '<a class="result-card no-match"><h3>No results.</h3><p>Try another search term?</p></a>';
          } else {
            for (var j = 0; j < finalResults.length; j++) {
              var item = finalResults[j];
              var htmlTags = item.tags.length > 0 ? '<ul class="tags">' + item.tags.join("") + '</ul>' : '';
              var itemTile = document.createElement("a");
              itemTile.className = "result-card";
              itemTile.id = item.slug;
              itemTile.href = "/" + item.slug;
              itemTile.innerHTML = '<h3 class="card-title">' + item.title + '</h3>' + htmlTags + '<p class="card-description">' + item.content + '</p>';
              itemTile.addEventListener("click", function(e) {
                if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
                hideSearch();
              });
              results.appendChild(itemTile);
            }
          }
        }

        async function onType(e) {
          currentSearchTerm = e.target.value;
          searchLayout.classList.toggle("display-results", currentSearchTerm !== "");
          searchType = currentSearchTerm.startsWith("#") ? "tags" : "basic";
          
          var query = currentSearchTerm;
          var searchResults;
          
          if (searchType === "tags") {
            query = currentSearchTerm.substring(1).trim();
            searchResults = await index.searchAsync({
              query: query,
              limit: numSearchResults,
              index: ["tags"]
            });
          } else {
            searchResults = await index.searchAsync({
              query: query,
              limit: numSearchResults,
              index: ["title", "content"]
            });
          }
          
          var allIds = new Set();
          for (var k = 0; k < searchResults.length; k++) {
            var fieldResult = searchResults[k];
            if (fieldResult && fieldResult.result) {
              for (var m = 0; m < fieldResult.result.length; m++) {
                allIds.add(fieldResult.result[m]);
              }
            }
          }
          
          var finalResults = [];
          allIds.forEach(function(id) {
            finalResults.push(formatForDisplay(currentSearchTerm, id));
          });
          
          await displayResults(finalResults.slice(0, numSearchResults));
        }

        searchButton.addEventListener("click", function() { showSearch("basic"); });
        searchBar.addEventListener("input", onType);
        
        document.addEventListener("keydown", function(e) {
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

    async function fillDocument() {
      var id = 0;
      for (var slug in contentData) {
        var fileData = contentData[slug];
        idDataMap[id] = slug;
        await index.addAsync(id, {
          id: id,
          slug: slug,
          title: fileData.title || "",
          content: fileData.content || "",
          tags: fileData.tags || []
        });
        id++;
      }
    }

    async function init() {
      try {
        var response = await fetch("/static/contentIndex.json");
        var data = await response.json();
        contentData = data.content || data;
        await fillDocument();
        await setupSearch();
      } catch (err) {
        console.error("[Search] Error initializing:", err);
      }
    }

    init();
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
            <div class="search-layout" data-preview={enablePreview}></div>
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
