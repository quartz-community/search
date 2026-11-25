---
"@quartz-community/search": patch
---

Words with punctuation attached can be found by their letters:

- `hello` finds `"hello";`, `nbsp` finds `&nbsp;`, and `node` finds `node.js`;
- exact searches (`node.js`, `c++`, `"hello"`) still match;
- typographic quotes match typed ones, so `don't` finds Quartz's typeset `don’t`, and its excerpt and preview highlight it.

The encoder indexes each word as written, without its leading and trailing punctuation, and as its parts.
