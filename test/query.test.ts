import { afterEach, describe, expect, it } from "vitest";
import { setSlugOptions } from "@quartz-community/utils/path";
import { parseSearchQuery } from "../src/util/query";

describe("search query tags", () => {
  afterEach(() => setSlugOptions({}));

  it("are slugged as the site slugs tags", () => {
    expect(parseSearchQuery("#Café rest of #Projects/Alpha")).toEqual({
      tags: ["café", "projects/alpha"],
      query: "rest of",
    });
    // slugTag, not just lowercase: `&` becomes `-and-` as on the tag's page
    expect(parseSearchQuery("#Rock&Roll")).toEqual({ tags: ["rock-and-roll"], query: "" });
  });

  it("lose their accents with slugs.stripDiacritics, as the pages' tags did", () => {
    // what Quartz sets in the browser from configuration.slugs
    setSlugOptions({ stripDiacritics: true });
    expect(parseSearchQuery("#café").tags).toEqual(["cafe"]);
  });

  it("ignore a lone #, as a tag and as a word", () => {
    expect(parseSearchQuery("#")).toEqual({ tags: [], query: "" });
    expect(parseSearchQuery("foo #")).toEqual({ tags: [], query: "foo" });
  });
});

describe("search query text", () => {
  it("is the words without the tags, single-spaced and trimmed", () => {
    expect(parseSearchQuery(" foo   bar ")).toEqual({ tags: [], query: "foo bar" });
    expect(parseSearchQuery("#a  b")).toEqual({ tags: ["a"], query: "b" });
  });
});
