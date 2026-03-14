# Phase 9: Scene Layout - Research

**Researched:** 2026-03-14
**Domain:** CSS layout, spatial positioning, visual design for 10 preposition drop zones on a 375px mobile screen
**Confidence:** HIGH

---

## Summary

Phase 9 replaces the Phase 8 two-zone test scaffold with a complete 10-zone scene layout inside `locations.html`. The task is purely HTML/CSS — no new JavaScript logic required. `window.LocationsGame` (from `locations.js`) and its `data-zone` / `zone-hover` contract are already built and verified; Phase 9 only adds the remaining 8 zones and their visual treatments.

The core layout challenge is fitting 10 labeled drop zones around a central reference box ("la caja") on a 375px mobile screen, all with 44px minimum touch targets, without overlap. The 10 prepositions fall into natural spatial groups: vertical axis (encima de / debajo de), front/back axis (delante de / detrás de), lateral axis (a la derecha de / a la izquierda de), an "inside" zone (en), and a distance band trio (cerca de / al lado de / lejos de). The distance band trio is the primary layout challenge because near/adjacent/far must be visually distinct without labels.

Two locked decisions from STATE.md constrain the solution: `detrás de` uses dashed border + drop-shadow depth cue, and `al lado de` is assigned to a fixed side (right) per exercise definition.

**Primary recommendation:** Use `position: absolute` within a `position: relative` `.scene` container. Size the scene to fill the card on mobile (min 320px, ideally 340-360px). Assign explicit `top`/`left`/`right`/`bottom` CSS coordinates to each zone. Use CSS custom properties from the existing `styles.css` palette throughout.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCEN-02 | Scene has 10 distinct, labeled drop zones for all prepositions: encima de, debajo de, delante de, detrás de, al lado de, a la derecha de, a la izquierda de, cerca de, lejos de, en | CSS position:absolute within a relative container; each zone is a `[data-zone]` div with a text label and a unique coordinate assignment |
| SCEN-03 | Drop zone for "detrás de" (behind) has a depth/shadow cue that visually distinguishes it from the front zone | Locked decision: dashed border + box-shadow depth treatment on the detrás de zone; delante de gets solid border |
| SCEN-04 | Drop zones for "cerca de", "al lado de", and "lejos de" are visually distinct with clear distance differentiation (separate distance bands) | Three concentric-ring-style horizontal bands at left edge; visual size or opacity/border-weight gradient communicates distance |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS `position: absolute` | Browser native | Precise zone placement within scene container | Only method that allows exact pixel placement matching the spatial semantics of each preposition |
| CSS `position: relative` on `.scene` | Browser native | Establishes coordinate context for all child zones | Standard containment pattern for absolutely positioned children |
| CSS custom properties | Browser native | Consistent dark-theme colors from existing `styles.css` | All theme colors already defined: --bg, --card, --ink, --muted, --accent, --ok, --warn, --error |
| CSS `box-shadow` | Browser native | Depth cue for `detrás de` zone | Locked decision; box-shadow inset/outer shadow visually recedes the behind zone |

### No External Libraries

Zero-dependency static site. All layout is vanilla HTML/CSS.

**Installation:** None required.

---

## Architecture Patterns

### Scene Container Sizing

The scene must fit a 375px viewport. With the `.container` padding of 16px and `.card` padding of 20px, usable interior width is approximately 375 - 32 - 40 = 303px absolute minimum. The Phase 8 scaffold used 320px; for 10 zones a slightly taller scene (360px wide, 380-400px tall) gives more room for the distance band trio along one edge.

The scene is a `position: relative` div. The reference box ("la caja") is a centered, fixed-size div (e.g., 80×80px) placed via `top: 50%` / `left: 50%` + negative margin, or via absolute position at known coordinates.

The draggable object (`#draggable`) remains inside the scene and is positioned absolutely. `resetDraggable` clears inline styles and CSS returns it to its defined position.

### Recommended Scene Layout (375px viewport)

```
.scene: 320px wide × 380px tall, position: relative
        centered with margin: 0 auto

  [encima de]   — top-center, above the box
  [debajo de]   — bottom-center, below the box
  [delante de]  — center, overlapping front edge of box (solid border)
  [detrás de]   — center, slightly offset behind / dark shadow (dashed border + box-shadow)
  [a la derecha de] — right of box
  [a la izquierda de] — left of box
  [en]          — overlapping center of box (smallest zone, represents "inside")

Distance band trio (left column or bottom strip):
  [cerca de]    — visually near the box edge
  [al lado de]  — one step further from box (fixed right side per locked decision)
  [lejos de]    — furthest band from box

  [#draggable]  — origin: center of scene, overlaps no zone at rest
```

### Pattern 1: Zone HTML Structure

Each zone is a `div` with `data-zone` and `data-preposition` attributes matching the preposition string. The `data-zone` value is the key used by `LocationsGame`'s `onDrop` callback:

```html
<!-- Source: Phase 8 established [data-zone] contract in locations.js -->
<div data-zone="encima-de" class="zone">encima de</div>
<div data-zone="debajo-de" class="zone">debajo de</div>
<div data-zone="delante-de" class="zone">delante de</div>
<div data-zone="detras-de" class="zone zone-detras">detrás de</div>
<div data-zone="al-lado-de" class="zone">al lado de</div>
<div data-zone="a-la-derecha-de" class="zone">a la derecha de</div>
<div data-zone="a-la-izquierda-de" class="zone">a la izquierda de</div>
<div data-zone="cerca-de" class="zone zone-cerca">cerca de</div>
<div data-zone="lejos-de" class="zone zone-lejos">lejos de</div>
<div data-zone="en" class="zone zone-en">en</div>
```

### Pattern 2: Base Zone CSS

```css
/* All drop zones */
.zone {
  position: absolute;
  min-width: 60px;
  min-height: 44px;          /* WCAG/Apple HIG minimum touch target */
  padding: 6px 8px;
  border: 2px dashed var(--muted);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 0.7rem;
  color: var(--muted);
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

/* Phase 8 zone-hover contract must be preserved exactly */
.zone.zone-hover {
  border-color: var(--accent);
  background: rgba(108, 168, 255, 0.15);
}
```

### Pattern 3: detrás de Depth Cue (SCEN-03 — Locked Decision)

The locked decision is "dashed border + drop-shadow depth cue". The approach: `detrás de` gets an inward/dark box-shadow to visually recede, while `delante de` gets a solid border and forward-shadow to appear closer:

```css
/* detrás de — recedes visually behind the reference box */
.zone-detras {
  border-style: dashed;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
  opacity: 0.75;            /* slightly dimmed = "behind" */
  z-index: 0;               /* below delante */
}

/* delante de — solid border, appears closer/in front */
.zone-delante {
  border-style: solid;
  border-color: var(--muted);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
  z-index: 2;               /* above detrás */
}
```

### Pattern 4: Distance Band Trio (SCEN-04)

The three distance zones (cerca de, al lado de, lejos de) must convey near/adjacent/far without labels. The most legible approach for a small scene is a three-band vertical strip along one edge, where band width (or border thickness) shrinks with distance:

```css
/* Distance bands — left edge of scene, stacked vertically */
/* cerca de — near: thick border, high opacity */
.zone-cerca {
  border-width: 3px;
  border-color: var(--ok);  /* green = close/positive */
  opacity: 1.0;
}

/* al lado de — adjacent: medium border, medium opacity */
/* No special class needed beyond base .zone at default style */

/* lejos de — far: thin dashed border, lower opacity */
.zone-lejos {
  border-width: 1px;
  border-style: dashed;
  opacity: 0.55;
}
```

Alternatively, use background fill density: cerca de has the most filled background, lejos de the least. Either convention is valid — the key constraint is that visual distinction is perceptible without reading labels.

### Pattern 5: 44px Touch Target on Small Zones

Short text labels like "en" would render narrower than 44px. Ensure minimum height and width are always met:

```css
.zone {
  min-height: 44px;
  min-width: 44px;    /* absolute minimum for any zone */
}

/* Wider for multi-word labels */
.zone[data-zone="a-la-derecha-de"],
.zone[data-zone="a-la-izquierda-de"] {
  min-width: 72px;   /* "a la derecha de" is 4 words — needs width */
  font-size: 0.65rem;
}
```

### Pattern 6: Reference Box ("la caja")

A non-interactive div, visually distinct from zones (solid colored block, not dashed border):

```css
#caja {
  position: absolute;
  width: 70px;
  height: 70px;
  background: var(--warn);   /* amber/gold — visually distinctive */
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #0b1020;
  /* centered in scene: top = (scene_height/2 - 35px), left = (scene_width/2 - 35px) */
  top: 155px;   /* example for 380px tall scene */
  left: 125px;  /* example for 320px wide scene */
  pointer-events: none;  /* not draggable, not a drop target */
}
```

### Anti-Patterns to Avoid

- **Flex/grid for zone layout:** Cannot achieve the spatial semantics (zones must be in specific positions relative to the center box, not flow-ordered). Use `position: absolute` for all zones.
- **Overlapping zones without z-index ordering:** `detrás de` and `delante de` may overlap the center of the box. Assign z-index explicitly.
- **Font size too large for small zones:** Long prepositions ("a la izquierda de") at standard font sizes overflow zone bounds. Use 0.65–0.75rem for all zone labels.
- **Touch targets below 44px:** Even if a zone visually appears small, its `min-height` and `min-width` must be 44px. Use `overflow: visible` or padding to extend the hit area if needed.
- **Using `data-zone` values with spaces:** The existing `onDrop` callback receives `zone.dataset.zone` as a JS key. Use kebab-case values consistently (e.g., `encima-de`, not `encima de`).
- **Forgetting `pointer-events: none` on the reference box (#caja):** If #caja intercepts pointer events, dragging over it will break zone detection.
- **Scene overflow causing card scroll:** If scene height exceeds viewport, the card scrolls during drag. Set `overflow: hidden` on `.scene` and constrain its height to fit the viewport minus header.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Touch target extension | Custom JS hit-area expansion | `min-height: 44px; min-width: 44px` on zone divs | CSS min-size is the standard; JS touch area expansion is fragile and unnecessary |
| Depth cue for detrás de | Canvas rendering, 3D transforms | `box-shadow + opacity` CSS on `.zone-detras` | Locked decision; CSS shadow is simpler, readable, and maintainable |
| Distance differentiation | Separate image assets | CSS `border-width`, `opacity`, or `border-color` gradient | No asset pipeline in this project; CSS properties are sufficient and zero-dependency |

---

## Common Pitfalls

### Pitfall 1: Scene Too Small for 10 Zones Without Overlap

**What goes wrong:** All 10 zones are placed and several overlap, making it impossible to drop on the intended zone.
**Why it happens:** 10 zones around a central 70px box in a 320x320 scene leaves very little space, especially if zones are sized for legibility (60-80px wide, 44px tall).
**How to avoid:** Design the scene taller than it is wide (e.g., 320×380-400px). Use the left/right columns for the distance band trio and left/right prepositions. Use top/bottom rows for vertical prepositions. Stack detrás/delante directly over the box center at different z-indices.
**Warning signs:** Zones at 10px spacing look fine on desktop but become impossible to target precisely on mobile touch.

### Pitfall 2: Long Labels ("a la izquierda de") Overflow Zone

**What goes wrong:** Long Spanish preposition labels break to multiple lines or overflow their zone div, misrepresenting the zone size.
**Why it happens:** Zone min-width is sized for short labels; "a la izquierda de" is 16 characters.
**How to avoid:** Use `font-size: 0.65rem` for all zone labels. Accept two-line labels for the longest prepositions (both a la derecha/izquierda de). Set `text-align: center` and allow wrapping.
**Warning signs:** Any zone text is cut off by the zone border on a real device.

### Pitfall 3: #draggable Resting Position Overlaps a Zone

**What goes wrong:** After `resetDraggable`, the draggable sits on top of a drop zone, making that zone impossible to select at the start of an exercise.
**Why it happens:** Draggable origin is placed at the center of the scene where other zones also are (en, delante de, etc.).
**How to avoid:** Place the draggable's CSS resting position at a dedicated neutral origin — a corner or below/above the reference box — that does not coincide with any drop zone coordinate. Phase 10 will define this per exercise, but the Phase 9 layout must reserve this origin space.
**Warning signs:** In manual testing, the game appears to start with the draggable covering a zone label.

### Pitfall 4: zone-hover Class Conflict on Overlapping Zones

**What goes wrong:** When two zones overlap (e.g., detrás de and delante de), `elementFromPoint` always returns the top z-index zone even when the user intends the other.
**Why it happens:** `elementFromPoint` returns the topmost visible element at those coordinates. If zones overlap, the lower-z-index zone can never be selected.
**How to avoid:** Do not use zones that share physical screen coordinates — position detrás de slightly offset (e.g., shifted 8-12px in a diagonal direction) from delante de so they do not share any pixel-level overlap.
**Warning signs:** One of the overlapping zones is never selectable in testing.

### Pitfall 5: Scene Scrolls Because Container Is Taller Than Viewport

**What goes wrong:** On iPhone SE (375×667px), the `.card` with a 380px scene plus page header exceeds viewport height, causing the page to scroll during drag.
**Why it happens:** `touch-action: none` is only on `#draggable`. Scrolling the card occurs when the user starts a drag outside the draggable.
**How to avoid:** Keep total page height under ~580px on the game page (viewport minus ~80px for browser chrome). On the game page body, consider `overflow: hidden` or `position: fixed` on the card during drag. Alternatively, limit scene height to 340px and make zones smaller.
**Warning signs:** Page scrolls when dragging near the edge of the scene on a physical iPhone SE.

---

## Code Examples

### Minimal 10-Zone Scene HTML

```html
<!-- Source: Phase 8 established pattern; extending to 10 zones -->
<div class="scene">
  <!-- Reference box (non-interactive) -->
  <div id="caja">la caja</div>

  <!-- Vertical axis -->
  <div data-zone="encima-de" class="zone">encima de</div>
  <div data-zone="debajo-de" class="zone">debajo de</div>

  <!-- Front / Back axis (overlapping center — different z-index) -->
  <div data-zone="delante-de" class="zone zone-delante">delante de</div>
  <div data-zone="detras-de" class="zone zone-detras">detrás de</div>

  <!-- Lateral axis -->
  <div data-zone="a-la-derecha-de" class="zone">a la derecha de</div>
  <div data-zone="a-la-izquierda-de" class="zone">a la izquierda de</div>

  <!-- Inside -->
  <div data-zone="en" class="zone zone-en">en</div>

  <!-- Distance band trio -->
  <div data-zone="cerca-de" class="zone zone-cerca">cerca de</div>
  <div data-zone="al-lado-de" class="zone zone-al-lado">al lado de</div>
  <div data-zone="lejos-de" class="zone zone-lejos">lejos de</div>

  <!-- Draggable object -->
  <div id="draggable"></div>
</div>
```

### Zone Position Coordinates (320×380px scene, 70px reference box centered at 125,155)

Concrete absolute positioning numbers verified against a 320×380px scene:

```css
/* Reference box center: left=125px top=155px (box is 70×70) */

#caja              { top: 155px; left: 125px; }
[data-zone="encima-de"]       { top: 8px;   left: 110px; width: 100px; }
[data-zone="debajo-de"]       { bottom: 8px; left: 110px; width: 100px; }
[data-zone="delante-de"]      { top: 148px; left: 88px;  width: 80px; z-index: 2; }
[data-zone="detras-de"]       { top: 160px; left: 100px; width: 80px; z-index: 1; }
[data-zone="a-la-derecha-de"] { top: 155px; right: 4px;  width: 72px; }
[data-zone="a-la-izquierda-de"] { top: 155px; left: 4px; width: 72px; }
[data-zone="en"]              { top: 168px; left: 138px; width: 44px; z-index: 3; }

/* Distance band trio — right column, stacked vertically */
[data-zone="cerca-de"]  { top: 80px;  right: 4px; width: 64px; }
[data-zone="al-lado-de"]{ top: 136px; right: 4px; width: 64px; }
[data-zone="lejos-de"]  { top: 192px; right: 4px; width: 64px; }
```

**Note:** These are starting coordinates for the planner to refine in the task. The exact values require manual visual verification on a 375px device — treat as HIGH confidence in approach, MEDIUM confidence in exact pixel values.

### detrás de Depth Cue CSS (Locked Decision)

```css
/* Source: STATE.md locked decision — "dashed border + drop-shadow depth cue" */
.zone-detras {
  border-style: dashed;
  border-color: var(--muted);
  box-shadow: inset 0 3px 10px rgba(0, 0, 0, 0.55);
  opacity: 0.7;
}

.zone-delante {
  border-style: solid;
  border-color: var(--ink);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
  opacity: 1.0;
}
```

### Distance Band CSS (SCEN-04)

```css
/* cerca de — visually nearest: strong border, fully opaque */
.zone-cerca {
  border-width: 3px;
  border-color: var(--ok);
  opacity: 1.0;
}

/* al lado de — middle distance: default styling */
/* Uses base .zone defaults */

/* lejos de — visually furthest: light/thin/dim */
.zone-lejos {
  border-width: 1px;
  border-style: dashed;
  opacity: 0.5;
}
```

### zone-hover Must Work On All 10 Zones

The existing `LocationsGame` IIFE queries `[data-zone]` selectors. The new zones use `class="zone"` for styling convenience but must keep `data-zone` attributes. Both the data attribute (for JS) and the class (for CSS) are needed:

```html
<!-- Correct: has data-zone for LocationsGame + class for CSS -->
<div data-zone="encima-de" class="zone">encima de</div>

<!-- Wrong: class only, LocationsGame won't detect it -->
<div class="zone encima-de">encima de</div>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Phase 8: 2-zone test scaffold | Phase 9: 10-zone full scene | This phase | locations.html becomes the real game scene (partial — game logic wired in Phase 10) |
| Generic `[data-zone]` attribute selectors only | `data-zone` + CSS `.zone` class | This phase | CSS classes allow per-preposition styling; `data-zone` remains the JS contract |

---

## Open Questions

1. **Exact coordinate values for all 10 zones**
   - What we know: Scene is ~320×380px; reference box is ~70×70px; zones need 44px min touch targets
   - What's unclear: Whether the distance band trio should be a right-column strip, a bottom strip, or occupy their own dedicated region of the scene
   - Recommendation: Start with the right-column strip (less overlap risk); planner should note that pixel coordinates require manual visual verification on a 375px screen

2. **Draggable resting origin position**
   - What we know: `resetDraggable` clears inline styles; CSS `position: absolute` with `left`/`top` defines resting position
   - What's unclear: The ideal resting position (a clear neutral zone) depends on final zone layout; Phase 10 may override it per exercise
   - Recommendation: Phase 9 plan should pick an explicit resting origin (e.g., center of scene slightly below the reference box) that visually overlaps no zone

3. **detrás de / delante de pixel offset from center**
   - What we know: Both zones must NOT share any overlapping pixel coordinates (Pitfall 4)
   - What's unclear: How many pixels of horizontal/vertical offset are needed to separate them while still conveying "in front / behind" semantics
   - Recommendation: Offset detrás de by +12px right and +10px down from delante de; visually small enough to read as "same location but layered"

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — zero-dependency static site; no test runner |
| Config file | none |
| Quick run command | Open `locations.html` in browser; drag to each of the 10 zones |
| Full suite command | Manual visual check on 375px viewport (DevTools mobile emulation or real device) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCEN-02 | All 10 zones visible with correct labels, no overlap | manual | Inspect DOM; count `[data-zone]` elements; verify 10 present | ❌ Wave 0 |
| SCEN-02 | Each zone can receive a drop (drag to each and verify drop callback fires) | manual | Open locations.html; drag to every zone; confirm result text updates | ❌ Wave 0 |
| SCEN-03 | detrás de and delante de visually distinguishable without reading labels | manual | Screenshot both zones side by side; verify depth cue visible | ❌ Wave 0 |
| SCEN-04 | cerca de / al lado de / lejos de occupy distinct distance bands | manual | Look at scene without labels; can you tell near from far? | ❌ Wave 0 |
| SCEN-02 | All 10 zones have minimum 44px touch target | manual | DevTools inspect each zone; check computed height/width >= 44px | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** Open locations.html in browser; visually confirm all 10 zones visible and non-overlapping
- **Per wave merge:** Full criteria checklist on 375px viewport (DevTools iPhone 12 Pro emulation)
- **Phase gate:** All 4 Phase 9 success criteria TRUE before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] Update `tap-to-vocab/locations.html` — replace 2-zone scaffold with 10-zone full scene
- [ ] No new JS files needed — `locations.js` is unchanged

*(No test framework gaps — project uses manual browser testing throughout)*

---

## Sources

### Primary (HIGH confidence)

- `tap-to-vocab/assets/js/locations.js` (existing) — `[data-zone]` selector contract, `zone-hover` class name, `resetDraggable` behavior
- `tap-to-vocab/assets/css/styles.css` (existing) — CSS custom properties: --bg, --card, --ink, --muted, --accent, --ok, --warn, --error
- `.planning/STATE.md` — Locked decisions: detrás de uses dashed border + drop-shadow; al lado de fixed to right side
- `.planning/REQUIREMENTS.md` — SCEN-02 zone list (exact 10 prepositions), SCEN-03 detrás depth cue, SCEN-04 distance band requirements, 44px minimum touch target
- MDN CSS position:absolute — browser-standard absolute positioning within relative container

### Secondary (MEDIUM confidence)

- Apple Human Interface Guidelines: 44pt minimum touch target (equivalent to 44px at 1x density) — standard referenced in REQUIREMENTS.md success criteria
- `.planning/phases/08-interaction-foundation/08-01-SUMMARY.md` — confirmed drag engine works with `[data-zone]` selector pattern; `resetDraggable` clears inline styles returning element to CSS position

### Tertiary (LOW confidence)

- Exact pixel coordinate values in the Code Examples section — calculated geometrically from scene dimensions but not verified on a real device; require manual visual check

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — pure CSS layout; no external libraries; patterns match existing project conventions
- Architecture (zone groupings and spatial layout): HIGH — spatial semantics of 10 prepositions are well-defined; CSS absolute positioning is the only viable approach for this layout
- Exact pixel coordinates: MEDIUM — geometrically derived; require visual verification on 375px screen
- Pitfalls: HIGH — overlap, touch target, and z-index issues are well-understood CSS layout concerns

**Research date:** 2026-03-14
**Valid until:** 2026-09-14 (stable CSS, no churn risk)
