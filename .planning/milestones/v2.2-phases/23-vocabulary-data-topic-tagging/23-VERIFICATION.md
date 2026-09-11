---
phase: 23-vocabulary-data-topic-tagging
verified: 2026-09-10T19:21:12Z
status: passed
score: 5/5 truths verified
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 4/5
  gaps_closed:
    - "SharedUtils.loadWords/loadTSV read a topics column by header name; rows on a words.tsv without that column, or with it blank, still load with no missing/undefined-topics crash"
  gaps_remaining: []
  regressions: []
---

# Phase 23: Vocabulary Data & Topic Tagging Verification Report

**Phase Goal:** `words.tsv` carries a tolerant `topics` column; Unidad 5B (~24 headwords + ~15 sentences) is added; every existing word is tagged into a topic under the partitioned (Palabras) or additive (Unidades) rule; the practice list still resolves correctly after re-tagging.

**Verified:** 2026-09-10T19:21:12Z
**Status:** passed
**Re-verification:** Yes — after gap closure (commit `aa7b587 fix(23): guard missing TSV cells in loadWords`)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Unidad 5B's ~24 headwords / ~15 sentences are present, browsable/quizzable via `topic.html?cat=Unidad5B`, and a `Unidad5B` checkbox appears in Build Sentences | ✓ VERIFIED (carried forward) | `data/words.tsv` unchanged since prior verification (`git diff cd5696d..HEAD -- data/words.tsv` is empty). Re-ran the fixed loader against the real file: 44 `Unidad5B` rows (27 tagged headwords + 17 blank-topic sentence rows), identical to prior count. No code touching `tapvocab.js`/`sentences.js` was part of the fix commit (`git diff cd5696d..HEAD --stat` shows only `assets/js/shared-utils.js`, 8 lines). |
| 2 | `loadWords`/`loadTSV` read a `topics` column by header name; rows without the column, or with it blank, still load with no missing/undefined-topics crash | ✓ VERIFIED | Independently re-derived in Node against the current `assets/js/shared-utils.js` (not trusting the fix commit message). All required cases pass: (A) short row missing the trailing `topics` cell (no trailing tab) → `[{"category":"Casa","es":"hola","de":"hallo","topics":""}]` — KEPT, no throw. (B) blank `topics` cell with a trailing tab → `topics:""`, same as A. (C) TSV with no `topics` header at all → `topics:""` for every row. (D) row missing a REQUIRED field (`de` blank/absent) → `.filter(r => r.category && r.es && r.de)` correctly drops it (`[]` returned, no throw) — confirmed the required-field filter (previously dead code on short rows because `.trim()` threw before reaching `.filter()`) now actually executes. (E) mixed file with one well-formed row, one short row, and one row with a blank required field → correctly returns 2 rows (short row kept with `topics:""`, required-field-blank row dropped), proving per-row tolerance without an all-or-nothing crash. Ran the real `data/words.tsv` through both the pre-fix loader (`git show 9b332de:assets/js/shared-utils.js`) and the post-fix loader: both currently produce 752 rows (the shipped file has 0 malformed rows), and the two output arrays are **byte-identical** (`diff` clean, 66941 bytes each) — the fix changes failure-mode behavior only, not the parsed output on today's data. |
| 3 | Every row that was under Palabras either moved into one of the 8 non-Palabras topics or still carries `topics: Palabras` — no row lost, no row left with an empty topics value (headwords only, per locked decision D-08) | ✓ VERIFIED (carried forward) | `data/words.tsv` untouched by the fix commit. Re-derived from the fixed loader's real output: 125 `Palabras` rows, 7 with blank `topics` (previously confirmed all 7 are sentence-shaped, D-06). Numbers match the prior verification exactly. |
| 4 | Every row under Unidad2/3/4/5A/5B keeps its original `category` and additionally carries a `topics` tag | ✓ VERIFIED (carried forward) | `data/words.tsv` untouched. Topics distribution reproduced from the fixed loader's real output: `Palabras 243, Casa_Familia 83, Calendario 63, Saludar 55, Escuela 49, Numeros 32, Animales 21, Comida_Bebida 20, Colores 15, blank 171` — sums to 752, identical to the prior verification's figures. |
| 5 | Words already saved to the ⭐ practice list (by exact Spanish text) before the tagging pass are still present and openable after the tagging pass | ✓ VERIFIED (carried forward) | `grep -n "topics" assets/js/tapvocab.js assets/js/sentences.js assets/js/fill-blank.js assets/js/conjugation.js` returns zero matches — `topics` is read nowhere outside `shared-utils.js`, so the fix (which only touches `shared-utils.js`) cannot affect practice-list resolution. `isMarked`/`toggleMark` in `tapvocab.js` still match purely on `w.es === word.es && w.de === word.de` (confirmed present at lines 84-96, unmodified by the fix diff). |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `assets/js/shared-utils.js` | `loadWords` projects `topics` by header name, tolerant of absence AND of a short/malformed row | ✓ VERIFIED | Lines 34-37 now read `(idx.field >= 0 ? cols[idx.field] || "" : "").trim()` for all four fields (`category`, `es`, `de`, `topics`), matching the sibling `loadTSV` idiom on line 53. Independently exercised (see Truth 2) — no crash on any of the tested malformed-row shapes. |
| `data/words.tsv` | 4-column TSV, header `category\tes\tde\ttopics`, 752 data rows, 9 canonical slugs only | ✓ VERIFIED (carried forward) | Unchanged since prior verification (`git diff cd5696d..HEAD -- data/words.tsv` empty); prior figures reproduced identically through the fixed loader. |
| `tap-to-vocab-walkthrough.md` | Documents the 4th `topics` column and loader tolerance in plain English | ✓ VERIFIED | Unchanged by the fix commit; its description of loader tolerance is now accurate (previously it described intended-but-unverified behavior — that gap is closed). |
| `.planning/phases/.../23-05-SUMMARY.md` | Final topic distribution + NAV-07 proof | ✓ VERIFIED (carried forward) | Distribution and NAV-07 zero-loss claims previously independently reproduced; unaffected by this fix. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `data/words.tsv` | `assets/js/shared-utils.js` | `loadWords` reads `topics` by header name | ✓ WIRED | No longer merely "functional for the well-formed file" — independently confirmed genuinely tolerant of short rows, blank cells, and absent headers, while still correctly dropping rows with a missing required field. |
| `data/words.tsv` | `assets/js/tapvocab.js` | `topic.html?cat=Unidad5B` filters on unmodified `category` | ✓ WIRED (carried forward) | Unaffected by the fix; unchanged since prior verification. |
| `data/words.tsv` | `assets/js/sentences.js` | Build Sentences derives checkboxes from `s.category` at runtime; new categories default to enabled | ✓ WIRED (carried forward) | Unaffected by the fix. |
| `data/words.tsv` | `assets/js/tapvocab.js` | Practice list matches on `es`+`de` equality, independent of `topics`/`category` mutation | ✓ WIRED (carried forward) | Unaffected by the fix; `topics` not read by `tapvocab.js` at all. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| `assets/js/shared-utils.js:loadWords` | `topics` field on each returned row object | `data/words.tsv` column 4, read by header index with `|| ""` cell guard | Yes — verified against the real 752-row file, output byte-identical pre/post fix | ✓ FLOWING |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| DATA-03 | 23-04 | Browse/quiz Unidad 5B (~24 headwords) | ✓ SATISFIED (carried forward) | Unchanged; 27 tagged Unidad5B headwords present, reachable via unmodified `topic.html` filter. |
| DATA-04 | 23-04 | Unidad 5B sentences (~15) as `Unidad5B` Build Sentences checkbox | ✓ SATISFIED (carried forward) | Unchanged; 21 Unidad5B rows end in `.?!`; checkbox auto-derived. |
| DATA-05 | 23-01, 23-02, 23-05 | `topics` column read by header name; rows without it still load correctly | ✓ SATISFIED | Gap closed. Independently re-verified: absent header, blank cell, and short/malformed row all load without crashing the promise; rows genuinely missing a required field are cleanly dropped instead of aborting the whole load. |
| TAG-01 | 23-02, 23-05 | Palabras partition (move or keep `topics: Palabras`) | ✓ SATISFIED (carried forward) | Unchanged; 125 Palabras rows, 7 blank all sentence-shaped. |
| TAG-02 | 23-03, 23-04, 23-05 | Unidad words keep category + gain topic | ✓ SATISFIED (carried forward) | Unchanged; all 5 unidades, 0 non-sentence blank rows. |
| TAG-03 | 23-02, 23-05 | 5 legacy topics self-tagged | ✓ SATISFIED (carried forward) | Unchanged. |
| TAG-04 | 23-02, 23-03, 23-05 | Calendario populated (days/months/seasons/periods) | ✓ SATISFIED (carried forward) | Unchanged; 63 rows. |
| TAG-05 | 23-02, 23-03, 23-05 | Comida_Bebida populated | ✓ SATISFIED (carried forward) | Unchanged; 20 rows. |
| TAG-06 | 23-02, 23-03, 23-05 | Escuela populated | ✓ SATISFIED (carried forward) | Unchanged; 49 rows. |
| NAV-07 | 23-05 | Practice list survives re-tagging | ✓ SATISFIED (carried forward) | Unchanged; matching logic doesn't read `topics` at all, confirmed zero references outside `shared-utils.js`. |

No orphaned requirements — all 10 IDs given for this phase appear in REQUIREMENTS.md's traceability table mapped to Phase 23, and all 10 are claimed by at least one of the 5 plans' frontmatter.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `assets/js/shared-utils.js` | 34-37 | ~~Incomplete tolerant-guard idiom~~ RESOLVED — now uses `|| ""` on all four field projections, matching `loadTSV`'s idiom | — | CR-01 (23-REVIEW.md) is now closed. No remaining BLOCKER. |
| `assets/js/tapvocab.js` | ~470 (`getPracticeList`) | Practice-list entries saved before Phase 23 have no `topics` key (`{...word}` spreads from earlier app versions) | ⚠️ WARNING (unresolved, carried forward) | Does not break NAV-07 (matching is es+de only). Flagged by review as WR-01, not yet addressed; relevant for Phase 24, the first phase expected to consume `topics`. Not a Phase 23 blocker — Phase 23 makes no claim about consuming `topics` outside the loader. |
| `assets/js/shared-utils.js` | 29 | `header.indexOf("topics")` is exact-case match; a renamed/mistyped header silently disables tagging with no diagnostic | ℹ️ INFO (WR-02, unresolved, carried forward) | Not exercised today (header is correct); no test/lint would catch a future typo. Not required for phase goal. |
| `assets/js/shared-utils.js` | 23-24, 47-48 | Empty/header-less TSV throws an opaque `TypeError` rather than a clear error | ℹ️ INFO (WR-03, unresolved, carried forward) | Pre-existing pattern, not required by any of the 10 phase requirements; optional per prior report. |
| `CLAUDE.md` | 36 | `loadWords(path)` documented return shape doesn't mention `topics` | ℹ️ INFO (IN-03, unresolved, carried forward) | Documentation drift; no functional impact; not a phase requirement. |

No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` markers found in `assets/js/shared-utils.js`.

### CR-01 Resolution Status

**CR-01 (23-REVIEW.md, classified BLOCKER) is RESOLVED.** The fix commit `aa7b587` applies exactly the two-line change the review specified: all four field projections in `loadWords` (`category`, `es`, `de`, `topics`) now use `(idx.field >= 0 ? cols[idx.field] || "" : "").trim()`. Independently re-verified against all 6 of the review's original test cases plus the two additional required-field-drop cases from this re-verification's task brief — every case now behaves per the documented contract. The remaining review findings (WR-01, WR-02, WR-03, IN-01, IN-02, IN-03) are warnings/info, not blockers, and none is required by any of the 10 requirement IDs mapped to Phase 23; they remain open as tracked follow-up items, most relevantly WR-01 for Phase 24 (the first phase expected to consume `topics` outside the loader).

### Human Verification Required

None. This re-verification is a mechanical re-check of a code-level fix (a parser guard) and does not touch UI/UX behavior. The original Phase 23 checkpoint:human-verify (Browse/Quiz Unidad5B, Build Sentences checkbox, unchanged Colores/Palabras behavior, starred-word survival, console cleanliness, git-diff skim) was already approved by the user in 23-05-SUMMARY.md, and the fix commit did not touch any file involved in that checkpoint's scope (`git diff cd5696d..HEAD --stat` shows only `assets/js/shared-utils.js` changed, 8 lines).

## Gaps Summary

No gaps remain. The single gap from the prior verification (criterion 2's tolerance property) is closed: `SharedUtils.loadWords` now tolerates a short data row (missing trailing `topics` cell, the realistic hand-edit failure mode), a blank cell with a trailing tab, and an absent `topics` header — all three load every row with `topics === ""` and no crash — while a row genuinely missing a required field (`category`/`es`/`de`) is still correctly dropped by the `.filter()` rather than silently kept or crashing the load. The fix was verified independently in Node against the current source, not taken on the commit message's word, and produces byte-identical output to the pre-fix loader on the real 752-row `data/words.tsv`, confirming no regression to today's shipped data. CR-01 from 23-REVIEW.md is resolved. All 10 requirement IDs mapped to Phase 23 (DATA-03, DATA-04, DATA-05, TAG-01 through TAG-06, NAV-07) are satisfied.

---

*Verified: 2026-09-10T19:21:12Z*
*Verifier: Claude (gsd-verifier)*
