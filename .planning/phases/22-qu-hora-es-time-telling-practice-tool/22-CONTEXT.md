# Phase 22: Qué Hora Es? — Time-Telling Practice Tool - Context

**Gathered:** 2026-08-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a new standalone page where the user sets a 24h time by dragging two dials (hour 00–23, minute in 5-minute steps) and taps "Qué hora es?" to see and hear the Spanish phrase for that time, using traditional time-telling phrasing (Es la una / Son las..., y cuarto, y media, menos cuarto/veinte, de la mañana/tarde/noche). A "Repeat" button re-speaks without changing the time. Pure practice tool — no scoring, coins, or stats.

Requirements covered: HORA-01 through HORA-09.

</domain>

<decisions>
## Implementation Decisions

### Drag Interaction
- **D-01:** Dial drag behaves like a scrolling reel (iOS date-picker / smartwatch time-setter style) — the current value is shown centered with faded neighboring values above/below, drag distance scrolls proportionally, and it settles on the nearest valid value on release. Not a simple snap-per-swipe.

### Visual Style
- **D-02:** Clock face is a rounded card matching the app's existing dark theme (`--card` background, existing accent color for digits) — NOT a literal black/LCD digital-clock look. Should blend with the rest of Tap-to-Vocab's visual system.
- **D-03:** Layout is side-by-side: hour dial, colon, minute dial — reads as a single clock at a glance (`HH : MM`), not stacked vertically.
- **D-04:** While a dial is actively being dragged, it gets a highlight (border/background) and a subtle scale-up — consistent with the app's existing tap/press feedback conventions elsewhere.

### Claude's Discretion
- Exact drag-distance-to-value-change ratio (pixels per step) and release/settle physics (snap animation duration/easing)
- Colon styling and spacing between HH and MM dials
- Minute reel step values are fixed at 00, 05, 10 ... 55 (12 positions) — display/scroll behavior between them is Claude's call
- Exact highlight color/scale amount for the active-drag state (should reuse existing CSS custom properties, e.g. `--accent`)
- Home/back navigation placement (follow numbers.html / quien-soy.html precedent: Home + relevant back link)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` §v2.1 — HORA-01 through HORA-09 acceptance criteria
- `.planning/ROADMAP.md` §Phase 22 — goal and success criteria

### Existing code to reuse
- `assets/js/tapvocab.js` lines 13–53 — Complete TTS implementation: `getSpanishVoice()` with Monica preference, `voiceschanged` async listener, `speakSpanish(text)` function (rate 0.95, lang "es-ES", `cancel()` before `speak()`)
- `assets/js/locations.js` lines 8–60 — Pointer Events drag pattern: `pointerdown`/`pointermove`/`pointerup` on `document`, `setPointerCapture` — reference for building the reel-drag gesture (adapt from single-drag-and-drop to a scrolling-reel value picker)
- `assets/css/styles.css` — `:root` CSS custom properties (`--bg`, `--card`, `--ink`, `--muted`, `--accent`, `--ok`, `--warn`, `--error`); `.grid-two-col .btn-quien-soy` / `.btn-numbers` (lines ~79–93, 1350) — pattern for the new full-width home button class (e.g. `.btn-hora`)
- `index.html` lines 58–59 — placement precedent: "Quién soy yo" button, full-width, spans both grid columns — new "Qué hora es?" button goes directly below it

### Pages to model after
- `numbers-quiz.html` / `quien-soy.html` — inline-IIFE single-page pattern with Home + back nav links, no separate `.js` file needed for a self-contained feature this size

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **TTS voice setup** (`tapvocab.js:13–53`): Copy `getSpanishVoice()` + `speakSpanish()` + `voiceschanged` listener block — handles iOS async voice loading and Monica preference. Same pattern used successfully in numbers-quiz.html and quien-soy.html.
- **Pointer Events drag** (`locations.js:8–60`): Existing single-code-path mouse+touch drag handling via Pointer Events API (works on iOS Safari, unlike HTML5 Drag-and-Drop). The reel-picker interaction needed here is a new interaction pattern (continuous value scrolling vs. drag-to-drop-zone) but reuses the same event wiring approach.
- **CSS custom properties**: All colors should come from existing `:root` variables — no new color values needed.

### Established Patterns
- All JS is IIFE pattern, either inline in the HTML page or exported to `window` — no ESM
- Full-width feature buttons on the home page use a dedicated CSS class per feature (`.btn-quien-soy`, `.btn-numbers`, etc.) inside `.grid-two-col`
- Every feature page has Home + contextual back navigation links

### Integration Points
- `index.html` — add new button below `.btn-quien-soy` (line 59), spanning both grid columns
- `assets/css/styles.css` — add `.btn-hora` (or similar) full-width button class + new dial/reel component CSS
- New page (e.g. `hora.html`) — self-contained, following the numbers-quiz.html / quien-soy.html inline-IIFE precedent

</code_context>

<specifics>
## Specific Ideas

- Drag gesture should feel like "setting an alarm on a smart watch" (user's own words) — confirmed as a scrolling-reel picker, not a discrete swipe-to-increment control
- Clock should look native to the app's existing dark theme rather than mimicking a literal LCD/digital-alarm-clock aesthetic

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope (no scope-creep suggestions raised).

</deferred>

---

*Phase: 22-qu-hora-es-time-telling-practice-tool*
*Context gathered: 2026-08-02*
