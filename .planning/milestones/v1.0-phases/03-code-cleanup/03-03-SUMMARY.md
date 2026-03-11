---
phase: 03-code-cleanup
plan: "03"
subsystem: ui
tags: [javascript, refactor, deduplication, game-guard, iife]

# Dependency graph
requires:
  - phase: 02-bug-fixes
    provides: sessionStorage game lives guard logic (BUG-03) that this plan deduplicates
provides:
  - Shared game lives guard via window.GameInit.requireLives() in game-init.js
  - Three game HTML files updated to call GameInit.requireLives() instead of inline guard blocks
affects: [games, game-init, coin-dash, jungle-run, tower-stack]

# Tech tracking
tech-stack:
  added: []
  patterns: [shared game initialization module via IIFE exporting window.GameInit]

key-files:
  created:
    - tap-to-vocab/assets/js/game-init.js
  modified:
    - tap-to-vocab/games/coin-dash.html
    - tap-to-vocab/games/jungle-run.html
    - tap-to-vocab/games/tower-stack.html

key-decisions:
  - "requireLives returns false/true instead of calling return directly — caller is responsible for early return to stay within IIFE scope"
  - "jungle-run uses #overlay-start h2 selector (CSS equivalent of getElementById+querySelector chain) since it has no .card h1"

patterns-established:
  - "GameInit module pattern: IIFE exports window.GameInit with initialization helpers shared across game pages"
  - "Selector-parameterized guard: requireLives(errorTargetSelector) lets each game provide its own DOM insertion target"

requirements-completed: [STRCT-03]

# Metrics
duration: 10min
completed: 2026-03-10
---

# Phase 3 Plan 03: Game Init Deduplication Summary

**Extracted copy-pasted sessionStorage lives guard from three game files into a single GameInit.requireLives(selector) function in game-init.js**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-10T19:30:00Z
- **Completed:** 2026-03-10T19:40:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created tap-to-vocab/assets/js/game-init.js exporting window.GameInit with requireLives(errorTargetSelector)
- Replaced identical 6-line inline guard blocks in coin-dash.html and tower-stack.html with one-liner calls
- Replaced structurally similar guard in jungle-run.html with one-liner using CSS-equivalent selector (#overlay-start h2)
- Direct URL navigation to any game with no sessionStorage game_lives still shows "No games remaining" error

## Task Commits

Each task was committed atomically:

1. **Task 1: Create game-init.js with requireLives()** - `032bbdb` (feat)
2. **Task 2: Update all three game HTML files to use game-init.js** - `2e0565b` (refactor)

## Files Created/Modified
- `tap-to-vocab/assets/js/game-init.js` - IIFE exports window.GameInit.requireLives(selector); returns false + inserts error HTML when lives <= 0, returns true otherwise
- `tap-to-vocab/games/coin-dash.html` - Added game-init.js script tag; guard replaced with `if (!GameInit.requireLives(".card h1")) return;`
- `tap-to-vocab/games/jungle-run.html` - Added game-init.js script tag; guard replaced with `if (!GameInit.requireLives("#overlay-start h2")) return;`
- `tap-to-vocab/games/tower-stack.html` - Added game-init.js script tag; guard replaced with `if (!GameInit.requireLives(".card h1")) return;`

## Decisions Made
- requireLives returns false/true rather than trying to `return` out of the caller scope — callers do `if (!GameInit.requireLives(...)) return;`
- jungle-run's `document.getElementById("overlay-start").querySelector("h2")` replaced with CSS selector `#overlay-start h2` — functionally equivalent and simpler

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Lives guard now maintained in one place (game-init.js); any future behavioral change only requires editing one file
- Pattern is established for additional shared game initialization helpers to be added to GameInit module

## Self-Check: PASSED
- game-init.js: FOUND
- coin-dash.html: FOUND
- jungle-run.html: FOUND
- tower-stack.html: FOUND
- Commit 032bbdb: FOUND
- Commit 2e0565b: FOUND

---
*Phase: 03-code-cleanup*
*Completed: 2026-03-10*
