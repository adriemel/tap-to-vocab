# Phase 18: Numbers Quiz with Flip Cards & TTS - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Add interactive quiz logic to the numbers-quiz.html stub already built in Phase 17. The stub has an empty `#quiz-grid` div and `numbers-data.js` loaded. Phase 18 fills that grid with a 4-column flip-card grid: number on front face, Spanish word revealed on back face, TTS spoken on flip. No coin rewards, no score tracking, no shuffle — passive explore/learn feature.

Requirements covered: NUM-05, NUM-06, NUM-07.

</domain>

<decisions>
## Implementation Decisions

### Card Visual Style
- **D-01:** Front face uses yellow/gold number text on dark navy background — matches the WhichNumberQuizz.png reference image exactly.
- **D-02:** New compact card CSS (not the existing oversized `.flip-card` which has `min-height: 320px`). Cards should be roughly square and small enough to show 4 per row on mobile without scrolling. Add compact number-card classes to styles.css.
- **D-03:** Back face uses a green border (`--ok`) with `--ink` text for the Spanish word — visually signals "revealed" and gives satisfying positive feedback on flip.

### Back Face Content
- **D-04:** Back face shows only the Spanish word (e.g., "veinte") — clean and minimal. Requirements say "reveals the Spanish word for that number"; no need to also show the number.

### Re-tap Behavior
- **D-05:** Tapping an already-flipped card re-speaks the Spanish word via TTS but keeps the card flipped — useful for pronunciation practice. Cards do not flip back.

### JavaScript Architecture
- **D-06:** Inline IIFE script in numbers-quiz.html (same pattern as numbers-learn.html). Logic is self-contained: parse URL param, init TTS voice, render grid, handle clicks. No separate numbers-quiz.js file needed.

### Claude's Discretion
- Exact card pixel dimensions (height, font size, gap) — calibrate for mobile 4-column fit
- Grid spacing and card border radius
- Whether a "Tap to reveal" hint text appears on front face
- TTS cancel-before-speak timing (follow tapvocab.js: `speechSynthesis.cancel()` then `speak()` with 100ms delay)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Numbers feature
- `.planning/REQUIREMENTS.md` §v1.9 — NUM-05, NUM-06, NUM-07 acceptance criteria
- `WhichNumberQuizz.png` — Reference layout image: 4-column grid, yellow text, dark navy cards

### Existing code to reuse
- `assets/js/tapvocab.js` lines 13–53 — Complete TTS implementation: `getSpanishVoice()` with Monica preference, `voiceschanged` async listener, `speakSpanish(text)` function (rate 0.95, lang "es-ES", `cancel()` before `speak()`)
- `assets/css/styles.css` lines 389–465 — Existing flip-card CSS patterns (perspective, transform-style, `rotateY(180deg)`, backface-visibility) — new compact variant builds on these
- `numbers-learn.html` — URL param parsing pattern: `URLSearchParams`, `parseInt`, `isNaN` guard, fallback to default range
- `assets/js/numbers-data.js` — `window.NUMBERS` array of `{n, es}` objects (already loaded in stub)

### Stub to fill
- `numbers-quiz.html` — Phase 18 target: populate `#quiz-grid` div; `numbers-data.js` already loaded; nav links (Home, Back to Numbers) already present

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **TTS voice setup** (`tapvocab.js:13–53`): Copy `getSpanishVoice()` + `speakSpanish()` + `voiceschanged` listener block verbatim. Handles iOS async voice loading and Monica preference.
- **Flip-card CSS** (`styles.css:389–465`): `.flip-card`, `.flip-card-inner`, `.flip-card-front`, `.flip-card-back`, `.flip-card.flipped` — the 3D CSS transform machinery already works. Phase 18 adds a compact variant (smaller height, adjusted font sizes).
- **URL param parsing** (`numbers-learn.html`): `new URLSearchParams(location.search)` + `parseInt` + `isNaN` guard pattern — copy directly.

### Established Patterns
- All JS is IIFE pattern exporting to `window` or inline IIFE — no ESM
- DOM creation uses `createElement + textContent` exclusively (never innerHTML with variable content)
- Script load order: `numbers-data.js` → then inline quiz script (already set up in stub)

### Integration Points
- `window.NUMBERS` — already available from `numbers-data.js` loaded before the quiz script
- `#quiz-grid` div — Phase 17 stub left this empty; Phase 18 fills it
- `?range=lo-hi` URL param — numbers-learn.html "Take a Test" button already passes this param

</code_context>

<specifics>
## Specific Ideas

- Reference image (WhichNumberQuizz.png): dark navy card background, yellow/gold large bold number text, cards appear roughly square, 4 columns × 5 rows for 1-20 range
- Green (`--ok` = `#3ddc97`) border on back face to signal "revealed" — same green used for correct answers elsewhere in the app

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 18-numbers-quiz*
*Context gathered: 2026-04-29*
