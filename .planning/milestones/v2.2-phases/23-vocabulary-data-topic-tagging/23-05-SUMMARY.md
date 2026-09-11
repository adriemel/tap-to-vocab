---
phase: 23-vocabulary-data-topic-tagging
plan: 05
subsystem: data
tags: [tsv, words.tsv, topic-tagging, audit, nav-07]

# Dependency graph
requires:
  - phase: 23-vocabulary-data-topic-tagging
    provides: "23-01..23-04's fully tagged 753-line words.tsv (708 pre-phase rows + 44 Unidad5B rows), all nine topic slugs applied"
provides:
  - "Whole-file audit of data/words.tsv against every Phase 23 gate (structure, slug whitelist, headword coverage, sentence untagging, legacy self-tag, category preservation, topic population, Palabras partition)"
  - "Mechanical NAV-07 proof: all 708 pre-phase es+de pairs provably survive under the real SharedUtils.loadWords loader"
  - "Final per-topic distribution recorded for Phase 24 to build its nine Topics buttons"
affects: ["phase-24 (Topics/Unidades navigation reads this column and the final distribution recorded here)"]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Node.js throwaway harness requiring the real assets/js/shared-utils.js via global.window/global.fetch stubs, kept entirely in /tmp/gsd23, never committed"]

key-files:
  created: []
  modified: []

key-decisions:
  - "Task 1 found data/words.tsv already fully compliant with all 8 gates from prior plans - no column-4 corrections were needed, so no data commit was made for this task"
  - "Documented (not fixed) a reasoned edge case: two Saludar rows ('En alemán buenos días se dice Guten Tag.' and 'Me llamo Bjarne y mi apellido es Driemel.', both 8 Spanish words) are tagged topics:Saludar despite exceeding the plan's >7-word long-sentence gate. This is correct per D-05, which unconditionally self-tags ALL 40 Saludar rows (including sentence-shaped sentences) with topics=Saludar, with no length carve-out - confirmed by Gate 5 passing at 0 violations, and thematically consistent with D-07's own worked example ('Como se dice buenos días en alemán?' at 7 words, explicitly a set phrase to be tagged). Blanking these two rows to satisfy the long-sentence gate would instead break Gate 5's D-05 compliance and remove genuinely relevant sentences from Saludar's topic view. Left unchanged."
  - "Task 3 human-verify checkpoint: user reviewed the running app (all seven verification steps, including the two flagged Saludar sentence rows shown explicitly) and replied 'Approved' with no corrections requested. data/words.tsv was left completely unmodified for the entire plan — zero commits touched column 4 or any other column."

requirements-completed: [NAV-07, DATA-03, DATA-04, DATA-05, TAG-01, TAG-02, TAG-03, TAG-04, TAG-05, TAG-06]

# Metrics
duration: "Tasks 1-2 (automated audit + NAV-07 proof) plus Task 3 (human-verify checkpoint, approved with no corrections) — single session"
completed: 2026-09-10
---

# Phase 23 Plan 05: Phase Close-Out Audit Summary

**Audited the finished `data/words.tsv` (753 lines) against all eight Phase 23 gates, mechanically proved NAV-07 for all 708 pre-phase Spanish+German pairs using the real `loadWords` loader, and obtained human approval of the running app with zero corrections requested. `data/words.tsv` was never modified by this plan.**

## Performance

- **Duration:** Tasks 1-3 completed in this session (Task 3 spanned a checkpoint pause awaiting user response)
- **Completed:** 2026-09-10
- **Tasks:** 3 of 3
- **Files modified:** 0 (audit found the file already fully compliant; human verification requested no corrections)

## Accomplishments

### Task 1: Whole-file audit against every Phase 23 gate
- Reconstructed the pre-phase 3-column baseline at commit `f386342` (== independently-derived `42a6b76`, byte-identical, 709 lines, 0 rows with NF != 3) into `/tmp/gsd23/words-prephase.tsv`
- Gate 1 (structure): `wc -l data/words.tsv` = 753; header exactly `category\tes\tde\ttopics`; `NF!=4` count = 0; no empty (double-tab) fields — **PASS**
- Gate 2 (slug whitelist): 0 violations — only the nine canonical slugs appear anywhere in column 4 — **PASS**
- Gate 3 (headwords tagged): 0 untagged non-sentence rows — **PASS**
- Gate 4 (sentences untagged): blank-topic count = 171 (within the 150-200 expected range), and every blank row matches `/[.?!]$/` (0 violations) — **PASS**. The long-sentence sub-check found 2 rows over 7 words tagged in Saludar; determined **not a defect** (see key-decisions) and left unchanged
- Gate 5 (legacy self-tag): 0 violations for both the 5 legacy categories and the 2 x-prefixed categories — **PASS**
- Gate 6 (categories intact): exact match — Unidad3 143, Palabras 125, Unidad5A 115, Unidad4 108, Unidad2 77, Saludar 40, Casa_Familia 33, Numeros 32, Animales 15, Colores 13, xAnimales 5, xCasa_Familia 2, plus Unidad5B 44 (within 42-46) — **PASS**
- Gate 7 (new topics populated): all nine slugs present with Calendario=63 (>=20), Comida_Bebida=20 (>=12), Escuela=49 (>=10) — **PASS**
- Gate 8 (partition happened): 58 Palabras-category rows carry a non-Palabras, non-blank topic (>=20 required) — **PASS**
- Columns 1-3 of the first 708 data rows confirmed byte-identical to the pre-phase baseline (`diff` clean) — no edits were made anywhere in this task

### Task 2: NAV-07 proof
- Wrote `/tmp/gsd23/nav07-check.js` (node built-ins only, never installed as a package, never committed) that requires the real `assets/js/shared-utils.js` via `global.window`/`global.fetch` stubs and runs the exact `es === es && de === de` predicate `isMarked` uses
- `node /tmp/gsd23/nav07-check.js` → `prephase_rows 708`, `current_rows 752`, **`lost 0`**, exit 0
- Independent awk cross-check (no dependency on the JS loader): **`lost_pairs=0`**
- `loadWords` smoke test: 752 rows returned, 0 rows with non-string `topics`, sample row `{"category":"Saludar","es":"el día","de":"der Tag","topics":"Saludar"}` — confirms the four-key projection (DATA-05)
- Three named spot entries, each confirmed present exactly once via `grep -cP` on the full 4-column row:
  - **Palabras:** `el queso` / `der Käse` (line 125, topics=`Comida_Bebida`)
  - **Unidad (re-tagged):** `los abuelos` / `die Großeltern (Pl.)` (Unidad4, line 487, topics=`Casa_Familia`)
  - **xAnimales:** `el mono` / `der Affe` (line 67, topics=`Animales`)
- `git status --porcelain` confirmed clean — `nav07-check.js` exists only under `/tmp/gsd23`, nothing leaked into the repo

### Task 3: Human verification of the running app (checkpoint)

- Server was started from the repo root (`python3 -m http.server 8000`) and the seven verification
  steps in the plan (Unidad5B browse/quiz, sentence manager checkbox, unchanged Colores/Palabras
  behavior, starred-practice-word survival, console cleanliness, `git diff` skim) were handed to the
  user per the plan's blocking `checkpoint:human-verify` gate
- **User response: "Approved."** No topic-assignment corrections were requested.
- The user was shown, and explicitly approved, the two long Saludar sentence rows flagged in Task 1
  (`En alemán 'buenos días' se dice 'Guten Tag'.` and `Me llamo Bjarne y mi apellido es Driemel.`) —
  both keep `topics=Saludar` per CONTEXT.md D-05, exactly as Task 1 had already determined was
  correct (not a defect)
- Because no corrections were requested, `data/words.tsv` remains completely untouched by this
  entire plan — 0 commits to that file across Tasks 1, 2, or 3
- Per D-14, this checkpoint verifies the running app; it does not approve a proposed mapping (the
  mapping was already applied by plans 01-04). The checkpoint is now satisfied.

## Final Topic Distribution (for Phase 24)

```
Animales=21
Calendario=63
Casa_Familia=83
Colores=15
Comida_Bebida=20
Escuela=49
Numeros=32
Palabras=243
Saludar=55
```
(Sum of tagged rows = 581; blank/untagged sentence rows = 171; total data rows = 752.)

## Final Category Distribution

Unidad3 143, Palabras 125, Unidad5A 115, Unidad4 108, Unidad2 77, **Unidad5B 44**, Saludar 40, Casa_Familia 33, Numeros 32, Animales 15, Colores 13, xAnimales 5, xCasa_Familia 2. Unidad5B: 44 total rows = 27 tagged headwords + 17 blank example sentences.

## Task Commits

No commits were made for Tasks 1 or 2 — the audit found `data/words.tsv` already fully compliant with every gate from prior plans (23-01 through 23-04), so no column-4 corrections were needed and no file in the repo was modified. Task 3 (human-verify checkpoint) resulted in user approval with no corrections requested, so `data/words.tsv` was never touched across the whole plan. This SUMMARY.md (partial, then finalized) is committed as the record of the audit and the approval.

## Files Created/Modified

- `data/words.tsv` — audited only, **not modified** (all gates already passing from prior plans)
- `.planning/phases/23-vocabulary-data-topic-tagging/23-05-SUMMARY.md` — created (this file)

## Decisions Made

See `key-decisions` in frontmatter for the reasoned Saludar long-sentence edge case (D-05 vs. the plan's Gate 4 long-sentence heuristic).

## Deviations from Plan

**[Rule 4-adjacent — judgment, not fix] Two Saludar sentence rows exceed the plan's Gate 4 word-count heuristic but were left unchanged.** See key-decisions above for full reasoning. This is a judgment call on an internal tension between two of the plan's own acceptance criteria (Gate 4's generic long-sentence check vs. Gate 5's unconditional D-05 legacy self-tag rule), resolved in favor of the more specific, explicit CONTEXT.md decision (D-05). No user escalation was needed since D-05 is unambiguous and Gate 5 (also a hard acceptance criterion) would otherwise fail.

No other deviations — Tasks 1 and 2 otherwise executed exactly as written, with every other gate passing on the first check with no retries.

## Issues Encountered

**Worktree base drift at session start.** This agent's worktree HEAD was initially on `361372b`, an ancestor of the expected base `58fd59e`. Per the `<worktree_branch_check>` protocol, confirmed the working tree was clean, then ran `git reset --hard 58fd59eb649e95d0be83dadeb2461d4fefa97a95` to correct the base before starting Task 1 — a sanctioned recovery step, not a deviation from plan content.

## NAV-07 Note for Phase 24

Practice-list entries saved in `localStorage` before this phase have no `topics` field (they were saved when `loadWords` only projected `category`/`es`/`de`). Any Phase 24 code that reads `topics` off a practice-list entry must tolerate `undefined`. NAV-07 itself is unaffected — matching is by `es`+`de` equality only, proven above for all 708 pre-phase pairs.

## Checkpoint Status

**Task 3 (human-verify, blocking) is APPROVED.** The user exercised the running app against all
seven verification steps and replied "Approved," requesting no topic-assignment corrections —
including explicit approval of the two long Saludar sentence rows discussed in Task 1's
key-decisions. `data/words.tsv` was left byte-identical throughout the plan. All three tasks of
this plan, and Phase 23 as a whole, are complete.

## Self-Check: PASSED

- `data/words.tsv` exists and is unmodified by this plan (confirmed via `git status --short` showing
  no pending changes to it across the whole session)
- Commit `c16916b` (`data(23-05): audit words.tsv against all Phase 23 gates, prove NAV-07`) exists
  in `git log` and carries the Task 1-2 SUMMARY
- This finalized SUMMARY.md is committed as the closing record of Task 3's approval

---
*Phase: 23-vocabulary-data-topic-tagging*
*Plan 05 completed: 2026-09-10*
*All 3 tasks done; Task 3 checkpoint approved by user with zero corrections requested*
