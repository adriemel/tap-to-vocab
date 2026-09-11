---
phase: 24-topics-unidades-navigation
fixed_at: 2026-09-11T04:58:36Z
review_path: .planning/phases/24-topics-unidades-navigation/24-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
---

# Phase 24: Code Review Fix Report

**Fixed at:** 2026-09-11T04:58:36Z
**Source review:** .planning/phases/24-topics-unidades-navigation/24-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 3 (CR-01, WR-01, WR-02; fix_scope = critical_warning)
- Fixed: 3
- Skipped: 0
- Out of scope (Info): IN-01, IN-02, IN-03, IN-04 were not attempted

## Fixed Issues

### CR-01: Topic word lists contain duplicate cards (55 across topics), inflating counts, repeating quiz cards and double-paying coins

**Files modified:** `assets/js/tapvocab.js`
**Commit:** 3431019
**Applied fix:** In the `?topic=` branch of `initFromTSV`, rows are now deduplicated on `es + "\t" + de` using a `Set` before shuffling. This is the same identity the practice list uses in `isMarked`/`toggleMark`. The category and practice branches are unchanged.

**Verification:** `node --check` passes. A node script reproduced `SharedUtils.loadWords` and the new filter against the shipped `data/words.tsv`. The distinct-card counts match the review table exactly:

| topic | rows before | cards after |
|---|---|---|
| Casa_Familia | 83 | 63 |
| Palabras | 243 | 227 |
| Calendario | 63 | 49 |
| Escuela | 49 | 45 |
| Saludar | 55 | 54 |
| Animales / Colores / Comida_Bebida / Numeros | 21 / 15 / 20 / 32 | unchanged |

**Follow-up (data, out of scope for code fixes):** `data/words.tsv` was not edited. Code dedup can't catch these 5 punctuation-only variants (same `es`, `de` differs only in `,` vs `;`), so they still show twice within their topic:
- Escuela: `hablar` (`sprechen, reden` / `sprechen; reden`)
- Escuela: `el alemán` (`Deutsch, die deutsche Sprache` / `Deutsch; die deutsche Sprache`)
- Escuela: `el inglés` (`Englisch, die englische Sprache` / `Englisch; die englische Sprache`)
- Escuela: `el español` (`Spanisch, die spanische Sprache` / `Spanisch; die spanische Sprache`)
- Palabras: `en` (`in, auf, an` / `in; auf; an`)

The review counted 11 near-duplicates. The remaining same-`es` pairs appear to be different meanings, not copies, so they are probably correct as separate cards: `la casa` (`das Haus` / `das Haus; die Wohnung`), `genial`, `malo`, `alto`, `la clase`. A human should decide on `la casa`. The 24-01 plan truth ("lists the N rows") should also be updated to count distinct words.

### WR-01: Coin counter on topics.html / unidades.html is stale after browser-Back (bfcache)

**Files modified:** `assets/js/coins.js`
**Commit:** ca6d9b2
**Applied fix:** Confirmed that the localStorage key constant is `KEY` (`"tapvocab_coins"`) and the refresh function is `updateDisplay`, both in the IIFE scope. Added `pageshow` (when `e.persisted`) and `storage` (when `e.key === KEY`) listeners that call `updateDisplay()`, with a short comment. The fix is in the shared module, so it covers `index.html`, `topics.html`, `unidades.html` and every other page with `#coin-counter`.

**Verification:** `node --check` passes. The bfcache behavior itself needs a manual browser check: Topics, then a topic, earn coins in the Quiz, press browser Back, and confirm the badge shows the new balance. Known limit: `localStorage.clear()` in another tab fires `storage` with `key === null`, which this listener ignores. The app never calls it.

### WR-02: Inconsistent `"practice"` detection now shows a topic title over the practice list

**Files modified:** `assets/js/tapvocab.js`
**Commit:** ccd1143
**Applied fix:** `initFromTSV` now computes `const isPractice = category.toLowerCase() === "practice";` once. It is used for the filter branch, both `titleEl.textContent` assignments (empty state and normal path), and the empty-state error text. A one-line comment states the precedence: `practice > topic > cat`. The existing case-insensitive `isPracticeCategory` in `setupQuizMode` already matched this rule and was left alone.

**Verification:** `node --check` passes, and the diff was re-read. `?cat=Practice&topic=Colores` should now show the practice list under "⭐ Practice". Please confirm this in a browser.

---

_Fixed: 2026-09-11T04:58:36Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
