---
phase: 23-vocabulary-data-topic-tagging
plan: 01
subsystem: data
tags: [tsv-loader, vanilla-js, shared-utils]

# Dependency graph
requires: []
provides:
  - "SharedUtils.loadWords projects a 4th `topics` string field on every row, tolerant of a missing column"
  - "Plain-English walkthrough documents the `topics` column and the loader's tolerance"
affects: [23-02-data-migration, 23-03-data-migration, 23-04-data-migration, 24-topics-navigation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tolerant column projection: idx.field = header.indexOf(name), then (idx.field >= 0 ? cols[idx.field] : \"\").trim() — never undefined, never throws on a missing column"

key-files:
  created: []
  modified:
    - assets/js/shared-utils.js
    - tap-to-vocab-walkthrough.md

key-decisions:
  - "topics is read by header name (header.indexOf(\"topics\")) and never split on commas, matching D-01/D-02"
  - "topics is NOT added to the required-fields filter, so blank-topic rows (example sentences) are never dropped, matching D-03"

patterns-established:
  - "loadWords now mirrors loadTSV's tolerant-guard idiom for its 4th field without becoming fully generic — kept loadTSV untouched per plan"

requirements-completed: [DATA-05]

# Metrics
duration: 10min
completed: 2026-09-10
---

# Phase 23 Plan 01: TSV Loader Topics Projection Summary

**`SharedUtils.loadWords` now returns `{category, es, de, topics}` for every row, reading `topics` by header name with a two-line tolerant guard that yields `""` (never `undefined`) when the column is absent — the one code change enabling Phase 23's data migration and Phase 24's Topics screens.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-09-10T15:03:32Z (approx, per STATE.md session start)
- **Completed:** 2026-09-10T15:07:50Z
- **Tasks:** 2 completed
- **Files modified:** 2

## Accomplishments
- `loadWords` in `assets/js/shared-utils.js` projects a 4th `topics` field using the same ternary-guard idiom as `category`/`es`/`de`
- Verified with two Node harnesses: the real `data/words.tsv` (708 rows, all `topics` typeof string, no row dropped) and a synthetic 3-column legacy TSV with no `topics` header (1 row returned, `topics === ""`) — proving the DATA-05 tolerance
- `loadTSV` left byte-identical (it is already header-keyed and needed no change)
- `tap-to-vocab-walkthrough.md` updated per the code-walkthrough skill: directory listing now names all 4 columns, a new paragraph explains the `topics` column (one topic per row, the 9 current slugs, blank cells are deliberate, `category` untouched), and the TSV Loader worked example is now a 4-column row/object with a sentence on the missing-column tolerance

## Task Commits

Each task was committed atomically:

1. **Task 1: Project the topics column in loadWords** - `9b332de` (feat)
2. **Task 2: Update the plain-English walkthrough for the new column** - `4a36f01` (feat)

## Files Created/Modified
- `assets/js/shared-utils.js` - `loadWords` now returns a `topics` string field on every row (2 net new lines); `loadTSV` untouched
- `tap-to-vocab-walkthrough.md` - documents the `topics` column and loader tolerance in plain English, all 9 D-01 slugs named

## Decisions Made
None beyond what the plan specified - followed the plan's exact two-line code change and explicit documentation content.

## Deviations from Plan

None - plan executed exactly as written. Both harness verification commands from the plan's `<verify>` block were run and exited 0. All acceptance criteria greps were run and matched expected output exactly (see below).

## Issues Encountered

None. One environmental note: the sandboxed Bash tool refused a few multi-command compound invocations (`&&` chains, background `()` subshells) with a "too complex to verify worktree containment" error; these were split into individual single-purpose Bash calls, which the plan's task structure already supported without any behavior change.

## Verification Evidence

- `grep -c 'header.indexOf("topics")' assets/js/shared-utils.js` → `1`
- Real-data harness: `rows 708 expected 708 badTopics 0` (exit 0)
- Legacy-3-column harness: `[{"category":"Colores","es":"negro","de":"schwarz","topics":""}]` (exit 0)
- `sed -n '19,39p' assets/js/shared-utils.js | grep -c 'console'` → `0`
- `grep -c 'filter(r => r.category && r.es && r.de)' assets/js/shared-utils.js` → `1`, unchanged, no `topics` added
- `git diff -U0 assets/js/shared-utils.js | grep -c '^+[^+]'` → `4`
- `git diff -U0 assets/js/shared-utils.js | grep -c 'loadTSV'` → `0`
- `node --check assets/js/shared-utils.js` → syntax OK
- Local static server: `topic.html`, `sentences.html`, `data/words.tsv`, `assets/js/shared-utils.js` all return HTTP 200
- `grep -c 'topics' tap-to-vocab-walkthrough.md` → `4` (>= 4 required)
- All nine D-01 slugs (`Colores Animales Numeros Saludar Casa_Familia Palabras Calendario Comida_Bebida Escuela`) confirmed present in the walkthrough
- `grep -c 'de: "schwarz"}' tap-to-vocab-walkthrough.md` → `0` (stale 3-key example replaced)
- `git diff --stat tap-to-vocab-walkthrough.md` → changes confined to that one file

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `loadWords` contract is now live and safe for plans 02-04 to write `topics` values into `data/words.tsv` in any order — a row with a blank `topics` cell, a filled cell, or a file with no `topics` column at all all resolve correctly through the loader
- Both `topic.html`/`tapvocab.js` and `sentences.html`/`sentences.js` continue to behave exactly as before (neither reads `topics` yet — that is Phase 24's job)
- No blockers for the remaining Phase 23 data-migration plans
