import { describe, it, expect } from "vitest";
import { plainText } from "../src/util/plainText";

describe("plainText: the content index's escaped text, decoded once", () => {
  it("decodes the entities escapeHTML writes", () => {
    expect(plainText("const greeting = &quot;hello&quot;; a &amp; b &lt;br&gt; it&#039;s")).toBe(
      `const greeting = "hello"; a & b <br> it's`,
    );
  });

  it("decodes in one pass, so text that was literally an entity stays one", () => {
    expect(plainText("add &amp;nbsp; or &amp;lt;")).toBe("add &nbsp; or &lt;");
  });
});
