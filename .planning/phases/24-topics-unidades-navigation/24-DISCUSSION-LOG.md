# Phase 24: Topics & Unidades Navigation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-10
**Phase:** 24-Topics & Unidades Navigation
**Areas discussed:** Home screen look of the 2 buttons

---

## Gray areas offered

| Area | Description | Selected |
|------|-------------|----------|
| Sub-screen structure | Two static pages like `numbers.html`, one shared parameterized page, or buttons generated from `words.tsv` at runtime | |
| How `topic.html` filters a topic | A new `?topic=` param, or reuse `?cat=` with category-OR-topics matching — decides whether 🎨 Colores shows 13 words or all 15 | |
| Home screen look of the 2 buttons | Layout, visual weight, label content, position relative to ⭐ Practice | ✓ |
| Sub-screen contents & polish | Emoji/labels for the 3 new topics, button order, word counts, a back-to-Topics path | |

---

## Home screen look of the 2 buttons

### Q1 — How should 📚 Topics and 📖 Unidades be laid out on the home screen?

| Option | Description | Selected |
|--------|-------------|----------|
| Two full-width, stacked (recommended) | Each spans both grid columns like ⭐ Practice and 🔤 Build Sentences; reads as "two doors into the vocabulary", no new grid rules | |
| Side by side, one row | Both sit in the existing 2-col grid as a single row where the 10 category buttons used to start; most compact, whole page 4 rows shorter | ✓ |
| Two tall hero tiles | Side by side but much taller, big emoji stacked over the label; most distinct but a new component with new CSS | |

**User's choice:** Side by side, one row.
**Notes:** Chosen over the recommendation. Keeps the home screen's existing shape — the new row simply occupies the slot the categories vacated.

### Q2 — How much should those two buttons stand out from the tool buttons below?

| Option | Description | Selected |
|--------|-------------|----------|
| Plain `.btn`, exactly like the old category buttons (recommended) | Same navy fill and 1px border; home screen looks almost unchanged, just shorter; zero new CSS | |
| Accented like the feature buttons | New `.btn-topics` / `.btn-unidades` with gradient + 2px accent border, following `.btn-sentences` | |
| Plain, but taller than a tool button | Default colours, more vertical padding — presence without a new palette colour, one small CSS rule | ✓ |

**User's choice:** Plain, but taller than a tool button.
**Notes:** No new accent colour — the colour-accented tool buttons stay the only accented elements on the page. Extra height alone carries the emphasis.

### Q3 — The taller button leaves room for a second line. What should be inside each one?

| Option | Description | Selected |
|--------|-------------|----------|
| Just the emoji + name (recommended) | `📚 Topics` / `📖 Unidades`, nothing more — matches every other button in the app | ✓ |
| Name + a muted count line | Small grey "9 topics" / "5 unidades"; hardcoded, so needs a manual edit whenever a topic is added | |
| Name + a muted hint line | Small grey "by theme" / "by school unit" — explains the difference between the two doors | |

**User's choice:** Just the emoji + name.
**Notes:** No button in the app carries a subtitle. Side benefit: no counts in the HTML to go stale.

### Q4 — With 10 buttons gone, should anything separate the 2 vocabulary buttons from the 9 tool buttons?

| Option | Description | Selected |
|--------|-------------|----------|
| Nothing — leave the grid as is (recommended) | The taller height plus the tool buttons' coloured borders already distinguish the groups; honours NAV-02 literally | |
| A little extra breathing room | One larger gap before ⭐ Practice — groups them with whitespace only, nothing below moves or changes | ✓ |
| Small muted section labels | "VOCABULARY" / "PRACTICE & GAMES" captions — clearest structure, but adds text the home screen never had | |

**User's choice:** A little extra breathing room.
**Notes:** Whitespace only, no text and no divider. Implemented on the new row so no rule touches `.btn-practice` or anything below it.

---

## Claude's Discretion

The user chose not to discuss the other three areas. Recommendations were stated before the discussion closed and are recorded in CONTEXT.md as the intended direction:

- **Sub-screen structure** → two static pages (`topics.html`, `unidades.html`) modelled on `numbers.html`, plus the `#coin-counter` badge and `coins.js` that `numbers.html` lacks.
- **Topic filtering** → a new `?topic=` param rather than overloading `?cat=`, because 5 names exist as both a category and a topic with different row counts, and overloading would silently change what existing `?cat=` bookmarks show.
- **Labels, emoji and order** → reuse the existing home-screen strings for the 6 known topics, invent emoji for Calendario / Comida y Bebida / Escuela, existing order first then the 3 new ones, no counts.
- Single-column vs 2-column layout on the sub-screens; whether to prettify the raw slug in `topic.html`'s `h1`.

## Deferred Ideas

- Grouping the 9 tool/game buttons behind a third home-screen button (NAV-08) — already deferred in REQUIREMENTS.md.
- A back-to-Topics path from `topic.html` (its 🏠 Home returns to `index.html`, skipping the sub-screen) — offered, not taken, no NAV requirement asks for it.
- Word counts on the sub-screen buttons — would make the static pages data-driven.
- Pretty display titles in `topic.html` (`Casa_Familia` → "Casa y Familia").
- Deleting the dead `.palabras-group` CSS left over from v1.6.
