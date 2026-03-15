# Phase 11: Locations UI Fixes - Research

**Researched:** 2026-03-15
**Domain:** Vanilla HTML/CSS/JS — DOM manipulation, CSS positioning
**Confidence:** HIGH

## Summary

Phase 11 targets two isolated bugs in `locations.html` and `assets/js/locations.js`. Both bugs are fully diagnosable by reading the source; no library or framework research is needed.

**Bug 1 (LOC-01):** The German translation `#prompt-de` element is always populated and visible. In `loadExercise()` (locations.js line 148), the code sets `document.getElementById('prompt-de').textContent = ex.de`. The element exists in the HTML and is styled with `color:var(--muted)` — it is never hidden, so German text always shows.

**Bug 2 (LOC-02):** The `delante-de` drop zone is placed at `top:306px; left:46px` with dimensions `58×46px`. Its visual center is approximately (75, 329). The box front face spans roughly left:100–180, top:205–265. The zone is shifted too far left to appear "in front of" the box and sits uncomfortably close to (though technically not overlapping) `debajo-de` at `top:250px`. Visually on a mobile screen, the two zones can appear to crowd each other. Correct positioning should center `delante-de` horizontally under the front face (center ~left:140) and push it a bit further below the box bottom edge.

**Primary recommendation:** Two targeted edits — (1) hide `#prompt-de` via CSS or stop populating it in JS; (2) adjust the `delante-de` CSS position to horizontally center under the front face.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LOC-01 | User sees only the Spanish preposition in the prompt header — German translation is not displayed | `#prompt-de` element is always populated in `loadExercise()`; hiding or depopulating it resolves the bug |
| LOC-02 | The "delante de" drop zone is visually centered in front of the box's front face without overlapping the "debajo de" zone | CSS coordinates fully mapped; `delante-de` must shift right and position correctly under the front face |
</phase_requirements>

## Standard Stack

### Core
| Item | Version | Purpose | Notes |
|------|---------|---------|-------|
| HTML/CSS/JS | — | All fixes are pure DOM/style edits | No libraries involved |
| locations.html | current | Inline `<style>` block controls all scene CSS | Drop zone positions live here |
| locations.js | current | IIFE, `window.LocationsGame`; `loadExercise()` controls prompt content | German population lives here |

### Supporting
No supporting libraries. Fixes are self-contained.

## Architecture Patterns

### Relevant Project Structure
```
tap-to-vocab/
├── locations.html          # Inline <style> + HTML markup for scene
└── assets/js/locations.js  # IIFE game logic, EXERCISES constant, loadExercise()
```

All fixes are contained to these two files. No shared CSS file change is needed; the scene styles are inline in `locations.html`.

### Pattern: Prompt Card Rendering

The prompt card HTML (`locations.html` lines 213-216):
```html
<div id="prompt-card" class="sentence-target" style="text-align:center; margin-bottom:10px;">
  <div id="prompt-es" style="font-size:1.4rem; font-weight:700; color:var(--ink);">—</div>
  <div id="prompt-de" style="font-size:1rem; color:var(--muted); margin-top:4px;">—</div>
</div>
```

The `loadExercise()` function in `locations.js` lines 147-148:
```js
document.getElementById('prompt-es').textContent = ex.es;
document.getElementById('prompt-de').textContent = ex.de;  // ← LOC-01 bug
```

**Fix options (in order of preference):**
1. Set `#prompt-de` to `display:none` in HTML inline style — simplest, preserves JS unchanged for any future re-enable
2. Stop populating `#prompt-de` in `loadExercise()` — removes German text but still renders blank line spacer
3. Remove `#prompt-de` from HTML entirely and remove the `prompt-de` line from JS — cleanest if German will never be needed

Option 1 is the least invasive and fully satisfies LOC-01. Option 3 is cleanest but removes future flexibility.

### Pattern: Drop Zone CSS Positioning

All drop zones use `position:absolute` inside `.scene` (320×410px). The box geometry as documented in the CSS comment (locations.html line 134):
```
Box geometry: front (100,205)→(180,265) · top (120,175)→(200,205) · right (180,175)→(200,265)
```

Current `delante-de` position (locations.html line 163):
```css
[data-zone="delante-de"] { width: 58px; height: 46px; top: 306px; left: 46px; }
```

Zone center: left + width/2 = 46 + 29 = **75**, top + height/2 = 306 + 23 = **329**

Box front face center: left + width/2 = 100 + 40 = **140**, top = 205+(265-205)/2 = **235**

"In front of the box" in this isometric-style perspective means: horizontally aligned with the front face center and below the front face bottom edge. Target center: approximately **x:140, y:280-290**.

This gives a corrected position of roughly:
```css
[data-zone="delante-de"] { width: 58px; height: 46px; top: 265px; left: 111px; }
```
(center: left=111+29=140, top=265+23=288 — directly below the front face bottom, horizontally centered)

`debajo-de` zone: `top:250px; left:109px; width:62px; height:44px` — occupies top:250–294, left:109–171. The proposed corrected `delante-de` at `top:265–311, left:111–169` **would overlap** `debajo-de`. To avoid overlap, push `delante-de` further down:

Recommendation: `top: 295px; left: 111px` (center: x=140, y=318) — this keeps `delante-de` below `debajo-de`'s bottom edge of 294px with a 1px gap, and is still visually "in front of" the box.

Cross-check for `al-lado-de` (`top:280px; left:210px; width:56px; height:52px`) — no horizontal overlap with `delante-de` at left:111 (ends at 169) vs `al-lado-de` left:210. No conflict.

### Anti-Patterns to Avoid
- **Modifying EXERCISES constant** to remove `de` fields — other code references `de` (showCompletion uses `ex.de` indirectly, but actually does not; however keeping the data intact is safer)
- **Using `visibility:hidden`** for `#prompt-de` — leaves blank vertical space; `display:none` is correct
- **Moving `delante-de` zone into `debajo-de` bounding box** — re-creates the overlap bug

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Hiding DOM element | Custom fade/animation | `display:none` inline style or CSS rule |
| Zone pixel math | Geometry framework | Manual pixel calculation against documented box geometry (already in CSS comment) |

## Common Pitfalls

### Pitfall 1: Residual Blank Line from Hidden `#prompt-de`
**What goes wrong:** Setting `display:none` on `#prompt-de` is correct, but if the line in `loadExercise()` still runs `getElementById('prompt-de').textContent = ex.de`, the element is populated but hidden. If `display` is ever re-enabled (e.g. by the completion screen `innerHTML` replacement), old text won't interfere. This is acceptable.
**How to avoid:** Prefer both hiding the element AND not populating it, to keep the DOM clean.

### Pitfall 2: Overlap After Repositioning `delante-de`
**What goes wrong:** Centering `delante-de` under the front face naively puts it at top:265px which overlaps `debajo-de` (top:250–294).
**How to avoid:** Push `delante-de` to `top: 295px` or lower so its top edge starts after `debajo-de`'s bottom edge (294px).

### Pitfall 3: Coin / Advance Logic for `delante-de` and `debajo-de` After Repositioning
**What goes wrong:** After moving the `delante-de` zone, its `data-zone` attribute must remain `"delante-de"` and the EXERCISES entry must still reference `zone: 'delante-de'`. Drop detection uses `data-zone` string matching, not position.
**How to avoid:** Only change CSS coordinates; never touch `data-zone` attribute values or EXERCISES constant zone keys.

### Pitfall 4: Completion Screen Overwriting `#prompt-card`
**What goes wrong:** `showCompletion()` does `document.getElementById('prompt-card').innerHTML = ...` — this replaces the inner nodes including `#prompt-de`. This is fine for LOC-01 (completion replaces everything) but must not be confused with the normal game flow.
**Warning signs:** If `#prompt-de` reappears after navigating back from completion, the issue is elsewhere.

## Code Examples

### LOC-01: Simplest Fix — Hide `#prompt-de` in HTML
```html
<!-- locations.html line 215 — add display:none to existing inline style -->
<div id="prompt-de" style="font-size:1rem; color:var(--muted); margin-top:4px; display:none;">—</div>
```
Source: Direct analysis of locations.html + locations.js

### LOC-01: Cleaner Fix — Also Stop Populating in JS
```js
// locations.js loadExercise() — remove or comment out this line:
// document.getElementById('prompt-de').textContent = ex.de;
```
Source: Direct analysis of locations.js line 148

### LOC-02: Corrected `delante-de` Zone Position
```css
/* locations.html — replace line 163 */
[data-zone="delante-de"] { width: 58px; height: 46px; top: 295px; left: 111px; }
```
- Center: x = 111 + 29 = 140 (aligned with box front face center x)
- Center: y = 295 + 23 = 318 (below `debajo-de` bottom at 294px)
- No overlap with `debajo-de` (top:250–294, left:109–171) — `delante-de` starts at top:295
- No overlap with `al-lado-de` (top:280–332, left:210–266) — different left region

Source: Direct coordinate analysis of locations.html CSS

## State of the Art

| Old Behavior | Corrected Behavior | Notes |
|--------------|-------------------|-------|
| `#prompt-de` always shows German text | `#prompt-de` hidden (`display:none`) | LOC-01 fix |
| `delante-de` zone at top:306, left:46 (off-center, crowds debajo) | `delante-de` at top:295, left:111 (centered under front face) | LOC-02 fix |

## Open Questions

1. **Should `#prompt-de` element be removed entirely or just hidden?**
   - What we know: The element is referenced by `loadExercise()` in JS; removal would require removing that JS line too
   - What's unclear: Whether German translation might be wanted for an accessibility mode in future
   - Recommendation: Apply `display:none` to HTML element AND remove the `prompt-de` population line in JS — clean and reversible

2. **Exact pixel value for `delante-de` top position**
   - What we know: Must be > 294px (bottom of `debajo-de`) to avoid overlap; 295px is minimal, 300px gives breathing room
   - Recommendation: Use `top: 295px` as minimum; if visual testing shows they look too close, increase to `top: 300px`

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — static site, no test runner |
| Config file | none |
| Quick run command | Manual: open browser, navigate to `/locations.html` |
| Full suite command | Manual visual inspection of all 10 exercises |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LOC-01 | Prompt shows only Spanish — no German text visible | manual | n/a — visual check in browser | n/a |
| LOC-02 | `delante-de` zone centered in front of box, no overlap with `debajo-de` | manual | n/a — visual check in browser | n/a |

### Sampling Rate
- **Per task commit:** Load `/locations.html` in browser, play through all 10 exercises, verify prompt and zone positions
- **Per wave merge:** Same manual check
- **Phase gate:** Both success criteria confirmed visually before `/gsd:verify-work`

### Wave 0 Gaps
None — existing files cover all requirements. No test infrastructure needed (static site, manual visual verification only).

## Sources

### Primary (HIGH confidence)
- `/home/desire/tap-to-vocab/tap-to-vocab/locations.html` — full source read; CSS coordinates and HTML structure confirmed
- `/home/desire/tap-to-vocab/tap-to-vocab/assets/js/locations.js` — full source read; `loadExercise()` German population confirmed at line 148
- `/home/desire/tap-to-vocab/.planning/STATE.md` — accumulated context confirms root causes

### Secondary (MEDIUM confidence)
- None needed — both bugs are fully diagnosable from source alone

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Bug root causes: HIGH — directly observed in source code
- Fix approach: HIGH — standard DOM/CSS patterns, no edge cases
- Pixel coordinates for LOC-02: MEDIUM — calculated from documented box geometry; exact values may need minor tuning after visual test

**Research date:** 2026-03-15
**Valid until:** Indefinite — static site, no dependency drift risk
