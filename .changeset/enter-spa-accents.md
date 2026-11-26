---
"@quartz-community/search": patch
---

- Enter on a result navigates with Quartz's SPA router; it reloaded the page (it clicked the result's link after closing the search had removed it from the page).
- Tag searches are slugged as the site slugs tags: with `configuration.slugs.stripDiacritics`, `#café` finds the pages tagged `cafe` (it found nothing).
- Search ignores the accents of Latin letters, in both directions and whatever the slug options: `creme` and `brulee` find "Crème brûlée", `crème` finds "creme", and matches are highlighted as written. Tag suggestions match the same way.

Bundles `@quartz-community/utils` 1.3.1.
