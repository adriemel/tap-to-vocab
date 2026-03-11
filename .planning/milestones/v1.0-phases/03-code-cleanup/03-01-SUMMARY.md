---
phase: 03-code-cleanup
plan: "01"
subsystem: ui
tags: [javascript, tsv, shared-utils, refactor, deduplication]

# Dependency graph
requires:
  - phase: 02-bug-fixes
    provides: Working fill-blank.js and conjugation.js game files
provides:
  - Generic SharedUtils.loadTSV(path) function for any TSV file
  - fill-blank.js using SharedUtils.loadTSV instead of local loadSentences
  - conjugation.js using SharedUtils.loadTSV instead of local loadVerbs
affects: [fill-blank, conjugation, shared-utils, any future TSV consumers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Generic TSV loader in SharedUtils — returns header-keyed row objects; callers filter for their domain"
    - "No-op duplication removal: delete standalone loader, inline the filter at call site"

key-files:
  created: []
  modified:
    - tap-to-vocab/assets/js/shared-utils.js
    - tap-to-vocab/assets/js/fill-blank.js
    - tap-to-vocab/assets/js/conjugation.js

key-decisions:
  - "loadTSV returns unfiltered rows — callers own domain filtering (fill-blank filters on de/es_with_blank/correct_answer; conjugation filters on infinitive/de)"
  - "loadWords() kept unchanged — it is a specialized convenience wrapper with different shape; not replaced by loadTSV"

patterns-established:
  - "Shared TSV loading: all TSV files loaded via SharedUtils.loadTSV; domain filtering inline at call site"

requirements-completed: [STRCT-01]

# Metrics
duration: 2min
completed: 2026-03-10
---

# Phase 3 Plan 01: Consolidate TSV Loaders Summary

**Extracted duplicate TSV parsing into SharedUtils.loadTSV, removing loadSentences from fill-blank.js and loadVerbs from conjugation.js — single fix point for all future TSV changes**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-10T19:33:17Z
- **Completed:** 2026-03-10T19:35:15Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added generic `SharedUtils.loadTSV(tsvPath)` to shared-utils.js — header-driven, returns all rows as keyed objects, no domain filtering
- Removed 25-line `loadSentences()` from fill-blank.js; replaced with `SharedUtils.loadTSV()` + inline filter
- Removed 16-line `loadVerbs()` from conjugation.js; replaced with `SharedUtils.loadTSV()` + inline filter

## Task Commits

Each task was committed atomically:

1. **Task 1: Add loadTSV to SharedUtils** - `862780d` (feat)
2. **Task 2: Replace standalone loaders in fill-blank.js and conjugation.js** - `201d39c` (refactor)

## Files Created/Modified
- `tap-to-vocab/assets/js/shared-utils.js` - Added loadTSV() function and exported it on window.SharedUtils
- `tap-to-vocab/assets/js/fill-blank.js` - Removed loadSentences(); init() now calls SharedUtils.loadTSV() with inline filter
- `tap-to-vocab/assets/js/conjugation.js` - Removed loadVerbs(); init() now calls SharedUtils.loadTSV() with inline filter

## Decisions Made
- `loadTSV` is deliberately generic (no filtering) — callers own their domain-specific filter logic. This keeps the shared utility neutral and lets each game define what counts as a "valid" row.
- `loadWords()` was kept unchanged — it has a different return shape (always {category, es, de}) and is a convenience wrapper for tapvocab.js and sentences.js. Replacing it with loadTSV would require downstream changes for no benefit.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- TSV loader consolidation complete; STRCT-01 requirement satisfied
- Any future TSV format changes or parsing bugs can be fixed in one place (SharedUtils.loadTSV)
- Ready for remaining phase 03 plans

## Self-Check: PASSED

- SUMMARY.md created at `.planning/phases/03-code-cleanup/03-01-SUMMARY.md` — FOUND
- Commit 862780d (feat: add loadTSV) — FOUND
- Commit 201d39c (refactor: replace standalone loaders) — FOUND

---
*Phase: 03-code-cleanup*
*Completed: 2026-03-10*
