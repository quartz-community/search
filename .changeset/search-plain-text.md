---
"@quartz-community/search": patch
---

Excerpts show the page's text as written, not HTML entities (`"hello"`, not `&quot;hello&quot;`). The content index holds text escaped by the Description plugin, which search escaped a second time; it is now decoded once when loaded. Searching "quot" or "amp" no longer matches every page with quotes or ampersands, and a term can't split an entity when highlighted. The `#tag` autocomplete ghost text takes the input's box, font and scroll, so it lines up with what is typed under any styling.
