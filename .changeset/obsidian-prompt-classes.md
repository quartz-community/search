---
"@quartz-community/search": patch
---

Search carries the classes of Obsidian's quick switcher and command palette next to its own, so Obsidian themes (via `@quartz-themes/core`) style it as they style those:

- the search box is `.prompt`, with `.prompt-input` and `.prompt-results`;
- results are `.suggestion-item.mod-complex`, with `.suggestion-title` and `.suggestion-note`;
- the selected result gets `.is-selected`, and matches get `.suggestion-highlight`;
- the overlay gets `mod-dim`.
