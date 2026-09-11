---
phase: 24-topics-unidades-navigation
plan: 02
subsystem: ui
tags: [static-html, hub-page, navigation]

# Dependency graph
requires:
  - phase: 24-topics-unidades-navigation
    plan: 01
    provides: "?topic= URL parameter support in TapVocabTSV.initFromTSV, consumed by every button on topics.html"
provides:
  - "topics.html — 9-button static hub screen linking into topic.html?topic="
  - "unidades.html — 5-button static hub screen linking into topic.html?cat=, including the first-ever entry point for Unidad5B"
affects: [24-topics-unidades-navigation (plan 03 - index.html home screen buttons that will link to these two pages, and the 10 category-button deletion)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Static hub-page skeleton: .container > .card > header flex row (h1 + coin badge + Home) > instruction paragraph > single-column .btn stack, modelled on numbers.html merged with topic.html's coin-badge header idiom"

key-files:
  created:
    - topics.html
    - unidades.html
  modified: []

key-decisions:
  - "Single-column button stack (not 2-column grid) chosen per plan's stated rationale: numbers.html is the literal in-repo precedent, the 9 topic labels vary too much in length to wrap evenly in two columns, and full-width rows give bigger mobile tap targets"
  - "Both pages are pure static HTML — no fetch, no page-specific JS module — per 24-CONTEXT.md's Claude's Discretion direction, keeping the 9 topics and 5 unidades a hardcoded closed set this milestone"

patterns-established:
  - "Hub-page header merges numbers.html's Home-in-header-row layout with topic.html's coin-badge-in-a-flex-group layout — the two flex-row idioms now coexist as the canonical pattern for any future static hub screen"

requirements-completed: [NAV-03, NAV-04, NAV-05]

# Metrics
duration: 15min
completed: 2026-09-11
---

# Phase 24 Plan 02: Topics & Unidades Hub Screens Summary

**Created two static hub pages, `topics.html` (9 buttons) and `unidades.html` (5 buttons), each a hardcoded closed set of links into the existing `topic.html`, both carrying a live coin counter and Home control that `numbers.html` (their structural template) lacks.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-09-11
- **Completed:** 2026-09-11
- **Tasks:** 2 completed
- **Files created:** 2

## Accomplishments
- `topics.html` lists all 9 canonical topics (`Colores`, `Animales`, `Numeros`, `Saludar`, `Palabras`, `Casa_Familia`, `Calendario`, `Comida_Bebida`, `Escuela`) as `?topic=` links into `topic.html`, verified against the live `data/words.tsv` to land on row counts 15, 21, 32, 55, 243, 83, 63, 20, 49 respectively — exactly matching the plan's ground truth
- `unidades.html` lists all 5 unidades (`Unidad2`, `Unidad3`, `Unidad4`, `Unidad5A`, `Unidad5B`) as `?cat=` links into `topic.html`, verified against `data/words.tsv` to land on 77, 143, 108, 115, 44 rows respectively — exactly matching the plan's ground truth; `Unidad5B` (44 rows) now has its first-ever home-screen-reachable entry point
- Both pages carry a `#coin-counter` badge wired only via a single `<script src="/assets/js/coins.js"></script>` tag (no per-page JS), and a `🏠 Home` control returning to `/`
- The 4 pre-existing Unidad hrefs (`Unidad2/3/4/5A`) were confirmed byte-identical to the ones still live in `index.html`, satisfying NAV-04's "opens the same word list the old home-screen button did" before Plan 03 removes them from `index.html`

## Task Commits

Each task was committed atomically:

1. **Task 1: Create topics.html — the 9-topic hub screen** - `d29c6c7` (feat)
2. **Task 2: Create unidades.html — the 5-unidad hub screen** - `60df025` (feat)

## Files Created/Modified
- `topics.html` (new) - static hub page, 9 hardcoded `?topic=` anchors, coin badge, Home control, single `coins.js` script tag, no fetch/JS module
- `unidades.html` (new) - static hub page, 5 hardcoded `?cat=` anchors, coin badge, Home control, single `coins.js` script tag, no fetch/JS module

## Decisions Made
- Single-column button stack for both pages (per plan's explicit rationale in the action block): `numbers.html` is the literal precedent, label lengths vary too much for a clean 2-column grid, and full-width rows give bigger mobile tap targets. The plan's `<human-check>` leaves reconsidering a 2-column grid open if scrolling feels excessive in UAT.
- No word counts, subtitles, or descriptions on any button (D-03) — buttons are pure hardcoded emoji + label so adding a topic later is a one-line HTML edit, never a data-driven re-render.

## Deviations from Plan

None - plan executed exactly as written. All grep-based acceptance criteria for both tasks passed on first verification; the live `data/words.tsv` row-count spot-check (via a standalone Node script, since no browser automation tool was available in this environment) matched the plan's ground-truth numbers exactly for all 14 links.

## Issues Encountered

No browser automation tool (e.g. Playwright MCP) was available in this session, so the `<human-check>` phone-viewport visual check and the in-browser click-through of all 14 buttons could not be performed directly. In its place: (1) every grep-based acceptance criterion passed, (2) a Node script re-derived the exact filter expressions from Plan 01 against the live `data/words.tsv` and reproduced all 14 expected row counts precisely, and (3) the Unidad href byte-match against `index.html` was confirmed with `grep -o`. This gives high confidence the pages are wired correctly; a human should still do the phone-viewport visual pass this plan's `<human-check>` calls for once both new pages are link-reachable from the home screen (Plan 03).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 03 can now safely delete the 10 category buttons from `index.html` and add the two `📚 Topics` / `📖 Unidades` buttons — both target pages exist, are verified static, and correctly resolve every link including the previously-unreachable `Unidad5B`.
- The `<human-check>` visual/UAT pass (phone-viewport stack readability, live click-through of all 14 buttons, coin-badge balance parity) should be performed once Plan 03 makes these pages reachable from `/`.

---
*Phase: 24-topics-unidades-navigation*
*Completed: 2026-09-11*

## Self-Check: PASSED

- FOUND: topics.html
- FOUND: unidades.html
- FOUND: commit d29c6c7
- FOUND: commit 60df025
