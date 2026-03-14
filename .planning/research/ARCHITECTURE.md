# Architecture Research

**Domain:** Spatial prepositions drag-and-drop game — integration into existing Tap-to-Vocab static site
**Researched:** 2026-03-14
**Confidence:** HIGH — based on direct codebase inspection, no speculative claims

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (GitHub Pages)                   │
├─────────────────────────────────────────────────────────────┤
│  index.html        locations.html        [other pages]       │
│  (home grid)       (NEW — this page)     (existing)          │
├─────────────────────────────────────────────────────────────┤
│                    Script Load Order                         │
│  coins.js  →  shared-utils.js  →  locations.js              │
│  (CoinTracker)  (SharedUtils)   (window.Locations — NEW)     │
├─────────────────────────────────────────────────────────────┤
│                    Inline Data (JS constant)                 │
│  EXERCISES array defined at top of locations.js              │
│  (no TSV file — see Data Structure rationale below)          │
├─────────────────────────────────────────────────────────────┤
│                    Persistent State                          │
│  localStorage: coins (CoinTracker)                           │
│  No page-specific state needed — game resets per session     │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|---------------|----------------|
| `locations.html` | Page shell: header, coin badge, scene container, prompt area, controls | Static HTML, links styles.css, loads 3 scripts |
| `locations.js` (IIFE) | Game logic: exercise sequencing, drag/touch handling, drop zone hit detection, feedback | New file, exports `window.Locations` |
| `coins.js` | Coin award on correct drop | Existing — call `CoinTracker.addCoin()` on success |
| `shared-utils.js` | `playSuccessSound()`, `playErrorSound()`, `showSuccessAnimation()`, `confettiBurst()` | Existing — no changes |
| `styles.css` | New CSS classes for locations scene appended to file | Modified — add `.locations-*` classes |
| `index.html` | Add "Locations" button to `.grid-two-col` | Modified — one new `<a>` element |

---

## Recommended Project Structure

```
tap-to-vocab/
├── locations.html                  # NEW — page shell
├── assets/
│   ├── css/
│   │   └── styles.css              # MODIFIED — append locations CSS section
│   └── js/
│       ├── coins.js                # unchanged
│       ├── shared-utils.js         # unchanged
│       └── locations.js            # NEW — IIFE module
├── index.html                      # MODIFIED — add Locations button
└── data/                           # unchanged — no new TSV needed
```

### Structure Rationale

- **No new TSV file:** The 11 prepositions are a fixed, closed vocabulary set that never changes. Using a TSV would add fetch latency, a loading state, and an error path for zero gain. Inline JS constant is the right tradeoff at this scale. Every other game page (fill-blank, sentences, conjugation) loads dynamic content that editors might extend — prepositions are different.
- **locations.js as new IIFE module:** Consistent with every other game module in the codebase. Exports `window.Locations` with a single `init()` entry point called from an inline `<script>` block at the bottom of `locations.html`.
- **styles.css modification (not new file):** All pages share one stylesheet. Splitting would break the load pattern and require a second link element in locations.html while adding nothing architecturally.

---

## Architectural Patterns

### Pattern 1: IIFE Module with Single init() Entry Point

**What:** Wrap all module code in `(function(){ ... })()`. Export one object to `window`. Call `Locations.init()` from an inline script at the bottom of the HTML page.

**When to use:** Always — this is the project's established module pattern.

**Trade-offs:** No tree shaking, no ESM benefits. Accepted cost for zero-build-step simplicity.

**Example:**
```javascript
(function () {
  var EXERCISES = [ /* ... */ ];
  var state = {};

  function initGame(exercises) { /* ... */ }
  function init() { initGame(SharedUtils.shuffleArray(EXERCISES)); }

  window.Locations = { init: init };
})();
```

### Pattern 2: CSS Positioned Divs for the Scene (not Canvas)

**What:** Render the spatial scene as a fixed-size `div` with `position: relative`. Place the reference box, drop zones, and draggable object as absolutely-positioned child `div`s.

**When to use:** Any interactive learning layout where individual elements need click/drag/touch targets, readable labels, and CSS transitions. Canvas is appropriate for the mini-games (Jungle Run, etc.) which require per-frame animation loops — not for a turn-based educational exercise.

**Trade-offs:** CSS layout is slower to prototype the spatial grid but far easier to maintain, style, and make accessible. Touch and pointer events work naturally on DOM elements. Canvas would require manual hit detection, manual text rendering, and manual touch coordinate math — all unnecessary here.

**Why not Canvas:** The existing canvas pages (Jungle Run, Tower Stack, Coin Dash) use canvas because they need a requestAnimationFrame loop for physics. Locations has no animation loop — it is turn-based. DOM is the right tool.

### Pattern 3: Pointer Events API for Drag on Mobile and Desktop

**What:** Use `pointerdown`, `pointermove`, `pointerup` on the draggable object. Call `element.setPointerCapture(e.pointerId)` on `pointerdown` to ensure `pointermove` events stay on the element even when finger moves fast. On `pointerup`, compute final position and check which drop zone was hit.

**When to use:** Any drag interaction that must work on both touch and mouse without separate event handler branches.

**Trade-offs:** Pointer Events are supported in all modern browsers including iOS Safari 13+ (HIGH confidence — widely supported). The HTML5 Drag and Drop API (`draggable`, `ondragover`, `ondrop`) does not work reliably on iOS without a polyfill, so do not use it.

**Why not HTML5 DnD:** iOS Safari does not fire `dragstart` or `drop` on touch devices without third-party polyfills. Pointer Events work natively. This is a known constraint for zero-dependency static sites.

**Example structure:**
```javascript
draggable.addEventListener("pointerdown", function(e) {
  e.preventDefault();
  draggable.setPointerCapture(e.pointerId);
  state.dragging = true;
  state.startX = e.clientX;
  state.startY = e.clientY;
});

draggable.addEventListener("pointermove", function(e) {
  if (!state.dragging) return;
  var dx = e.clientX - state.startX;
  var dy = e.clientY - state.startY;
  draggable.style.transform = "translate(" + dx + "px, " + dy + "px)";
});

draggable.addEventListener("pointerup", function(e) {
  if (!state.dragging) return;
  state.dragging = false;
  draggable.releasePointerCapture(e.pointerId);
  checkDrop(e.clientX, e.clientY);
});
```

### Pattern 4: Drop Zone Hit Detection via getBoundingClientRect

**What:** On `pointerup`, iterate the 11 drop zone elements, call `getBoundingClientRect()` on each, and check if the pointer coordinates fall within any zone's bounds.

**When to use:** Always prefer DOM-native hit detection over manual coordinate math when elements are in the DOM. `getBoundingClientRect()` handles scroll offset and viewport transforms automatically.

**Example:**
```javascript
function checkDrop(clientX, clientY) {
  var hit = null;
  dropZones.forEach(function(zone) {
    var rect = zone.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right &&
        clientY >= rect.top  && clientY <= rect.bottom) {
      hit = zone;
    }
  });
  if (hit) {
    handleDrop(hit.dataset.key);
  } else {
    returnDraggable();
  }
}
```

---

## Drop Zone Layout for All 11 Prepositions

This is the central design problem. All 11 positions must be visually distinct and recognizable on a mobile screen (~375px wide).

### Scene Structure

The scene is a fixed-aspect-ratio container (`aspect-ratio: 1 / 1` or `padding-bottom: 100%`) containing:
- A **reference box** centered in the middle third of the scene
- **Drop zones** placed at the 11 spatial positions relative to the box
- A **draggable object** (ball or simplified icon) that the user places

### Position-to-Zone Mapping

```
┌─────────────────────────────────────┐
│            [encima de]              │  top — above box
│  [lejos de]  ┌────────┐  [lejos de]│  far — two corners (or single wide zone)
│              │        │            │
│[a la izq de]│ CAJA   │[a la der de]│  left / right of box
│              │ (ref)  │            │
│  [cerca de]  └────────┘  [cerca de]│  near — adjacent to box sides
│            [debajo de]              │  bottom — below box
│   [delante de]  shown differently  │
│   [detrás de]   shown differently  │
│         [entre]  two-box row        │
│           [en]  inside box          │
└─────────────────────────────────────┘
```

### Solving the Ambiguous Positions

**encima de (on top of) vs debajo de (underneath):**
Standard above/below placement — no ambiguity.

**a la derecha de (to the right of) vs a la izquierda de (to the left of):**
Standard left/right placement — no ambiguity.

**delante de (in front of) vs detrás de (behind):**
These are the hardest to show in a flat 2D scene. Recommended approach: use a **perspective-hint sub-scene** for these two. Render a second small isometric or pseudo-3D box (CSS `transform: rotateX(20deg) rotateY(-20deg)` on the reference box div) and label the front face area and the shadowed back area. Alternatively: show the reference box with a visible "front face" (lighter color, slightly larger) and a "back face" (darker, slightly offset behind) using CSS. The drop zone for `detrás de` is placed at the offset dark-face position.

Simpler fallback: divide a dedicated row at the bottom of the scene into two labeled sub-zones: "delante" (left half, bright border) and "detrás" (right half, dark/muted border with a "shadow" appearance). This makes intent unambiguous even if not perfectly iconic.

**cerca de (near) vs lejos de (far):**
Use **distance from the reference box** as the visual cue. Place `cerca de` drop zones immediately adjacent to the box edges (thin ring around it). Place `lejos de` drop zones at the scene corners (maximum distance). Label each zone with a small text label that appears on hover/focus. Use color: `cerca de` gets `--accent` (blue, nearby) and `lejos de` gets `--muted` (dimmed, distant).

**entre (between):**
Render two smaller reference boxes side by side in a dedicated "between" row at the bottom of the scene. The drop zone is the gap between them. This row is clearly separate from the single-box positions.

**en (inside/in):**
The drop zone is the interior of the reference box itself. Give it a dashed border and a distinct background. The object "entering" it triggers a fill animation.

**al lado de (beside) vs a la derecha/izquierda de:**
`al lado de` is ambiguous directionally — it means "beside" without specifying which side. Two approaches:
1. Treat it as a synonym for either side and accept either left or right as correct.
2. Define a single "beside" zone on one designated side (e.g., right) and document this in the exercise data.
Recommended: define a single fixed side for `al lado de` in each exercise definition. Do not rely on the user knowing which side — the exercise prompt can say "place the ball beside (to the right of) the box."

### Recommended Layout Grid (percentage positions within scene container)

| Zone | CSS `top` | CSS `left` | CSS `width` | CSS `height` |
|------|-----------|------------|-------------|-------------|
| encima de | 5% | 30% | 40% | 15% |
| debajo de | 80% | 30% | 40% | 15% |
| a la izquierda de | 30% | 2% | 20% | 30% |
| a la derecha de | 30% | 78% | 20% | 30% |
| cerca de (left) | 38% | 18% | 12% | 14% |
| cerca de (right) | 38% | 70% | 12% | 14% |
| lejos de (top-left) | 5% | 2% | 18% | 18% |
| lejos de (top-right) | 5% | 80% | 18% | 18% |
| en (inside) | 33% | 33% | 34% | 34% |
| delante de / detrás de row | 68% | 5% | 90% | 20% (split in half) |
| entre (two-box row) | 90% | 5% | 90% | — (separate visual row below main scene) |

Note: The reference box occupies roughly 33%-67% left/right, 33%-67% top/bottom of the scene.

These percentages are starting points. Implement as percentage-based `position: absolute` values inside the scene `div` so they scale proportionally on all screen sizes.

### Mobile-First Sizing

The scene container should be:
```css
.locations-scene {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;   /* Square scene */
  max-width: 420px;       /* Cap on desktop */
  margin: 0 auto;
  background: #0f1540;
  border-radius: 16px;
  border: 1px solid #243688;
  overflow: hidden;
}
```

On 375px viewport width this gives a 375x375px scene — enough space to place 11 zones without overlap if zone sizes are kept to ~15-20% of scene width.

Drop zones must have a minimum touch target of 44x44px (project requirement). At 375px scene width, 15% = ~56px — within spec.

---

## Data Structure

### Inline JS Constant (recommended over TSV)

```javascript
var EXERCISES = [
  {
    key: "encima_de",
    es: "encima de",
    de: "auf / oben auf",
    hint: "Put the ball on top of the box.",
    zoneId: "zone-encima-de"
  },
  {
    key: "debajo_de",
    es: "debajo de",
    de: "unter",
    hint: "Put the ball underneath the box.",
    zoneId: "zone-debajo-de"
  },
  {
    key: "delante_de",
    es: "delante de",
    de: "vor",
    hint: "Put the ball in front of the box.",
    zoneId: "zone-delante-de"
  },
  {
    key: "detras_de",
    es: "detrás de",
    de: "hinter",
    hint: "Put the ball behind the box.",
    zoneId: "zone-detras-de"
  },
  {
    key: "al_lado_de",
    es: "al lado de",
    de: "neben",
    hint: "Put the ball beside the box.",
    zoneId: "zone-al-lado-de"
  },
  {
    key: "a_la_derecha_de",
    es: "a la derecha de",
    de: "rechts von",
    hint: "Put the ball to the right of the box.",
    zoneId: "zone-derecha"
  },
  {
    key: "a_la_izquierda_de",
    es: "a la izquierda de",
    de: "links von",
    hint: "Put the ball to the left of the box.",
    zoneId: "zone-izquierda"
  },
  {
    key: "entre",
    es: "entre",
    de: "zwischen",
    hint: "Put the ball between the two boxes.",
    zoneId: "zone-entre"
  },
  {
    key: "cerca_de",
    es: "cerca de",
    de: "in der Nähe von",
    hint: "Put the ball near the box.",
    zoneId: "zone-cerca-de"
  },
  {
    key: "lejos_de",
    es: "lejos de",
    de: "weit weg von",
    hint: "Put the ball far from the box.",
    zoneId: "zone-lejos-de"
  },
  {
    key: "en",
    es: "en",
    de: "in",
    hint: "Put the ball inside the box.",
    zoneId: "zone-en"
  }
];
```

Each exercise maps a `zoneId` (matching a drop zone element's `id` in the HTML) to a Spanish preposition. The game picks exercises in shuffled order and asks the player to place the draggable object in the correct zone.

### Why not TSV

- The exercise set is complete and closed — 11 entries, no user extension path
- TSV would require an async `init()`, a loading state, an error path, and `SharedUtils.loadTSV()` call — overhead for a file that will never change
- Inline data is immediately available, verifiable at a glance, and eliminates the fetch-failure error case
- Existing TSV-driven pages (fill-blank, conjugation, sentences) use TSV because the content is expected to grow — prepositions are not

---

## Data Flow

### Game Loop

```
Page Load
    ↓
locations.html DOMContentLoaded
    ↓
Locations.init() called from inline <script>
    ↓
EXERCISES array shuffled (SharedUtils.shuffleArray)
    ↓
loadExercise(index=0)
    ↓
Render prompt: Spanish preposition + German translation hint
    ↓
User drags object (pointerdown → pointermove → pointerup)
    ↓
checkDrop(clientX, clientY) via getBoundingClientRect
    ├── HIT correct zone → showSuccessAnimation() + confettiBurst(20)
    │                    + CoinTracker.addCoin()
    │                    + setTimeout(loadExercise, 1200)
    └── HIT wrong zone  → playErrorSound() + shake animation on draggable
                        + return draggable to start position
    └── NO HIT (dropped on scene background)
                        → return draggable to start position (no sound)
```

### State Management

All game state is local to the `locations.js` IIFE closure. No localStorage, no sessionStorage needed for this page.

```
state = {
  exercises: [],        // shuffled array
  currentIndex: 0,      // which exercise is active
  dragging: false,      // pointer capture flag
  startX: 0,            // pointer offset at drag start
  startY: 0,            // pointer offset at drag start
  dragOffsetX: 0,       // offset of pointer within draggable element
  dragOffsetY: 0        // offset of pointer within draggable element
}
```

---

## Integration Points

### New Files

| File | Type | Purpose |
|------|------|---------|
| `tap-to-vocab/locations.html` | New | Page shell for drag-drop locations game |
| `tap-to-vocab/assets/js/locations.js` | New | IIFE game module — window.Locations |

### Modified Files

| File | Change | Detail |
|------|--------|--------|
| `tap-to-vocab/index.html` | Add button | New `<a class="btn btn-locations">` inside `.grid-two-col`, spans both columns, placed after `.btn-fill-blank` |
| `tap-to-vocab/assets/css/styles.css` | Add CSS section | Append `.locations-*` classes at end of file — scene container, reference box, drop zone states, draggable |

### Unchanged Files

All other JS modules (coins.js, shared-utils.js, fill-blank.js, sentences.js, conjugation.js, tapvocab.js, home.js, game-init.js) require no changes.

No new TSV file.

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| locations.js → SharedUtils | Direct call at runtime | SharedUtils must be loaded before locations.js in script order |
| locations.js → CoinTracker | Direct call: `CoinTracker.addCoin()` | CoinTracker (coins.js) must be loaded first |
| locations.html → coins.js | `#coin-counter` element auto-updated | coins.js DOMContentLoaded listener handles this automatically |
| index.html → locations.html | `<a href="/locations.html">` | Standard link, no sessionStorage/game_lives needed (not a mini-game) |

### Script Load Order in locations.html

```html
<script src="/assets/js/coins.js"></script>
<script src="/assets/js/shared-utils.js"></script>
<script src="/assets/js/locations.js"></script>
<script>
  Locations.init();
</script>
```

Note: `game-init.js` is NOT loaded. This page does not require coins to access — it is a learning game, not a coin-gated mini-game.

---

## Suggested Build Order

Dependencies determine the order. Each step is unblocked after the previous is complete.

1. **CSS classes in styles.css** — Unblocks HTML layout work. Define `.locations-scene`, `.locations-ref-box`, `.locations-drop-zone`, `.locations-drop-zone.active`, `.locations-drop-zone.correct`, `.locations-drop-zone.wrong`, `.locations-draggable`, `.locations-prompt`, `.btn-locations`. No JS dependency.

2. **locations.html shell** — Requires CSS from step 1. Build static layout with reference box and all 11 drop zones in their visual positions. No JS yet — verify layout is correct on mobile before wiring interaction.

3. **locations.js IIFE** — Requires HTML from step 2 (reads element IDs). Wire pointer events, hit detection, exercise sequencing, and feedback calls to SharedUtils and CoinTracker.

4. **index.html button** — Independent of steps 2-3. Can be done any time. Add the button, verify it links correctly.

5. **Integration test** — Verify all 11 zones work on mobile (375px), that coin counter updates, that sounds fire, that the draggable returns to origin on miss.

---

## Anti-Patterns

### Anti-Pattern 1: HTML5 Drag and Drop API

**What people do:** Add `draggable="true"` to the object element and use `ondragstart`, `ondragover`, `ondrop`.

**Why it's wrong:** iOS Safari does not support the HTML5 DnD API on touch input without a polyfill. The zero-dependency constraint means no polyfill. The game would be non-functional on iPhone/iPad, which is a primary target platform.

**Do this instead:** Use the Pointer Events API (`pointerdown`, `pointermove`, `pointerup`) with `setPointerCapture`.

### Anti-Pattern 2: Loading Exercise Data from TSV

**What people do:** Create `/data/locations.tsv` and fetch it in `init()` following the pattern of fill-blank.js.

**Why it's wrong:** Adds fetch latency, a loading spinner, and an error code path for a dataset of 11 fixed entries that never changes. `SharedUtils.loadTSV` is designed for growable content edited by non-developers.

**Do this instead:** Define `EXERCISES` as a JS array constant at the top of locations.js. It is immediately available and visually auditable.

### Anti-Pattern 3: Canvas Rendering

**What people do:** Render the scene on a `<canvas>` element, draw the reference box and drop zones manually, implement manual hit detection.

**Why it's wrong:** Canvas requires manual text rendering, manual touch coordinate normalization, manual redraw on every frame, and no native CSS transitions. Existing canvas pages (Jungle Run, etc.) use canvas because they need 60fps animation loops — this game has no animation loop. CSS-positioned divs give CSS transitions, native pointer events, and natural hit targets for free.

**Do this instead:** Use `position: relative/absolute` CSS layout inside the scene container div.

### Anti-Pattern 4: Touch-Only Event Handlers

**What people do:** Use `touchstart`, `touchmove`, `touchend` because "it's a mobile game."

**Why it's wrong:** Touch events don't fire on desktop mouse input. Pointer Events unify both. Using touch-only would break desktop usability.

**Do this instead:** Pointer Events only.

### Anti-Pattern 5: Hardcoded Pixel Positions

**What people do:** Position drop zones with hardcoded pixel values (e.g., `top: 120px; left: 80px`).

**Why it's wrong:** The scene must scale from 320px to 760px width. Hardcoded pixels break at any size other than the one tested.

**Do this instead:** Use percentage-based `top`/`left`/`width`/`height` values inside the scene container. The container itself is `width: 100%; max-width: 420px`.

---

## Scaling Considerations

This is a static single-user app. Scaling is not a concern. The only scale-relevant consideration is:

| Scale | Architecture Adjustment |
|-------|------------------------|
| Current (single-user) | In-memory state in JS closure — correct approach |
| Multi-device same user | Would need localStorage to persist progress — not in scope for v1.4 |
| Future preposition sets | Extend EXERCISES array, add new zone IDs in HTML — no architectural change |

---

## Sources

- Direct inspection of `/home/desire/tap-to-vocab/tap-to-vocab/assets/js/` — all existing modules
- Direct inspection of `/home/desire/tap-to-vocab/tap-to-vocab/assets/css/styles.css` — CSS variables, responsive breakpoints, component classes
- Direct inspection of `/home/desire/tap-to-vocab/tap-to-vocab/index.html` and `fill-blank.html` — page shell patterns, script load order
- Direct inspection of `.planning/PROJECT.md` — confirmed v1.4 milestone scope and constraints
- Pointer Events API browser support: HIGH confidence — part of the W3C standard, supported in all evergreen browsers including iOS Safari 13+ (2019)
- HTML5 DnD on iOS: HIGH confidence — known longstanding limitation; iOS Safari does not fire drag events on touch without polyfills

---

*Architecture research for: Tap-to-Vocab v1.4 Locations drag-and-drop page*
*Researched: 2026-03-14*
