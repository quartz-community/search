import { describe, it, expect } from "vitest";
import Search from "../src/components/Search";
import script from "./__mocks__/scriptMock";

type Props = Record<string, unknown>;

/** The props of every element `Search(opts)` renders. */
function elements(opts?: Parameters<typeof Search>[0]): Props[] {
  const out: Props[] = [];
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    const props = ((node as { props?: Props }).props ?? {}) as Props;
    out.push(props);
    walk(props.children);
  };
  walk(Search(opts)({ cfg: { locale: "en-US" } } as never));
  return out;
}
const byClass = (els: Props[], cls: string) =>
  els.filter((p) => typeof p.class === "string" && p.class.split(" ").includes(cls));

describe("Search component", () => {
  it("renders the preview pane by default", () => {
    const els = elements();
    expect(byClass(els, "search-preview")).toHaveLength(1);
    expect(byClass(els, "search-space")[0]!["data-preview"]).toBe(true);
    expect(byClass(els, "search-layout")[0]).toMatchObject({
      "data-preview": true,
      "data-field-priority": '["title","content","tags"]',
    });
  });

  it("renders no preview pane with enablePreview: false", () => {
    const els = elements({ enablePreview: false });
    expect(byClass(els, "search-preview")).toHaveLength(0);
    expect(byClass(els, "search-space")[0]!["data-preview"]).toBe(false);
    expect(byClass(els, "search-layout")[0]!["data-preview"]).toBe(false);
  });

  it("renders fieldPriority for the script", () => {
    const layout = byClass(elements({ fieldPriority: ["tags", "title"] }), "search-layout")[0]!;
    expect(JSON.parse(layout["data-field-priority"] as string)).toEqual(["tags", "title"]);
  });

  it("labels the button and the input in the site's locale", () => {
    const els = elements();
    expect(byClass(els, "search-button")[0]!["aria-label"]).toBe("Search");
    expect(byClass(els, "search-bar")[0]).toMatchObject({
      placeholder: "Search for something...",
      "aria-label": "Search for something...",
    });
  });

  it("attaches the search script as is", () => {
    expect(Search().afterDOMLoaded).toBe(script);
  });
});
