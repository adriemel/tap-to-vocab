# Phase 10: Game Loop & Integration - Research

**Researched:** 2026-03-15
**Domain:** Vanilla JS game loop, exercise sequencing, feedback integration, HTML page structure, home-page navigation wiring
**Confidence:** HIGH

---

## Summary

Phase 10 wires game logic onto the visual scene built in Phases 8-9. The work is two plans: (1) an IIFE module `locations.js` extended with game state (EXERCISES constant, `loadExercise()`, `checkDrop()`, skip, completion), and (2) a `locations.html` page shell plus an entry button in `index.html`.

**Critical upstream dependency:** Phase 9 verification found 4 of 5 must-haves failing. The current `locations.html` has only 9 zones (cerca-de absent), zones are unlabeled teal blobs, the locked detrás-de dashed-border depth cue is not implemented, and 4 zones fall below the 44px touch-target minimum. Phase 10 planning must decide whether to (a) remediate Phase 9 gaps in a Wave 0 task before wiring game logic, or (b) scope Wave 0 of Plan 10-01 to fix the scene first. Either way, Phase 10 cannot be marked complete until SCEN-02, SCEN-03, and SCEN-04 are also satisfied — those requirements were Phase 9's but are unverified.

The game logic pattern is already well-established in the project: fill-blank.js is the closest analogue — it has `loadSentence()`, `history[]` back-tracking, `CoinTracker.addCoin()` on correct answer, `SharedUtils.confettiBurst()`, `SharedUtils.playSuccessSound()` / `playErrorSound()`, progress badge, skip, home button, and a completion branch. The Locations game follows the same loop, replacing sentence/choice DOM with the drag-and-drop scene and `LocationsGame.checkDrop()`.

**Primary recommendation:** Extend `locations.js` as a single IIFE that owns all game state; `LocationsGame.init()` stays the drag-engine entry point; add `LocationsGame.startGame()` as the game-loop entry point called from an inline script in `locations.html`.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAME-02 | User sees success feedback (sound, confetti, coin award) when dropped on correct zone | `SharedUtils.playSuccessSound()`, `SharedUtils.confettiBurst(30)`, `CoinTracker.addCoin()` — all verified in shared-utils.js and coins.js; same pattern as fill-blank.js line 80-88 |
| GAME-03 | User sees an error message and the object snaps back to origin when dropped on the wrong zone | `SharedUtils.playErrorSound()` for sound; `LocationsGame.resetDraggable(el)` for snap-back; error message injected to a `#feedback` div; same pattern as fill-blank.js wrong-answer branch |
| GAME-04 | User sees a progress badge showing how many prepositions completed out of 10 | `#progress-badge` element updated in `loadExercise()` — `progressEl.textContent = currentIndex + " / 10"` — identical to fill-blank.js line 39 |
| GAME-05 | User can skip the current preposition and advance to the next | Skip button calls `advanceExercise()` — same as fill-blank.js btnSkip.onclick; no correct-answer required, no coin awarded |
| GAME-06 | User sees a completion celebration when all 10 prepositions are done | `currentIndex >= 10` branch calls `SharedUtils.confettiBurst(50)` and renders completion HTML — identical to fill-blank.js loadSentence completion branch |
| NAV-01 | User can access the Locations game from a "Locations" button on index.html, below the "Fill in" button | New `<a>` element with `class="btn btn-locations"` added to `.grid-two-col` in index.html; new CSS rule `grid-column: 1 / -1` in styles.css mirroring btn-fill-blank pattern |
| NAV-02 | User can navigate back or to home from the Locations page | Back button `onclick = () => { history.length ? (currentIndex = history.pop(), loadExercise()) : location.href = '/' }` plus Home button `onclick = () => { location.href = '/' }` — same controls pattern as fill-blank.html |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `window.LocationsGame` (locations.js) | existing IIFE | Drag engine + game state | Already built in Phase 8; extend in place |
| `window.SharedUtils` (shared-utils.js) | existing IIFE | Sound, confetti, success animation | Used by all 4 game pages; loaded before locations.js |
| `window.CoinTracker` (coins.js) | existing IIFE | Award coin on correct drop | Loaded before shared-utils.js; `addCoin()` API verified |
| Vanilla HTML/CSS/JS | browser native | Page shell, controls, prompt card | Zero-dependency project constraint |

### No External Libraries

Zero-dependency static site. All game logic is vanilla JS IIFEs.

**Installation:** None required. All assets already exist.

**Script load order for locations.html (must match project convention):**
```html
<script src="/assets/js/coins.js"></script>
<script src="/assets/js/shared-utils.js"></script>
<script src="/assets/js/locations.js"></script>
<script>LocationsGame.startGame();</script>
```

Note: `game-init.js` is explicitly out of scope (REQUIREMENTS.md: "Locations is a learning game, not a coin-gated mini-game").

---

## Architecture Patterns

### Game Module Structure (locations.js extension)

The existing IIFE in locations.js exposes `{ init, resetDraggable }`. Phase 10 adds game-state variables and functions inside the same IIFE closure, then also exposes `startGame`.

```
locations.js IIFE closure:
  ── Existing (Phase 8, do not change) ──
  var shiftX, shiftY, originLeft, originTop, snapTimer
  var onDropCallback, activeDraggable
  function init(draggableEl, onDrop)        ← drag engine entry
  function onPointerDown / onPointerMove / onPointerUp
  function snapBack(el)
  function resetDraggable(el)               ← public API

  ── New (Phase 10) ──
  var EXERCISES = [...]                      ← constant array, 10 items
  var currentIndex, history, draggableEl    ← game state
  function startGame()                       ← public API, called from HTML
  function loadExercise()                    ← renders prompt, updates progress
  function checkDrop(zoneName, el)           ← onDrop callback wired to init()
  function advanceExercise()                 ← correct or skip → next
  function showCompletion()                  ← renders when currentIndex >= 10

window.LocationsGame = { init, resetDraggable, startGame };
```

### EXERCISES Constant Structure

10 fixed objects — no TSV fetch, no async. Inline JS constant (locked decision from STATE.md).

```javascript
// Source: REQUIREMENTS.md SCEN-02 zone list + data-zone kebab-case keys from locations.html
var EXERCISES = [
  { zone: "encima-de",         es: "encima de",         de: "oben auf" },
  { zone: "debajo-de",         es: "debajo de",         de: "unter" },
  { zone: "delante-de",        es: "delante de",        de: "vor" },
  { zone: "detras-de",         es: "detrás de",         de: "hinter" },
  { zone: "al-lado-de",        es: "al lado de",        de: "neben" },
  { zone: "a-la-derecha-de",   es: "a la derecha de",   de: "rechts von" },
  { zone: "a-la-izquierda-de", es: "a la izquierda de", de: "links von" },
  { zone: "cerca-de",          es: "cerca de",          de: "in der Nähe von" },
  { zone: "lejos-de",          es: "lejos de",          de: "weit weg von" },
  { zone: "en",                es: "en",                de: "in / auf" }
];
```

**IMPORTANT:** `zone` values must exactly match `data-zone` attribute values in locations.html. Verified mapping:
- `encima-de`, `debajo-de`, `delante-de`, `detras-de`, `al-lado-de`, `a-la-derecha-de`, `a-la-izquierda-de`, `en`, `lejos-de` — all present in locations.html (Phase 9 output)
- `cerca-de` — MISSING from locations.html (Phase 9 gap). Phase 10 Wave 0 must add this zone before game logic works.

### Recommended Page Structure (locations.html)

Following the fill-blank.html pattern exactly:

```
<head>
  coins.js, shared-utils.js, locations.js
</head>
<body>
  .container > .card
    header row: h1 "Locations" + coin-counter badge + progress-badge
    #prompt-card: Spanish preposition + German translation
    .scene (existing 10-zone layout — DO NOT REPLACE, only fix gaps)
    .controls: Back button + Skip button + Home button
    #feedback: error message div (hidden by default)
</body>
<script>LocationsGame.startGame();</script>
```

### Pattern: loadExercise()

Mirrors `fill-blank.js initGame > loadSentence()` exactly:

```javascript
function loadExercise() {
  if (currentIndex >= EXERCISES.length) {
    showCompletion();
    return;
  }
  var ex = EXERCISES[currentIndex];
  // Update prompt card
  document.getElementById('prompt-es').textContent = ex.es;
  document.getElementById('prompt-de').textContent = ex.de;
  // Update progress badge
  document.getElementById('progress-badge').textContent =
    (currentIndex + 1) + ' / ' + EXERCISES.length;
  // Reset draggable to its CSS resting origin
  resetDraggable(draggableEl);
  // Clear feedback
  var fb = document.getElementById('feedback');
  if (fb) { fb.textContent = ''; fb.style.display = 'none'; }
}
```

### Pattern: checkDrop() — the onDrop callback

```javascript
function checkDrop(zoneName, el) {
  var ex = EXERCISES[currentIndex];
  if (zoneName === ex.zone) {
    // Correct
    SharedUtils.playSuccessSound();
    SharedUtils.confettiBurst(30);
    CoinTracker.addCoin();
    advanceExercise();
  } else {
    // Wrong
    SharedUtils.playErrorSound();
    var fb = document.getElementById('feedback');
    if (fb) {
      fb.textContent = 'Falsch! Try again.';
      fb.style.display = 'block';
    }
    resetDraggable(el);  // snap back to origin
  }
}
```

### Pattern: startGame()

```javascript
function startGame() {
  currentIndex = 0;
  history = [];
  draggableEl = document.getElementById('draggable');
  LocationsGame.init(draggableEl, checkDrop);
  // Wire controls
  document.getElementById('btn-skip').onclick = function() { advanceExercise(true); };
  document.getElementById('btn-back').onclick = function() {
    if (history.length === 0) return;
    currentIndex = history.pop();
    updateBackButton();
    loadExercise();
  };
  document.getElementById('btn-home').onclick = function() { location.href = '/'; };
  updateBackButton();
  loadExercise();
}
```

### Pattern: showCompletion()

```javascript
function showCompletion() {
  SharedUtils.confettiBurst(50);
  document.getElementById('prompt-card').innerHTML =
    '<div style="text-align:center; padding: 16px;">' +
    '<div style="font-size:2rem; margin-bottom:8px;">🎉</div>' +
    '<div style="font-weight:700; font-size:1.2rem; color:var(--ok);">All 10 done!</div>' +
    '<div style="color:var(--muted); margin-top:8px;">Gut gemacht!</div>' +
    '</div>';
  document.getElementById('progress-badge').textContent = '10 / 10';
  // Hide skip, keep home and back
  var btnSkip = document.getElementById('btn-skip');
  if (btnSkip) btnSkip.style.display = 'none';
}
```

### Pattern: NAV-01 — Home button in index.html

Add after `.btn-fill-blank` in `.grid-two-col`, before `.btn-games`:

```html
<!-- 📍 Locations — spans both columns -->
<a class="btn btn-locations" href="/locations.html">📍 Locations</a>
```

With CSS in styles.css:

```css
.grid-two-col .btn-locations {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #2a3a50 0%, #1a2535 100%);
  border: 2px solid var(--accent);
  font-weight: 700;
}
```

### Anti-Patterns to Avoid

- **Calling `LocationsGame.init()` before `startGame()`**: `init()` wires the drag engine permanently. `startGame()` must call `init()` exactly once on page load, passing `checkDrop` as the callback. Do not call `init()` in an inline script separate from `startGame()`.
- **Replacing the scene HTML in Phase 10**: locations.html scene structure is owned by Phase 9. Phase 10 only adds prompt card, controls, and feedback elements outside the scene div. Do not modify `.scene` CSS or zone divs except to fix the 4 Phase 9 gaps (cerca-de, touch targets, depth cue).
- **Shuffling EXERCISES**: REQUIREMENTS.md does not require shuffle. The 10 prepositions are presented in a fixed pedagogically sequenced order. Do not call `SharedUtils.shuffleArray()` on EXERCISES (unlike fill-blank which shuffles).
- **Using `game-init.js`**: Explicitly out of scope per REQUIREMENTS.md. Do not add a coin/lives gate.
- **Awarding a coin on skip**: Skip advances without awarding a coin. Only correct drop awards a coin.
- **Forgetting advanceTimer guard**: If user clicks skip while a success animation is mid-flight, a timer guard prevents double-advance (same as fill-blank.js `advanceTimer` pattern).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Success sound | Custom Web Audio oscillator sequence | `SharedUtils.playSuccessSound()` | Already implemented: C5-E5-G5 sine chime via Web Audio API |
| Error sound | Custom sawtooth | `SharedUtils.playErrorSound()` | Already implemented: 150Hz sawtooth 0.15s |
| Confetti | Custom particle system | `SharedUtils.confettiBurst(count)` | Already implemented; injects @keyframes fall if missing |
| Coin award | Custom localStorage write | `CoinTracker.addCoin()` | Already implemented; dispatches coinschanged CustomEvent to update #coin-counter |
| Snap-back animation | Custom CSS transition | `LocationsGame.resetDraggable(el)` | Already implemented with 0.25s ease transition and cleanup |
| Progress text | Custom counter state | Inline DOM update `progressEl.textContent = (i+1) + " / 10"` | No library needed — single string write |

**Key insight:** Every feedback mechanism needed by Phase 10 is already built and verified in other game pages. The work is wiring, not building.

---

## Critical Phase 9 Gaps (Must Address in Phase 10 Wave 0)

Phase 9 verification (09-VERIFICATION.md) found 4 blockers that Phase 10 inherits:

### Gap 1: cerca-de zone missing from locations.html (BLOCKER for GAME-02/GAME-03)

**What:** `<div data-zone="cerca-de" class="zone"></div>` is absent. The EXERCISES constant will include `{ zone: "cerca-de", ... }` but `checkDrop("cerca-de", el)` will never fire a correct result because no element with that data-zone exists.

**Fix:** Add `<div data-zone="cerca-de" class="zone"></div>` with a distinct CSS position in the scene. Suggested position: between al-lado-de and lejos-de in the right column (e.g., `top: 236px; right: 4px; width: 44px;` — shifting the existing band trio coordinates to make room for a 4th zone in that column, or use a different region entirely). This must be decided at planning time.

### Gap 2: Locked detrás-de depth cue not applied (BLOCKER for SCEN-03 — correctness prerequisite)

**What:** STATE.md locked decision "dashed border + drop-shadow" is not in locations.html. The zones are unlabeled blobs without borders.

**Fix:** Apply `zone-detras` class CSS with `border-style: dashed; box-shadow: inset 0 3px 10px rgba(0,0,0,0.55); opacity: 0.7;` to the detras-de zone. This is a visual-only fix; no game logic changes.

### Gap 3: 4 zones below 44px touch target minimum

**What:** encima-de (22px tall), detras-de (42px tall), lejos-de (36x36px), debajo-de (40px tall).

**Fix:** Adjust zone div CSS so min-height: 44px; min-width: 44px; are satisfied. The visual (::before pseudo-element) can remain shaped as designed; only the hit-area div needs the 44px minimum.

### Gap 4: Zones are unlabeled blobs (SCEN-02 requires labeled zones)

**What:** Zones show no Spanish text. SCEN-02 requires labeled zones. GAME-02/03/04 success criteria reference "the prompt card" — zones need labels so the user knows where they are dropping.

**Fix:** Zone labels should exist (either as text content in the zone div, or as a separate label element adjacent to each zone). This is compatible with the blob visual design — text can be placed outside the blob ::before pseudo-element.

**Planning decision:** The planner must decide whether Wave 0 of Plan 10-01 fixes all 4 gaps, or whether a dedicated 10-00 scene-fix plan is created first. Recommendation: include scene gap fixes as the first task in Plan 10-01 (single Wave 0 task), not a separate plan — avoids a 3-plan phase for what is essentially 2 plans of real work.

---

## Common Pitfalls

### Pitfall 1: checkDrop fires on a zone not in EXERCISES

**What goes wrong:** If user drops on a zone not matching the current exercise's `zone` key, the wrong-answer branch fires correctly. But if cerca-de is missing from the HTML, the EXERCISES entry for cerca-de can never be answered — game gets stuck.

**How to avoid:** Ensure EXERCISES[i].zone values exactly match data-zone attribute values in locations.html. Add cerca-de zone in Wave 0 before writing EXERCISES constant.

### Pitfall 2: advanceTimer not cleared before skip

**What goes wrong:** User completes a drop (success animation running, 1s timer queued), then immediately hits Skip. Two advances fire: timer-advance AND skip-advance. `currentIndex` skips 2 exercises.

**How to avoid:** Guard all advance paths with `if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }` before incrementing — exact pattern from fill-blank.js lines 106-107.

### Pitfall 3: resetDraggable not called between exercises

**What goes wrong:** After a correct drop, the draggable object stays wherever it was dropped (in fixed positioning with inline left/top). The next exercise starts with the draggable sitting on the correct zone of the previous exercise.

**How to avoid:** `advanceExercise()` must call `resetDraggable(draggableEl)` before calling `loadExercise()`. The `loadExercise()` itself also calls `resetDraggable()` as a safety — belt-and-suspenders.

### Pitfall 4: progress badge shows 1 / 10 on first exercise instead of 1 / 10 at completion

**What goes wrong:** Progress badge is set to `currentIndex + 1` — so on the first exercise (index 0) it shows "1 / 10". This is correct (progress, not index). The fill-blank.js pattern uses this same formula.

**Warning signs:** Bug report that progress seems off by one. It is not — confirm the formula is `currentIndex + 1` at `loadExercise()` time.

### Pitfall 5: locations.html overrides scene layout from Phase 9

**What goes wrong:** Plan 10-02 creates a new locations.html shell and unintentionally replaces the Phase 9 scene layout rather than extending it.

**How to avoid:** Plan 10-02 modifies locations.html — it must preserve the entire `.scene` div contents (zones, #caja, #draggable, #caja-shadow, #draggable-shadow) and only add elements OUTSIDE the `.scene` div (prompt card, controls, feedback). Read the current file before writing.

### Pitfall 6: Back button enabled at game start

**What goes wrong:** `history = []` at start means there is no prior exercise to go back to. If btnBack is enabled at game start, clicking it does nothing visible or causes an error.

**How to avoid:** `updateBackButton()` disables btnBack when `history.length === 0` — same as fill-blank.js line 102.

---

## Code Examples

### EXERCISES Declaration

```javascript
// Source: REQUIREMENTS.md SCEN-02 (zone list) + locations.html data-zone attribute values
var EXERCISES = [
  { zone: 'encima-de',         es: 'encima de',         de: 'oben auf' },
  { zone: 'debajo-de',         es: 'debajo de',         de: 'unter' },
  { zone: 'delante-de',        es: 'delante de',        de: 'vor' },
  { zone: 'detras-de',         es: 'detrás de',         de: 'hinter' },
  { zone: 'al-lado-de',        es: 'al lado de',        de: 'neben' },
  { zone: 'a-la-derecha-de',   es: 'a la derecha de',   de: 'rechts von' },
  { zone: 'a-la-izquierda-de', es: 'a la izquierda de', de: 'links von' },
  { zone: 'cerca-de',          es: 'cerca de',          de: 'in der Nähe von' },
  { zone: 'lejos-de',          es: 'lejos de',          de: 'weit weg von' },
  { zone: 'en',                es: 'en',                de: 'in / auf' }
];
```

### CoinTracker.addCoin() — correct usage

```javascript
// Source: fill-blank.js line 82 + coins.js verified API
if (window.CoinTracker) CoinTracker.addCoin();
```

Guard with `window.CoinTracker` check in case script load order changes during development.

### Prompt Card HTML

```html
<!-- Source: fill-blank.html pattern adapted for drag-and-drop prompt -->
<div id="prompt-card" class="sentence-target" style="text-align:center; margin-bottom:12px;">
  <div id="prompt-es" style="font-size:1.4rem; font-weight:700; color:var(--ink);">—</div>
  <div id="prompt-de" style="font-size:1rem; color:var(--muted); margin-top:4px;">—</div>
</div>
```

### Header Row (coin counter + progress badge)

```html
<!-- Source: fill-blank.html header pattern -->
<div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;">
  <h1 style="margin:0">📍 Locations</h1>
  <div style="display:flex; align-items:center; gap:8px;">
    <span class="badge coin-badge" id="coin-counter"><span class="coin-icon"></span> 0</span>
    <span class="badge" id="progress-badge">1 / 10</span>
  </div>
</div>
```

### Controls Row

```html
<!-- Source: fill-blank.html .controls pattern -->
<div class="controls">
  <button class="btn secondary" id="btn-back" disabled>← Back</button>
  <button class="btn secondary" id="btn-skip">Skip →</button>
  <button class="btn secondary" id="btn-home">🏠 Home</button>
</div>
```

### Feedback Div (error message area)

```html
<!-- Source: fill-blank.html #error pattern -->
<div class="error" id="feedback" style="display:none; margin-top:8px; text-align:center;"></div>
```

The `.error` class already exists in styles.css with `color: var(--error)` styling.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Phase 8-9: static test scaffold (LocationsGame.init with console/result div callback) | Phase 10: full game loop with EXERCISES, progress, coin award, completion | Phase 10 | locations.html becomes a real game page, not a test scaffold |
| Inline script callback in locations.html | `startGame()` as a named public API on `window.LocationsGame` | Phase 10 | Cleaner page; `<script>LocationsGame.startGame();</script>` replaces multi-line inline script |

---

## Open Questions

1. **German translations for the 10 prepositions**
   - What we know: "encima de" = "oben auf", "debajo de" = "unter", "delante de" = "vor", "detrás de" = "hinter", "en" = "in / auf" are reasonably certain
   - What's unclear: "cerca de" = "in der Nähe von" vs "nahe bei", "al lado de" = "neben" vs "nebenan", "a la derecha de" = "rechts von" vs "rechts neben"
   - Recommendation: The planner should confirm German translations with the user (owner is Spanish/German context). Placeholder translations provided in EXERCISES above are best-effort; exact wording is a content decision, not a code decision.

2. **cerca-de zone position in the scene**
   - What we know: The current Phase 9 scene has 9 zones; the right-column strip at `top:280px, right:4px` is "al-lado-de" and `top:20px, right:4px` is "lejos-de". There is no cerca-de.
   - What's unclear: Where to place cerca-de so it fits visually and communicates "near" relative to al-lado-de and lejos-de.
   - Recommendation: Planner should specify coordinates for a 3-band vertical strip (all three distance zones stacked with 10-12px gaps), replacing the current 2-element strip.

3. **Exercise order: shuffle vs fixed**
   - What we know: REQUIREMENTS.md does not specify. fill-blank.js shuffles; sentences.js shuffles.
   - What's unclear: Whether fixed pedagogical order or random order is preferred for a learning game teaching prepositions for the first time.
   - Recommendation: Default to fixed order (sequence in EXERCISES constant as written) — easier to learn when prepositions are grouped semantically (vertical, front/back, lateral, distance). A later phase can add shuffle (GAME-09 mentions restart + shuffle as a v2+ enhancement).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — zero-dependency static site; no test runner |
| Config file | none |
| Quick run command | Open `tap-to-vocab/locations.html` in browser; play through 2-3 exercises |
| Full suite command | Manual playthrough of all 10 exercises on 375px viewport |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAME-02 | Correct drop plays sound, triggers confetti, awards coin | manual | Open locations.html; drop on correct zone; verify #coin-counter increments | ❌ Wave 0 |
| GAME-03 | Wrong drop shows error message, object snaps back | manual | Drop on wrong zone; verify #feedback text visible and draggable returns to origin | ❌ Wave 0 |
| GAME-04 | Progress badge updates after correct drop or skip | manual | Inspect #progress-badge after each drop/skip action | ❌ Wave 0 |
| GAME-05 | Skip button advances to next exercise without coin | manual | Click Skip; verify currentIndex increments, no coin awarded | ❌ Wave 0 |
| GAME-06 | Completion screen shows after 10th correct drop or skip | manual | Complete all 10 exercises; verify confetti burst and completion message | ❌ Wave 0 |
| NAV-01 | Locations button visible on index.html, navigates to locations.html | manual | Open index.html; confirm Locations button exists and links to /locations.html | ❌ Wave 0 |
| NAV-02 | Back and Home buttons work from locations.html | manual | Click Home from locations.html; verify redirect to /; test Back button navigates to prior exercise | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** Open locations.html in browser; confirm drag engine still works and game state updates
- **Per wave merge:** Full manual playthrough of all 10 exercises on 375px viewport (DevTools)
- **Phase gate:** All 7 Phase 10 success criteria AND all remaining Phase 9 gaps resolved before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tap-to-vocab/locations.html` — fix 4 Phase 9 gaps (add cerca-de zone, apply zone-detras depth cue, fix 4 touch targets to 44px, add zone labels or verify unlabeled design meets SCEN-02)
- [ ] `tap-to-vocab/assets/js/locations.js` — add EXERCISES, game state variables, startGame(), loadExercise(), checkDrop(), advanceExercise(), showCompletion() to existing IIFE
- [ ] `tap-to-vocab/locations.html` — add prompt card, controls, feedback div outside .scene; update script tags order; call `LocationsGame.startGame()`
- [ ] `tap-to-vocab/index.html` — add Locations button to .grid-two-col
- [ ] `tap-to-vocab/assets/css/styles.css` — add .btn-locations rule

*(No automated test infrastructure needed — project uses manual browser testing throughout)*

---

## Sources

### Primary (HIGH confidence)

- `tap-to-vocab/assets/js/locations.js` (read directly) — exact IIFE structure, public API `{ init, resetDraggable }`, `onDropCallback` parameter signature, `snapBack()` behavior
- `tap-to-vocab/assets/js/fill-blank.js` (read directly) — authoritative game loop pattern: `loadSentence()`, `history[]`, `advanceTimer`, `CoinTracker.addCoin()`, `SharedUtils` calls, skip/back/home button wiring
- `tap-to-vocab/assets/js/shared-utils.js` (read directly) — exact API: `playSuccessSound()`, `playErrorSound()`, `showSuccessAnimation()`, `confettiBurst(count)`, `shuffleArray(arr)`
- `tap-to-vocab/assets/js/coins.js` (read directly) — exact API: `addCoin()`, `getCoins()`, `spendCoins(amount)`, `#coin-counter` auto-update via coinschanged CustomEvent
- `tap-to-vocab/locations.html` (read directly) — actual Phase 9 output: 9 zones, zone positions, #draggable at left:12px top:24px, script load structure
- `tap-to-vocab/index.html` (read directly) — .grid-two-col structure, .btn-fill-blank pattern for new button placement
- `tap-to-vocab/assets/css/styles.css` (read directly) — CSS custom properties, `.btn`, `.badge`, `.coin-badge`, `.controls`, `.error`, `.quiz-modal` classes
- `tap-to-vocab/fill-blank.html` (read directly) — exact HTML pattern for header, controls, error div
- `.planning/phases/09-scene-layout/09-VERIFICATION.md` (read directly) — 4 blocker gaps in Phase 9 output that Phase 10 must address

### Secondary (MEDIUM confidence)

- `.planning/STATE.md` — locked decisions: EXERCISES inline (no TSV), al-lado-de fixed to right side, Pointer Events API, entre excluded
- `.planning/REQUIREMENTS.md` — complete 10-preposition zone list (SCEN-02), explicit out-of-scope list (game-init.js coin gate excluded)
- `.planning/ROADMAP.md` — Phase 10 plan hints: 10-01 (locations.js IIFE with game logic), 10-02 (locations.html shell + index.html button)

### Tertiary (LOW confidence)

- German translation values for "cerca de", "al lado de", "a la derecha/izquierda de" — best-effort based on standard Spanish-German translation; should be confirmed with project owner

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries read directly from source; APIs verified in existing files
- Architecture (game loop pattern): HIGH — fill-blank.js is an exact analogue; pattern is copy-and-adapt, not invent
- Phase 9 gap inventory: HIGH — read from 09-VERIFICATION.md and confirmed by reading locations.html directly
- German translations: LOW — standard translations, not verified against project owner's intent
- cerca-de zone coordinates: LOW — requires visual placement decision; no pixel values can be verified without seeing the scene

**Research date:** 2026-03-15
**Valid until:** Indefinitely (stable vanilla JS/CSS; no library churn risk)
