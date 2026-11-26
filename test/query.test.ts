import { afterEach, describe, expect, it } from "vitest";
import { setSlugOptions } from "@quartz-community/utils/path";
import { parseSearchQuery } from "../src/util/query";
import { encoder, foldForSearch } from "../src/util/encoder";

describe("search query tags", () => {
  afterEach(() => setSlugOptions({}));

  it("are slugged as the site slugs tags", () => {
    expect(parseSearchQuery("#Café rest of #Projects/Alpha")).toEqual({
      tags: ["café", "projects/alpha"],
      query: "rest of",
    });
  });

  it("lose their accents with slugs.stripDiacritics, as the pages' tags did", () => {
    // what Quartz sets in the browser from configuration.slugs
    setSlugOptions({ stripDiacritics: true });
    expect(parseSearchQuery("#café").tags).toEqual(["cafe"]);
  });
});

describe("accent-insensitive search", () => {
  it("folds Latin accents in the index and the query, both ways", () => {
    expect(encoder("Crème brûlée")).toEqual(["creme", "brulee"]);
    expect(encoder("crème")).toEqual(encoder("creme"));
    expect(foldForSearch("Ça VA")).toBe("ca va");
  });

  it("keeps other scripts as written", () => {
    expect(encoder("한국어 日本")).toEqual(["한", "국", "어", "日", "本"]);
    expect(foldForSearch("नमस्ते")).toBe("नमस्ते");
  });
});
