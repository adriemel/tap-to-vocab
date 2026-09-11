---
phase: 23-vocabulary-data-topic-tagging
plan: 02
subsystem: data
tags: [tsv, words.tsv, topic-tagging, data-model]

# Dependency graph
requires:
  - phase: 23-vocabulary-data-topic-tagging
    provides: "23-CONTEXT.md D-01..D-14 tagging decisions; REQUIREMENTS.md Data Model partition table"
provides:
  - "data/words.tsv 4th `topics` column, header-named, present on all 709 lines"
  - "133 legacy-topic rows self-tagged (Colores/Animales/Numeros/Saludar/Casa_Familia)"
  - "7 hidden x-prefixed rows tagged with their un-prefixed topic (xAnimales->Animales, xCasa_Familia->Casa_Familia)"
  - "118 of 125 Palabras rows partitioned into one of 8 non-Palabras topics or left as Palabras; 7 long example sentences kept blank"
affects: ["23-03-PLAN (Unidad additive tagging)", "23-04-PLAN (Unidad additive tagging)", "23-05-PLAN (Unidad 5B import)", "phase-24 (Topics/Unidades navigation reads this column)"]

# Tech tracking
tech-stack:
  added: []
  patterns: ["awk-driven TSV column append with NR-keyed lookup map, kept entirely in /tmp/gsd23, never committed"]

key-files:
  created: []
  modified: ["data/words.tsv"]

key-decisions:
  - "Assigned 118 Palabras headwords by hand-reviewed per-row judgment per CONTEXT.md D-01/D-06/D-08/D-12 guidance: 16 to Escuela, 3 to Comida_Bebida, 1 to Casa_Familia, 38 to Calendario, 60 remain Palabras"
  - "Kept exactly the 7 Palabras rows matching /[.?!]$/ blank (D-06/D-08); did not exercise the D-07 discretion to tag the two short ones (¿Qué pasa?, Adelante!) into Saludar, since 7 blank was already within the plan's accepted 0-7 range and the two rows are Palabras-specific dialogue lines, not general Saludar phrases"
  - "el chico (Palabras, line 165) kept as topics:Palabras rather than Casa_Familia — it's a generic 'boy' word, not a family-specific one; Casa_Familia's own category already carries a separate el chico row"

requirements-completed: [DATA-05, TAG-01, TAG-03, TAG-04, TAG-05, TAG-06]

# Metrics
duration: ~15min
completed: 2026-09-10
---

# Phase 23 Plan 02: Legacy Topics + Palabras Partition Summary

**Added the `topics` 4th column to `data/words.tsv` and hand-tagged 265 of 708 rows: 133 legacy-category rows self-tagged, 7 hidden x-rows un-hidden onto Animales/Casa_Familia, and 118 of 125 Palabras headwords partitioned across Escuela/Comida_Bebida/Casa_Familia/Calendario/Palabras.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-09-10T15:10:13Z
- **Tasks:** 2
- **Files modified:** 1 (`data/words.tsv`)

## Accomplishments
- `data/words.tsv` is now a 4-column, 709-line file (`category`, `es`, `de`, `topics`); every data row has exactly 4 tab-separated fields
- 133 rows in Colores (13), Animales (15), Numeros (32), Saludar (40), Casa_Familia (33) self-tagged with their own category name, including all 19 sentence-shaped set phrases per D-07
- 7 hidden `x`-prefixed rows (5 xAnimales, 2 xCasa_Familia) tagged with their un-prefixed topic name while keeping the `x` category — deliberate un-hiding via the new axis (D-05b)
- 118 of 125 Palabras headwords partitioned: 16 -> Escuela, 3 -> Comida_Bebida, 1 -> Casa_Familia, 38 -> Calendario, 60 remain `Palabras`
- 7 long Palabras example sentences kept a blank `topics` cell per D-06/D-08
- `category`, `es`, `de` columns proven byte-identical to the pre-plan file via a `diff` gate run after each task (D-04, NAV-07, T-23-08 mitigation)
- No Unidad row touched — left for plans 03 and 04

## Task Commits

Each task was committed atomically:

1. **Task 1: Add the topics column and tag the five legacy topics plus the x-prefixed rows** - `a7db4ea` (data)
2. **Task 2: Partition the 125 Palabras rows into topics** - `ca2e55e` (data)

**Plan metadata:** (this commit, added by orchestrator after worktree merge)

## Files Created/Modified
- `data/words.tsv` - 4th `topics` column added; 265/708 rows tagged (133 legacy + 7 x-rows + 118 Palabras headwords); 7 Palabras sentences and all Unidad rows left blank

## Decisions Made
- Palabras partition assignments were made by direct per-row review against CONTEXT.md's guidance list and the Escuela/Comida_Bebida/Calendario category definitions — see `key-decisions` in frontmatter for the three most notable judgment calls
- Used a throwaway awk script + NR-keyed mapping file in `/tmp/gsd23` (never committed) to apply the column-4 edits deterministically and re-verifiably, rather than hand-editing 265 lines with sed/Edit — reduces risk of an off-by-one row error while keeping the repo zero-dependency (no script committed, no package installed)

## Deviations from Plan

None - plan executed exactly as written. All acceptance criteria and verification gates in both tasks passed on the first attempt with no retries.

## Issues Encountered

None.

## Verification Results

All automated gates from the plan's `<verify>` blocks and `<acceptance_criteria>` passed:
- `head -1 data/words.tsv` is exactly `category\tes\tde\ttopics`
- `wc -l data/words.tsv` = 709 (unchanged)
- `awk -F'\t' 'NF!=4'` = 0 (every line has exactly 4 fields)
- Columns 1-3 diff clean against `/tmp/gsd23/cols123-before.txt` after both tasks (`COLS123_IDENTICAL`)
- Legacy self-tag gate = 0, x-row gate = 0
- Palabras headword blank gate = 0 (all 118 non-sentence rows tagged)
- Slug whitelist gate = 0 (no typo, no `Comida`, no comma-joined pair)
- Long-sentence gate = 0 (no Palabras row >7 words tagged)
- Palabras distribution: `(blank)=7, Calendario=38, Casa_Familia=1, Comida_Bebida=3, Escuela=16, Palabras=60` — 4 distinct non-Palabras topics with non-zero counts, including Comida_Bebida and Escuela
- Palabras self-tag count 60 < 118 (partition actually moved words, not a blanket self-tag)
- Category distribution unchanged: Unidad3 143, Palabras 125, Unidad5A 115, Unidad4 108, Unidad2 77, Saludar 40, Casa_Familia 33, Numeros 32, Animales 15, Colores 13, xAnimales 5, xCasa_Familia 2
- `grep`-equivalent double-tab check = 0 (no row lost `es`/`de` to a field shift)
- Live server check: `python3 -m http.server` + `curl` against `topic.html?cat=Palabras` and `topic.html?cat=Colores` both returned HTTP 200; `data/words.tsv` served with the new 4-column header intact

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `data/words.tsv` now carries the `topics` column that plans 03, 04 and 05 will additively tag on Unidad rows and the new Unidad5B import
- Columns 1-3 are provably untouched, so plans 03-05 can build on the same pre-phase baseline snapshot at `/tmp/gsd23/words-prephase.tsv` (note: this is a worktree-local scratch file, not committed; each plan's own executor should re-derive its own baseline from git history filtering `(23-` commit messages per this plan's `<output>` instruction)
- No blockers for downstream plans in this wave/phase

---
*Phase: 23-vocabulary-data-topic-tagging*
*Completed: 2026-09-10*
