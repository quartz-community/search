import { describe, it, expect } from "vitest";
import { encoder } from "../src/util/encoder";

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
  });

  it("keeps the word as written, and its parts", () => {
    expect(encoder("node.js")).toEqual(["node.js", "node", "js"]);
    expect(encoder("C++")).toEqual(["c++", "c"]);
    expect(encoder("it's")).toEqual(["it's", "it", "s"]);
  });

  it("folds typographic quotes into typed ones", () => {
    expect(encoder("don’t “quote”")).toEqual(["don't", "don", "t", '"quote"', "quote"]);
  });

  it("lowercases, and splits CJK text into characters", () => {
    expect(encoder("Hello 日本語")).toEqual(["hello", "日", "本", "語"]);
  });
});
