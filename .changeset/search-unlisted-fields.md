---
"@quartz-community/search": patch
---

Matches in a field that `fieldPriority` leaves out (such as `tags` with `fieldPriority: [content, title]`) are no longer dropped: they are ranked after the listed fields.
