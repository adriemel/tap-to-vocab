---
phase: 01-audit
plan: 02
subsystem: audit
tags: [vocab.html, voices.html, standalone-pages, concerns, audit]

# Dependency graph
requires:
  - phase: 01-audit
    provides: "9-point audit checklist and CONCERNS.md format from 01-01 learning pages audit"
provides:
  - "CONCERNS.md '## Audit — Standalone Pages' section with vocab.html and voices.html findings"
  - "Confirmed both pages are orphaned (zero in-app links)"
  - "Confirmed vocab.html reachability gap: no links from topic.html or any other page"
  - "Confirmed voices.html is intentionally developer-only debug utility"
affects: [04-ui-polish, 03-features]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - ".planning/codebase/CONCERNS.md"

key-decisions:
  - "vocab.html is orphaned (not linked from any page) — classified as Medium severity, not Low, because the page has actual game functionality that users cannot discover"
  - "voices.html navigation absence is Low severity — page is intentionally developer-only and should remain navigation-free"
  - "speechSynthesis unguarded access in voices.html listVoices() is Medium severity — could crash page in unsupported browsers at load time (not just on user interaction)"

patterns-established: []

requirements-completed: [AUDT-01]

# Metrics
duration: 10min
completed: 2026-03-10
---

# Phase 1 Plan 02: Audit Standalone Pages Summary

**vocab.html (orphaned spelling card) and voices.html (dev debug tool) audited with 12 combined findings added to CONCERNS.md; both confirmed unreachable from main app navigation**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-10T08:17:00Z
- **Completed:** 2026-03-10T08:27:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Confirmed vocab.html is completely orphaned — no HTML or JS file in the app links to it, despite CLAUDE.md describing it as a URL-param-based word card for topic.html
- Confirmed voices.html is intentionally developer-only — no links, minimal styling, German-language instructions aimed at developers
- Documented vocab.html functional gaps: no CoinTracker integration (correct answers give no coins), no SharedUtils (duplicates speech logic), no TSV fetch (words via URL params only), no navigation
- Documented voices.html crash risk: `listVoices()` calls `window.speechSynthesis.getVoices()` without null check; page would crash at load in browsers without speechSynthesis API
- Added "## Audit — Standalone Pages" section to CONCERNS.md with 12 entries across both pages, each with severity ratings

## Task Commits

1. **Task 1: Audit vocab.html** + **Task 2: Audit voices.html** - `b09624c` (feat)

**Plan metadata:** (pending final commit)

## Files Created/Modified

- `.planning/codebase/CONCERNS.md` — Added "## Audit — Standalone Pages" section (109 lines) with vocab.html (8 entries) and voices.html (5 entries)

## Decisions Made

- Classified vocab.html orphan status as Medium (not Low): the page has working game functionality (spelling practice, speech, back-navigation) that users cannot access — this is a discoverable gap, not just a cosmetic or optional feature
- Classified voices.html navigation absence as Low (intentional): file title, German instructions, and developer-focused content confirm it is a debug utility; adding nav would be inappropriate
- Classified voices.html speechSynthesis crash as Medium: `render()` is called at page load (line 78) before any user gesture, and `listVoices()` at line 37 does not guard against `window.speechSynthesis` being undefined — this is a real crash in unsupported browsers

## Deviations from Plan

None — plan executed exactly as written. All 9 audit checklist points were applied to both pages. All open questions from RESEARCH.md were answered with specific findings.

## Issues Encountered

- Plan's file path `tap-to-vocab/tap-to-vocab/vocab.html` did not exist as a nested path from the repo root; correct path is `tap-to-vocab/vocab.html` (the inner `tap-to-vocab/tap-to-vocab/` structure in CLAUDE.md refers to the outer repo having an inner `tap-to-vocab/` subdirectory, but `vocab.html` is directly in `tap-to-vocab/`). Files were found and read without issue once correct paths were used.

## Next Phase Readiness

- All standalone pages are now covered in CONCERNS.md — the issue registry is complete for Phase 1 audit scope
- vocab.html integration gap (orphaned + no coins + no nav) is documented and ready for Phase 4 (UI Polish) prioritization decisions
- voices.html speechSynthesis crash risk is documented for Phase 2 (Bug Fixes) if desired
- CONCERNS.md is ready to guide Phase 2 (Bug Fixes) and Phase 4 (UI Polish) work

## Self-Check: PASSED

- SUMMARY.md exists at `.planning/phases/01-audit/01-02-SUMMARY.md`
- CONCERNS.md exists at `.planning/codebase/CONCERNS.md` with "## Audit — Standalone Pages" section
- Task commit `b09624c` confirmed in git log

---
*Phase: 01-audit*
*Completed: 2026-03-10*
