---
phase: 24-topics-unidades-navigation
plan: 01
subsystem: ui
tags: [vanilla-js, tsv-filtering, topic-html, tapvocab]

# Dependency graph
requires:
  - phase: 23-vocabulary-data-topic-tagging
    provides: "topics column on data/words.tsv, read by header name via SharedUtils.loadWords"
provides:
  - "opts.topic support in TapVocabTSV.initFromTSV, filtering rows.topics with a blank/undefined-safe guard"
  - "topic.html reads ?topic= and passes it through to initFromTSV alongside the existing ?cat="
  - "non-blank h1 title on topic pages via a displayName fallback (topic || category)"
affects: [24-topics-unidades-navigation (plan 02 - sub-screens that link into ?topic=)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "initFromTSV branch order: practice -> topic -> category, each mutually exclusive"
    - "(r.topics || \"\") guard before .toLowerCase() mirrors the project's established (cols[i] || \"\").trim() TSV-parsing convention"

key-files:
  created: []
  modified:
    - assets/js/tapvocab.js
    - topic.html

key-decisions:
  - "Kept ?topic= as a fully separate URL param from ?cat= (per 24-CONTEXT.md Claude's Discretion) rather than OR-matching, so 5 overlapping names (Colores, Animales, Numeros, Saludar, Casa_Familia) keep distinct, correct counts under each param"
  - "Introduced displayName = topic || category solely to fix the title-blank regression that ?topic= would otherwise cause (topic.html always passes category: cat, which is empty when only ?topic= is set)"

patterns-established:
  - "New filter branches on optional TSV columns must guard with (col || \"\") before string methods, since not every row (and no rehydrated localStorage entry) carries every column"

requirements-completed: [NAV-06]

# Metrics
duration: 10min
completed: 2026-09-11
---

# Phase 24 Plan 01: Topic-Aware Filtering in tapvocab.js Summary

**Added a `?topic=` URL parameter that filters `data/words.tsv` by its `topics` column, independent of the existing `?cat=` category filter, with a non-blank title fix and a blank/undefined-safe guard for untagged rows.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-09-11T04:15:00Z
- **Completed:** 2026-09-11T04:23:57Z
- **Tasks:** 2 completed
- **Files modified:** 2

## Accomplishments
- `initFromTSV` now accepts `opts.topic` and filters `rows` on `r.topics` (case-insensitive), inserted between the existing `practice` and `category` branches so `?cat=practice` is never diverted and a `?topic=` URL always wins over the incidental `category` value it comes with
- Fixed a title regression that this feature would otherwise introduce: `topic.html` always passes `category: cat` (empty string when only `?topic=` is set), which previously fell through to `inferCategoryFromPath()` and rendered the literal string `"topic"` in the `h1`. A `displayName = topic || category` fallback now renders the topic slug correctly in both the populated and empty-result branches
- `topic.html`'s inline script reads `params.get("topic")` and forwards it to `initFromTSV` as a second, independent key
- Verified against the live `data/words.tsv` with a standalone Node script: topic `Colores` → 15 rows (vs. category `Colores` → 13), topic `Escuela` → 49, topic `Casa_Familia` → 83, category `Unidad3` → 143 — all match the plan's ground-truth counts exactly, proving `?topic=` and `?cat=` are genuinely distinct filters

## Task Commits

Each task was committed atomically:

1. **Task 1: Add the topic filter branch and non-blank topic title to initFromTSV** - `2e2c411` (feat)
2. **Task 2: Read the ?topic= parameter in topic.html and pass it through** - `7f2d37e` (feat)

## Files Created/Modified
- `assets/js/tapvocab.js` - `initFromTSV` gained `opts.topic`, a `displayName` fallback, a topic filter branch guarded with `(r.topics || "")`, and topic-aware error/title text
- `topic.html` - inline script reads `params.get("topic")` and passes `{ category: cat, topic: topic }` to `initFromTSV`

## Decisions Made
- Kept `?topic=` fully separate from `?cat=` rather than merging/OR-matching, per 24-CONTEXT.md's discretion note — this preserves the pre-existing `?cat=Colores` (13) bookmark behaviour while `?topic=Colores` (15) is a new, distinct URL.
- No underscore-to-space or other display-string cleanup was applied to the topic slug in the title (e.g. `Casa_Familia` renders as-is) — this was explicitly flagged as optional polish and out of scope in the plan and CONTEXT.md.

## Deviations from Plan

None - plan executed exactly as written. All five acceptance-criteria grep counts for Task 1 and all criteria for Task 2 passed on first verification; `node --check` passed; `innerHTML` count is 0 in both files.

## Issues Encountered
A stale `python3 -m http.server` process from a deleted worktree (`/home/desire/tap-to-vocab/.claude/worktrees/agent-ad36008e86da17ccc (deleted)`) was already bound to port 8123 and unrelated to this session — used port 8321 instead rather than killing another process's server. Full in-browser verification (h1 text, `#counter` badge) was not run since no browser automation tool was available in this environment; instead the filter logic was verified against the real `data/words.tsv` via a Node script reproducing the exact filter expressions, which reproduced the plan's ground-truth counts exactly (Colores topic=15/cat=13, Escuela topic=49, Casa_Familia topic=83, Unidad3 cat=143). Combined with the `node --check` syntax pass and the grep-based acceptance criteria, this gives high confidence in correctness; a human should still spot-check the rendered `h1` and `#counter` badge per the plan's `<human-check>` note (e.g. `/topic.html?topic=Calendario` should show day/month words that live under `category: Unidad5A`).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 02's two sub-screens (`topics.html`, `unidades.html`) can now link to `/topic.html?topic=<slug>` and `/topic.html?cat=Unidad<N>` and get correct, distinct filtered results
- The human-check spot-check from this plan's verification section (confirming a Unidad5A word surfaces under `?topic=Calendario`) is still open and should be done once Plan 02's buttons exist, or directly via URL now

---
*Phase: 24-topics-unidades-navigation*
*Completed: 2026-09-11*

## Self-Check: PASSED

- FOUND: assets/js/tapvocab.js
- FOUND: topic.html
- FOUND: .planning/phases/24-topics-unidades-navigation/24-01-SUMMARY.md
- FOUND: commit 2e2c411
- FOUND: commit 7f2d37e
