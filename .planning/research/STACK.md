# Stack Research

**Domain:** Vanilla JS drag-and-drop game (spatial prepositions, mobile-first)
**Researched:** 2026-03-14
**Confidence:** HIGH (core API recommendations), MEDIUM (iOS version specifics — compatibility table not retrievable directly)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Pointer Events API | Living Standard (Baseline since July 2020) | Unified touch + mouse drag handler | Single code path covers finger, stylus, and mouse. HTML5 DnD is mouse-only and does not fire on iOS Safari touch. Touch Events are explicitly marked "not Baseline" by MDN and require separate mouse fallbacks. |
| CSS `touch-action: none` | Baseline since September 2019 | Prevent browser scroll hijack on draggable elements | Without this, `pointermove` on the dragged element fires `pointercancel` on iOS/Android as the browser intercepts the gesture for scrolling. Required on every draggable element. |
| `element.setPointerCapture(ev.pointerId)` | Baseline since July 2020 | Lock pointer tracking to the dragged element during move | Without capture, `pointermove` is lost when the finger moves off the draggable element. On touch browsers, capture is implicit but explicitly calling it is defensive and works cross-browser. |
| `document.elementFromPoint(x, y)` | Universal | Hit-test which drop zone is under the pointer during drag | HTML5 DnD provides `dragover` on the target, but Pointer Events do not — you must manually check what is under the pointer on each `pointermove`. `elementFromPoint` is the standard technique. |

### Supporting Libraries

None. The constraint "no external dependencies" is maintained. All required APIs (Pointer Events, `elementFromPoint`, CSS `touch-action`) are native browser APIs with no polyfill needed for the target audience (modern iOS Safari 13.4+, Chrome, Firefox).

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Local HTTP server (existing) | Serve absolute-path assets | Same as rest of project — `python3 -m http.server 8000` |
| iOS Safari DevTools (Safari on Mac + iPhone cable) | Verify touch drag on real device | Simulator can miss touch-action quirks; real device test recommended before shipping |

## Installation

No packages to install. This project has no build step and no package manager in production. All APIs used are native browser globals.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Pointer Events API | HTML5 Drag and Drop API | Only when drag data transfer (MIME types, DataTransfer) is needed (e.g., file drop, OS-level drag). For in-page game drag, DnD API adds ghost-image complexity and does not fire on iOS Safari touch at all. |
| Pointer Events API | Touch Events + Mouse Events (dual handler) | Only when targeting very old browsers (pre-2017) or when fine-grained multi-touch detection is needed. MDN explicitly recommends Pointer Events over Touch Events for all new development. |
| Manual `elementFromPoint` hit-test | HTML5 DnD `dragover` events on drop zones | HTML5 DnD approach is cleaner but unavailable with Pointer Events. The `elementFromPoint` pattern is idiomatic for custom drag in vanilla JS. |
| CSS absolute positioning for drag clone | CSS `transform: translate()` on original element | Both work. A visual clone (`element.cloneNode`) dragged with absolute positioning keeps the original in-layout as a placeholder, which is cleaner for the prepositions layout. Either is fine for this game. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| HTML5 Drag and Drop API (`draggable`, `dragstart`, `drop`) | Fundamentally mouse-event-based. Does not fire from touch on iOS Safari. The ghost drag image cannot be customized without canvas hacks. Requires separate touch fallback, negating simplicity. | Pointer Events API |
| Touch Events (`touchstart`, `touchmove`, `touchend`) | MDN marks as "not Baseline" — not available in all widely-used browsers. Desktop touch screens (Surface, etc.) are excluded. Requires a parallel mouse-event handler for desktop, doubling the code. MDN explicitly says "use Pointer Events instead." | Pointer Events API |
| Any drag-and-drop library (SortableJS, interact.js, etc.) | Project constraint: zero external dependencies. No CDN, no npm in production. These libraries add 20–60 KB for features this game does not need (sorting, resize, multiple targets). | Native Pointer Events |
| `dragover` with `preventDefault()` pattern | Only relevant to HTML5 DnD API. In a Pointer Events implementation there are no `dragover` events — drop detection is done in `pointermove` via `elementFromPoint`. | `elementFromPoint` in `pointermove` handler |

## Stack Patterns by Variant

**If the draggable object must stay in-flow while dragging (placeholder stays):**
- Create a visual clone on `pointerdown`, append to `document.body` with `position: fixed`
- Move clone with `transform: translate(dx, dy)` on `pointermove`
- On `pointerup`, remove clone and apply result to real element
- This is the recommended pattern for this game's layout

**If direct move of the original element is acceptable (no placeholder):**
- Change original to `position: fixed` on drag start
- Update `left`/`top` or `transform` on `pointermove`
- Simpler code, but the layout hole while dragging may be visually disruptive for the prepositions diagram

**For the 11-zone layout (spatial positions around a reference box):**
- Give each drop zone a `data-preposition` attribute
- On `pointerup`, call `document.elementFromPoint(ev.clientX, ev.clientY)` and walk up with `.closest('[data-preposition]')`
- Compare found zone's `data-preposition` to the current challenge's correct answer

## Integration with Existing SharedUtils

| SharedUtils Function | How Locations Game Uses It |
|---------------------|---------------------------|
| `SharedUtils.shuffleArray(arr)` | Shuffle the 11 prepositions array to randomize challenge order |
| `SharedUtils.playSuccessSound()` | Call on correct drop |
| `SharedUtils.playErrorSound()` | Call on wrong drop |
| `SharedUtils.showSuccessAnimation()` | Call on correct drop (emoji burst) |
| `SharedUtils.confettiBurst(count)` | Optional: call on round complete |
| `CoinTracker.addCoin()` | Call on each correct answer, matching all other game modes |

No new SharedUtils functions are needed. The drag mechanics are entirely local to `locations.js`.

## Script Load Order

Following the established project pattern:

```html
<script src="/assets/js/coins.js"></script>
<script src="/assets/js/shared-utils.js"></script>
<script src="/assets/js/locations.js"></script>
<script>
  Locations.init();
</script>
```

No `game-init.js` is needed unless a "lives" gate is added (out of scope for v1.4).

## iOS / Safari Caveats

| Caveat | Detail | Mitigation |
|--------|--------|------------|
| `touch-action: none` is mandatory | Without it, iOS scroll intercepts the drag gesture and fires `pointercancel` immediately | Add `touch-action: none` to the draggable element and the entire game board container |
| `pointercancel` must be handled | If `touch-action` is missing or the browser overrides it, `pointercancel` fires instead of `pointerup` | Listen for `pointercancel` and reset drag state identically to `pointerup`, without applying a drop result |
| `elementFromPoint` occlusion | On `pointerup`, the dragged clone element may be directly under the pointer and occlude the drop zone | Temporarily set `pointer-events: none` on the clone before calling `elementFromPoint`, then restore |
| Explicit `setPointerCapture` | While iOS Safari applies implicit capture on touch, calling it explicitly on `pointerdown` ensures `pointermove` fires even when finger moves off the element | Call `element.setPointerCapture(ev.pointerId)` inside `pointerdown` handler |
| Minimum tap target size | Drag handles and the draggable object need at least 44px touch target (project standard) | Ensure draggable object renders at minimum 44x44px |

## Version Compatibility

| API | Supported Since | Notes |
|-----|-----------------|-------|
| Pointer Events (pointerdown/move/up) | iOS Safari 13.4 (2020), Chrome 55, Firefox 59 | Baseline Widely Available since July 2020. Safe for all modern devices. |
| `setPointerCapture` | iOS Safari 13.4, Chrome 55, Firefox 59 | Same baseline as above. |
| `touch-action: none` | iOS Safari 13 (2019), Chrome 36, Firefox 52 | Baseline Widely Available since September 2019. |
| `document.elementFromPoint` | Universal — all browsers, all versions | No compatibility concern. |
| CSS `position: fixed` for clone | Universal | No compatibility concern. |

## Sources

- [MDN Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) — Baseline status "widely available since July 2020" confirmed; iOS support confirmed. HIGH confidence.
- [MDN Using Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Using_Pointer_Events) — `pointerdown`/`pointermove`/`pointerup` pattern, `setPointerCapture`, `Map` for pointer tracking. HIGH confidence.
- [MDN Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events) — Explicitly recommends Pointer Events instead; marks Touch Events "not Baseline." HIGH confidence.
- [MDN HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) — Mouse-event-based, no mention of touch support; MDN links to CanIUse for compatibility. MEDIUM confidence (CanIUse not directly accessible in this session, but mouse-only nature is structurally clear from API design).
- [MDN touch-action CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) — Baseline since September 2019; `touch-action: none` prevents `pointercancel` by disabling browser gesture handling. HIGH confidence.
- [MDN setPointerCapture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture) — Baseline widely available since July 2020. HIGH confidence.

---
*Stack research for: Vanilla JS mobile-first drag-and-drop spatial prepositions game*
*Researched: 2026-03-14*
