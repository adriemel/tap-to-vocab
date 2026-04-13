---
phase: 13-session-statistics
plan: 03
subsystem: game-stats
tags: [stats, fill-blank, locations, session-tracking]
dependency_graph:
  requires: [13-01]
  provides: [STATS-01, STATS-02, STATS-03, STATS-04 for fill-blank and locations]
  affects: [fill-blank.html, locations.html]
tech_stack:
  added: []
  patterns: [guarded-window-check, IIFE-module, var-style-for-existing-files]
key_files:
  modified:
    - tap-to-vocab/assets/js/fill-blank.js
    - tap-to-vocab/assets/js/locations.js
decisions:
  - "showPanel called before innerHTML overwrite in showCompletion per RESEARCH Pitfall 5"
  - "All SessionStats calls guarded with if (window.SessionStats) for safe degradation"
  - "locations.js edits use var + function() to match existing file style"
metrics:
  duration: ~8 minutes
  completed: 2026-04-13
  tasks: 2
  files: 2
---

# Phase 13 Plan 03: Session Stats Wiring — Fill-Blank and Locations Summary

SessionStats lifecycle (reset/record/showPanel/hidePanel) wired into fill-blank.js and locations.js, completing STATS-01 through STATS-04 coverage for all four required game modes alongside Plan 02.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wire SessionStats into fill-blank.js initGame | c969e8a | assets/js/fill-blank.js |
| 2 | Wire SessionStats into locations.js startGame/checkDrop/showCompletion | 9d96b1b | assets/js/locations.js |

## What Was Done

### Task 1 — fill-blank.js (5 insertions inside initGame)

- **Edit 1** (button wiring): after `errorEl` declaration, before empty-guard — wires `btn-stats` onclick to `SessionStats.showPanel()` and `btn-stats-close` onclick to `SessionStats.hidePanel()`.
- **Edit 2** (reset): after `let advanceTimer = null` — calls `SessionStats.reset()` to zero counters at round start (STATS-04).
- **Edit 3** (session end): inside `if (currentIndex >= sentences.length)` after `confettiBurst(50)` — calls `SessionStats.showPanel()` (STATS-03).
- **Edit 4** (correct hook): after `CoinTracker.addCoin()` in the correct-answer branch — calls `SessionStats.record(true)` (STATS-01).
- **Edit 5** (wrong hook): after `playErrorSound()` in the else branch — calls `SessionStats.record(false)` (STATS-01).

### Task 2 — locations.js (4 insertions)

- **Edit 1** (reset + buttons): inside `startGame()` after `getElementById('draggable')`, before `init(draggableEl, checkDrop)` — resets stats and wires both stats buttons using `var`/`function()` to match existing file style.
- **Edit 2** (correct hook): inside `checkDrop` correct branch, after `CoinTracker.addCoin()` — calls `SessionStats.record(true)`.
- **Edit 3** (wrong hook): inside `checkDrop` else branch, after `playErrorSound()` — calls `SessionStats.record(false)`.
- **Edit 4** (session end): as FIRST statement in `showCompletion()`, before `confettiBurst` and before `prompt-card` innerHTML overwrite — calls `SessionStats.showPanel()` per RESEARCH Pitfall 5.

## Verification Results

All grep counts matched acceptance criteria for both files:

| Pattern | fill-blank.js | locations.js |
|---------|--------------|-------------|
| SessionStats.reset | 1 | 1 |
| SessionStats.record(true) | 1 | 1 |
| SessionStats.record(false) | 1 | 1 |
| SessionStats.showPanel | 2 | 2 |
| SessionStats.hidePanel | 1 | 1 |
| getElementById("btn-stats") | 1 | 1 |
| getElementById("btn-stats-close") | 1 | 1 |

Both files pass `node -e "new Function(require('fs').readFileSync(...))"` JS parse check.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. SessionStats calls are wired to the real API defined in Plan 01 (stats.js). No placeholder data.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes introduced. Only client-side event recording hooks added.

## Self-Check: PASSED

- `c969e8a` exists in git log: confirmed
- `9d96b1b` exists in git log: confirmed
- Both files contain all required SessionStats calls: confirmed
- JS parse check passed for both files: confirmed
