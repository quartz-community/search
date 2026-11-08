---
"@quartz-community/search": patch
---

The manifest declares that the plugin needs `static/contentIndex.json` (`quartz.capabilities`), so Quartz 5.1+ reports a missing content index at build time instead of shipping a search with nothing to search. Older versions ignore the field.
