import { slugTag } from "@quartz-community/utils/path";

/**
 * A tag as the site's pages carry it: slugged as Quartz slugs tags, with the site's
 * `configuration.slugs` options (Quartz passes them to the browser), so `#café` finds the
 * pages tagged `cafe` when `slugs.stripDiacritics` is on, as the tag's page is `tags/cafe`.
 */
export function normalizeTag(tag: string): string {
  return slugTag(tag).toLowerCase();
}

/** A search query: its `#tags` (normalized with {@link normalizeTag}) and the rest of it. */
export function parseSearchQuery(input: string): { tags: string[]; query: string } {
  const tokens = input.split(/\s+/);
  const tags: string[] = [];
  const queryParts: string[] = [];
  for (const token of tokens) {
    if (token.startsWith("#") && token.length > 1) {
      tags.push(normalizeTag(token.substring(1)));
    } else if (token !== "#") {
      queryParts.push(token);
    }
  }
  return { tags, query: queryParts.join(" ").trim() };
}
