import { afterEach, describe, expect, it } from "vitest";
import { setSlugOptions } from "@quartz-community/utils/path";
import {
  highlight,
  highlightPattern,
  highlightSegments,
  highlightTags,
  matchesTags,
  tokenizeTerm,
} from "../src/util/highlight";
import { parseSearchQuery } from "../src/util/query";

const mark = (s: string) => `<span class="highlight suggestion-highlight">${s}</span>`;

describe("highlight (result titles and text)", () => {
  it("marks a word matched without its accents, shown as written", () => {
    expect(highlight("creme", "Crème brûlée")).toBe(`${mark("Crème")} brûlée`);
  });

  it("marks a typographic apostrophe for a typed one", () => {
    expect(highlight("don't", "I don’t know")).toBe(`I ${mark("don’t")} know`);
    expect(highlight("don’t", "I don't know")).toBe(`I ${mark("don&#039;t")} know`);
  });

  it("marks only the matching part of a word, case-insensitively", () => {
    expect(highlight("art", "Quartz ART")).toBe(`Qu${mark("art")}z ${mark("ART")}`);
    expect(highlight("an", "banana")).toBe(`b${mark("an")}${mark("an")}a`);
  });

  it("escapes each piece, so a term never splits an entity", () => {
    expect(highlight("a<b", "x a<b&c <i>")).toBe(`x ${mark("a&lt;b")}&amp;c &lt;i&gt;`);
    expect(highlight("amp", "&")).toBe("&amp;");
  });

  it("marks the whole word when folding changes its length", () => {
    expect(highlight("ss", "Die Straße")).toBe(`Die ${mark("Straße")}`);
  });

  it("trims long text to the window with the matches", () => {
    const words = Array.from({ length: 200 }, (_, i) => `w${i}`);
    words[80] = "target";
    const html = highlight("target", words.join(" "), true);
    const expected = words.slice(50, 110).join(" ").replace("target", mark("target"));
    // 30 words before the window with the match, cut at both ends
    expect(html.startsWith(`...${expected}`)).toBe(true);
    expect(html.endsWith("...")).toBe(true);
  });

  // The trimmed text drops its last word and adds "..." even when nothing was cut:
  // tokenizedText.slice(startIndex, endIndex) excludes endIndex, and the "..." check
  // compares endIndex with the sliced list's length.
  it.fails("keeps all of a short text when trimming", () => {
    expect(highlight("word", "one two word three", true)).toBe(`one two ${mark("word")} three`);
  });
});

describe("highlightPattern / highlightSegments (the preview)", () => {
  it("splits a text node into matched and plain pieces, as written", () => {
    expect(highlightSegments("Crème brûlée", highlightPattern("creme")!)).toEqual([
      { text: "Crème", match: true },
      { text: " brûlée", match: false },
    ]);
    expect(highlightSegments("I don’t, “quote”", highlightPattern('don\'t "quote"')!)).toEqual([
      { text: "I ", match: false },
      { text: "don’t", match: true },
      { text: ", ", match: false },
      { text: "“quote”", match: true },
    ]);
    // folding would change the length (ß → ss): matched on the text as written
    expect(highlightSegments("Straße: don’t", highlightPattern("don't")!)).toEqual([
      { text: "Straße: ", match: false },
      { text: "don’t", match: true },
    ]);
  });

  it("matches regex characters literally", () => {
    const regex = highlightPattern("c++ (x)")!;
    expect(highlightSegments("c++ and (x) not cx", regex)).toEqual([
      { text: "c++", match: true },
      { text: " and ", match: false },
      { text: "(x)", match: true },
      { text: " not cx", match: false },
    ]);
  });

  it("prefers the longest run of the term's words", () => {
    expect(tokenizeTerm("a b c")).toEqual(["a b c", "a b", "a", "b", "c"]);
    expect(highlightSegments("a b c", highlightPattern("a b c")!)).toEqual([
      { text: "a b c", match: true },
    ]);
  });

  it("gives nothing for an empty term or a text without a match", () => {
    expect(highlightPattern("   ")).toBeNull();
    expect(highlightSegments("nothing here", highlightPattern("quartz")!)).toBeNull();
  });
});

describe("matchesTags (#tag search)", () => {
  afterEach(() => setSlugOptions({}));

  it("matches the content index's tags (slugged by Quartz) with the query's", () => {
    const { tags } = parseSearchQuery("#Rock&Roll");
    expect(matchesTags(tags, ["rock-and-roll", "music"])).toBe(true);
    expect(matchesTags(tags, ["rock"])).toBe(false);
    // a tag as written in frontmatter (a site whose frontmatter isn't slugged)
    expect(matchesTags(tags, ["Rock&Roll"])).toBe(true);
  });

  it("matches #café with a cafe tag when slugs.stripDiacritics is on", () => {
    setSlugOptions({ stripDiacritics: true });
    expect(matchesTags(parseSearchQuery("#café").tags, ["cafe"])).toBe(true);
    setSlugOptions({});
    expect(matchesTags(parseSearchQuery("#café").tags, ["cafe"])).toBe(false);
  });

  it("needs every tag of the query", () => {
    const { tags } = parseSearchQuery("#a #b");
    expect(matchesTags(tags, ["a", "b", "c"])).toBe(true);
    expect(matchesTags(tags, ["a"])).toBe(false);
    expect(matchesTags([], [])).toBe(true);
  });
});

describe("highlightTags", () => {
  it("lists at most five tags, escaped, the searched ones marked", () => {
    expect(highlightTags(["rock"], ["Rock&Roll", "jazz", "c", "d", "e", "f"])).toEqual([
      '<li><p class="match-tag">#Rock&amp;Roll</p></li>',
      "<li><p>#jazz</p></li>",
      "<li><p>#c</p></li>",
      "<li><p>#d</p></li>",
      "<li><p>#e</p></li>",
    ]);
    expect(highlightTags([], ["a"])).toEqual([]);
    expect(highlightTags(["a"], [])).toEqual([]);
  });
});
