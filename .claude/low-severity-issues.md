# Low Severity Issues (from audit 2026-02-24)

- [x] **10. `revealTimer` not cleared on quiz→browse mode switch** (tapvocab.js:120,180) — Fixed: shared `_activeRevealTimer` ref cleared on browse switch
- [x] **11. Tab switch re-inits entire conjugation game, discarding progress** (conjugation.js:355-368) — Fixed: lazy init with `practiceInitialized`/`showInitialized` flags
- [x] **12. `Idiomas` category (15 words in TSV) has no navigation button on index.html** — Fixed: added button
- [x] **13. `vocab.html` has `lang="de"` but content is Spanish/English** — Fixed: changed to `lang="es"`
- [x] **14. CSS `:has()` unsupported on older Android/Firefox** (styles.css:288-292) — Fixed: added JS fallback with `.quiz-active` class + matching CSS rule
- [x] **15. No SEO meta/og tags on any page** — Fixed: added meta description + og tags to index, topic, sentences, conjugation, fill-blank
- [x] **16. First auto-speak may use wrong voice** (tapvocab.js:12-19) — Fixed: added `voiceschanged` listener to pre-cache voice
- [x] **17. `confettiBurst` creates 50 DOM elements; `@keyframes fall` missing on pages without styles.css** (shared-utils.js:105-121) — Fixed: dynamic keyframe injection via `ensureFallKeyframe()`
