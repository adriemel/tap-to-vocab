---
phase: 09-scene-layout
plan: 01
subsystem: ui
tags: [css, drag-and-drop, locations, prepositions, scene-layout]

# Dependency graph
requires:
  - phase: 08-interaction-foundation
    provides: locations.js drag engine (init, onDrop callback), locations.html 2-zone scaffold
provides:
  - locations.html with 9 CSS-positioned drop zones around reference box
  - Scene layout foundation (box centered, zones spatially placed)
  - Draggable origin at upper-left (left:12px top:24px)
affects: [10-game-loop-and-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS absolute positioning for drop zones within .scene container"
    - "Opacity/z-index depth cue (partial — locked decision deferred to Phase 10)"
    - "Zone divs as teal blobs — ::before visual + div touch target pattern introduced"

key-files:
  created: []
  modified:
    - tap-to-vocab/locations.html

key-decisions:
  - "cerca-de zone initially merged with al-lado-de — gap identified by gsd-verifier, fixed in Phase 10"
  - "Zone labels omitted in initial layout — added then removed in Phase 10 fix commit"
  - "Depth cue implemented as opacity only (not locked dashed-border decision) — corrected in Phase 10-01"

patterns-established:
  - "Scene layout: .scene container with absolute-positioned .zone divs around a centered .reference-box"

requirements-completed: [SCEN-01, SCEN-05]

# Metrics
duration: ~30min
completed: 2026-03-14
---

# Phase 9 Plan 01: Scene Layout Summary

**9-zone CSS scene with reference box and draggable positioned in .scene container; gaps in touch targets, cerca-de zone, and depth cue identified and fixed in Phase 10-01**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-03-14
- **Completed:** 2026-03-14
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Replaced Phase 8 two-zone test scaffold with full scene layout in locations.html
- Centered reference box (.reference-box) in .scene container
- Placed 9 drop zones (encima-de, delante-de, detras-de, debajo-de, a-la-izquierda-de, a-la-derecha-de, al-lado-de, lejos-de, encima-detras) as CSS absolute-positioned divs
- Draggable element (#draggable) anchored at upper-left origin (left:12px top:24px)
- Drag engine from Phase 8 preserved and functional with new zone layout

## Gaps Found by Verification

Phase 9 VERIFICATION.md (gsd-verifier) found 4 of 5 must-haves failed:
- cerca-de zone absent (merged into al-lado-de — violates SCEN-02)
- detrás-de depth cue used opacity only instead of locked dashed-border + inset-shadow decision
- 4 zones below 44px touch target minimum (encima-de, detras-de, lejos-de, debajo-de)
- Zone labels absent

All gaps were fixed in Phase 10-01.

## Files Created/Modified
- `tap-to-vocab/locations.html` — Scene layout with reference box and 9 drop zones

## Decisions Made
- cerca-de initially merged with al-lado-de (practical simplification — later reversed in Phase 10, then re-merged in Phase 10 fix commit as final design decision)

## Deviations from Plan
- Locked dashed-border depth cue for detrás-de was not applied — fixed in Phase 10-01

---
*Phase: 09-scene-layout*
*Completed: 2026-03-14*
