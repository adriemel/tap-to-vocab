---
phase: 23-vocabulary-data-topic-tagging
verified: 2026-09-10T19:16:13Z
status: gaps_found
score: 4/5 truths verified
overrides_applied: 0
gaps:
  - truth: "SharedUtils.loadWords/loadTSV read a topics column by header name; rows on a words.tsv without that column, or with it blank, still load with no missing/undefined-topics crash"
    status: failed
    reason: >
      Independently reproduced (Node harness, real assets/js/shared-utils.js, no dependency on the
      phase's own claims): a data row that omits the trailing tab for the last column (e.g.
      "category\tes\tde\n" with no 4th field) throws
      "TypeError: Cannot read properties of undefined (reading 'trim')" inside loadWords' .map(),
      which rejects the ENTIRE promise. This kills Browse, Quiz, and Build Sentences for all 752
      words, not just the malformed row. The two literal contract cases named in 23-01-PLAN.md's
      must_haves (topics header absent; topics cell blank WITH a trailing tab present) both pass —
      but the plan's own must_haves did not cover the "short row, no trailing tab" case, which is
      the realistic way a human hand-editing this TSV leaves a trailing column blank.
      This exact defect was already found and classified as a code-review BLOCKER (23-REVIEW.md
      CR-01, 2026-09-10) with a two-line documented fix
      ("(idx.field >= 0 ? cols[idx.field] || \"\" : \"\").trim()", matching the sibling loadTSV
      idiom already present 16 lines below in the same file). Checking `git log -- assets/js/shared-utils.js`
      shows the file's last commit is 9b332de (plan 23-01, before the review); the review commit
      841cd04 is the newest phase-23 commit and touches no code — the fix was never applied.
      data/words.tsv itself is currently clean (0 of 752 rows have NF != 4), so nothing is broken
      in production today, but the phase goal's own wording ("tolerant topics column") and DATA-05's
      requirement text ("rows without it still load correctly") describe a tolerance property that
      the shipped code does not actually have for a documented, realistic failure mode.
    artifacts:
      - path: "assets/js/shared-utils.js"
        issue: "Lines 34-37: (idx.field >= 0 ? cols[idx.field] : \"\").trim() guards a missing HEADER, not a missing CELL. cols[idx.field] is undefined (not \"\") when a data row has fewer tab-separated fields than the header, and .trim() on undefined throws, aborting the whole loadWords() promise."
    missing:
      - "Apply the CR-01 fix from 23-REVIEW.md: change all four field projections in loadWords (category, es, de, topics) to `(idx.field >= 0 ? cols[idx.field] || \"\" : \"\").trim()`, matching loadTSV's existing safe idiom on line 53."
      - "Optional but recommended per WR-03: guard the empty-file case (`lines[0]` undefined) in both loadWords and loadTSV with an explicit `if (!lines.length) throw new Error(...)` rather than an opaque TypeError."
---

# Phase 23: Vocabulary Data & Topic Tagging Verification Report

**Phase Goal:** `words.tsv` carries a tolerant `topics` column; Unidad 5B (~24 headwords + ~15 sentences) is added; every existing word is tagged into a topic under the partitioned (Palabras) or additive (Unidades) rule; the practice list still resolves correctly after re-tagging.

**Verified:** 2026-09-10T19:16:13Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Unidad 5B's ~24 headwords / ~15 sentences are present, browsable/quizzable via `topic.html?cat=Unidad5B`, and a `Unidad5B` checkbox appears in Build Sentences | ✓ VERIFIED | 44 `Unidad5B` rows in `data/words.tsv`: 27 tagged headwords + 17 blank-topic sentence rows (21 rows total end in `.?!` and will surface in Build Sentences, since `filterSentences` in `sentences.js:53-58` keys on punctuation, not on `topics`). `tapvocab.js:472` filters `topic.html` case-insensitively on `category`, unmodified — `Unidad5B` works exactly like `Unidad5A`. `sentences.js:75-95` derives Build Sentences checkboxes from `s.category` at runtime and defaults unseen categories to enabled (line 89) — no code change was needed or made, and none is required for the checkbox to appear. |
| 2 | `loadWords`/`loadTSV` read a `topics` column by header name; rows without the column, or with it blank, still load with no missing/undefined-topics crash | ✗ FAILED | Confirmed independently in Node (see gap below): a short data row (header has `topics` but the row itself has no 4th field/trailing tab) throws inside `loadWords()` and aborts the ENTIRE load, not just that row. This is a live, unfixed BLOCKER already identified by the phase's own code review (23-REVIEW.md CR-01) and never patched (`git log -- assets/js/shared-utils.js` shows no commit after 9b332de, which predates the review at 841cd04). The two narrower cases the plan's own must_haves tested (no `topics` header at all; blank cell WITH trailing tab) both pass. |
| 3 | Every row that was under Palabras either moved into one of the 8 non-Palabras topics or still carries `topics: Palabras` — no row lost, no row left with an empty topics value (headwords only, per locked decision D-08) | ✓ VERIFIED | 125 `Palabras` rows total; 7 have a blank `topics` cell, and all 7 independently confirmed to be sentence-shaped (`es` ends in `.`/`?`/`!`) via direct grep — none is a bare headword. File-wide: 171 blank-topics rows total, and ALL 171 end in `.`/`?`/`!` with zero exceptions (`awk` scan across the full 752-row file), matching the important-context instruction to verify the blank set is exactly the sentence rows. 0 Palabras rows are lost — 125 rows present both before and after (baseline `git show f386342:data/words.tsv` also shows 125 Palabras-category rows). |
| 4 | Every row under Unidad2/3/4/5A/5B keeps its original `category` and additionally carries a `topics` tag | ✓ VERIFIED | Unidad2 77 rows (55 tagged / 22 blank), Unidad3 143 (96/47), Unidad4 108 (73/35), Unidad5A 115 (72/43), Unidad5B 44 (27/17) — every blank row in every unidad confirmed sentence-shaped (0 non-sentence blanks found via `awk` per-category scan). Columns 1-3 (`category`, `es`, `de`) of the first 708 rows are byte-identical to the pre-phase baseline at commit `f386342` (`diff` clean) — `category` was never touched, confirming the additive rule held. |
| 5 | Words already saved to the ⭐ practice list (by exact Spanish text) before the tagging pass are still present and openable after the tagging pass | ✓ VERIFIED | Independently re-ran the NAV-07 proof (not trusting the SUMMARY's own script): loaded `data/words.tsv` through the real `loadWords()`, built a set of `es|||de` pairs, and checked all 708 pre-phase `es`+`de` pairs (from `git show f386342:data/words.tsv`) against it — **0 lost**. `tapvocab.js:84-96` (`isMarked`/`toggleMark`) match practice-list entries purely on `w.es === word.es && w.de === word.de`; `topics` plays no role in the match, so it cannot break resolution. |

**Score:** 4/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `assets/js/shared-utils.js` | `loadWords` projects `topics` by header name, tolerant of absence | ⚠️ STUB-LIKE (partial) | Header-absence and blank-cell-with-tab cases work; short-row (missing trailing tab) case crashes the whole loader. See gap. |
| `data/words.tsv` | 4-column TSV, header `category\tes\tde\ttopics`, 752 data rows, 9 canonical slugs only | ✓ VERIFIED | `head -1` confirms header; `awk 'NF!=4'` finds 0 violations; distinct `topics` values are exactly the 9 canonical slugs plus blank (`Palabras 243, Casa_Familia 83, Calendario 63, Saludar 55, Escuela 49, Numeros 32, Animales 21, Comida_Bebida 20, Colores 15`, blank 171 — sums to 752, matches 23-05-SUMMARY.md's reported distribution exactly). |
| `tap-to-vocab-walkthrough.md` | Documents the 4th `topics` column and loader tolerance in plain English | ✓ VERIFIED | Lines 67, 87, 124-125 describe the column, its slug values, blank-cell meaning, and the loader's header-absence tolerance (though the walkthrough's claim of full tolerance is itself inaccurate given the CR-01 gap — the doc describes the intended behavior, not the verified behavior). |
| `.planning/phases/.../23-05-SUMMARY.md` | Final topic distribution + NAV-07 proof | ✓ VERIFIED (exists, cross-checked) | Distribution and NAV-07 zero-loss claims independently reproduced above rather than trusted at face value. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `data/words.tsv` | `assets/js/shared-utils.js` | `loadWords` reads `topics` by header name | ⚠️ PARTIAL | Wired and functional for the current, well-formed file; the wiring is fragile (see gap) rather than genuinely tolerant. |
| `data/words.tsv` | `assets/js/tapvocab.js` | `topic.html?cat=Unidad5B` filters on unmodified `category` | ✓ WIRED | `tapvocab.js:472`, category column untouched, confirmed byte-identical for rows 1-708 and additively appended for Unidad5B. |
| `data/words.tsv` | `assets/js/sentences.js` | Build Sentences derives checkboxes from `s.category` at runtime; new categories default to enabled | ✓ WIRED | `sentences.js:75-95`; no code change needed, none made; 21 Unidad5B rows end in punctuation and will populate the new checkbox. |
| `data/words.tsv` | `assets/js/tapvocab.js` | Practice list matches on `es`+`de` equality, independent of `topics`/`category` mutation | ✓ WIRED | `tapvocab.js:84-96`; 0/708 pairs lost, verified independently. |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| DATA-03 | 23-04 | Browse/quiz Unidad 5B (~24 headwords) | ✓ SATISFIED | 27 tagged Unidad5B headwords present, `category=Unidad5B`, reachable via unmodified `topic.html` filter. |
| DATA-04 | 23-04 | Unidad 5B sentences (~15) as `Unidad5B` Build Sentences checkbox | ✓ SATISFIED | 21 Unidad5B rows end in `.?!`; `sentences.js` auto-derives and auto-enables the new checkbox — no code change required. |
| DATA-05 | 23-01, 23-02, 23-05 | `topics` column read by header name; rows without it still load correctly | ✗ BLOCKED | See Truth 2 / gap — the tolerance is incomplete; a realistic malformed-row shape crashes the entire load rather than degrading gracefully. |
| TAG-01 | 23-02, 23-05 | Palabras partition (move or keep `topics: Palabras`) | ✓ SATISFIED | 125 Palabras rows; 7 blank are all sentence-shaped; rest carry a slug. |
| TAG-02 | 23-03, 23-04, 23-05 | Unidad words keep category + gain topic | ✓ SATISFIED | All 5 unidades: 0 non-sentence blank rows in any of them. |
| TAG-03 | 23-02, 23-05 | 5 legacy topics self-tagged | ✓ SATISFIED | 0 mismatches for Colores/Animales/Numeros/Saludar/Casa_Familia; x-prefixed rows also correctly tagged per D-05b. |
| TAG-04 | 23-02, 23-03, 23-05 | Calendario populated (days/months/seasons/periods) | ✓ SATISFIED | 63 rows; sample confirms thematic correctness (días, meses, horas, temprano/tarde). |
| TAG-05 | 23-02, 23-03, 23-05 | Comida_Bebida populated | ✓ SATISFIED | 20 rows; sample confirms thematic correctness (restaurante, tomate, queso, agua, carne...). |
| TAG-06 | 23-02, 23-03, 23-05 | Escuela populated | ✓ SATISFIED | 49 rows; sample confirms thematic correctness (mochila, idiomas, estudiar, palabra...). |
| NAV-07 | 23-05 | Practice list survives re-tagging | ✓ SATISFIED | 0/708 es+de pairs lost, independently re-verified; matching logic doesn't depend on `topics`. |

No orphaned requirements — all 10 IDs given for this phase appear in REQUIREMENTS.md's traceability table mapped to Phase 23, and all 10 are claimed by at least one of the 5 plans' frontmatter.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `assets/js/shared-utils.js` | 34-37 | Incomplete tolerant-guard idiom — protects against missing header, not missing cell | 🛑 BLOCKER | Confirmed reproducible whole-app crash on a short/malformed data row (see gap). Already identified and classified BLOCKER by 23-REVIEW.md CR-01; unfixed. |
| `assets/js/tapvocab.js` | ~470 (`getPracticeList`) | Practice-list entries saved before Phase 23 have no `topics` key (`{...word}` spreads from earlier app versions) | ⚠️ WARNING | Does not break NAV-07 (matching is es+de only), but any future `topics` consumer reading practice-list entries directly will hit `undefined`. Flagged by review as WR-01, not yet addressed; relevant for Phase 24, which is the first phase expected to consume `topics`. |
| `assets/js/shared-utils.js` | 29 | `header.indexOf("topics")` is exact-case match; a renamed/mistyped header silently disables tagging for all rows with no diagnostic | ℹ️ INFO (WR-02) | Not exercised today (header is correct), but no test/lint would catch a future typo. |
| `assets/js/shared-utils.js` | 23-24, 47-48 | Empty/header-less TSV throws an opaque `TypeError` rather than a clear error | ℹ️ INFO (WR-03) | Pre-existing pattern, not introduced this phase, but the exact lines touched this phase left it unaddressed. |
| `CLAUDE.md` | 36 | `loadWords(path)` documented return shape doesn't mention `topics` | ℹ️ INFO (IN-03) | Documentation drift; no functional impact. |

No `TBD`/`FIXME`/`XXX` markers found in `assets/js/shared-utils.js` or `data/words.tsv`.

### Human Verification Required

None — the phase's own plan 23-05 already ran a blocking `checkpoint:human-verify` (Browse/Quiz Unidad5B, Build Sentences checkbox, unchanged Colores/Palabras behavior, starred-word survival, console cleanliness, git-diff skim) and the user replied "Approved" with no corrections requested, per 23-05-SUMMARY.md. That checkpoint's scope covers the UI/UX truths in this report. The one gap found here (CR-01) is a mechanically-reproducible code defect, not something requiring human judgment — it is independently confirmed by direct Node execution, not by re-asking a human to look at the running app.

## Gaps Summary

Phase 23's data-migration work is substantively complete and independently verified across all five
success criteria's *data* content: Unidad 5B is fully transcribed and wired into existing screens
with no code changes needed, the Palabras partition and additive Unidad tagging are both correctly
applied file-wide (171/171 blank rows are provably sentence rows, 0 headwords left untagged), the
five legacy topics and x-prefixed rows self-tag correctly, the three new topics (Calendario,
Comida_Bebida, Escuela) are populated with thematically appropriate vocabulary, and the practice
list survives the re-tagging with 0 of 708 pairs lost (independently re-derived, not trusted from
the SUMMARY).

The one blocking gap is the code side of DATA-05: `SharedUtils.loadWords` is not actually tolerant
of the row shape most likely to occur from a hand-edit of `words.tsv` (a trailing column value
typed without its preceding tab). This was already caught and classified BLOCKER by this phase's own
code review (23-REVIEW.md, CR-01) with a two-line fix identified, and the fix was never applied —
the file's last code commit (`9b332de`) predates the review commit (`841cd04`). Because
`data/words.tsv` is currently well-formed (0 malformed rows), nothing is broken in the deployed app
today, but the phase goal explicitly promises a "tolerant `topics` column," and DATA-05's requirement
text explicitly promises rows "without it still load correctly" — the shipped code does not meet
that bar for a documented, realistic failure mode, and a future hand-edit (the file's only editing
method — no build/lint/test exists in this project) can take down Browse, Quiz, and Build Sentences
simultaneously with no actionable error message.

Recommended closure: apply the two-line fix from 23-REVIEW.md CR-01 (`|| ""` guard on all four field
projections in `loadWords`, matching the sibling `loadTSV` idiom already in the same file) before
Phase 24 builds the Topics/Unidades screens on top of this loader.

---

*Verified: 2026-09-10T19:16:13Z*
*Verifier: Claude (gsd-verifier)*
