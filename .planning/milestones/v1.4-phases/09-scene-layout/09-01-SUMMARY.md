---
phase: 09-scene-layout
plan: 01
subsystem: ui
tags: [css, html, drag-drop, 3d-layout, spatial-vocab, locations]

# Dependency graph
requires:
  - "08-01: Pointer Events drag engine (locations.js IIFE)"
provides:
  - "3D cardboard box scene with 9 teal blob drop zones in locations.html"
  - "Draggable orange cat positioned clear of all zones"
  - "Spatial preposition zones: encima-de, en, detrás-de, debajo-de, delante-de, a-la-derecha-de, a-la-izquierda-de, al-lado-de, lejos-de"
  - "Document-level pointer drop detection on [data-zone] elements"
affects:
  - locations.html

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "3D CSS box illusion using three div faces (front/top/right) with transform skewing"
    - "Blob drop zones as absolute-positioned divs with border-radius and opacity for depth cues"
    - "z-index layering to place detrás-de and debajo-de behind the box for spatial realism"
    - "document-level pointermove/pointerup handlers for drag-drop detection across zone overlaps"

key-files:
  created: []
  modified:
    - tap-to-vocab/locations.html

key-decisions:
  - "cerca-de zone removed and merged into al-lado-de — the two prepositions are too visually similar for players to distinguish on a spatial scene; merging reduces cognitive load"
  - "Zones rendered as teal blobs (border-radius ellipses) rather than rectangular bordered boxes — blobs read more naturally as 3D floor/surface regions"
  - "encima-de rendered as a skewed flat ellipse painted directly on the top face surface — reinforces the on-top-of illusion without a floating label"
  - "en zone uses a pale ghostly blob on the front face — communicates inside-the-box without occluding the box art"

patterns-established:
  - "3D scene spatial layout: use z-index + transform skew to create depth, not perspective camera transforms"
  - "Merge near-synonym zones rather than showing ambiguous duplicates in a spatial drag game"

requirements-completed: []

# Metrics
duration: ~60min (multiple fix iterations)
completed: 2026-03-14
---

# Phase 9 Plan 01: Scene Layout — 3D Box with 9 Spatial Drop Zones Summary

**3D cardboard box scene with 9 teal blob drop zones and a draggable orange cat, replacing the Phase 8 scaffold in locations.html**

## Performance

- **Duration:** ~60 min
- **Completed:** 2026-03-14
- **Tasks:** 2 (build + visual verification)
- **Files modified:** 1

## Accomplishments

- Replaced the Phase 8 drag scaffold with a full 3D scene in `locations.html`
- Built a cardboard box illusion from three CSS `div` faces (front, top, right) with seam lines and a floor drop shadow
- Positioned 9 teal blob drop zones around the box in 3D space:
  - `encima-de` — skewed flat ellipse on the top face surface
  - `en` — pale ghostly blob on the front face (inside-box illusion)
  - `detrás-de` — partially hidden behind the box upper-right (z-index below box)
  - `debajo-de` — floor ellipse partially under the box bottom (z-index below box)
  - `delante-de` — floor ellipse forward-left of the box
  - `a-la-derecha-de` — circle to the right of the box
  - `a-la-izquierda-de` — circle to the left of the box
  - `al-lado-de` — floor ellipse right-lower (merged with cerca-de)
  - `lejos-de` — small dim circle far upper-right
- Orange cat draggable in upper-left, positioned clear of all zones
- Drop detection working via document-level pointer handlers
- All zones are `[data-zone]` divs with `class="zone"` (9 zones, no text labels)
- Human visual verification approved

## Task Commits

Each task was committed atomically:

1. **Task 1: Build 10-zone scene layout in locations.html** - `0ee9013` (feat) — initial scaffold replacement
   - Additional fix commits during layout refinement:
   - `9db1f70`, `8df3194`, `628ddbe`, `788b6af`, `3238bf6`, `64208d9`, `654a76c`
2. **Task 2: Visual verification** — approved by human (no code commit)

## Files Created/Modified

- `tap-to-vocab/locations.html` — Complete rewrite: 3D box scene, 9 blob zones, draggable cat, drop detection

## Decisions Made

- Merged `cerca-de` into `al-lado-de` — zone count reduced from 10 to 9; too similar for players to distinguish visually
- Used circular/elliptical blob shapes instead of rectangular bordered boxes — reads more naturally as spatial regions on a floor
- Rendered `encima-de` as a skewed ellipse on the top face rather than a floating zone above it

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Iterative refinement] Zone positions required multiple fix passes**
- **Found during:** Task 1
- **Issue:** Initial zone placement did not clearly communicate spatial relationships; encima overlapped the en zone; debajo was not visually under the box; delante was not clearly forward
- **Fix:** Seven successive fix commits repositioning zones for 3D spatial clarity; merged cerca-de into al-lado-de
- **Files modified:** locations.html
- **Commits:** `9db1f70`, `8df3194`, `628ddbe`, `788b6af`, `3238bf6`, `64208d9`, `654a76c`

**2. [Plan deviation] cerca-de zone removed**
- **Found during:** Task 1 / visual review
- **Issue:** cerca-de (near) and al-lado-de (next to) are indistinguishable at this zoom level on a static scene
- **Fix:** Removed cerca-de, merged into al-lado-de. Final zone count: 9 (not 10)
- **Files modified:** locations.html
- **Approved:** Human visual checkpoint approved the result

## Issues Encountered

None beyond the iterative zone-placement refinements documented above.

## User Setup Required

None.

## Next Phase Readiness

- Scene layout complete and visually verified
- All 9 `[data-zone]` elements in place with correct `data-zone` attribute values matching Spanish preposition names
- Ready for Phase 10: game logic (drag-to-zone answer checking, scoring, feedback)

---
*Phase: 09-scene-layout*
*Completed: 2026-03-14*
