---
phase: 03-code-cleanup
plan: "02"
subsystem: ui
tags: [vanilla-js, iife, html, inline-scripts, refactor]

# Dependency graph
requires:
  - phase: 03-code-cleanup
    provides: coins.js defining window.CoinTracker (loads before home.js)
provides:
  - tap-to-vocab/assets/js/home.js with all home-page JS logic in IIFE
  - index.html with zero inline script blocks
affects: [03-code-cleanup]

# Tech tracking
tech-stack:
  added: []
  patterns: ["IIFE module pattern for home-page JS", "External script files instead of inline HTML scripts"]

key-files:
  created:
    - tap-to-vocab/assets/js/home.js
  modified:
    - tap-to-vocab/index.html

key-decisions:
  - "Merged both inline script blocks into one DOMContentLoaded listener in home.js — reset-coins listener was outside DOMContentLoaded in original but DOM is ready by the time the body script ran, so consolidating is safe and cleaner"
  - "Used var (not const/let) to match established IIFE style in coins.js and other files"

patterns-established:
  - "All home-page logic lives in assets/js/home.js; index.html contains no inline JS"

requirements-completed: [STRCT-02]

# Metrics
duration: 2min
completed: 2026-03-10
---

# Phase 3 Plan 02: Home Page JS Extraction Summary

**Extracted index.html inline scripts into assets/js/home.js IIFE — practice count badge, games coin check, and reset coins button now in dedicated external file**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-10T19:33:20Z
- **Completed:** 2026-03-10T19:35:22Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created `assets/js/home.js` as an IIFE with single DOMContentLoaded listener containing all three home-page behaviors
- Removed both inline `<script>` blocks from index.html (one in `<head>`, one at end of `<body>`)
- index.html now loads only `<script src>` tags — coins.js then home.js — with zero inline JS

## Task Commits

Each task was committed atomically:

1. **Task 1: Create home.js with all home-page logic** - `ee3944e` (feat)
2. **Task 2: Remove inline scripts from index.html and add home.js script tag** - `1d9c013` (refactor)

## Files Created/Modified
- `tap-to-vocab/assets/js/home.js` - New IIFE containing practice count badge, games coin check, and reset coins logic
- `tap-to-vocab/index.html` - Removed 28 lines of inline JS; added single `<script src="/assets/js/home.js"></script>` in head

## Decisions Made
- Merged both inline script blocks into one DOMContentLoaded listener in home.js — the reset-coins listener was outside DOMContentLoaded in the original body script, but the button exists in DOM by that point, so consolidating is safe and produces cleaner code
- Used `var` (not `const`/`let`) to match the established IIFE coding style in coins.js and other existing files

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- home.js is lintable, versionable, and separately cacheable
- index.html is now a pure HTML document with zero JS concerns
- Ready for any further 03-code-cleanup plans

---
*Phase: 03-code-cleanup*
*Completed: 2026-03-10*
