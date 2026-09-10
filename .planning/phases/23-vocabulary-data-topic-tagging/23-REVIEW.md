---
phase: 23-vocabulary-data-topic-tagging
reviewed: 2026-09-10T00:00:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - assets/js/shared-utils.js
findings:
  critical: 1
  warning: 3
  info: 3
  total: 7
status: issues_found
---

# Phase 23: Code Review Report

**Reviewed:** 2026-09-10T00:00:00Z
**Depth:** standard
**Files Reviewed:** 1
**Status:** issues_found

## Summary

Phase 23 made a single code change: `SharedUtils.loadWords` now projects a 4th `topics` field
from `data/words.tsv`, guarded by `header.indexOf("topics")`. The rest of the phase was data
edits to `data/words.tsv`.

I verified the parser behaviour by extracting the exact post-change function body and running it
against six input shapes in Node. Five of six contract points hold. One does not: the guard covers
a **missing header** but not a **missing cell**. A data row that stops after `de` (no trailing tab)
makes `cols[idx.topics]` `undefined` and `.trim()` throws a `TypeError` that aborts the entire
load — every word in the file, on both `topic.html` and `sentences.html`.

`data/words.tsv` today is clean (all 753 lines have exactly 4 tab fields, 171 of them with an empty
trailing `topics` cell), so this is latent rather than live. It is still classified BLOCKER because:

1. The file is hand-edited, and the natural way a human appends a row is `category<TAB>es<TAB>de`
   with no trailing tab — which is now a whole-app outage rather than an untagged row.
2. The sibling loader **in the same file** (`loadTSV`, line 53) already uses the safe
   `(cols[i] || "").trim()` idiom, so this is a deviation from the file's own convention.
3. This project has already shipped and fixed this exact crash once before, in the
   `fill-in-blank.tsv` parser (recorded in project memory as a known gotcha).

Verification transcript (parser logic copied verbatim from lines 23-39):

```
A: short row, topics cell omitted (no trailing tab) => THROWS TypeError: Cannot read properties of undefined (reading 'trim')
B: blank topics cell (trailing tab)                 => [{"category":"Casa","es":"hola","de":"hallo","topics":""}]   PASS
C: no topics header at all                          => [{"category":"Casa","es":"hola","de":"hallo","topics":""}]   PASS
D: header order swapped, topics first               => [{"category":"Casa","es":"hola","de":"hallo","topics":"Palabras"}] PASS
E: empty file                                       => THROWS TypeError: Cannot read properties of undefined (reading 'split')
F: CRLF line endings                                => [{...,"topics":"Palabras"}]                                  PASS
```

Contract points that DO hold: blank cell is kept with `topics === ""` (case B); absent header still
yields `topics === ""` for every row (case C); `topics` is returned as one unsplit string — no
`.split(",")` anywhere (all 9 distinct values in the data are single tokens, none contain a comma
or space); and the `category`/`es`/`de` required-field filter on line 39 is byte-identical to
pre-phase behaviour per `git diff f386342..HEAD`.

## Critical Issues

### CR-01: Short data row crashes the entire vocabulary load

**File:** `assets/js/shared-utils.js:34-37`

**Issue:** The ternary `(idx.topics >= 0 ? cols[idx.topics] : "")` only defends against the
`topics` *header* being absent. When the header exists (it does — `data/words.tsv:1` is
`category<TAB>es<TAB>de<TAB>topics`) but a data row has fewer cells, `cols[idx.topics]` is
`undefined` and `.trim()` throws `TypeError: Cannot read properties of undefined`.

The throw happens inside `.map()`, so it is not a per-row degradation — it rejects the whole
`loadWords` promise. Blast radius:

- `assets/js/tapvocab.js:466` → caught at line 509, user sees
  `"Could not load words.tsv: Cannot read properties of undefined (reading 'trim')"`.
  Browse, Quiz, and the practice list are all dead.
- `assets/js/sentences.js:318` → Build Sentences fails to initialise.

One mistyped row takes down 752 working ones, with an error message that points at nothing
actionable. The same hazard applies to `category`/`es`/`de` on lines 34-36, and `topics` being the
new *trailing* column makes it by far the most likely cell to be omitted.

**Fix:** Use the `|| ""` idiom already established by `loadTSV` on line 53. This also makes the
required-field filter on line 39 do its job — a genuinely malformed row gets dropped quietly
instead of taking the page with it.

```js
return lines.slice(1).map(line => {
  const cols = line.split("\t");
  return {
    category: (idx.category >= 0 ? cols[idx.category] || "" : "").trim(),
    es:       (idx.es       >= 0 ? cols[idx.es]       || "" : "").trim(),
    de:       (idx.de       >= 0 ? cols[idx.de]       || "" : "").trim(),
    topics:   (idx.topics   >= 0 ? cols[idx.topics]   || "" : "").trim()
  };
}).filter(r => r.category && r.es && r.de);
```

Re-running case A against the patched version yields `[{"category":"Casa","es":"hola","de":"hallo","topics":""}]`,
which is the documented contract for an absent `topics` column.

## Warnings

### WR-01: Practice-list words bypass `loadWords`, so `topics` is `undefined` there

**File:** `assets/js/shared-utils.js:37` (contract), `assets/js/tapvocab.js:470`

**Issue:** The phase contract states `topics` is always a string. That holds only for objects that
came through `loadWords`. `tapvocab.js:470` takes the practice path
`words = getPracticeList()` — reading raw objects out of `localStorage["practiceList"]`, which were
pushed as `{...word}` spreads (`tapvocab.js:259, 291, 311`) by earlier app versions. Every entry
saved before this phase has **no `topics` key at all**.

Nothing reads `topics` yet, so there is no crash today. But the first consumer that does
`w.topics.includes(t)` or `w.topics.split("_")` will throw on exactly the users who have been using
the practice list the longest — the hardest failure mode to reproduce locally, since a fresh
browser profile has no legacy entries.

**Fix:** Normalise on read so the invariant holds for every word object in the app, not just fresh
ones. In `tapvocab.js:getPracticeList`:

```js
function getPracticeList() {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(list) ? list.map(w => ({ ...w, topics: w.topics || "" })) : [];
  } catch { return []; }
}
```

Alternatively, any future `topics` consumer must read it as `(w.topics || "")`. Pick one and state
it next to the field in the loader.

### WR-02: Header rename or case change silently disables tagging with no diagnostic

**File:** `assets/js/shared-utils.js:29`

**Issue:** `header.indexOf("topics")` is an exact, case-sensitive match. If the column is ever
written as `Topics`, `topic`, or picks up a stray character, `idx.topics` is `-1` and **all 752 rows
silently get `topics: ""`**. The app keeps working, nothing is logged, and the feature just quietly
does nothing. Given this project already has a documented header gotcha (`verbs.tsv` uses `él` with
an accent), a silent header mismatch is a realistic failure, and a silent one is the expensive kind.

Note the guard is doing double duty here: it is meant to express "old TSV without the column is
fine", but it also swallows "new TSV with a typo'd column". Those deserve different treatment.

**Fix:** Warn once when the header is present-but-unmatched-by-case, which distinguishes the two:

```js
if (idx.topics < 0 && header.some(h => h.toLowerCase() === "topics")) {
  console.warn("words.tsv: 'topics' header found with unexpected casing — tagging disabled. Header:", header);
}
```

### WR-03: Empty or header-less TSV throws an opaque `TypeError`

**File:** `assets/js/shared-utils.js:24`

**Issue:** If `text` is empty or whitespace-only, `lines` is `[]`, `lines[0]` is `undefined`, and
`lines[0].split("\t")` throws `TypeError: Cannot read properties of undefined (reading 'split')`
(verified, case E above). A truncated deploy, a zero-byte file, or an HTTP 200 with an empty body
surfaces as an internal type error rather than "no data". The explicit `res.ok` check on line 21
shows the intent to fail with a clear message; this path undercuts it.

This is pre-existing and not introduced by the diff, but the same three lines were edited this
phase and the fix is two lines. `loadTSV:47-48` has the identical defect.

**Fix:**

```js
const lines = text.split(/\r?\n/).filter(Boolean);
if (!lines.length) throw new Error("Empty TSV: " + tsvPath);
```

## Info

### IN-01: `loadWords` duplicates `loadTSV`'s parsing; delegating would have prevented CR-01

**File:** `assets/js/shared-utils.js:19-40` vs `43-57`

**Issue:** Both functions independently implement fetch → `res.ok` check → `split(/\r?\n/)` →
`filter(Boolean)` → header parse → per-line split. Only `loadTSV` has the `|| ""` cell guard. This
divergence is precisely what produced CR-01: the safe idiom existed 16 lines below the unsafe one
and was not reused. Each new column added to `loadWords` re-opens the same risk.

**Fix:** Express `loadWords` in terms of `loadTSV`, which is safe by construction and drops the
manual `idx` map entirely:

```js
async function loadWords(tsvPath) {
  const rows = await loadTSV(tsvPath);
  return rows
    .map(r => ({
      category: r.category || "",
      es: r.es || "",
      de: r.de || "",
      topics: r.topics || ""
    }))
    .filter(r => r.category && r.es && r.de);
}
```

This preserves the projected-shape contract (exactly four known keys, no passthrough of unexpected
columns) while inheriting the short-row tolerance. Worth doing only alongside CR-01, not instead
of it.

### IN-02: `topics` has no consumer — currently a dead field

**File:** `assets/js/shared-utils.js:37`

**Issue:** `grep -rn "\.topics" assets/js *.html` returns matches only inside `shared-utils.js`.
Neither `tapvocab.js` nor `sentences.js` nor `fill-blank.js` reads it. The field is groundwork for a
later phase, which is a legitimate reason to land it — flagged so it is a tracked commitment rather
than a forgotten one. If no consumer arrives, this is payload that gets written into every
`practiceList` localStorage entry for nothing.

**Fix:** No change now. Confirm a follow-up phase consumes `topics`; otherwise revert the projection.

### IN-03: Documentation drift — `topics` is undocumented, and 23% of rows are untagged

**File:** `assets/js/shared-utils.js:18` (comment), `CLAUDE.md`

**Issue:** Two gaps. (a) `CLAUDE.md` describes `loadWords(path)` as "words.tsv-specific" and lists
the returned shape without `topics`; `grep -n "topics" CLAUDE.md` returns nothing, so the new field
is invisible to the next contributor. (b) 171 of 752 data rows have an empty `topics` cell — blank
is explicitly allowed by the contract, but a future topic-filter UI will show roughly a quarter of
the vocabulary under no topic at all. Worth an intentional decision (a `Palabras`-style default, or
a deliberate "untagged" bucket) rather than a discovery at UI-build time.

**Fix:** Add `topics` to the `loadWords` bullet in `CLAUDE.md`, noting it is a single unsplit
string, `""` when blank or when the column is absent. Add a one-line comment at line 18 recording
that the column is optional by design. Decide the untagged-row policy before the consuming phase.

---

_Reviewed: 2026-09-10T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
