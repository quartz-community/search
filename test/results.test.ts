import { describe, expect, it } from "vitest";
import { rankResultIds } from "../src/util/results";

// FlexSearch's results for a query: one entry per field with matches
const results = [
  { field: "content", result: [3, 1, 4] },
  { field: "title", result: [1, 5] },
];

describe("search result ranking (fieldPriority)", () => {
  it("lists title matches, then content matches, each page once", () => {
    expect(rankResultIds(results, ["title", "content", "tags"])).toEqual([1, 5, 3, 4]);
  });

  it("follows the configured field order", () => {
    expect(rankResultIds(results, ["content", "title", "tags"])).toEqual([3, 1, 4, 5]);
  });

  it("has nothing without matches", () => {
    expect(rankResultIds([], ["title", "content", "tags"])).toEqual([]);
  });

  it("keeps the matches of a field fieldPriority leaves out", () => {
    expect(rankResultIds([{ field: "tags", result: [7] }], ["content", "title"])).toEqual([7]);
  });

  it("ranks the fields fieldPriority leaves out after the ones it lists", () => {
    const withTags = [{ field: "tags", result: [7, 1] }, ...results];
    expect(rankResultIds(withTags, ["title", "content"])).toEqual([1, 5, 3, 4, 7]);
  });
});
