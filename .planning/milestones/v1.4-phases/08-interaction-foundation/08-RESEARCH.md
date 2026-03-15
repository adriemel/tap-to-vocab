# Phase 8: Interaction Foundation - Research

**Researched:** 2026-03-14
**Domain:** Pointer Events API, drag-and-drop, touch input, vanilla JS
**Confidence:** HIGH

---

## Summary

Phase 8 builds the drag-and-drop interaction layer for the Locations game. The technical core is the Pointer Events API (`pointerdown`/`pointermove`/`pointerup`), which works identically for mouse and touch on all modern browsers including iOS Safari. The HTML5 Drag and Drop API is explicitly out of scope (locked decision) because it does not fire on iOS Safari touch.

The three hard sub-problems are: (1) preventing page scroll during a touch drag — solved entirely by `touch-action: none` on the draggable element; (2) preventing the draggable object from jumping when first grabbed — solved by recording the grab offset (pointer position minus element corner) on `pointerdown`; (3) detecting which drop zone the pointer is over while the dragged element is on top of it — solved by temporarily hiding the dragged element, calling `document.elementFromPoint(clientX, clientY)`, then immediately unhiding.

`setPointerCapture` is the correct approach for capturing the pointer to a single element during drag, avoiding the need to listen on the entire document. Once `setPointerCapture` is called, all subsequent pointer events for that `pointerId` are routed to the element even if the pointer leaves its bounds. This is baseline-widely-available since July 2020.

**Primary recommendation:** Use a single IIFE module (`locations.js`) following the existing project pattern. Implement the drag loop with `setPointerCapture`, `touch-action: none`, grab-offset positioning, and `elementFromPoint` hit detection. No external libraries.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAME-01 | User can drag an object to a drop zone representing the prompted Spanish preposition (works on mouse and touch/mobile) | Pointer Events API pointerdown/pointermove/pointerup + setPointerCapture provides unified mouse+touch handling; touch-action:none prevents scroll |
| SCEN-01 | Scene displays a reference box ("la caja") and a draggable object with clear visual affordance | Static HTML/CSS div layout; draggable gets CSS cursor:grab/grabbing + distinct styling; position:fixed during drag |
| SCEN-05 | Drop zones highlight visually when the draggable object hovers over them during drag | elementFromPoint hit detection during pointermove; add/remove CSS class on detected zone |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Pointer Events API | Browser native | Unified mouse + touch drag | Only API that works on iOS Safari touch; HTML5 DnD excluded per locked decision |
| `document.elementFromPoint` | Browser native | Drop zone hit detection | Standard approach when dragged element occludes underlying targets |
| CSS `touch-action: none` | Browser native | Prevent page scroll during drag | The only reliable cross-browser way to block touch-initiated scroll on the draggable |

### No External Libraries
This is a zero-dependency static site. All interaction is vanilla JS.

**Installation:** None required. No npm, no CDN.

---

## Architecture Patterns

### Recommended File Layout
```
tap-to-vocab/
├── locations.html          # New page (skeleton only in Phase 8)
└── assets/js/
    └── locations.js        # New IIFE module → window.LocationsGame
```

Phase 8 produces only the drag engine and a minimal test scaffold. Full scene layout (HTML/CSS for zones) is Phase 9. Full game loop is Phase 10.

### Pattern 1: Pointer Events Drag Loop with setPointerCapture

**What:** Attach `pointerdown` to the draggable element. On pointerdown, record grab offset, call `setPointerCapture`, move to `position:fixed` for drag. Handle `pointermove` to reposition. Handle `pointerup` to run hit detection and either settle into a zone or snap back.

**When to use:** Always — this is the only pattern for this phase.

```javascript
// Source: https://javascript.info/pointer-events + MDN setPointerCapture
const draggable = document.getElementById('draggable');
let originX, originY, shiftX, shiftY;

draggable.addEventListener('pointerdown', (e) => {
  // 1. Record where in the element the user grabbed
  const rect = draggable.getBoundingClientRect();
  shiftX = e.clientX - rect.left;
  shiftY = e.clientY - rect.top;
  // 2. Remember origin for snap-back
  originX = rect.left + window.scrollX;
  originY = rect.top + window.scrollY;
  // 3. Lift element — position:fixed so it rides above layout
  draggable.style.position = 'fixed';
  draggable.style.zIndex = '1000';
  draggable.style.left = (e.clientX - shiftX) + 'px';
  draggable.style.top  = (e.clientY - shiftY) + 'px';
  draggable.style.cursor = 'grabbing';
  // 4. Capture pointer — all future events route here even outside element
  draggable.setPointerCapture(e.pointerId);
});

draggable.addEventListener('pointermove', (e) => {
  if (!draggable.hasPointerCapture(e.pointerId)) return;
  draggable.style.left = (e.clientX - shiftX) + 'px';
  draggable.style.top  = (e.clientY - shiftY) + 'px';

  // 5. Hit detection: hide self, sample underneath, unhide
  draggable.hidden = true;
  const below = document.elementFromPoint(e.clientX, e.clientY);
  draggable.hidden = false;
  const zone = below && below.closest('[data-zone]');

  // 6. Highlight active zone, clear all others
  document.querySelectorAll('[data-zone]').forEach(z => z.classList.remove('zone-hover'));
  if (zone) zone.classList.add('zone-hover');
});

draggable.addEventListener('pointerup', (e) => {
  if (!draggable.hasPointerCapture(e.pointerId)) return;
  draggable.releasePointerCapture(e.pointerId);
  draggable.style.cursor = 'grab';

  // 7. Final hit detection
  draggable.hidden = true;
  const below = document.elementFromPoint(e.clientX, e.clientY);
  draggable.hidden = false;
  const zone = below && below.closest('[data-zone]');

  document.querySelectorAll('[data-zone]').forEach(z => z.classList.remove('zone-hover'));

  if (zone) {
    // Dropped on a zone — return result to caller
    onDrop(zone.dataset.zone);
  } else {
    // Missed all zones — snap back
    snapBack();
  }
});

function snapBack() {
  // CSS transition handles animation
  draggable.style.transition = 'left 0.25s ease, top 0.25s ease';
  draggable.style.left = originX + 'px';
  draggable.style.top  = originY + 'px';
  setTimeout(() => {
    draggable.style.position = '';
    draggable.style.transition = '';
    draggable.style.zIndex = '';
  }, 260);
}
```

### Pattern 2: Required CSS on Draggable Element

```css
/* Source: MDN touch-action, javascript.info/pointer-events */
#draggable {
  touch-action: none;   /* prevents browser scroll hijack on touch */
  cursor: grab;
  user-select: none;    /* prevents text selection flash during drag */
  -webkit-user-select: none;
}
#draggable:active {
  cursor: grabbing;
}
```

### Pattern 3: Drop Zone Hover Highlight CSS

```css
[data-zone] {
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
[data-zone].zone-hover {
  background-color: rgba(108, 168, 255, 0.2);  /* --accent with opacity */
  border-color: var(--accent);
}
```

### Pattern 4: IIFE Module Structure (matches project convention)

```javascript
// Source: existing project pattern (fill-blank.js, conjugation.js)
(function () {
  let _onDrop = null;

  function init(options) {
    // options: { onDrop: fn(zoneName) }
    _onDrop = options.onDrop;
    setupDrag();
  }

  function setupDrag() { /* drag loop here */ }
  function snapBack() { /* snap-back here */ }

  window.LocationsGame = { init };
})();
```

### Anti-Patterns to Avoid

- **Listening on `document` for `pointermove`**: Unnecessary when `setPointerCapture` is used. After `setPointerCapture`, all moves route to the dragging element regardless of pointer position.
- **Using `mousedown`/`touchstart` separately**: Creates dual-handler complexity. Pointer Events are a single unified API that handles both.
- **Using HTML5 Drag and Drop API**: Explicitly excluded — does not fire on iOS Safari touch.
- **Positioning with `position:absolute` into a parent**: Makes coordinate math depend on scroll position. `position:fixed` during drag uses viewport coordinates directly, matching `clientX`/`clientY`.
- **Skipping the elementFromPoint hide/unhide**: Without hiding the draggable first, `elementFromPoint` returns the draggable itself — not the zone underneath.
- **Snapping back with JS-animated frames**: Use a CSS `transition` on `left`/`top` for snap-back. No `requestAnimationFrame` loop needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Preventing scroll during drag | Custom touchmove preventDefault | `touch-action: none` CSS | CSS property is more reliable, fires earlier in the event pipeline than JS handlers |
| Pointer routing outside element bounds | Global document listener for pointermove | `setPointerCapture(e.pointerId)` | Built-in browser mechanism, no cleanup leak risk |
| Drop zone hit detection | Bounding rect intersection math for each zone | `elementFromPoint` + `.closest('[data-zone]')` | Automatic layout-aware, handles any zone shape or position, zero coordinate bookkeeping |
| Cross-browser mouse+touch unification | Separate mousedown/touchstart handlers | Pointer Events API (single handler set) | One code path for all input types; touch-action:none replaces touchmove.preventDefault |

**Key insight:** The hide/elementFromPoint/unhide trick is the standard pattern for drag-over detection when a dragged element would otherwise block `elementFromPoint` results. It is fast (microseconds), doesn't cause flicker, and requires no zone coordinate caching.

---

## Common Pitfalls

### Pitfall 1: Jarring Jump on First Grab (Offset Not Recorded)
**What goes wrong:** Draggable snaps so its top-left corner is under the pointer on `pointerdown`, instead of staying where the user grabbed it.
**Why it happens:** Position is set to `clientX`/`clientY` directly without subtracting the grab point inside the element.
**How to avoid:** Record `shiftX = e.clientX - rect.left` and `shiftY = e.clientY - rect.top` on `pointerdown`, then apply `left = e.clientX - shiftX` on every `pointermove`.
**Warning signs:** Works fine when grabbing the center but jumps when grabbing an edge.

### Pitfall 2: Page Scrolls During Touch Drag
**What goes wrong:** On mobile, dragging the object also scrolls the page, making it uncontrollable.
**Why it happens:** Browser's default touch-scroll behavior is not suppressed.
**How to avoid:** Set `touch-action: none` in CSS on the draggable element. This must be a CSS property — calling `e.preventDefault()` in `pointerdown` alone is insufficient because the browser makes the scroll decision before the JS handler fires in some cases.
**Warning signs:** Works on desktop (mouse), broken on mobile (touch).

### Pitfall 3: elementFromPoint Returns Draggable Instead of Zone
**What goes wrong:** `elementFromPoint(e.clientX, e.clientY)` always returns the draggable element or one of its children, never a zone.
**Why it happens:** The draggable sits on top (higher z-index) at those coordinates, so it is the topmost element.
**How to avoid:** Set `draggable.hidden = true` before calling `elementFromPoint`, then immediately set `draggable.hidden = false` after.
**Warning signs:** `zone` variable is always `null` even when visually over a zone.

### Pitfall 4: pointercancel Fires on iOS Safari During Diagonal Drag
**What goes wrong:** The drag terminates unexpectedly with a `pointercancel` event mid-drag when the user moves diagonally.
**Why it happens:** iOS Safari interprets diagonal touch movement as a scroll gesture and cancels the pointer event before `touch-action: none` fully suppresses it in some edge cases.
**How to avoid:** Set `touch-action: none` on the draggable. Also listen for `pointercancel` and treat it the same as `pointerup` (snap back). This ensures the game state is always consistent even if a cancel fires.
**Warning signs:** Drag works for straight vertical/horizontal moves but cancels on diagonal swipes.

### Pitfall 5: Drag State Leaks Across Exercises
**What goes wrong:** After a correct drop, the snap-back timeout or lingering `position:fixed` style leaves the draggable in an inconsistent position for the next exercise.
**Why it happens:** The `snapBack` setTimeout and style cleanup are not cancelled/reset before `loadExercise` repositions the element.
**How to avoid:** On exercise load, cancel any pending snap-back timer and reset the draggable's `position`, `left`, `top`, `transition`, and `zIndex` styles explicitly. Keep a module-level `snapTimer` variable.
**Warning signs:** Draggable appears in the wrong place on the second exercise.

---

## Code Examples

### Complete Minimal Drag Engine

```javascript
// Source: javascript.info/pointer-events + MDN setPointerCapture
// Verified pattern for this project's constraints

(function () {
  let shiftX, shiftY, originLeft, originTop, snapTimer;
  let onDropCallback = null;

  function init(draggableEl, onDrop) {
    onDropCallback = onDrop;
    draggableEl.addEventListener('pointerdown', onPointerDown);
    draggableEl.addEventListener('pointermove', onPointerMove);
    draggableEl.addEventListener('pointerup',   onPointerUp);
    draggableEl.addEventListener('pointercancel', onPointerUp); // iOS safety
    draggableEl.ondragstart = () => false; // disable native image drag on desktop
  }

  function onPointerDown(e) {
    if (!e.isPrimary) return; // ignore secondary touches
    if (snapTimer) { clearTimeout(snapTimer); snapTimer = null; }

    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    shiftX = e.clientX - rect.left;
    shiftY = e.clientY - rect.top;
    originLeft = rect.left;
    originTop  = rect.top;

    el.style.position = 'fixed';
    el.style.zIndex = '1000';
    el.style.left = (e.clientX - shiftX) + 'px';
    el.style.top  = (e.clientY - shiftY) + 'px';
    el.style.transition = 'none';
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!e.isPrimary) return;
    const el = e.currentTarget;
    if (!el.hasPointerCapture(e.pointerId)) return;

    el.style.left = (e.clientX - shiftX) + 'px';
    el.style.top  = (e.clientY - shiftY) + 'px';

    // Zone hover highlight
    el.hidden = true;
    const below = document.elementFromPoint(e.clientX, e.clientY);
    el.hidden = false;
    const zone = below && below.closest('[data-zone]');
    document.querySelectorAll('[data-zone]').forEach(z =>
      z.classList.toggle('zone-hover', z === zone)
    );
  }

  function onPointerUp(e) {
    if (!e.isPrimary) return;
    const el = e.currentTarget;
    if (!el.hasPointerCapture(e.pointerId)) return;
    el.releasePointerCapture(e.pointerId);

    document.querySelectorAll('[data-zone]').forEach(z => z.classList.remove('zone-hover'));

    el.hidden = true;
    const below = document.elementFromPoint(e.clientX, e.clientY);
    el.hidden = false;
    const zone = below && below.closest('[data-zone]');

    if (zone) {
      onDropCallback(zone.dataset.zone, el);
    } else {
      snapBack(el);
    }
  }

  function snapBack(el) {
    el.style.transition = 'left 0.25s ease, top 0.25s ease';
    el.style.left = originLeft + 'px';
    el.style.top  = originTop  + 'px';
    snapTimer = setTimeout(() => {
      el.style.position = '';
      el.style.transition = '';
      el.style.zIndex = '';
      el.style.left = '';
      el.style.top  = '';
      snapTimer = null;
    }, 260);
  }

  function resetDraggable(el) {
    if (snapTimer) { clearTimeout(snapTimer); snapTimer = null; }
    el.style.position = '';
    el.style.transition = '';
    el.style.zIndex = '';
    el.style.left = '';
    el.style.top  = '';
  }

  window.LocationsGame = { init, resetDraggable };
})();
```

### Minimal Test HTML Scaffold

```html
<!-- Minimal scaffold for Phase 8 verification -->
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="/assets/css/styles.css">
  <style>
    .scene { position: relative; width: 320px; height: 320px;
             margin: 40px auto; background: var(--card); border-radius: 16px; }
    #draggable { width: 60px; height: 60px; background: var(--accent);
                 border-radius: 12px; position: absolute;
                 left: 130px; top: 130px;
                 touch-action: none; cursor: grab; user-select: none; }
    [data-zone] { position: absolute; width: 80px; height: 60px;
                  border: 2px dashed var(--muted); border-radius: 8px;
                  display: flex; align-items: center; justify-content: center;
                  font-size: 0.75rem; color: var(--muted); }
    [data-zone].zone-hover { border-color: var(--accent);
                              background: rgba(108,168,255,0.15); }
    [data-zone="above"] { top: 10px; left: 120px; }
    [data-zone="below"] { bottom: 10px; left: 120px; }
    #result { text-align: center; margin-top: 12px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>Phase 8 — Drag Test</h1>
      <div class="scene">
        <div data-zone="above">encima de</div>
        <div data-zone="below">debajo de</div>
        <div id="draggable"></div>
      </div>
      <div id="result">Drag the box to a zone</div>
    </div>
  </div>
  <script src="/assets/js/locations.js"></script>
  <script>
    LocationsGame.init(document.getElementById('draggable'), function(zoneName, el) {
      document.getElementById('result').textContent = 'Dropped on: ' + zoneName;
      LocationsGame.resetDraggable(el);
    });
  </script>
</body>
</html>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HTML5 Drag and Drop API | Pointer Events API | iOS Safari never supported DnD events | DnD excluded by locked decision; Pointer Events is the correct standard |
| Separate `mousedown`/`touchstart` handlers | Single `pointerdown` handler | Pointer Events shipped ~2017, iOS Safari ~2020 | One code path for all input devices |
| `touchmove.preventDefault()` to stop scroll | `touch-action: none` CSS | CSS touch-action standardized; `preventDefault` requires `{ passive: false }` | CSS fires earlier; no passive listener complexity |
| Document-level move handlers (`document.addEventListener('mousemove', ...)`) | `setPointerCapture` on element | Pointer Events Level 2 | Cleaner, no global handler, no cleanup leak |

**Deprecated/outdated:**
- `touchstart`/`touchmove`/`touchend` event triplet: Still works, but adds code duplication alongside mouse events. Pointer Events replaces both.
- `e.preventDefault()` on `touchmove` to block scroll: Requires `{ passive: false }` in modern browsers; CSS `touch-action: none` is simpler and preferred.

---

## Open Questions

1. **Snap-back animation during a correct drop**
   - What we know: Phase 8 only needs to snap back on miss. On correct drop, the object should settle into the zone.
   - What's unclear: Phase 10 will define whether "settle" means the object animates into the zone center or just stays where released.
   - Recommendation: In Phase 8, on correct drop just call `onDropCallback` and leave the element where it is. Phase 10 wires the visual feedback.

2. **Draggable origin position relative to layout**
   - What we know: The draggable lives inside the scene div (CSS-positioned). During drag it switches to `position:fixed`.
   - What's unclear: The exact origin coordinates depend on Phase 9's scene layout (div dimensions, padding).
   - Recommendation: `resetDraggable` restores the element to its pre-drag state by clearing all inline position styles, which returns it to its CSS-defined position in the scene. This works regardless of Phase 9's layout decisions.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — zero-dependency static site; no test runner |
| Config file | none |
| Quick run command | Open `locations.html` in browser, exercise manually |
| Full suite command | Manual verification against success criteria checklist |

This project has no automated test infrastructure. Validation is manual browser testing. The `nyquist_validation` config key is `true` but the project has no test runner installed and CLAUDE.md explicitly states "There is no build, lint, or test command."

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAME-01 | Drag works on mouse (desktop) | manual | Open locations.html, drag with mouse | ❌ Wave 0 |
| GAME-01 | Drag works on touch (mobile) | manual | Open locations.html on phone, drag with finger | ❌ Wave 0 |
| GAME-01 | Page does not scroll during drag | manual | Touch-drag on mobile, verify no scroll | ❌ Wave 0 |
| SCEN-01 | Draggable has visual affordance (cursor, style) | manual | Inspect element, verify cursor:grab CSS | ❌ Wave 0 |
| SCEN-05 | Zone highlights on hover | manual | Drag over each zone, verify highlight class | ❌ Wave 0 |
| SCEN-05 | Zone unhighlights on pointer leave | manual | Drag away from zone, verify highlight removed | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Manual: open browser, drag object to each zone + drag to miss
- **Per wave merge:** Full success-criteria checklist on both desktop and a real mobile device
- **Phase gate:** All 4 success criteria TRUE before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tap-to-vocab/locations.html` — minimal scaffold for drag testing
- [ ] `tap-to-vocab/assets/js/locations.js` — IIFE drag engine module

*(No test framework gaps — project uses manual browser testing throughout)*

---

## Sources

### Primary (HIGH confidence)
- [javascript.info/pointer-events](https://javascript.info/pointer-events) — pointerdown/pointermove/pointerup patterns, setPointerCapture, touch-action:none, pointercancel, isPrimary
- [MDN setPointerCapture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture) — method signature, browser support (baseline widely available since July 2020), releasePointerCapture
- [javascript.info/mouse-drag-and-drop](https://javascript.info/mouse-drag-and-drop) — grab offset calculation (shiftX/shiftY), elementFromPoint hide/unhide trick, snap-back pattern

### Secondary (MEDIUM confidence)
- [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) — touch-action:none browser support, iOS Safari behavior
- [MDN Pointer Events overview](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) — event model, pointerId, isPrimary

### Tertiary (LOW confidence — needs validation on real device)
- WebSearch results re: iOS Safari pointercancel on diagonal drag — mentioned in multiple community sources but not in official Apple docs. Recommend testing on real device.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Pointer Events API, setPointerCapture, and elementFromPoint are W3C standards with MDN documentation and verified browser support tables
- Architecture: HIGH — Grab offset, elementFromPoint hide/unhide, and CSS transition snap-back are verified patterns from javascript.info authoritative tutorials
- Pitfalls: MEDIUM — pointercancel on iOS diagonal drag is from community sources; touch-action:none fix is verified

**Research date:** 2026-03-14
**Valid until:** 2026-09-14 (stable browser APIs, low churn)
