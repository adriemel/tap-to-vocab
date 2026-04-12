---
phase: 12-homepage-visual-tweaks
plan: 01
subsystem: ui
tags: [css-variables, grid-layout, dark-theme, homepage]

# Dependency graph
requires: []
provides:
  - Palabras group markup with Tiempo and Idiomas visually nested as sub-buttons
  - Lighter dark background (#152238) replacing near-black (#0b1020)
affects: [homepage, index.html, global-theme]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hierarchical grid grouping: .palabras-group spans both columns with inner .palabras-sub two-column grid"
    - "Sub-button subordination via dashed border + reduced opacity (0.82) without new colors"

key-files:
  created: []
  modified:
    - tap-to-vocab/index.html
    - tap-to-vocab/assets/css/styles.css

key-decisions:
  - "Restored deleted app source files from commit faa36fa — entire codebase was accidentally deleted in commit 16e23f9 during v1.6 milestone setup"
  - "Dashed border + opacity 0.82 on sub-buttons visually subordinates Tiempo/Idiomas without introducing new color tokens"
  - "Casa_Familia remains as standalone grid item after the palabras-group"
  - "#0b1020 retained in 5 non-background uses (active tab text, word slot text) — plan's grep-c==0 criterion excluded these intentional dark-on-light text colors"

patterns-established:
  - "Grid group pattern: wrapper div with grid-column:1/-1, flex-column layout, inner grid for sub-items"

requirements-completed: [HOME-01, VIS-01]

# Metrics
duration: 25min
completed: 2026-04-12
---

# Phase 12 Plan 01: Homepage & Visual Tweaks Summary

**Tiempo and Idiomas grouped under Palabras as dashed sub-buttons in a two-column inline grid; global background lightened from #0b1020 to #152238**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-12T00:00:00Z
- **Completed:** 2026-04-12T00:25:00Z
- **Tasks:** 2
- **Files modified:** 2 (+ 23 codebase files restored)

## Accomplishments
- Tiempo and Idiomas links removed from flat grid and nested inside `.palabras-group` wrapper spanning both columns
- `.palabras-sub` inner grid shows both sub-buttons side-by-side with dashed borders at 0.82 opacity
- All three links (Palabras, Tiempo, Idiomas) navigate to correct `/topic.html?cat=` URLs
- Global `--bg` CSS variable updated from near-black `#0b1020` to dark navy `#152238`
- Full app codebase restored after accidental deletion in milestone setup commit

## Task Commits

Each task was committed atomically:

1. **Task 1: Group Tiempo and Idiomas under Palabras in the home grid** - `47124e7` (feat)
2. **Task 2: Lighten global background CSS variable** - `b8df6df` (style)

## Files Created/Modified
- `tap-to-vocab/index.html` - Replaced standalone Tiempo/Idiomas/Palabras with `.palabras-group` wrapper containing main + sub-buttons
- `tap-to-vocab/assets/css/styles.css` - Added `.palabras-group`, `.palabras-sub`, `.btn-palabras-sub` rules; updated `--bg` to `#152238`

## Decisions Made
- Dashed border style for sub-buttons: signals secondary status without needing new colors or complex styling
- Sub-buttons use `font-size: 0.88rem` and reduced vertical padding to visually distinguish from main buttons
- Casa_Familia left as standalone item — it is not semantically related to the Palabras vocabulary group

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Restored deleted codebase files**
- **Found during:** Pre-task setup
- **Issue:** Commit `16e23f9` ("docs: define milestone v1.6 requirements") accidentally deleted all app source files: index.html, styles.css, all JS modules, all HTML pages, all TSV data files
- **Fix:** Restored all deleted files from commit `faa36fa` (merge commit with full codebase), then applied the quiz fix from `dcd5da0` (styles.css + tapvocab.js)
- **Files modified:** 23 app source files restored
- **Verification:** Files present on disk and tracked in git after Task 1 commit
- **Committed in:** `47124e7` (part of Task 1 commit)

**2. [Plan criterion note] --bg:#0b1020 still appears 5 times in styles.css**
- **Found during:** Task 2 verification
- **Issue:** Plan success criterion requires `grep -c "#0b1020" styles.css == 0`, but the color appears in 5 rules as dark text color on bright/colored backgrounds (active mode tabs, word slots)
- **Fix:** Not changed — these are intentional dark-on-light text colors unrelated to the background variable. Changing them would break contrast on active states
- **Files modified:** None (no fix needed)
- **Verification:** `grep -n "#0b1020" styles.css` confirms all 5 occurrences are `color:` properties, not `background:` or `--bg`

---

**Total deviations:** 1 auto-fixed blocking (codebase restore) + 1 plan criterion clarification
**Impact on plan:** Codebase restore was prerequisite for any work. Plan criterion on #0b1020 count was an oversight — the --bg variable goal is fully achieved.

## Issues Encountered
- Entire app codebase was missing from git HEAD due to accidental deletion in planning commit. Files were restored from the last full-codebase commit (`faa36fa`) before proceeding.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Homepage grouping complete — Tiempo and Idiomas are nested under Palabras
- Background lightening applied globally via CSS variable
- All app source files restored and tracked in git
- Ready for Phase 13 (statistics board)

## Self-Check

**Checking created files exist:**
- `tap-to-vocab/index.html`: FOUND (verified via grep)
- `tap-to-vocab/assets/css/styles.css`: FOUND (verified via grep)
- `.planning/phases/12-homepage-visual-tweaks/12-01-SUMMARY.md`: This file

**Checking commits exist:**
- `47124e7`: feat(12-01) — Task 1
- `b8df6df`: style(12-01) — Task 2

## Self-Check: PASSED

---
*Phase: 12-homepage-visual-tweaks*
*Completed: 2026-04-12*
