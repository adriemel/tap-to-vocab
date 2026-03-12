---
phase: 07-parrot-stomp-mechanic
plan: 01
subsystem: ui
tags: [canvas, game, collision-detection, web-audio]

# Dependency graph
requires: []
provides:
  - Parrot stomp mechanic in Jungle Run (fall-from-above kills parrot, bounces monkey)
  - playStompSound() — bright sine pop + low triangle thud, distinct from squawk/fall
  - STOMP_BOUNCE_VEL constant (-10) for upward bounce after stomp
  - Double particle burst (body + wing colors) on stomp
affects: [jungle-run]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Collision discrimination: velY > 0 AND positional test to distinguish stomp from side-hit in circular hitbox"
    - "Dual oscillator sound design: high sine pop + low triangle thud for percussive feedback"

key-files:
  created: []
  modified:
    - tap-to-vocab/games/jungle-run.html

key-decisions:
  - "Stomp zone: monkeyY <= pp.y + 4 (parrot center + 4px tolerance) — tight enough for skill but not punishing"
  - "break after stomp collision — only one parrot processed per frame, prevents cascade kills"
  - "score++ on stomp — rewards skill-based play without separate bonus mechanic"

patterns-established:
  - "Collision discrimination pattern: check velocity direction (velY > 0) AND spatial position before classifying outcome"

requirements-completed: [STOMP-01, STOMP-02, STOMP-03, STOMP-04]

# Metrics
duration: 10min
completed: 2026-03-12
---

# Phase 7 Plan 01: Parrot Stomp Mechanic Summary

**Parrot stomp via fall-detection in circular hitbox: removes parrot, bounces monkey (-10 vel), fires dual particle burst and bright percussive pop/thud sound**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-12T00:00:00Z
- **Completed:** 2026-03-12T00:10:00Z
- **Tasks:** 2 auto-tasks complete (1 checkpoint pending human verification)
- **Files modified:** 1

## Accomplishments
- Stomp detection: `velY > 0 && monkeyY <= pp.y + 4` branch correctly discriminates top-landing from side-hit
- Bounce: `velY = STOMP_BOUNCE_VEL (-10)` gives visible upward bounce after stomp; `onGround = false` ensures air physics apply
- Death regression preserved: side/head-on collisions still call `gameOver()` + squawk sound
- `playStompSound()`: 800->200Hz sine pop (0.1s) + 120->50Hz triangle thud (0.15s) — audibly distinct from sawtooth squawk
- Double particle burst at stomp point in parrot `colors.body` + `colors.wing` for richer explosion

## Task Commits

Each task was committed atomically:

1. **Tasks 1+2: Stomp detection, collision discrimination, bounce, and stomp sound** - `da1b26c` (feat)

## Files Created/Modified
- `tap-to-vocab/games/jungle-run.html` - Stomp mechanic: STOMP_BOUNCE_VEL constant, discriminated collision loop, playStompSound() function

## Decisions Made
- Stomp zone tolerance `pp.y + 4` (not `pp.y + 8` full half-height): requires deliberate jump-on-top action, not accidental graze
- `break` after collision block: prevents multi-parrot processing in one frame which could cause confusing double-effects
- `score++` on stomp: simple reward for skill, consistent with banana collection scoring

## Deviations from Plan

None — plan executed exactly as written. Tasks 1 and 2 were committed together as one atomic unit since Task 2 added the `playStompSound()` function called in Task 1's collision branch.

## Issues Encountered

None. Git repo is nested at `tap-to-vocab/tap-to-vocab/` — all commits made from that directory.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Stomp mechanic fully implemented and awaiting human verification (Task 3 checkpoint)
- Once approved, no further work in this phase — plan complete
- No blockers

## Self-Check: PASSED

- `tap-to-vocab/games/jungle-run.html` — FOUND
- Commit `da1b26c` — FOUND

---
*Phase: 07-parrot-stomp-mechanic*
*Completed: 2026-03-12*
