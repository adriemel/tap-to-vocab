---
phase: 22-qu-hora-es-time-telling-practice-tool
plan: 01
subsystem: ui
tags: [vanilla-js, spanish-grammar, tdd, css]

# Dependency graph
requires: []
provides:
  - "window.HoraPhrase.buildTimePhrase(hour24, minute) — pure Spanish time-phrase generator"
  - "hora-phrase.test.js — zero-dependency Node test covering 12 exact cases + 288-state invariant sweep"
  - ".grid-two-col .btn-hora home button styling + index.html entry point to /hora.html"
affects: [22-02, 22-03, 22-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dual window/module.exports IIFE for logic that must run in both browser and Node test (no build step)"

key-files:
  created:
    - assets/js/hora-phrase.js
    - hora-phrase.test.js
  modified:
    - index.html
    - assets/css/styles.css

key-decisions:
  - "Period suffix (mañana/tarde/noche) computed in a dedicated periodFromHour24() helper, never inline with spokenHour, to make Pitfall 1 structurally impossible to reintroduce"
  - "Es la/Son las verb agreement checked strictly on the post-menos-shift spokenHour, per RESEARCH.md Pitfall 2"

patterns-established:
  - "Grammar/logic-only JS files that need Node-test coverage use the dual window/module.exports IIFE guard pattern (see coins.js for the window-only precedent this extends)"

requirements-completed: [HORA-01, HORA-06, HORA-07]

# Metrics
duration: ~15min
completed: 2026-08-02
---

# Phase 22 Plan 01: Time-Phrase Grammar Engine + Home Button Summary

**Pure `buildTimePhrase(hour24, minute)` grammar engine (dual window/Node export) with a 300-assertion Node test, plus the home-screen `🕐 Qué hora es?` entry button.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-08-02T17:19:00+02:00
- **Completed:** 2026-08-02T17:20:21+02:00
- **Tasks:** 2 completed
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments
- Built `assets/js/hora-phrase.js` — a pure, DOM-free `buildTimePhrase(hour24, minute)` implementing traditional Spanish time phrasing (Es la una / Son las..., y cuarto/media, menos cuarto/veinte, en punto), dual-exported for both browser (`window.HoraPhrase`) and Node (`module.exports`)
- Wrote `hora-phrase.test.js`, a zero-dependency Node test that follows RED→GREEN TDD: 12 exact-string cases from RESEARCH.md's worked-example table, plus an exhaustive sweep of all 288 reachable (hour, minute) dial states asserting shape invariants (starts with Es la/Son las, ends with exactly one period suffix, contains no digits)
- Correctly implemented both documented pitfalls as structurally separate code paths: period suffix always derived from raw `hour24` (Pitfall 1), and Es la/Son las agreement always checked on the post-menos-shift `spokenHour` (Pitfall 2) — both proven by the (18,45)/(23,40)/(0,40)/(12,40)/(11,35) test cases
- Added the home-screen `🕐 Qué hora es?` button in `index.html`, positioned directly below "Quién soy yo" and above "Play Games", styled with the reused `.btn-quien-soy` gradient/border combo verbatim in `assets/css/styles.css`

## Task Commits

Each task was committed atomically (Task 1 followed TDD RED→GREEN):

1. **Task 1 (RED): failing test for buildTimePhrase** - `03eb293` (test)
2. **Task 1 (GREEN): implement buildTimePhrase** - `ff44999` (feat)
3. **Task 2: home-screen Qué hora es? entry button** - `22be3f3` (feat)

_TDD gate sequence verified in git log: test(...) commit precedes feat(...) implementation commit._

## Files Created/Modified
- `assets/js/hora-phrase.js` - Pure Spanish time-phrase grammar engine, dual window/Node exported
- `hora-phrase.test.js` - Node assert test: 12 exact cases + 288-state invariant sweep, prints "ALL PASS" on success
- `index.html` - New `.btn-hora` anchor linking to `/hora.html`, placed between Quién soy yo and Play Games
- `assets/css/styles.css` - New `Qué Hora Es? — Time-Telling (hora-*)` section banner + `.grid-two-col .btn-hora` rule (reuses `.btn-quien-soy` gradient/border/weight verbatim)

## Decisions Made
- Followed RESEARCH.md's locked decisions (A1 period boundaries, A2 no mediodía/medianoche special words, A4 "en punto" for exact hours) exactly as specified — no re-litigation
- Kept the period-suffix computation as a small standalone `periodFromHour24()` function rather than an inline branch, specifically so future edits to the hour-shift logic cannot accidentally leak into the period calculation (defense against Pitfall 1 regressions in later plans)

## Deviations from Plan

None - plan executed exactly as written. Both tasks matched the plan's acceptance criteria on first implementation; no auto-fixes were needed.

## Issues Encountered

None. The worktree branch was initially missing the phase 22 planning documents (10 docs-only commits present on `main` but not yet on this worktree branch) — resolved via a pure fast-forward merge (`git merge main --ff-only`) before execution began, since the worktree branch was a strict ancestor of `main` with zero divergent commits. This was a setup/environment issue, not a deviation from the plan itself.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `window.HoraPhrase.buildTimePhrase` / `require('./assets/js/hora-phrase.js')` is a stable, tested contract ready for plan 03 to consume from `hora.html`
- `.btn-hora` links to `/hora.html`, which does not exist yet — this is expected at this wave; plan 02 creates the page. The 404 is called out explicitly in the plan's own verification section (item 3).
- `.grid-two-col .btn-hora` and the `hora-*` CSS section banner are in place for plan 02 to extend with clock-card/reel/phrase-card styles

---
*Phase: 22-qu-hora-es-time-telling-practice-tool*
*Completed: 2026-08-02*
