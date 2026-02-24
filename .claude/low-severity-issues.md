# Low Severity Issues (from audit 2026-02-24)

- [ ] **10. `revealTimer` not cleared on quiz→browse mode switch** (tapvocab.js:120,180) — Leaked timer modifies hidden elements
- [ ] **11. Tab switch re-inits entire conjugation game, discarding progress** (conjugation.js:355-368)
- [ ] **12. `Idiomas` category (15 words in TSV) has no navigation button on index.html**
- [ ] **13. `vocab.html` has `lang="de"` but content is Spanish/English** — Should be `lang="es"` or `lang="en"`
- [ ] **14. CSS `:has()` unsupported on older Android/Firefox** (styles.css:288-292) — Browse tab outline degrades silently
- [ ] **15. No SEO meta/og tags on any page** — Poor search results and link previews for tapvocab.fun
- [ ] **16. First auto-speak may use wrong voice** (tapvocab.js:12-19) — No `voiceschanged` handler; voices not loaded on first card
- [ ] **17. `confettiBurst` creates 50 DOM elements; `@keyframes fall` missing on pages without styles.css** (shared-utils.js:105-121)
