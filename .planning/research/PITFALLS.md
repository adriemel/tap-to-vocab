# Pitfalls Research

**Domain:** Drag-and-drop spatial prepositions game — vanilla JS, mobile-first, iOS Safari
**Researched:** 2026-03-14
**Confidence:** HIGH (core iOS/touch behavior is well-documented and stable; spatial layout pitfalls are architectural)

---

## Critical Pitfalls

### Pitfall 1: HTML5 Drag API Is Dead on iOS Safari

**What goes wrong:**
The native HTML5 drag-and-drop API (`draggable="true"`, `ondragstart`, `ondragover`, `ondrop`) fires no events on iOS Safari. Users cannot drag anything. The page silently does nothing on touch. This is not a bug that will be fixed — Apple has intentionally not implemented it, and as of 2025 the status remains unchanged.

**Why it happens:**
Developers test on desktop Chrome where the HTML5 drag API works fine, then deploy and discover it is completely broken on iPhone. The spec technically allows touch devices to opt out, and iOS does.

**How to avoid:**
Do not use the HTML5 drag API at all. Build the entire drag system on `touchstart` / `touchmove` / `touchend` events (with corresponding `mousedown` / `mousemove` / `mouseup` for desktop fallback). Use `document.elementFromPoint(touch.clientX, touch.clientY)` during `touchmove` to find the drop target under the finger, since you cannot use `event.target` on move events (it always refers to the element where the touch started).

The implementation pattern is:
1. `touchstart` on the draggable element — record offset from finger to element corner, add `position: fixed` to lift it out of flow
2. `touchmove` on `document` — reposition element with `left/top`, call `elementFromPoint` to highlight candidate drop zone
3. `touchend` on `document` — call `elementFromPoint` one final time to determine drop target, process result, reset element

**Warning signs:**
- Any use of `draggable="true"` attribute
- Any `addEventListener('dragstart', ...)` or `addEventListener('drop', ...)` in the implementation
- Testing only on desktop before shipping

**Phase to address:** Phase 1 (foundation) — the interaction model must be decided before any layout work begins. Retrofitting touch after building on the HTML5 API requires a full rewrite of the interaction layer.

---

### Pitfall 2: touchmove Fires on the Touch Origin, Not the Element Under the Finger

**What goes wrong:**
`event.target` during `touchmove` always returns the element where the touch originally started — not the element currently under the finger. Developers write `event.target` during move to find the current drop zone and always get the draggable object itself, not the zone it is over. Hit detection appears to never work.

**Why it happens:**
This is correct browser behavior (touch capture stays on the originating element), but it is counter-intuitive coming from mouse events where `mousemove` fires on whatever element the cursor is currently over.

**How to avoid:**
During `touchmove`, extract coordinates with `event.touches[0].clientX` and `event.touches[0].clientY`, then call `document.elementFromPoint(x, y)` to get the actual element at that position. Because the dragged element is under the finger at this point, it will be returned by `elementFromPoint` and will block detection of drop zones behind it. Fix this by setting `pointer-events: none` on the dragged element during the drag, so `elementFromPoint` sees through it to the drop zone beneath.

**Warning signs:**
- Drop zones never highlight during drag
- `console.log(event.target)` during `touchmove` always logs the draggable element
- Works on mouse but not touch

**Phase to address:** Phase 1 (touch interaction implementation).

---

### Pitfall 3: Page Scrolls During Drag Instead of Moving the Object

**What goes wrong:**
On mobile, any `touchmove` that is not cancelled causes the browser to scroll the page. The user tries to drag the ball and the page scrolls instead. The object does not move. This is especially bad for this game because the layout likely requires more than one screen height to show all 11 drop zones.

**Why it happens:**
Touch scroll is the browser's default behavior for `touchmove`. It runs unless explicitly prevented.

**How to avoid:**
Call `event.preventDefault()` inside the `touchmove` handler. This must be done inside a handler registered with `{ passive: false }` — passive event listeners (the default since Chrome 51 for performance) cannot call `preventDefault()` and will throw a console error if you try.

```js
draggable.addEventListener('touchmove', handler, { passive: false });
```

Inside the handler:
```js
function handler(e) {
  e.preventDefault(); // stops page scroll
  // ... reposition draggable
}
```

Do not call `preventDefault()` on `touchstart` — this breaks tap events and stops click events from firing afterward.

**Warning signs:**
- Console warning: "Unable to preventDefault inside passive event listener"
- Page scrolls when user tries to drag
- The draggable element moves correctly on desktop but not mobile

**Phase to address:** Phase 1 (touch interaction implementation).

---

### Pitfall 4: Ghost Image / Clone Misalignment During Drag

**What goes wrong:**
The dragged element jumps to an unexpected position when the drag begins. The element's visual position does not follow the finger correctly — it is offset by the element's top-left corner instead of the touch point within the element. On small phones this puts the element off-screen or under the thumb.

**Why it happens:**
Developers set the dragged element position to `touch.clientX, touch.clientY` directly. This snaps the element's top-left corner to the finger position, not the point the finger touched within the element.

**How to avoid:**
On `touchstart`, record the offset from the finger to the element's top-left corner:

```js
const rect = el.getBoundingClientRect();
const offsetX = touch.clientX - rect.left;
const offsetY = touch.clientY - rect.top;
```

Then during `touchmove`, position the element at:
```js
el.style.left = (touch.clientX - offsetX) + 'px';
el.style.top  = (touch.clientY - offsetY) + 'px';
```

This keeps the element anchored to exactly where the finger touched it.

**Warning signs:**
- Element snaps to a different position when drag starts
- Element always offsets to the upper-left of the finger position
- Works acceptably on desktop mouse (offset is less noticeable) but badly on touch

**Phase to address:** Phase 1 (touch interaction implementation).

---

### Pitfall 5: Drop Zone Hit Detection Fails for Geometrically Adjacent Zones (cerca de vs al lado de)

**What goes wrong:**
The game has prepositions that describe similar spatial concepts with different distances: `cerca de` (near) and `lejos de` (far), and directional variants `al lado de`, `a la derecha de`, `a la izquierda de`. If drop zones for similar concepts are adjacent or overlap in the visual layout, users repeatedly land in the wrong zone and believe the game is broken rather than imprecise in their placement.

**Why it happens:**
The visual layout that makes conceptual sense (near zone close to box, far zone farther away) creates physical proximity between zones. A touch point that is genuinely ambiguous between two adjacent zones will be assigned to whichever zone's bounding rect happens to be checked first.

**How to avoid:**
Assign drop zones using `elementFromPoint` rather than manual bounding rect iteration — this respects CSS z-index and paint order, which gives a deterministic single winner. More importantly, design the layout so adjacent zones are separated by a visible gap (minimum 20px) and are clearly labeled. For `cerca de` / `lejos de`, stack them concentrically with a clear visual ring boundary rather than side-by-side rectangles.

For directional zones (`a la derecha de`, `a la izquierda de`, `al lado de`), make `al lado de` a separate labeled zone that is distinct from the directional ones — or collapse them into right/left/beside and let the label do the teaching work.

Add a visual "hover highlight" state when `elementFromPoint` identifies a zone during drag. This gives the user real-time feedback about which zone they will land in before they lift their finger.

**Warning signs:**
- Playtest reveals users repeatedly dropping in the wrong zone
- Two zone labels appear visually equal distance from the reference box
- No highlight feedback during drag (user cannot self-correct before release)

**Phase to address:** Phase 2 (layout and zone design) — this is a design problem, not a code problem. Zone geometry must be finalized before coding hit detection.

---

### Pitfall 6: Representing "Behind" (detrás de) as a Visual Drop Zone

**What goes wrong:**
`detrás de` means "behind the box." In a 2D layout, "behind" is not a natural spatial location — it is either ambiguous (anything occluded by the box) or requires a perspective cue. If the zone is placed identically to `delante de` (in front) just on the opposite side, users cannot distinguish them visually. If it is placed behind/overlapping the reference box, it is physically obscured during drag.

**Why it happens:**
Front and behind are 3D concepts forced into a 2D grid. Developers pick the obvious symmetrical positions (front = bottom, behind = top OR front = left, behind = right) but those positions conflict with `encima de` (above) and `debajo de` (below), leaving no unambiguous location.

**How to avoid:**
Use perspective rendering for the reference box — draw it as a 3D-ish box using CSS or an image so that a "back" face is visually distinct from the "top." Place the `detrás de` drop zone at a slightly different elevation and shade it differently than `delante de`. Alternatively, accept that pure 2D representation of behind/front will always require a label and lean into that: make the drop zone for `detrás de` explicitly labelled with a shadow/depth cue (e.g., dashed border, lower opacity) rather than relying solely on position.

The key constraint: the `detrás de` zone must not overlap with `encima de` (above) or any other zone while also not being obscured by the reference box during drag (`pointer-events: none` on the box, not on zones).

**Warning signs:**
- During layout sketches, `delante de` and `detrás de` zones end up in the same screen region as `encima de` / `debajo de`
- Users in playtesting cannot predict where to drag for "behind"
- The zone for `detrás de` is physically under the reference box in the DOM, making it unreachable via `elementFromPoint`

**Phase to address:** Phase 2 (layout design) — must be solved at the wireframe stage. Retroactively adding a third spatial dimension to a completed layout is a significant redesign.

---

### Pitfall 7: entre Requires Two Reference Points But the Game Has One Object

**What goes wrong:**
`entre` means "between." All other 10 prepositions relate a single object (ball/cat) to one reference box. `entre` requires two reference objects, and the draggable must be placed between them. If the game uses only one reference box, there is nowhere unambiguous to place a thing "between."

**Why it happens:**
`entre` is included in the 11-preposition list but does not fit the single-reference-box interaction model. Developers either skip it (leaving the vocab list incomplete) or force it into a zone that is ambiguous with `al lado de` (next to) or `cerca de` (near).

**How to avoid:**
Choose one of two approaches before any code is written:

Option A: For `entre` questions specifically, show two reference boxes and a drop zone between them. The draggable can only be placed "between" when there is a second object. This requires the layout to be dynamic based on the current question.

Option B: Use a fixed two-box layout for the entire game (reference box A and reference box B always visible). All 10 single-reference prepositions are relative to box A; `entre` is relative to both. This is more complex to lay out but avoids mid-game layout changes.

Option C: Remove `entre` from the drag game and teach it separately (e.g., via a fill-in-blank sentence using the existing exercise format). This is the lowest-effort option and is defensible — the game teaches 10 prepositions spatially; `entre` is covered another way.

**Warning signs:**
- Layout wireframe shows `entre` zone in an arbitrary position that could also be `cerca de` or `al lado de`
- The game has only one reference object in the design
- No explicit decision about `entre` is documented

**Phase to address:** Phase 2 (layout design) — this is an information architecture decision, not a UI detail. Must be resolved before coding.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `position: absolute` with manual `left/top` for drop zones | Simple layout | Break when parent resizes or scrolls; percent-based zones mismatch actual rendered positions | Never — use `getBoundingClientRect()` at drop time instead |
| Hardcoding drop zone pixel coordinates | No dynamic calculation needed | Breaks on every screen size; useless on non-375px viewports | Never for a mobile-first app |
| Registering `touchmove` without `{ passive: false }` | No extra thought required | `preventDefault()` silently fails; page scrolls instead of dragging | Never when drag must suppress scroll |
| Using the HTML5 drag API with a polyfill library | Familiar API | Adds external dependency (violates project constraints); polyfills are often incomplete on iOS | Never — this project explicitly has zero external dependencies |
| Cloning the dragged element and dragging the clone | Simpler reset logic | Clone's bounding rect is 0,0 on first frame; clone is not in the same DOM position as original | Acceptable if you set `visibility: hidden` on original and remove clone on `touchend` |

---

## Integration Gotchas

These are integration points with the existing Tap-to-Vocab codebase.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| SharedUtils.playSuccessSound / playErrorSound | Calling before any user gesture (AudioContext suspended) | These are already guarded with `getAudioContext()` which calls `.resume()` — safe to call in `touchend` handler since touch is a user gesture |
| SharedUtils.confettiBurst | Calling before layout is stable | Confetti uses `position: fixed` with `z-index: 9999` — safe to call anytime, will render on top of drag overlay |
| CoinTracker.addCoin | Forgetting to call on correct answer | Copy pattern from fill-blank.js: call addCoin() immediately when drop is correct, before showing feedback |
| coins.js `#coin-counter` auto-update | Coin counter not updating after addCoin | The listener is on `window` for the `coinschanged` event; ensure `#coin-counter` element exists in the HTML before `DOMContentLoaded` |
| Script load order | Loading locations.js before shared-utils.js | Follow the established order: `coins.js` → `shared-utils.js` → `locations.js` (no game-init.js needed unless this becomes a lives-gated game) |
| styles.css | Assuming `position: relative` on containers | This page adds `position: fixed` elements during drag; verify the stacking context does not clip the dragged element |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Calling `getBoundingClientRect()` on every `touchmove` frame for every drop zone | Jank, stutter on low-end Android; touch feels unresponsive | Cache zone rects on load; invalidate and recalculate only on resize/orientation change | Noticeable with 11+ zones on devices below Snapdragon 660 class |
| Creating new DOM elements on every `touchmove` (e.g., re-rendering highlight state) | Forced reflow every frame, heavy GC pressure | Use a CSS class toggle on pre-existing elements for hover states; never create elements during drag | Immediate on any device |
| Using `setTimeout` for drag position updates instead of direct handler | Visible lag between finger and element | Reposition in the `touchmove` handler directly — no setTimeout, no requestAnimationFrame needed (handlers are sync) | Immediate — visible on all devices |
| `will-change: transform` on every drop zone | Memory pressure on low-end devices | Apply `will-change: transform` only to the actively dragged element; remove it after drop | Cumulative — worse with more zones |
| Not removing `touchmove` / `touchend` listeners from `document` after drop | Handlers accumulate on each new game round | Use named functions or `{ once: true }` for document-level listeners; remove them in `touchend` | After several rounds — memory and ghost events |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual feedback during drag (no zone highlight) | User cannot tell which zone they will land in; releases in wrong zone; believes game is broken | Highlight the drop zone under the finger in real time during `touchmove`; use a CSS class like `.zone-hover` |
| Drop zones too small for fingers (under 44px) | Users repeatedly miss zones; game feels impossible on mobile | Minimum 44x44px tap/drop target; for spatial layout, zones should be larger (60-80px) to account for fat-finger imprecision |
| Success/error state clears immediately | User does not know which zone was right | Show correct zone highlighted for 600-800ms before resetting for next question; do not reset immediately on wrong drop |
| Draggable object covers reference box during drag | User cannot see what they are positioning relative to | Keep dragged element semi-transparent (0.75 opacity) during drag so reference box is visible underneath |
| No fallback for mouse users (desktop testing, accessibility) | Desktop testing broken; keyboard/switch users excluded | Implement both `mousedown/mousemove/mouseup` and `touchstart/touchmove/touchend` using the same handler logic; share a drag state object |
| Screen orientation change mid-drag | Cached zone rects are wrong; drops land in wrong zones | Listen for `orientationchange` and `resize`; cancel any active drag and recalculate zone rects |
| Game asks a question that is visually ambiguous | User guesses randomly; learning does not happen | Do not present `cerca de` and `al lado de` questions back-to-back without clear zone differentiation; ensure the answer zone is visually obvious before the question is asked |

---

## "Looks Done But Isn't" Checklist

- [ ] **Touch drag works on iOS Safari:** Test on a real iPhone — simulators do not accurately reproduce iOS touch behavior. Confirm drag moves the object without scrolling the page.
- [ ] **Drop zones register correct hit on small phones (320px width):** Test at 320px viewport — zones must not overflow or overlap at minimum supported width.
- [ ] **`entre` is handled:** Either a two-box layout is implemented, or `entre` is explicitly excluded with a documented rationale.
- [ ] **`detrás de` zone is distinguishable:** A sighted user who does not read the label can tell this zone is "behind" the box, not "above" or "beside" it.
- [ ] **Drag does not scroll the page on iOS:** Verify `{ passive: false }` is set and `preventDefault()` is called in `touchmove`.
- [ ] **Object returns to start position on wrong drop:** The draggable must animate back to its start, not snap or disappear. Verify on both touch and mouse.
- [ ] **CoinTracker.addCoin() is called on correct answer:** Open DevTools, check localStorage `coins` value increments after each correct drop.
- [ ] **Zone rects recalculated after orientation change:** Rotate phone mid-session; confirm drops still register in the correct zones.
- [ ] **No document-level listener leak:** Play 10+ rounds in a single session; confirm memory does not grow (check via DevTools Memory tab).
- [ ] **Dragged element has `pointer-events: none` during drag:** Verify `elementFromPoint` resolves to the drop zone, not the draggable itself.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| HTML5 drag API used — does not work on iOS | HIGH | Full rewrite of interaction layer; touch API is not compatible with drag API handlers; no incremental path |
| Hardcoded pixel zone coordinates | MEDIUM | Replace with `getBoundingClientRect()` calls on zone elements at game start; takes 1-2 hours but isolated to one function |
| Scroll not prevented (`{ passive: false }` missing) | LOW | One-line fix to event listener registration; test immediately on iOS |
| `entre` zone placed ambiguously | MEDIUM | Requires layout redesign for that one question; if using dynamic layout (Option A), only the `entre` question rendering changes |
| Zone rects not recalculated on resize | LOW | Add `window.addEventListener('resize', recalcZones)` and call `recalcZones()` on orientation change; isolated change |
| Ghost image offset wrong | LOW | Fix offset calculation in `touchstart` handler; two-line change, immediately testable |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| HTML5 drag API on iOS | Phase 1: Interaction foundation | Test drag on iOS Safari before any layout work |
| `event.target` misuse in `touchmove` | Phase 1: Interaction foundation | Confirm `elementFromPoint` used; confirm `pointer-events: none` on draggable during drag |
| Page scroll during drag | Phase 1: Interaction foundation | iOS Safari drag does not scroll page |
| Ghost image offset | Phase 1: Interaction foundation | Element stays anchored to touch point through entire drag |
| Adjacent zone ambiguity (cerca/lejos, directional) | Phase 2: Layout and zone design | Paper prototype or CSS-only mockup reviewed before coding hit detection |
| `detrás de` visual representation | Phase 2: Layout and zone design | Zone is distinguishable without reading the label |
| `entre` requires two reference objects | Phase 2: Layout and zone design | Explicit decision documented: two-box layout OR exclusion |
| Zone rect caching and invalidation | Phase 1: Interaction foundation | Orientation change test; rects recalculated correctly |
| `{ passive: false }` listener registration | Phase 1: Interaction foundation | No console warning about passive listener; no scroll during drag |
| No hover highlight during drag | Phase 2: Layout and zone design | Zone visually indicates hover state in real time during drag |
| Document listener leak | Phase 3: Polish and integration | 10-round session memory profile shows stable heap |
| Integration with CoinTracker | Phase 3: Polish and integration | localStorage `coins` increments after correct drop |

---

## Sources

- MDN Web Docs: Touch Events — `touchstart`, `touchmove`, `touchend` behavior and `event.target` semantics (HIGH confidence — authoritative specification)
- MDN Web Docs: `Document.elementFromPoint()` — returns topmost element at coordinates, respects `pointer-events` (HIGH confidence)
- MDN Web Docs: EventTarget.addEventListener passive option — `{ passive: false }` required for `preventDefault()` in touch handlers (HIGH confidence)
- Apple Developer Documentation: Safari on iOS does not support HTML5 drag-and-drop events (HIGH confidence — Apple's own documentation confirms no support)
- W3C Touch Events specification: `touchmove` target is fixed to originating element (HIGH confidence — spec behavior, not a bug)
- Project CLAUDE.md and PROJECT.md: established patterns for SharedUtils, CoinTracker, script load order, 44px tap target requirement (HIGH confidence — first-party source)
- Project memory (MEMORY.md): existing audio patterns, coin integration, confetti system (HIGH confidence — first-party)

---
*Pitfalls research for: drag-and-drop spatial prepositions game (v1.4 Locations), vanilla JS mobile-first app*
*Researched: 2026-03-14*
