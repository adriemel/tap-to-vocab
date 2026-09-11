# Phase 23: Vocabulary Data & Topic Tagging - Pattern Map

**Mapped:** 2026-09-10
**Files analyzed:** 2 (1 data file, 1 code file with a 2-function surface)
**Analogs found:** 2 / 2

This is a narrow, data-heavy phase. CONTEXT.md's `<code_context>` block already names the exact integration points; this document verifies them against the live source and supplies the concrete excerpts the planner needs.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|--------------------|------|-----------|-----------------|----------------|
| `data/words.tsv` (4th column `topics` added, ~708 rows re-tagged, ~44 Unidad5B rows appended) | data/config (TSV) | batch/transform | `data/fill-in-blank.tsv` (existing tolerant, optional-column TSV consumed via `loadTSV`) | role-match |
| `assets/js/shared-utils.js` → `loadWords()` (lines 19-38) | utility (TSV loader) | transform | `assets/js/shared-utils.js` → `loadTSV()` (lines 41-56), same file, same role, already does what `loadWords` needs to start doing | exact (sibling function, same file) |

No other file requires a code change in this phase. `loadTSV`, `sentences.js`, `tapvocab.js`, `conjugation.js`, `fill-blank.js` are all consumers or precedent, not files to modify.

## Pattern Assignments

### `assets/js/shared-utils.js` — `loadWords()` (utility, transform)

**File to change:** `assets/js/shared-utils.js` lines 19-38 (function body only; do not touch `loadTSV` at lines 41-56).

**Current code, verbatim (lines 19-38):**
```javascript
  async function loadWords(tsvPath) {
    const res = await fetch(tsvPath, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + tsvPath);
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const header = lines[0].split("\t").map(h => h.trim());
    const idx = {
      category: header.indexOf("category"),
      es: header.indexOf("es"),
      de: header.indexOf("de")
    };
    return lines.slice(1).map(line => {
      const cols = line.split("\t");
      return {
        category: (idx.category >= 0 ? cols[idx.category] : "").trim(),
        es: (idx.es >= 0 ? cols[idx.es] : "").trim(),
        de: (idx.de >= 0 ? cols[idx.de] : "").trim()
      };
    }).filter(r => r.category && r.es && r.de);
  }
```

**Exact change required:**
1. Add `topics: header.indexOf("topics")` to the `idx` object (line 25-29 block).
2. Add a `topics` key to the returned object literal, following the exact same ternary-guard idiom as the other three keys: `topics: (idx.topics >= 0 ? cols[idx.topics] : "").trim()`. This means: if the TSV has no `topics` header at all, `idx.topics` is `-1` and the field is `""` — never `undefined`, never a crash (satisfies success criterion 2 / DATA-05).
3. **Do not change** the `.filter(r => r.category && r.es && r.de)` line — `topics` must NOT be added to this filter, or blank-topic rows (D-03, the 7 long Palabras sentences under D-08) would be silently dropped.

**Analog for the tolerant, fully-guarded idiom** — `loadTSV()`, same file, lines 41-56 (no change needed here, but this is the pattern `loadWords` is being pulled toward):
```javascript
  async function loadTSV(tsvPath) {
    const res = await fetch(tsvPath, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + tsvPath);
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const header = lines[0].split("\t").map(h => h.trim());
    return lines.slice(1).map(line => {
      const cols = line.split("\t");
      const obj = {};
      header.forEach((h, i) => {
        obj[h] = (cols[i] || "").trim();
      });
      return obj;
    });
  }
```
Note `loadTSV` already reads `topics` automatically for any caller that switches to it — it is fully header-keyed and needs zero changes. It is listed only as the pattern precedent, not as a file to touch.

**Tolerant-parse idiom used elsewhere in the repo** (CONVENTIONS.md's canonical guard, used verbatim in `fill-blank.js:149`):
```javascript
const sentences = rawRows.filter(r => r.de && r.es_with_blank && r.correct_answer);
```
This is the same "guard with `|| ""` at parse time, then filter on required fields only" shape `loadWords` already follows — `topics` must be parsed with the guard but must NOT be added to the required-fields filter.

---

### `data/words.tsv` (data file, batch edit)

**Current header + representative rows, verbatim** (`sed -n '1,9p' data/words.tsv`):
```
category	es	de
Saludar	el día	der Tag
Saludar	Buenos días	Guten Morgen! Guten Tag!
Saludar	Buenas tardes	Guten Tag! Guten Abend!
Palabras	con dos puntos	mit Umlaut
Palabras	la palabra	das Wort
Palabras	entonces	dann
Palabras	también	auch
Palabras	pero	aber
```

**One `x`-prefixed row** (line 59, `data/words.tsv`):
```
xAnimales	el serpiente	die Schlange
```

**One sentence-shaped row** (line 7, ends in `?`):
```
Saludar	¿Qué tal?	Wie geht's?
```

File is currently 709 lines total (1 header + 708 data rows), 3 tab-separated columns, confirming CONTEXT.md's row count.

**Target row shape (4 columns, per CONTEXT.md's `<specifics>` table):**
```
category	es	de	topics
Palabras	el queso	der Käse	Comida_Bebida
Palabras	negro	schwarz	Colores
Palabras	fuerte	stark	Palabras
Unidad5A	sábado	Samstag	Calendario
Unidad5A	El sábado voy al cine.	Am Samstag…	
Unidad5B	bailar	tanzen	Palabras
Unidad5B	el curso	der Kurs	Escuela
xAnimales	el mono	der Affe	Animales
Saludar	¿Qué tal?	Wie geht's?	Saludar
```
Blank `topics` cell (trailing tab, empty string) is valid — do not write a placeholder value.

**Analog for the punctuation-based sentence test** (D-06/D-07's ≤5-word exception references this exact regex) — `assets/js/sentences.js` lines 53-58:
```javascript
  function filterSentences(words) {
    return words.filter(w => {
      const s = w.es.trim();
      return /[.?!]$/.test(s) && !s.endsWith('..');
    });
  }
```
Use `/[.?!]$/` as the same test when hand-classifying which rows are "sentence-shaped" for the topics decision — this is the live regex the app itself uses, so classification stays consistent with runtime behavior.

---

## Shared Patterns

### TSV fetch pattern
**Source:** `assets/js/shared-utils.js:20-21` (both `loadWords` and `loadTSV`)
```javascript
const res = await fetch(tsvPath, { cache: "no-store" });
if (!res.ok) throw new Error("Failed to load " + tsvPath);
```
No change needed — applies unchanged after the `topics` column is added.

### Tolerant column guard
**Source:** `assets/js/shared-utils.js:33-36` (existing 3-key pattern) and `assets/js/fill-blank.js:149` (required-field filter precedent)
Apply to: the one-line addition inside `loadWords`'s returned object and `idx` map.

### Dynamic header lookup, never positional
**Source:** `.planning/codebase/CONVENTIONS.md` "TSV Parsing Pattern" section; confirmed live in both `loadWords` (named-index object) and `loadTSV` (forEach-over-header).
Apply to: confirms it is safe to append `topics` as a 4th column without disturbing column order for any existing 3-column reader that might exist elsewhere (verified below — there are none).

## Consumer Audit — every place that reads `words.tsv` or calls `loadWords`

Verified via `grep -n "loadWords\|words.tsv" -r assets/js *.html`:

| Consumer | Location | Access pattern | Safe after adding 4th column? |
|----------|----------|-----------------|-------------------------------|
| `SharedUtils.loadWords` definition | `assets/js/shared-utils.js:19-38` | header-keyed (`header.indexOf(...)`) | Yes — being modified in this phase to add the 4th key |
| `TapVocabTSV` (topic.html / browse+quiz) | `assets/js/tapvocab.js:56` (`var loadWords = SharedUtils.loadWords`), called at `tapvocab.js:466` (`let rows = await loadWords(tsvPath)`) | Consumes the projected `{category, es, de}` object from `loadWords`; filters on `r.category` at `tapvocab.js:472` (`words = shuffleArray(rows.filter(r => r.category.toLowerCase() === category.toLowerCase()))`) | Yes — header-keyed via `loadWords`, never touches raw columns. Will simply ignore the new `topics` field unless `loadWords` is changed to expose it (which this phase does) |
| `SentenceBuilder` (sentences.html) | `assets/js/sentences.js:13` (`var loadWords = SharedUtils.loadWords`), called at `sentences.js:318` (`const allWords = await loadWords("/data/words.tsv")`) | Consumes the projected object; filters sentences via `filterSentences()` (`sentences.js:53-58`) on `w.es`, groups by `s.category` at `sentences.js:75-95` | Yes — header-keyed via `loadWords`. Derives its category checkbox list from `s.category` at runtime (`sentences.js:75-80`: builds `categories` array from `allSentences.forEach(s => { if (!seen.has(s.category)) ... })`), and line 89's `if (filterMap[c] === undefined) filterMap[c] = true;` means a new `Unidad5B` category defaults to enabled with no code change — confirms DATA-04 needs no code change |
| `conjugation.js`, `fill-blank.js` | n/a | Read `verbs.tsv` / `fill-in-blank.tsv` via `SharedUtils.loadTSV`, not `words.tsv` | Not a consumer of `words.tsv` at all — irrelevant to this phase |

**CONTEXT.md's claim "Nothing else reads `words.tsv` columns positionally" — CONFIRMED.** The only two call sites (`tapvocab.js:466`, `sentences.js:318`) both go through `SharedUtils.loadWords`, which is exclusively header-keyed (`header.indexOf("category"/"es"/"de")`), never `cols[0]`/`cols[1]`/`cols[2]` positional access. There is no third consumer of `words.tsv` in the codebase (verified by grepping every `.js` and `.html` file for `words.tsv` and `loadWords`). Appending a 4th column is safe for all current consumers.

## Practice-list storage shape (informational — no code change in this phase)

**Source:** `assets/js/tapvocab.js` — `isMarked()` and `toggleMark()`:
```javascript
function isMarked(word) {
  const list = getPracticeList();
  return list.some(w => w.es === word.es && w.de === word.de);
}

function toggleMark(word) {
  let list = getPracticeList();
  if (isMarked(word)) {
    list = list.filter(w => !(w.es === word.es && w.de === word.de));
  } else {
    list.push(word);
  }
  savePracticeList(list);
}
```
Matching is by `es`+`de` equality only — `category` is never part of the match key, and `topics` will never be part of it either. The stored word object (`localStorage` key `practiceList`, per CONVENTIONS.md's key table: `{es, de, category}`) is pushed as-is from whatever `loadWords` returned to the browse/quiz screen at save time. After this phase's `loadWords` change, newly-saved entries will include a `topics` field; entries already saved before this phase's data migration will lack it entirely (`undefined`). NAV-07 is satisfied by construction (D-04: `es`/`de` never change), and per CONTEXT.md, any future reader of a practice-list entry's `topics` field must tolerate `undefined` — this is a note for Phase 24, not an action item for Phase 23.

## No Analog Found

None — both files in scope have direct, exact-match analogs already in the codebase (sibling function `loadTSV` for the code change; `fill-in-blank.tsv`'s tolerant-optional-column precedent and `sentences.js`'s punctuation regex for the data change).

## Metadata

**Analog search scope:** `assets/js/*.js`, `data/*.tsv`, `.planning/codebase/CONVENTIONS.md`
**Files scanned:** `assets/js/shared-utils.js`, `assets/js/tapvocab.js`, `assets/js/sentences.js`, `assets/js/fill-blank.js`, `assets/js/conjugation.js`, `data/words.tsv`
**Pattern extraction date:** 2026-09-10
