import { escapeHTML } from "@quartz-community/utils";
import { encoder, foldForSearch } from "./encoder";
import { normalizeTag } from "./query";

// Highlighting search matches and filtering by `#tags` (used by the search script).

export const numTagResults = 5;
export const contextWindowWords = 30;

/** Whether a page with `itemTags` has every one of the query's (normalized) `searchTags`. */
export function matchesTags(searchTags: string[], itemTags: string[]): boolean {
  return searchTags.every((tag) => itemTags.some((t) => normalizeTag(t) === tag));
}

/** The words of a search term and its runs of leading words ("a b c" → "a b c", "a b", …), longest first. */
export function tokenizeTerm(term: string): string[] {
  const tokens = term.split(/\s+/).filter((t) => t.trim() !== "");
  const tokenLen = tokens.length;
  if (tokenLen > 1) {
    for (let i = 1; i < tokenLen; i++) {
      tokens.push(tokens.slice(0, i + 1).join(" "));
    }
  }
  return tokens.sort((a, b) => b.length - a.length);
}

/**
 * The pattern that marks a search term in the preview: any of its words, accents and
 * typographic quotes folded (a typed quote also matches `’`), case-insensitive. `null` for an
 * empty term.
 */
export function highlightPattern(searchTerm: string): RegExp | null {
  const tokenizedTerms = tokenizeTerm(searchTerm).filter((term) => term.trim() !== "");
  if (tokenizedTerms.length === 0) return null;
  // a typed quote also matches its typographic forms (`don’t` for "don't")
  const combined = tokenizedTerms
    .map((term) =>
      foldForSearch(term)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/['\u2018\u2019\u02bc]/g, "['\u2018\u2019\u02bc]")
        .replace(/["\u201c\u201d]/g, '["\u201c\u201d]'),
    )
    .join("|");
  if (combined === "") return null;
  return new RegExp(combined, "gi");
}

/**
 * A text node's text split into the pieces {@link highlightPattern} marks and the rest, or
 * `null` when nothing matches. Matched with accents folded (`creme` marks "Crème") where that
 * keeps the offsets; the pieces are the text as written.
 */
export function highlightSegments(
  text: string,
  regex: RegExp,
): Array<{ text: string; match: boolean }> | null {
  const folded = foldForSearch(text);
  const haystack = folded.length === text.length ? folded : text;
  regex.lastIndex = 0;
  if (!regex.test(haystack)) return null;
  regex.lastIndex = 0;
  const segments: Array<{ text: string; match: boolean }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(haystack)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), match: false });
    }
    segments.push({ text: text.slice(match.index, match.index + match[0].length), match: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) segments.push({ text: text.slice(lastIndex), match: false });
  return segments;
}

/**
 * A result's title or text as HTML, the words matching the search term highlighted (each piece
 * HTML-escaped). With `trim`, only the window of words with the most matches, `...` marking
 * what was cut.
 */
export function highlight(searchTerm: string, text: string, trim?: boolean): string {
  const tokenizedTerms = tokenizeTerm(searchTerm);
  // Match on the plain text and escape each piece, so a term never splits an entity
  let tokenizedText = text.split(/\s+/).filter((t) => t !== "");

  const wordCount = tokenizedText.length;
  // The words shown: [startIndex, endIndex), end exclusive
  let startIndex = 0;
  let endIndex = wordCount;

  if (trim) {
    // As the index matches: a word by its letters too (`"hello";` for "hello")
    const includesCheck = (tok: string) => {
      const words = encoder(tok);
      return tokenizedTerms.some((term) => {
        const folded = foldForSearch(term);
        return words.some((w) => w.startsWith(folded));
      });
    };
    const occurrencesIndices = tokenizedText.map(includesCheck);

    let bestSum = 0;
    let bestIndex = 0;
    // every window start, the last full window (ending at the last word) included
    for (let i = 0; i <= Math.max(wordCount - contextWindowWords, 0); i++) {
      const window = occurrencesIndices.slice(i, i + contextWindowWords);
      const windowSum = window.reduce((total, cur) => total + (cur ? 1 : 0), 0);
      if (windowSum >= bestSum) {
        bestSum = windowSum;
        bestIndex = i;
      }
    }

    startIndex = Math.max(bestIndex - contextWindowWords, 0);
    endIndex = Math.min(startIndex + 2 * contextWindowWords, wordCount);
    tokenizedText = tokenizedText.slice(startIndex, endIndex);
  }

  const slice = tokenizedText
    .map((tok) => {
      // Matched as the index matches (typographic quotes and accents folded: `don’t` for
      // "don't", `Crème` for "creme"), shown as written
      const folded = foldForSearch(tok);
      for (const searchTok of tokenizedTerms) {
        const term = foldForSearch(searchTok);
        if (!term || !folded.includes(term)) continue;
        if (folded.length !== tok.length) {
          // folding changed the length (`İ`, `ß`): mark the whole word
          return `<span class="highlight suggestion-highlight">${escapeHTML(tok)}</span>`;
        }
        let html = "";
        let at = 0;
        for (let i = folded.indexOf(term); i !== -1; i = folded.indexOf(term, at)) {
          html += escapeHTML(tok.slice(at, i));
          html += `<span class="highlight suggestion-highlight">${escapeHTML(tok.slice(i, i + term.length))}</span>`;
          at = i + term.length;
        }
        return html + escapeHTML(tok.slice(at));
      }
      return escapeHTML(tok);
    })
    .join(" ");

  return (startIndex === 0 ? "" : "...") + slice + (endIndex === wordCount ? "" : "...");
}

/** A result's tags as list items (at most {@link numTagResults}), the searched ones marked. */
export function highlightTags(searchTags: string[], tags?: string[]): string[] {
  if (!tags || tags.length === 0 || searchTags.length === 0) return [];
  return tags
    .map((tag) => {
      const escaped = escapeHTML(tag);
      if (searchTags.some((st) => foldForSearch(tag).includes(foldForSearch(st)))) {
        return `<li><p class="match-tag">#${escaped}</p></li>`;
      } else {
        return `<li><p>#${escaped}</p></li>`;
      }
    })
    .slice(0, numTagResults);
}
