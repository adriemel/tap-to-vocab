---
phase: 05-mobile-ui-polish-bug-fix
plan: 02
subsystem: ui
tags: [mobile, responsive, bug-fix, conjugation]

# Dependency graph
requires:
  - "05-01 (flex-wrap: nowrap pattern in .controls mobile media query)"
provides:
  - "conjugation.html header row fits on one line at 375px (flex-wrap:nowrap + shortened title + clamp font-size)"
  - "Icon-only Home buttons in both practice-controls and show-controls nav rows"
  - "Show mode always re-renders when switching to it (no blank screen on second visit)"
affects:
  - "conjugation.html"
  - "conjugation.js"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "flex-wrap:nowrap on header row prevents two groups from stacking on 375px"
    - "clamp(1rem, 3.5vw, 1.5rem) scales h1 font size responsively for narrow viewports"
    - "Always-reinit pattern for Show mode: remove guard and call initShowMode unconditionally"

key-files:
  created: []
  modified:
    - tap-to-vocab/conjugation.html
    - tap-to-vocab/assets/js/conjugation.js

key-decisions:
  - "Changed flex-wrap from wrap to nowrap inline on outer header div (conjugation.html only — no CSS class added)"
  - "Shortened h1 text from 'Verb Conjugation' to 'Conjugation' — still unambiguous in context of the page"
  - "Used clamp(1rem, 3.5vw, 1.5rem) on h1 font-size for fluid scaling rather than a breakpoint override"
  - "Removed showInitialized guard entirely in switchMode() — Show mode is read-only, always safe to reinit"
  - "Kept showInitialized variable declaration with comment for code clarity (it is still set in the manager callback)"

requirements-completed: [UI-03, UI-04, BUG-01]

# Metrics
duration: 5min
completed: 2026-03-11
---

# Phase 5 Plan 02: Conjugation Header, Icon-Only Home Buttons, Show Mode Bug Fix Summary

**Header nowrap + shortened title + icon-only Home buttons fix 375px layout; always-reinit Show mode eliminates blank screen on mode switch**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-11T08:35:23Z
- **Completed:** 2026-03-11T08:40:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Changed outer header `flex-wrap:wrap` to `flex-wrap:nowrap` on conjugation.html — prevents the gear+title group from stacking under the coin+count group
- Shortened h1 text from "🔄 Verb Conjugation" to "🔄 Conjugation" and applied `font-size:clamp(1rem, 3.5vw, 1.5rem)` — at 375px clamps to 1rem, keeping the full row within ~282px (fits in 303px usable width)
- Stripped "Home" text from both `#btn-home` (practice-controls) and `#btn-home-show` (show-controls), leaving only 🏠 emoji with `title="Home"` for accessibility — shrinks each Home button from ~80px to ~44px
- Removed the `if (!showInitialized)` guard in `switchMode()` — `initShowMode()` now always called when switching to Show tab, fixing the blank screen on the second and subsequent Show visits

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix conjugation.html header wrapping and icon-only Home buttons** - `c091cb4` (feat)
2. **Task 2: Fix Show mode blank screen bug in conjugation.js (BUG-01)** - `2650484` (fix)

**Plan metadata:** (docs commit — see final_commit below)

## Files Created/Modified

- `tap-to-vocab/conjugation.html` — flex-wrap:nowrap on header, shortened h1 with clamp font-size, icon-only Home buttons in both control rows
- `tap-to-vocab/assets/js/conjugation.js` — removed `if (!showInitialized)` guard; `initShowMode` now always called when switching to Show mode

## Decisions Made

- Chose inline `flex-wrap:nowrap` on the header div rather than adding a CSS class — change is isolated to conjugation.html and does not affect any other page
- Shortened to "Conjugation" (not "Verbs") — preserves the page's identity while fitting within the available width budget
- Used `clamp()` rather than a `@media` breakpoint — simpler and avoids a separate media query block for a single h1
- Removed the guard entirely rather than resetting `showInitialized = false` on mode switch — always-reinit is more predictable and avoids any future flag-desync bugs

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- FOUND: tap-to-vocab/conjugation.html
- FOUND: tap-to-vocab/assets/js/conjugation.js
- FOUND commit: c091cb4 (Task 1)
- FOUND commit: 2650484 (Task 2)
