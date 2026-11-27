import { stripDiacritics } from "@quartz-community/utils/path";

/**
 * Search tokens: whitespace-separated words, CJK characters one by one (CJK text has no
 * spaces between words).
 */
/**
 * Typographic quotes as typed ones: Quartz typesets `don't` as `don’t`, which people search
 * for with a straight apostrophe. One code unit each, so offsets are unchanged.
 */
export function foldQuotes(str: string): string {
  return str.replace(/[\u2018\u2019\u02bc]/g, "'").replace(/[\u201c\u201d]/g, '"');
}

/**
 * Text as search compares it: lowercase, typographic quotes as typed ones, and Latin letters
 * without their accents, so `creme` finds "Crème brûlée" and `crème` finds "creme" (whatever
 * `slugs.stripDiacritics` is). Other scripts are kept as written. Mostly keeps the length; a few
 * letters fold to two (`ß` → `ss`), so callers that map offsets back check the lengths.
 */
export function foldForSearch(str: string): string {
  return stripDiacritics(foldQuotes(str.toLowerCase()));
}

function splitTokens(str: string): string[] {
  const tokens: string[] = [];
  let bufferStart = -1;
  let bufferEnd = -1;
  const lower = foldForSearch(str);
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
      bufferEnd = i + char.length;
    }
    i += char.length;
  }

  if (bufferStart !== -1) {
    tokens.push(lower.slice(bufferStart));
  }

  return tokens;
}

const EDGE_PUNCTUATION = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;
const INNER_PUNCTUATION = /[^\p{L}\p{N}]+/u;

/**
 * FlexSearch's encoder, for both the index and the query. A word with punctuation attached
 * (`"hello";`, `node.js`, `it's`, `&nbsp;`) is indexed as written, without its leading and
 * trailing punctuation (`hello`), and as its parts (`node`, `js`), so prefix search finds
 * it by its letters while exact searches (`c++`, `node.js`) still match.
 */
export function encoder(str: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (t: string) => {
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  };
  for (const tok of splitTokens(str)) {
    add(tok);
    const trimmed = tok.replace(EDGE_PUNCTUATION, "");
    add(trimmed);
    const parts = trimmed.split(INNER_PUNCTUATION);
    if (parts.length > 1) for (const part of parts) add(part);
  }
  return out;
}
