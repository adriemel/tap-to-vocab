---
phase: 24-topics-unidades-navigation
plan: 03
subsystem: ui
tags: [vanilla-css, static-html, home-navigation, docs]

# Dependency graph
requires:
  - phase: 24-topics-unidades-navigation
    plan: 02
    provides: "topics.html and unidades.html sub-screens, both link targets required to exist before the home screen could point at them"
provides:
  - "index.html home screen collapsed from 10 category buttons to a single two-button row (📚 Topics / 📖 Unidades)"
  - ".btn-topics / .btn-unidades CSS: taller default-colour buttons plus a narrow-viewport padding override that survives the existing 420px collapse"
  - "CLAUDE.md and tap-to-vocab-walkthrough.md updated to describe the new navigation and the ?topic= parameter"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "New .grid-two-col .btn-xxx variant classes can opt OUT of the span/gradient/accent-border convention (only padding + margin), proving that convention was never mandatory, just what every prior variant happened to choose"
    - "Narrow-viewport padding overrides for grid-two-col button variants must be placed inside the existing @media (max-width: 420px) block, after the generic .grid-two-col .btn rule, to win the source-order specificity tie"

key-files:
  created: []
  modified:
    - index.html
    - assets/css/styles.css
    - CLAUDE.md
    - tap-to-vocab-walkthrough.md

key-decisions:
  - "Deleted the 10 category anchors outright (D-05) rather than commenting them out — index.html now has zero ?cat=<category>/?cat=Unidad<N> links, only ?cat=practice survives"
  - "Applied margin-bottom: 16px to both .btn-topics and .btn-unidades (not just one) so grid-stretching can't make one button look shorter than its sibling, while still keeping the gap logic entirely off .btn-practice and everything below it (D-04/NAV-02)"
  - "Documented ?topic= vs ?cat= as deliberately separate parameters in CLAUDE.md, matching Plan 01's implementation and Phase 23's overlapping-name rationale"

patterns-established:
  - "A CSS variant rule for a home-grid button need not copy grid-column/gradient/border/font-weight — height and spacing alone are sufficient for a non-accented button (D-02)"

requirements-completed: [NAV-01, NAV-02]

# Metrics
duration: 15min
completed: 2026-09-11
---

# Phase 24 Plan 03: Home Screen Topics/Unidades Row Summary

**Collapsed index.html's 10 vocabulary category buttons into a single 📚 Topics / 📖 Unidades row with dedicated taller-but-uncoloured CSS, and brought CLAUDE.md plus the plain-English walkthrough up to date with the new navigation and the `?topic=` URL parameter.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-09-11T04:20:00Z
- **Completed:** 2026-09-11T04:35:17Z
- **Tasks:** 3 completed
- **Files modified:** 4

## Accomplishments
- `index.html`'s `.grid-two-col` now contains exactly two vocabulary anchors (`btn-topics` → `/topics.html`, `btn-unidades` → `/unidades.html`) in place of the 10 deleted `?cat=` category/unidad links; every line from the `⭐ Practice` comment downward is byte-identical to its pre-change state (mechanically verified via `git diff`)
- Added `.grid-two-col .btn-topics, .grid-two-col .btn-unidades { padding: 20px 16px; margin-bottom: 16px; }` — taller than the standard `12px 16px` tool button, same navy fill and 1px border, no gradient/accent/span — plus a `padding: 16px 8px` override inside the existing `@media (max-width: 420px)` block so the extra height survives the generic `.grid-two-col .btn` 10px/8px narrow-viewport collapse
- `CLAUDE.md`'s Pages-and-routing list now documents `topics.html`, `unidades.html`, and both `topic.html` URL parameters (`?cat=` vs `?topic=`, and why they're kept separate); the stale "add a button in `index.html`'s `.grid-two-col`" instruction under Adding Vocabulary is replaced with instructions pointing at `unidades.html`/`topics.html`
- `tap-to-vocab-walkthrough.md`'s folder map, Home Page section, and `words.tsv` section no longer describe or imply a per-category button grid on the home page; a new section explains what `topics.html` and `unidades.html` each list and why they're kept separate

## Task Commits

Each task was committed atomically:

1. **Task 1: Swap the 10 category buttons for the Topics/Unidades row in index.html** - `61e801d` (feat)
2. **Task 2: Add the .btn-topics / .btn-unidades height and gap rules, including the narrow-viewport override** - `8657de3` (feat)
3. **Task 3: Update CLAUDE.md and the plain-English walkthrough to describe the new navigation** - `b789956` (docs)

## Files Created/Modified
- `index.html` - 10 category `<a>` lines deleted, replaced with `btn-topics`/`btn-unidades` anchors; `⭐ Practice` and all 9 tool/game buttons untouched
- `assets/css/styles.css` - two additive rules: base height/gap for `.btn-topics`/`.btn-unidades`, and a narrow-viewport padding override inside the pre-existing `@media (max-width: 420px)` block
- `CLAUDE.md` - Pages-and-routing gains `topics.html`/`unidades.html` entries and documents `?topic=` alongside `?cat=`; Adding Vocabulary section no longer points at `index.html`
- `tap-to-vocab-walkthrough.md` - folder map, Home Page section (Category grid → Topics/Unidades row), a new Topics/Unidades section, and the `words.tsv` section's home-page reference all updated for consistency

## Decisions Made
- Deleted (not hid/commented) the 10 category lines per D-05 — mechanically confirmed via `grep -c` that zero `?cat=<category>` or `?cat=Unidad<N>` links remain in `index.html`, and the sole surviving `?cat=` occurrence is `?cat=practice`.
- Put `margin-bottom: 16px` on both new button selectors rather than only the visually-last one, since PATTERNS.md flagged that a single-sided margin could make one grid sibling look shorter than the other at the stretched row height.
- Extended the doc-consistency fix beyond the two files/sections the plan named literally, to the `words.tsv` walkthrough paragraph that still claimed "categories match the buttons on the home page" and that adding a category "appears automatically on the home page" — both became false the moment Task 1 landed, and the plan's own instruction says to fix the opening home-page description "if it enumerates the category grid, so the document does not contradict itself." This is a Rule 1 fix (stale/incorrect prose introduced by this same plan), not new scope.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed two additional stale `words.tsv` walkthrough sentences left inconsistent by Task 1/3's edits**
- **Found during:** Task 3
- **Issue:** `tap-to-vocab-walkthrough.md`'s `words.tsv` subsection said "Categories match the buttons on the home page" and "a new category name... will appear automatically on the home page" — both became false once the home page stopped listing categories directly (Task 1), and the section title's own "friendlier labels... live in the home-page buttons" line was also now imprecise since those emoji labels live on `topics.html`, not `index.html`.
- **Fix:** Reworded all three references to point at `unidades.html`/`topics.html` specifically instead of "the home page."
- **Files modified:** tap-to-vocab-walkthrough.md
- **Verification:** Re-read the full `words.tsv` subsection end-to-end; no remaining claim that a category or topic auto-appears anywhere in the app.
- **Committed in:** `b789956` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1)
**Impact on plan:** Pure consistency fix inside the exact section the plan already asked Task 3 to touch; no scope creep, no new files, no architectural change.

## Issues Encountered

No browser automation tool was available in this session, so the `<human-check>` visual/UAT pass (button-height comparison at desktop and 390px widths, phone-screen fit, gap perception versus the ASCII mockup) could not be performed directly. In its place: every grep-based acceptance criterion in Tasks 1–3 passed on first verification, including the CSS source-order checks (the narrow-viewport override's line number falls after both the generic `.grid-two-col .btn` rule and the `@media (max-width: 420px)` opening, and before its closing brace), the `git diff` purity checks (zero non-`+` lines removed from `styles.css`; zero removed tool/game-button lines from `index.html`), and the whole-phase link-integrity grep (every `href="/*.html"` in `index.html`, `topics.html`, and `unidades.html` resolves to a file that exists on disk). A human should still do the phone-viewport visual pass and the DevTools computed-padding spot-check (`20px 16px` desktop / `16px 8px` at 390px) this plan's `<human-check>` calls for, ideally after a hard refresh to clear the cached stylesheet.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All three deliverables named in the phase objective (button collapse, taller-but-default CSS, doc updates) are complete and verified mechanically; NAV-01 and NAV-02 are satisfied per the plan's own success criteria.
- This is the final plan of Phase 24 — the phase's outstanding human verification is the visual/UAT pass noted above (button height, gap size, and phone-screen fit versus the CONTEXT.md ASCII mockup), plus the Plan 01/02 human-checks carried forward (h1 title rendering on `?topic=` pages, live click-through of all 14 sub-screen buttons).

---
*Phase: 24-topics-unidades-navigation*
*Completed: 2026-09-11*

## Self-Check: PASSED

- FOUND: index.html
- FOUND: assets/css/styles.css
- FOUND: CLAUDE.md
- FOUND: tap-to-vocab-walkthrough.md
- FOUND: commit 61e801d
- FOUND: commit 8657de3
- FOUND: commit b789956
