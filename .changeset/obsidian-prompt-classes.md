---
"@quartz-community/search": minor
---

Search carries the classes of Obsidian's quick switcher, so Obsidian themes (via `@quartz-themes/core`) style it as they style that:

- the input and results are `.prompt`, with `.prompt-input` and `.prompt-results`;
- results are `.suggestion-item.mod-complex`, with `.suggestion-title` and `.suggestion-note`;
- the selected result gets `.is-selected`, and matches get `.suggestion-highlight`;
- the overlay gets `mod-dim`.

The preview is now its own panel beside the results, with Obsidian's page-preview classes (`.popover.hover-popover > .markdown-embed`). Under a theme, search shows two windows: the preview left of the switcher. Without a theme, it looks as before.
