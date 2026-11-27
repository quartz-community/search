import { describe, it, expect } from "vitest";
import { encoder, foldForSearch } from "../src/util/encoder";

describe("search encoder", () => {
  it("indexes words with punctuation attached by their letters too", () => {
    expect(encoder('const greeting = "hello";')).toEqual([
      "const",
      "greeting",
      "=",
      '"hello";',
      "hello",
    ]);
    expect(encoder("add &nbsp; (blank space)")).toEqual([
      "add",
      "&nbsp;",
      "nbsp",
      "(blank",
      "blank",
      "space)",
      "space",
    ]);
    // all the leading punctuation goes, not just one character
    expect(encoder('""hi')).toEqual(['""hi', "hi"]);
  });

  it("keeps the word as written, and its parts", () => {
    expect(encoder("node.js")).toEqual(["node.js", "node", "js"]);
    expect(encoder("C++")).toEqual(["c++", "c"]);
    expect(encoder("it's")).toEqual(["it's", "it", "s"]);
  });

  it("folds typographic quotes into typed ones", () => {
    expect(encoder("don’t “quote”")).toEqual(["don't", "don", "t", '"quote"', "quote"]);
  });

  it("splits on spaces, tabs and line breaks", () => {
    expect(encoder("a\tb\nc\rd e")).toEqual(["a", "b", "c", "d", "e"]);
    expect(encoder("foo ")).toEqual(["foo"]);
    // a word that starts at offset 1
    expect(encoder(" ab")).toEqual(["ab"]);
    expect(encoder(" ab c")).toEqual(["ab", "c"]);
  });
});

describe("CJK text", () => {
  it("is split into characters: hiragana, katakana, kanji, hangul, CJK Extension B", () => {
    // カ appears twice and is indexed once
    expect(encoder("ひらがな カタカナ")).toEqual(["ひ", "ら", "が", "な", "カ", "タ", "ナ"]);
    expect(encoder("한국어 日本")).toEqual(["한", "국", "어", "日", "本"]);
    expect(encoder("𠀋x")).toEqual(["𠀋", "x"]);
  });

  it("flushes the Latin word before it", () => {
    expect(encoder("Quartz使い方")).toEqual(["quartz", "使", "い", "方"]);
    expect(encoder(" ab日")).toEqual(["ab", "日"]);
  });

  it("includes the first and last character of each block", () => {
    // ぁ ゟ, ゠ ヿ, 一 鿿, 가 힣, 𠀀 𪛟: each split from the Latin letters around it
    const edges = [
      "\u3041",
      "\u309f",
      "\u30a0",
      "\u30ff",
      "\u4e00",
      "\u9fff",
      "\uac00",
      "\ud7a3",
      "\u{20000}",
      "\u{2a6df}",
    ];
    for (const c of edges) expect(encoder(`a${c}b`)).toEqual(["a", c, "b"]);
    // just outside: U+3190 and U+A000 (Yi) are not split
    expect(encoder("a\u3190b")).toEqual(["a\u3190b", "a", "b"]);
    expect(encoder("a\ua000b")).toEqual(["a\ua000b"]);
  });
});

describe("accent-insensitive search", () => {
  it("folds Latin accents in the index and the query, both ways", () => {
    expect(encoder("Crème brûlée")).toEqual(["creme", "brulee"]);
    expect(encoder("crème")).toEqual(encoder("creme"));
    expect(foldForSearch("Ça VA")).toBe("ca va");
  });

  it("keeps other scripts as written", () => {
    expect(foldForSearch("नमस्ते")).toBe("नमस्ते");
  });
});

describe("encoder: characters outside the CJK blocks", () => {
  it("keeps other wide characters in their word", () => {
    // fullwidth Latin letters and emoji come after the Hangul block
    expect(encoder("aａb")).toEqual(["aａb"]);
    expect(encoder("a😀b")).toEqual(["a😀b", "a", "b"]);
  });

  it("keeps a word's last character when it is outside the BMP", () => {
    expect(encoder("x😀 y")).toEqual(encoder("x😀").concat("y"));
    expect(encoder("𝔸𝔹 c")[0]).toBe("𝔸𝔹");
  });

  it("keeps a word's last character outside the BMP before a CJK character", () => {
    expect(encoder("x😀中")).toEqual([...encoder("x😀"), "中"]);
  });
});
