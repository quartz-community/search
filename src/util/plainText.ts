const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#039;": "'",
};

/**
 * The content index holds a page's text HTML-escaped (the Description plugin escapes it
 * for meta tags and feeds). Search indexes and highlights plain text, escaping it once
 * when it renders, so decode it first, in one pass: text that was literally `&lt;` stays.
 */
export function plainText(text: string): string {
  return text.replace(/&(?:amp|lt|gt|quot|#039);/g, (e) => ENTITIES[e]!);
}
