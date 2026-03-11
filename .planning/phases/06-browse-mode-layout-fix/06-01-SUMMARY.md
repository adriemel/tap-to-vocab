---
phase: 06-browse-mode-layout-fix
plan: 01
subsystem: ui
tags: [css, flexbox, mobile-layout, responsive, browse-mode]

# Dependency graph
requires:
  - phase: 05-mobile-ui-polish-bug-fix
    provides: flex-wrap nowrap rule on .controls inside @media (max-width: 600px) that this plan overrides
provides:
  - topic.html browse controls with browse-controls class and correct 4+2 button order
  - CSS override restoring flex-wrap: wrap for .browse-controls inside mobile media query
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Scoped CSS override: apply broad rule then narrow selector override in same media block (nowrap → wrap for browse-controls)"
    - "HTML class as CSS hook: add semantic class to existing element to allow scoped CSS without changing JS"

key-files:
  created: []
  modified:
    - tap-to-vocab/topic.html
    - tap-to-vocab/assets/css/styles.css

key-decisions:
  - "Added browse-controls class to #browse-mode .controls div as a CSS targeting hook — no JS impact since JS uses button IDs only"
  - "Placed .browse-controls { flex-wrap: wrap } immediately after .controls { flex-wrap: nowrap } in same @media block — equal specificity, later rule wins"
  - "Reordered browse buttons to Prev/Next/Show/Star (row 1) and Home/Hear (row 2) so the two-row split is visually logical"

patterns-established:
  - "Scoped override pattern: when a broad rule breaks a specific context, add a class to that context and override only that class rather than restructuring the rule"

requirements-completed: [BRWS-01]

# Metrics
duration: 15min
completed: 2026-03-11
---

# Phase 6 Plan 01: Browse Mode Layout Fix Summary

**Two-file CSS fix scoping flex-wrap nowrap to sentences/conjugation nav rows only, restoring 4+2 two-row browse mode layout at 375px via browse-controls class override**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-11
- **Completed:** 2026-03-11
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 2

## Accomplishments
- Added `browse-controls` class to `#browse-mode .controls` in topic.html — gives CSS a targeted hook without any JS changes
- Reordered browse buttons to logical 4+2 split: Prev/Next/Show/Star on row 1, Home/Hear on row 2
- Added `.browse-controls { flex-wrap: wrap }` override after the nowrap rule inside `@media (max-width: 600px)` — restores wrapping for browse mode only
- Human-verified at 375px: topic.html browse shows two rows; sentences.html and conjugation.html nav rows remain single-row

## Task Commits

Each task was committed atomically (commits in inner repo `/home/desire/tap-to-vocab/tap-to-vocab/`):

1. **Task 1: Restructure topic.html browse controls** - `b4734d1` (feat)
2. **Task 2: Update styles.css browse-controls wrap override** - `8e6bb04` (fix)
3. **Task 3: Checkpoint approval — layout verified at 375px** - `18c010c` (chore)

## Files Created/Modified
- `tap-to-vocab/topic.html` — Added `browse-controls` class to #browse-mode .controls div; reordered buttons to Prev/Next/Show/Star/Home/Hear
- `tap-to-vocab/assets/css/styles.css` — Added `.browse-controls { flex-wrap: wrap }` override inside @media (max-width: 600px) after the .controls nowrap rule

## Decisions Made
- Used a class-based override (browse-controls) rather than restructuring the existing nowrap rule — minimal diff, no side effects on sentences/conjugation
- Button reorder places the 4 "navigation" buttons first so they naturally occupy row 1, and the 2 "audio" buttons (Home/Hear) occupy row 2

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Browse mode layout regression (BRWS-01) is resolved — milestone v1.2 complete
- No blockers for future work

---
*Phase: 06-browse-mode-layout-fix*
*Completed: 2026-03-11*
