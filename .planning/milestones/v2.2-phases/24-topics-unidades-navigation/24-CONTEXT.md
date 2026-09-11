# Phase 24: Topics & Unidades Navigation - Context

**Gathered:** 2026-09-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Navigation phase — the consumer side of Phase 23's `topics` column. Three deliverables:

1. `index.html`: the 10 vocabulary category buttons are replaced by two buttons — 📚 Topics and 📖 Unidades.
2. Two new sub-screens listing the 9 topics and the 5 unidades, each button opening `topic.html` with the right word list.
3. `topic.html` / `tapvocab.js` gain the ability to filter by `topics` (they filter by `category` only today).

**Not in this phase:** no change to `data/words.tsv` (Phase 23 finished the data), no change to Browse/Quiz mechanics inside `topic.html`, no change to any of the 9 tool/game buttons or their pages, no new topics or unidades, no grouping of the tool buttons (NAV-08 is deferred).

**The hard constraint (NAV-02):** everything below the new button row — ⭐ Practice, 🔤 Build Sentences, 🔄 Verbs, ✏️ Fill in, 📍 Locations, 🔢 Qué número es?, 💬 Quién soy yo, 🕐 Qué hora es?, 🎮 Play Games — keeps its current order, position and appearance. The only permitted change below the new row is the size of the gap above ⭐ Practice (D-04).

</domain>

<decisions>
## Implementation Decisions

### Home screen (discussed with the user)

- **D-01:** The two buttons sit **side by side in one row**, inside the existing `.grid-two-col`, in the position where the 10 category buttons used to start — i.e. above ⭐ Practice. Topics on the left, Unidades on the right. They do **not** span both columns.
- **D-02:** **Default `.btn` colours, but taller.** No new accent colour, no gradient, no 2px border — the two buttons keep the standard navy `.btn` fill and 1px border, and get extra vertical padding so the row has presence (roughly `padding: 20px 16px` vs the standard `12px 16px`; exact value is Claude's call). Rationale the user chose this over an accented treatment: the colour-accented tool buttons below should stay the only accented things on the page.
- **D-03:** **Label is emoji + name only** — `📚 Topics` and `📖 Unidades`. No subtitle line, no item count, no description. Matches every other button in the app. This also keeps both sub-screen counts out of the HTML, so adding a topic later never requires editing `index.html`.
- **D-04:** **One larger gap between the new row and ⭐ Practice.** Whitespace only — no divider line, no section heading, no text. Implement it on the new row itself (e.g. a `margin-bottom` on the two new buttons' wrapper/class) so no rule touches `.btn-practice` or anything below it, keeping NAV-02 literally true.
- **D-05:** The 10 `<a class="btn" href="/topic.html?cat=…">` category lines are **deleted** from `index.html`, not commented out or hidden. The URLs they pointed at keep working (Phase 23 D-04/D-05 never moved `category`), they are just no longer linked from the home screen.

### Claude's Discretion

The user reviewed these three areas and chose not to discuss them. The recommendations below were stated to the user before they closed the discussion, so treat them as the intended direction — a planner may refine the details but should not reverse the direction without flagging it.

- **Sub-screen structure → two static HTML pages.** `topics.html` and `unidades.html`, each modelled on `numbers.html` (card, `h1` + `🏠 Home` in a flex row, a `flex-direction: column` stack of `.btn` links). Buttons, emoji and labels are hardcoded in the HTML; no JS, no runtime read of `words.tsv`. Both must additionally carry the `#coin-counter` badge and load `coins.js`, which `numbers.html` does not do — that is NAV-05 / criterion 5. A shared parameterized page and runtime-generated buttons were both considered and set aside: the 9 topics and 5 unidades are a fixed closed set this milestone, and static HTML is the established pattern for hub screens.
- **Topic filtering → a new `?topic=` URL parameter,** not an overload of `?cat=`. `topic.html`'s inline script reads `params.get("cat")` today; it should also read `params.get("topic")` and pass the result through to `TapVocabTSV.initFromTSV` so the filter matches `r.topics` instead of `r.category`. The Unidades screen keeps using `?cat=Unidad2` … `?cat=Unidad5B` unchanged. **Why this matters:** 5 names — `Colores`, `Animales`, `Numeros`, `Saludar`, `Casa_Familia` — exist as *both* a `category` and a `topics` value with different row counts (`Colores` 13 vs 15, `Casa_Familia` 33 vs 83, `Saludar` 40 vs 55, `Numeros` 32 vs 32, `Animales` 15 vs 21). NAV-06 requires the topic number. A shared `?cat=` with OR-matching would silently change what existing `?cat=Colores` bookmarks show; two distinct params keep old and new behaviour separable and make the Topics screen's intent explicit in the URL.
- **Topic button labels, emoji and order.** Labels reuse the existing home-screen strings exactly where one exists — `🎨 Colores`, `🦊 Animales`, `🔢 Numeros`, `👋 Saludar`, `🧩 Palabras`, `🏠 Casa y Familia` — and invent emoji for the three new topics (e.g. `🗓️ Calendario`, `🍽️ Comida y Bebida`, `🎒 Escuela`; exact emoji is Claude's call). Order: the six existing topics in their current home-screen order, then the three new ones. No counts on the buttons.
- Whether the two sub-screens use a single-column stack (like `numbers.html`) or the 2-column grid. Single column is the closer precedent; with 9 buttons, 2 columns may fit a phone screen better without scrolling. Either is acceptable.
- `topic.html`'s `🏠 Home` button stays as it is — it returns to `index.html`, not to the sub-screen the user came from. A back-to-Topics path was considered and is not required by any NAV requirement; revisit only if it bothers the user in UAT.
- How the `h1` on `topic.html` renders a topic. `tapvocab.js:476`/`:500` set `titleEl.textContent` to the raw slug, so a topic slug would display as `Casa_Familia`. Cleaning that up (underscore → space, or passing a display label through the URL) is optional polish, not a requirement.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements
- `.planning/REQUIREMENTS.md` — NAV-01 … NAV-06 (lines 27–32); the **## Data Model** section holds the canonical 9-topic and 5-unidad lists and their slugs. NAV-08 (grouping the tool buttons) is listed there as explicitly deferred.
- `.planning/ROADMAP.md` § Phase 24 — goal and the 5 success criteria. Criterion 2 names all 9 tool/game buttons that must stay untouched.

### Upstream phase — the data this phase consumes
- `.planning/phases/23-vocabulary-data-topic-tagging/23-CONTEXT.md` — **required reading.** D-01 (slug format, display labels live in the HTML button), D-02 (exactly one topic per row, equality match, no comma splitting), D-03 (blank = untagged, appears on no Topics screen), D-04/D-05 (`category` never moved, so old `?cat=` URLs still work), D-06 (all 171 example sentences are deliberately untagged), D-12 (`Palabras` is the catch-all bucket).
- `.planning/phases/23-vocabulary-data-topic-tagging/23-VERIFICATION.md` — confirms the shipped state of `data/words.tsv`: 752 data rows, 581 tagged, 171 blank.

### Codebase conventions
- `.planning/codebase/CONVENTIONS.md` — naming table (CSS classes kebab-case, TSV categories PascalCase), TSV parsing pattern, fetch pattern.
- `CLAUDE.md` § Adding Vocabulary — documents that a new visible category needs a button in `index.html`'s `.grid-two-col`. **This phase makes that instruction stale** for the 10 category buttons; CLAUDE.md's Pages-and-routing list also needs the two new pages added.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `numbers.html` (31 lines) — the exact template for both sub-screens: `.container` > `.card`, a flex row holding `<h1>` and `<a class="btn secondary" href="/">🏠 Home</a>`, a muted one-line instruction, then a `display:flex; flex-direction:column; gap:12px` stack of `.btn` links. Copy it twice and swap the button list. **Gap:** it has no `#coin-counter` and does not load `coins.js` — both new pages must add the `<span class="badge coin-badge" id="coin-counter">` markup and the `<script src="/assets/js/coins.js">` tag for criterion 5.
- `topic.html:18-25` — the canonical header row showing an `h1` beside a `#coin-counter` badge. Use this markup for the sub-screen headers (it puts the coin badge and the Home control in the same flex row).
- `assets/js/coins.js` — auto-updates any `#coin-counter` element on `DOMContentLoaded` and on the `coinschanged` event. No per-page JS is needed: include the script, add the element, done.
- `assets/css/styles.css:96-125` — **unused** `.palabras-group` / `.btn-palabras-main` / `.palabras-sub` / `.btn-palabras-sub` rules, dead since v1.6. Not needed under D-01/D-02 (they describe a main-plus-sub-buttons inline group). Worth either ignoring or deleting as incidental cleanup; do not build on them.

### Established Patterns
- `index.html` is pure static markup; the only JS on it is `coins.js` + `home.js`. `home.js` touches `#practice-btn`, `#btn-games`, `#coins-msg` and `#btn-reset-coins` — **none of the 10 category buttons**, so deleting them needs no JS change.
- `.grid-two-col` is `grid-template-columns: 1fr 1fr; gap: 12px`. Every full-width button gets its span from `grid-column: 1 / -1` inside a `.grid-two-col .btn-xxx` rule. Two ordinary `.btn` children land side by side automatically — D-01 needs no new grid rule, only the new height (D-02) and bottom gap (D-04).
- Hub pages link with plain `<a class="btn" href="…">`; there is no router and no shared nav component. A new page is a new file.
- Existing CSS class naming for button variants: `.btn-practice`, `.btn-sentences`, `.btn-verbs`, `.btn-fill-blank`, `.btn-locations`, `.btn-numbers`, `.btn-quien-soy`, `.btn-hora`, `.btn-games`. New classes should follow it (e.g. `.btn-topics`, `.btn-unidades`) even though D-02 keeps the default colours — the classes exist to carry the height and the gap.

### Integration Points
- `topic.html:140-143` (inline script) — `const cat = params.get("cat"); TapVocabTSV.initFromTSV({ category: cat });`. This is where a `topic` param gets read and passed through.
- `assets/js/tapvocab.js:460-472` — `initFromTSV` resolves `category`, then filters `rows.filter(r => r.category.toLowerCase() === category.toLowerCase())`, with a special case for `practice`. This single filter expression plus the `opts` shape is the whole code change for topic filtering. Note `r.topics` may be `""` (171 sentence rows) and, on practice-list entries restored from localStorage, `undefined` — any new comparison must not throw on either.
- `assets/js/tapvocab.js:474-498` — the empty-result branch builds its own error text and Home button. A mistyped or unmatched topic slug lands here, which is acceptable behaviour; the message says "No words found for category: X" and may deserve wording that fits a topic.
- `assets/js/tapvocab.js:476` and `:500` — `titleEl.textContent = category === "practice" ? "⭐ Practice" : category` renders the slug raw in both the empty and the populated branch (so `Casa_Familia`, not `Casa y Familia`).
- `assets/js/tapvocab.js:58-63` — `inferCategoryFromPath()` is the fallback when no category is passed; it strips `.html` from the last path segment. Harmless here, but a reminder that `initFromTSV`'s `opts` is the only supported entry point.
- `grep -rn "cat="` over the site finds only `index.html:29-41` (the 10 categories plus ⭐ Practice) and `assets/js/tapvocab.js:354` (the quiz-complete modal's "Practice" button → `?cat=practice`). Nothing links to the 10 category URLs outside `index.html`, and `?cat=practice` must keep working.

### Live data the sub-screens navigate into
- Topic row counts in the shipped `data/words.tsv`: Palabras 243, Casa_Familia 83, Calendario 63, Saludar 55, Escuela 49, Numeros 32, Animales 21, Comida_Bebida 20, Colores 15 — 581 tagged, 171 deliberately blank.
- Unidad `category` counts: Unidad3 143, Unidad5A 115, Unidad4 108, Unidad2 77, Unidad5B 44.
- The `Animales` and `Casa_Familia` topics include the 7 `x`-prefixed hidden rows by design (Phase 23 D-05b) — they surface on the Topics screen but stay out of the Unidades side.

</code_context>

<specifics>
## Specific Ideas

The home screen the user picked, concretely:

```
┌────────────┐ ┌────────────┐
│            │ │            │   ← default .btn navy, 1px border,
│ 📚 Topics  │ │ 📖 Unidades│     taller than a tool button
│            │ │            │
└────────────┘ └────────────┘
                                 ← one larger gap (whitespace only)
┌════════════════════════════┐
║      ⭐  Practice          ║   ← unchanged, orange border
└════════════════════════════┘
┌════════════════════════════┐
║      🔤  Build Sentences   ║   ← unchanged, purple border
└════════════════════════════┘
        … 7 more unchanged …
```

Explicitly rejected during discussion, with reasons:
- Two full-width stacked buttons — rejected in favour of the compact one-row version.
- Two tall hero tiles with a stacked big emoji — too much new CSS for the gain.
- An accented gradient/2px-border treatment like `.btn-sentences` — would add a fourth accent colour competing with the tool buttons.
- A count line ("9 topics") or a hint line ("by theme") under the name — no other button in the app carries a subtitle.
- Section captions ("VOCABULARY" / "PRACTICE & GAMES") — adds text the home screen never had and edges toward restyling the tool row NAV-02 protects.

</specifics>

<deferred>
## Deferred Ideas

- **Grouping the 9 tool/game buttons behind a third home-screen button (NAV-08)** — already listed as deferred in REQUIREMENTS.md, and NAV-02 requires the opposite this phase.
- **Back-to-Topics navigation from `topic.html`** — the Home button returns to `index.html`, skipping the sub-screen. Offered and not taken; no NAV requirement asks for it.
- **Word counts on the sub-screen buttons** — would require loading `words.tsv` on the sub-screens, turning the static pages data-driven. Rejected with D-03's no-subtitle rule.
- **Pretty display titles inside `topic.html`** (`Casa_Familia` → "Casa y Familia") — cosmetic, noted under Claude's Discretion rather than required.
- **Deleting the dead `.palabras-group` CSS** — unrelated to this phase's requirements; mentioned only so nobody builds on it.
- **Deportes y Ocio (TAG-07) / Ropa (TAG-08) / multi-topic rows (TAG-09)** — carried forward as deferred from Phase 23. If TAG-07 ever lands, the Topics screen gains one hardcoded button; nothing in this phase's design blocks that.

</deferred>

---

*Phase: 24-Topics & Unidades Navigation*
*Context gathered: 2026-09-10*
