# Project Research Summary

**Project:** Tap-to-Vocab v1.4 — Locations (Spatial Prepositions Drag-and-Drop Game)
**Domain:** Vanilla JS mobile-first drag-and-drop vocabulary game, static site
**Researched:** 2026-03-14
**Confidence:** HIGH

## Executive Summary

The v1.4 Locations feature adds a spatial prepositions drag-and-drop game to the existing Tap-to-Vocab static site. The game must teach 11 Spanish prepositions (encima de, debajo de, delante de, detrás de, al lado de, a la derecha de, a la izquierda de, entre, cerca de, lejos de, en) by having the user drag a single object to the correct spatial position relative to a reference box. The entire implementation uses zero new dependencies — the Pointer Events API, CSS absolute positioning, and `getBoundingClientRect` hit detection are the only tools needed, and all integrate cleanly with the existing SharedUtils and CoinTracker modules.

The recommended approach is: Pointer Events API (`pointerdown`/`pointermove`/`pointerup` with `setPointerCapture`) for cross-platform drag; CSS-positioned divs (not canvas) for the scene; inline JS data (not a TSV file) for the fixed 11-preposition set; and `getBoundingClientRect` for drop zone hit detection. The HTML5 Drag and Drop API must not be used — it does not fire on iOS Safari. The game must also solve two design challenges before any layout coding begins: (1) how to visually represent `detrás de` ("behind") in a 2D scene, and (2) how to handle `entre` ("between"), which requires two reference objects.

The primary risks are all Phase 1 interaction risks: failing to call `event.preventDefault()` with `{ passive: false }` causing page scroll during drag, using `event.target` in `pointermove` instead of `elementFromPoint`, and element offset misalignment on touch devices. These are well-understood problems with well-documented fixes. The secondary risk is the layout design: three pairs of prepositions (`cerca de` / `al lado de`, `delante de` / `detrás de`, directional left/right/beside) require deliberate visual treatment to prevent user confusion. These decisions must be locked down at the wireframe stage before any interaction code is written.

## Key Findings

### Recommended Stack

The entire drag system is implemented using native browser APIs available in all modern browsers since 2019-2020. No external dependencies are introduced and no build step is required, consistent with the existing site architecture.

**Core technologies:**
- **Pointer Events API** (`pointerdown`/`pointermove`/`pointerup`): unified drag handler for mouse and touch — HTML5 DnD is mouse-only and broken on iOS Safari
- **`element.setPointerCapture(ev.pointerId)`**: locks pointer tracking to the draggable element during move, prevents `pointermove` loss when finger moves fast
- **CSS `touch-action: none`**: prevents browser scroll hijack from intercepting the drag gesture and firing `pointercancel`
- **`document.elementFromPoint(x, y)`**: detects which drop zone is under the pointer at drop time — required because Pointer Events have no native `dragover` equivalent
- **CSS `position: relative/absolute`** (not canvas): scene layout is DOM-based for native touch targets, CSS transitions, and easy maintenance
- **Inline JS constant `EXERCISES`** (not TSV): the 11 prepositions are a fixed, closed set — no fetch latency, no loading state, no error path

See `.planning/research/STACK.md` for full compatibility table and iOS caveats.

### Expected Features

All 13 P1 features are required for launch. They are either zero-cost integrations with existing modules or direct consequences of the game's core mechanic.

**Must have (table stakes):**
- Single draggable object with clear visual affordance (ball or emoji)
- Reference box ("la caja") centered and labeled in scene
- 11 discrete drop zones correctly positioned around the reference box
- Pointer Events drag (mouse + touch, no separate code paths)
- Visual treatment for `detrás de` — "behind" is unrepresentable in flat 2D without a perspective cue
- Visual treatment for `entre` — requires a second reference object (two-box row, dynamic layout, or documented exclusion)
- Near/far/beside visual discrimination — `cerca de` vs `al lado de` vs `lejos de` zones must be clearly separated
- Prompt card showing Spanish preposition and German translation
- Correct drop: snap + `playSuccessSound()` + `confettiBurst(30)` + `CoinTracker.addCoin()`
- Wrong drop: shake animation + `playErrorSound()` + snap back to origin
- Progress badge (X / 11)
- Skip button + completion celebration state
- Back/Home navigation + home screen button in index.html

**Should have (differentiators, add post-launch):**
- TTS pronunciation of preposition on prompt load (Web Speech API already available in codebase)
- Animate object to correct zone on Skip (teach by demonstration)
- Restart/shuffle-again button at completion

**Defer (v2+):**
- `detrás de` 3D animation (canvas/SVG, significant effort)
- Multi-round scoring across sessions (coin economy already handles reward)
- Free-placement with distance judging (anti-feature at MVP)

See `.planning/research/FEATURES.md` for full prioritization matrix and anti-feature rationale.

### Architecture Approach

The game is a single new page (`locations.html`) plus a single new IIFE module (`locations.js`) following the exact established pattern of every other game page in the site. Two existing files are modified: `styles.css` (append `.locations-*` classes) and `index.html` (add one button). No new TSV file. No new shared utilities. State is scoped entirely to the `locations.js` closure — no localStorage, no sessionStorage.

**Major components:**
1. `locations.html` — page shell: header, coin badge (`#coin-counter`), scene container, prompt card, controls; loads 3 scripts in order
2. `locations.js` (IIFE, exports `window.Locations`) — exercise sequencing, pointer event drag handling, `getBoundingClientRect` hit detection, feedback dispatch to SharedUtils and CoinTracker
3. `styles.css` (modified) — `.locations-scene`, `.locations-ref-box`, `.locations-drop-zone`, `.locations-draggable`, drop zone state variants (`.correct`, `.wrong`, `.hover`)
4. `index.html` (modified) — one `<a class="btn btn-locations">` added inside `.grid-two-col`

**Build order:** CSS first (unblocks HTML layout), then HTML shell (verify visual layout on mobile before interaction), then JS wiring, then index.html button.

See `.planning/research/ARCHITECTURE.md` for zone layout percentages, data structure, and full build order.

### Critical Pitfalls

1. **HTML5 Drag API on iOS Safari** — does not fire touch events; silently broken on iPhone; recovery requires full interaction layer rewrite. Use Pointer Events exclusively.
2. **Page scrolls instead of dragging** — `touchmove`/`pointermove` without `{ passive: false }` cannot call `preventDefault()`; iOS intercepts gesture for scroll. Register all drag listeners with `{ passive: false }` and call `preventDefault()` in the move handler.
3. **`event.target` always returns the draggable, not the zone under it** — `pointermove` target is fixed to the element where the gesture started. Use `elementFromPoint(clientX, clientY)` for hit detection; set `pointer-events: none` on the dragged clone during drag so it does not occlude the zone beneath it.
4. **Ghost image offset misalignment** — placing the dragged element at `clientX, clientY` snaps its top-left corner to the finger, causing a jarring jump. Record `offsetX = clientX - rect.left` and `offsetY = clientY - rect.top` on `pointerdown`; subtract on `pointermove`.
5. **`detrás de` and `entre` zone ambiguity** — two prepositions cannot be represented by a simple zone on a flat layout without explicit design decisions. `detrás de` needs a perspective/depth cue; `entre` needs two reference objects or explicit exclusion. Both must be decided at wireframe stage.

See `.planning/research/PITFALLS.md` for UX pitfalls, performance traps, and the "looks done but isn't" checklist.

## Implications for Roadmap

Based on combined research, a 3-phase structure is recommended. The phase boundaries are driven by hard dependencies: interaction mechanics must be verified on real iOS before layout is finalized; layout geometry must be locked before hit detection is coded; integration polish comes last.

### Phase 1: Interaction Foundation

**Rationale:** The drag system is the highest-risk component and the foundation everything else depends on. If the touch drag is wrong, the layout and hit detection built on top of it must be rebuilt. Test the drag loop in isolation on real iOS Safari before investing in scene layout.
**Delivers:** A working drag-and-drop interaction on both desktop and mobile — draggable object follows pointer, `pointercancel` handled, `{ passive: false }` confirmed, `elementFromPoint` returning zone not draggable, object returning to origin on miss.
**Addresses:** Table stakes — touch drag, correct/wrong feedback wiring, CoinTracker integration, SharedUtils calls.
**Avoids:** HTML5 DnD anti-pattern; scroll-instead-of-drag; offset misalignment; event target misuse.
**Research flag:** Standard patterns — Pointer Events API is well-documented; no additional research needed.

### Phase 2: Scene Layout and Zone Design

**Rationale:** Layout decisions have downstream consequences for hit detection. Zone geometry, the `detrás de` visual treatment, and the `entre` approach must be finalized visually before any coordinate math is written. A CSS-only mockup (no JS) should be reviewed on a real 375px device before Phase 3 begins.
**Delivers:** Complete visual scene — reference box, all 11 drop zones at correct positions with minimum 44px touch targets, perspective cue for `detrás de`, two-box row for `entre` (or documented exclusion), distance rings for `cerca de` vs `lejos de` discrimination, hover highlight state during drag.
**Uses:** CSS `position: absolute` percentage-based coordinates, zone layout grid from ARCHITECTURE.md.
**Implements:** Scene container, reference box, drop zone elements with `data-preposition` attributes.
**Avoids:** Adjacent zone ambiguity; hardcoded pixel coordinates; zones smaller than 44px; `detrás de` placed ambiguously.
**Research flag:** May benefit from a quick paper prototype or CSS-only review before coding — the zone layout is the single most judgment-dependent part of the build.

### Phase 3: Integration and Polish

**Rationale:** With working drag (Phase 1) and correct layout (Phase 2), wiring the game loop, exercise sequencing, prompt card, progress badge, skip/completion state, and home screen button is straightforward integration against established patterns.
**Delivers:** Fully playable game — shuffled exercise sequence, prompt card (Spanish + German), correct/wrong feedback with sound and confetti, coin awards, progress badge, skip with completion state, back/home navigation, and home screen entry point.
**Implements:** `EXERCISES` constant, `loadExercise()` loop, `checkDrop()` via `getBoundingClientRect`, feedback dispatch, `CoinTracker.addCoin()` on correct drop.
**Avoids:** Document-level listener leaks (use named functions or `{ once: true }`); zone rect cache staleness on orientation change (add `resize` listener); AudioContext suspension (calls inside user gesture handler, already guarded in SharedUtils).
**Research flag:** Standard patterns — follows fill-blank.js and sentences.js exactly. No additional research needed.

### Phase Ordering Rationale

- Interaction before layout: a broken touch model requires a full rewrite; confirming it early bounds risk to Phase 1.
- Layout before integration: zone coordinates drive hit detection; changing layout after coding `checkDrop` requires recalibrating all zone geometry.
- Integration last: depends on stable elements from both prior phases but contains no novel unknowns — it is assembly of proven patterns.

### Research Flags

Phases needing deeper research during planning:
- **Phase 2 (Scene Layout):** The visual treatment for `detrás de` and `entre` has multiple valid approaches (CSS perspective, isometric SVG, two-box dynamic layout, row-based fallback). The planning step should explicitly choose and document one approach per ambiguous preposition before implementation begins.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Interaction Foundation):** Pointer Events API is fully documented; the implementation pattern is specified in STACK.md and ARCHITECTURE.md with code examples.
- **Phase 3 (Integration):** Follows exact patterns from fill-blank.js, sentences.js, and conjugation.js. No novel integration points.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Pointer Events API MDN sources; iOS Safari compatibility confirmed; zero-dependency constraint eliminates alternatives |
| Features | HIGH | Direct codebase inspection for integration points; spatial preposition pedagogy at MEDIUM (established ESL principle, not externally verified in this session) |
| Architecture | HIGH | Direct codebase inspection of all existing modules; patterns are identical to fill-blank.js and sentences.js |
| Pitfalls | HIGH | MDN spec behavior for `touchmove` target semantics and passive listeners; Apple developer docs confirm iOS HTML5 DnD gap |

**Overall confidence:** HIGH

### Gaps to Address

- **`detrás de` visual approach:** Three options exist (CSS perspective box, depth-cued zone labeling, isometric SVG). Research does not prescribe one — a planning decision is required. Choose at Phase 2 planning and document it. The simplest viable option (dashed dark border with depth shadow cue) is sufficient for MVP.
- **`entre` handling decision:** Three options documented (dynamic two-box layout, fixed two-box layout, explicit exclusion). Planning must pick one and commit before layout coding begins. Option A (dynamic — show two boxes only for `entre` question) is recommended as it keeps the default scene simple.
- **`al lado de` directionality:** The research recommends defining a fixed side (e.g., right) per the exercise definition. Planning must specify which side and update the `EXERCISES` constant accordingly.
- **iOS version floor:** Research confirms iOS Safari 13.4+ (Pointer Events Baseline since July 2020). If the app targets older devices, this needs verification. For tapvocab.fun's audience this is unlikely to be a concern.

## Sources

### Primary (HIGH confidence)
- MDN Pointer Events API — Baseline status, iOS Safari 13.4+ support, `setPointerCapture`, `touch-action: none`
- MDN Touch Events — `touchmove` target semantics (target fixed to originating element), recommendation to use Pointer Events instead
- MDN `addEventListener` passive option — `{ passive: false }` required for `preventDefault()` in touch handlers
- MDN `document.elementFromPoint` — universal browser support, `pointer-events: none` behavior
- Apple Developer Documentation — iOS Safari does not support HTML5 Drag and Drop on touch input
- Direct codebase inspection — `/home/desire/tap-to-vocab/tap-to-vocab/assets/js/` (all existing modules), `assets/css/styles.css`, `index.html`, `fill-blank.html`
- Project files — `.planning/PROJECT.md`, `CLAUDE.md`, `MEMORY.md`

### Secondary (MEDIUM confidence)
- Spatial preposition pedagogy (one-at-a-time prompting, movement encodes meaning) — established ESL instructional design principle; not externally verified in this research session

---
*Research completed: 2026-03-14*
*Ready for roadmap: yes*
