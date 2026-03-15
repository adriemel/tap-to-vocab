---
phase: 10-game-loop-and-integration
plan: 02
subsystem: ui
tags: [html, css, vanilla-js, drag-and-drop, locations-game]

# Dependency graph
requires:
  - phase: 10-01
    provides: LocationsGame engine with startGame(), skip(), back(), and DOM bindings for #prompt-es, #prompt-de, #progress-badge, #btn-back, #btn-skip, #btn-home, #feedback

provides:
  - locations.html game page shell with header, coin counter, progress badge, prompt card, preserved scene, controls, and feedback div
  - Locations entry button in index.html home page grid
  - .btn-locations CSS rule in styles.css

affects: [navigation, home-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Script load order: coins.js -> shared-utils.js -> [game-js] -> inline startGame() call
    - Full-width grid button with dark gradient and accent border (matches btn-fill-blank, btn-verbs pattern)

key-files:
  created: []
  modified:
    - tap-to-vocab/locations.html
    - tap-to-vocab/index.html
    - tap-to-vocab/assets/css/styles.css

key-decisions:
  - "No game-init.js on locations.html — explicitly out of scope per REQUIREMENTS.md"
  - "Prompt card uses .sentence-target CSS class (same as fill-blank.html pattern)"

patterns-established:
  - "Game page header: flex row with h1 + coin-badge + progress-badge on the right"
  - "Controls row: .controls class with back(disabled)/skip/home buttons below the game scene"

requirements-completed: [NAV-01, NAV-02]

# Metrics
duration: 8min
completed: 2026-03-15
---

# Phase 10 Plan 02: Page Shell & Integration Summary

**locations.html transformed from test scaffold into playable game page with header, prompt card, coin/progress badges, controls, and feedback; Locations button wired into home page grid**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-15T09:46:00Z
- **Completed:** 2026-03-15T09:54:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Rebuilt locations.html with full game page shell: header (coin badge + progress badge), prompt card (#prompt-es, #prompt-de), preserved .scene with 10 zones, controls row (Back disabled / Skip / Home), and #feedback error div
- Correct script load order established: coins.js -> shared-utils.js -> locations.js -> LocationsGame.startGame()
- Old test scaffold removed (LocationsGame.init callback and #result div gone)
- Added .btn-locations anchor to index.html between Fill in and Play Games buttons
- Added .grid-two-col .btn-locations CSS rule with dark blue gradient and accent border

## Task Commits

Each task was committed atomically:

1. **Task 1: Rebuild locations.html as full game page** - `cfdfaf6` (feat)
2. **Task 2: Add Locations button to index.html and styles.css** - `35da7fe` (feat)
3. **Task 3 (fix): Fix zone labels, merge cerca-de, fix drop detection** - `66de0c5` (fix)

## Files Created/Modified
- `tap-to-vocab/locations.html` - Rebuilt as full game page shell; preserves .scene div exactly from Plan 10-01; zone labels removed in fix commit
- `tap-to-vocab/locations.js` - Fixed drag/drop detection; merged cerca-de zone into al-lado-de; removed zone label rendering
- `tap-to-vocab/index.html` - Added .btn-locations anchor after .btn-fill-blank, before .btn-games
- `tap-to-vocab/assets/css/styles.css` - Added .grid-two-col .btn-locations rule
- `tap-to-vocab/assets/css/locations.css` - Zone label styles removed (if applicable)

## Decisions Made
- No game-init.js: locations.html does not use the lives-gate pattern (explicitly out of scope per REQUIREMENTS.md)
- Prompt card uses existing `.sentence-target` CSS class for consistent styling without new CSS rules

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed zone labels, cerca-de blob, and drag/drop detection**
- **Found during:** Task 3 (human verify checkpoint)
- **Issue:** Zone labels were visible on-screen cluttering the scene; cerca-de zone was a duplicate of al-lado-de and caused confusion; drag/drop hit detection was unreliable
- **Fix:** Removed zone labels from rendering; merged cerca-de zone into al-lado-de; improved pointer event / elementFromPoint drop detection logic
- **Files modified:** tap-to-vocab/locations.html, tap-to-vocab/locations.js
- **Commit:** 66de0c5

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All tasks complete including human checkpoint verification (approved)
- locations.html is fully wired: LocationsGame.startGame() called on page load; DOM elements match all selectors in locations.js
- Home page now exposes Locations as a discoverable entry point
- Phase 10 is complete; v1.4 milestone is done

---
*Phase: 10-game-loop-and-integration*
*Completed: 2026-03-15*
