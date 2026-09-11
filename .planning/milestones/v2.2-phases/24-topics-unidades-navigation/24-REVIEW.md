---
phase: 24-topics-unidades-navigation
reviewed: 2026-09-11T04:42:20Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - assets/css/styles.css
  - assets/js/tapvocab.js
  - index.html
  - topic.html
  - topics.html
  - unidades.html
findings:
  critical: 1
  warning: 2
  info: 4
  total: 7
status: issues_found
---

# Phase 24: Code Review Report

**Reviewed:** 2026-09-11T04:42:20Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Scope: the phase-24 diff (`2e2c411^..HEAD`) across the six files above. `SharedUtils.loadWords`, `coins.js`, `numbers.html` and the shipped `data/words.tsv` were read for context.

What checks out:
- All 9 hardcoded topic slugs in `topics.html` match a `topics` value in `words.tsv`.
- All 5 unidad slugs in `unidades.html` match a `category` value.
- `loadWords` already exposes `r.topics` and defaults it to `""`, so the new filter can't throw on blank rows.
- `?cat=` and `?cat=practice` behave as before.
- Every new string reaches the DOM through `textContent`, so there is no XSS path.
- The CSS change only targets `.btn-topics` / `.btn-unidades`, so NAV-02 still holds.

Main problem: the new `?topic=` filter pulls rows from every unidad, and `words.tsv` intentionally keeps the same word in several categories. As a result, topic lists contain 55 exact duplicate cards (es and de identical). Casa_Familia is 24% repeats. Category views have essentially none (1 duplicate across all categories). This affects Browse, the Quiz and the coin count.

Two smaller issues:
- The coin counter on the new hub pages goes stale after browser-Back (bfcache).
- The phase kept an existing inconsistent `"practice"` check. Combined with the new `topic` title, it can put the wrong heading on a page.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: Topic word lists contain duplicate cards (55 across topics), inflating counts, repeating quiz cards and double-paying coins

**File:** `assets/js/tapvocab.js:473-474`
**Issue:** The topic branch keeps every row whose `topics` equals the slug:

```js
} else if (topic) {
  words = shuffleArray(rows.filter(r => (r.topics || "").toLowerCase() === topic.toLowerCase()));
```

Phase 23 kept each word under every category it appears in (for example `la madre` is in both `Casa_Familia` and `Unidad2`) and tagged every copy with the same topic. A category filter never sees both copies. A topic filter aggregates across categories, so it does. Measured against the shipped `data/words.tsv`, counting rows vs distinct (es, de) pairs:

| topic | rows shown | distinct words | duplicate cards |
|---|---|---|---|
| Casa_Familia | 83 | 63 | 20 |
| Palabras | 243 | 227 | 16 |
| Calendario | 63 | 49 | 14 (`ahora` appears 3 times) |
| Escuela | 49 | 45 | 4 |
| Saludar | 55 | 54 | 1 |

By comparison, all category views together contain 1 duplicate.

What the user sees:
- The Browse counter reads `1 / 83` when there are 63 words.
- The same flashcard comes up twice in one Quiz run.
- Each "Got it!" on a repeat calls `CoinTracker.addCoin()` again, so a user can earn up to 20 extra coins per Casa_Familia pass. That weakens the 10-coin Games gate.
- The quiz score percentage is computed over the repeated cards.

The practice list identifies a word by `es` + `de` (`isMarked`, line 86), so the app already treats these rows as the same word. NAV-06 says "every **word** tagged with it", not every row.

Separately, 11 near-duplicates share `es` but differ only in the punctuation of `de` (for example `hablar`: `sprechen, reden` vs `sprechen; reden`). They also appear twice. Code-level dedup can't catch these; they need cleanup in `words.tsv`.

**Fix:** In the topic branch, deduplicate on the same identity the practice list uses:

```js
} else if (topic) {
  const t = topic.toLowerCase();
  const seen = new Set();
  const matched = rows.filter(r => {
    if ((r.topics || "").toLowerCase() !== t) return false;
    const key = r.es + "\t" + r.de;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  words = shuffleArray(matched);
}
```

Fix the 11 punctuation-only variants in `words.tsv` separately. Update the 24-01 plan truth ("lists the N rows") to count distinct words.

## Warnings

### WR-01: Coin counter on topics.html / unidades.html is stale after browser-Back (bfcache), so the "live" coin counter truth fails

**File:** `topics.html:16,36`, `unidades.html:16,32` (root cause in `assets/js/coins.js`, which only refreshes on `DOMContentLoaded` and on the same-window `coinschanged` event)
**Issue:** Both hub pages are static, have no unload handlers, and GitHub Pages serves them cacheable, so browsers keep them in the back/forward cache. The new navigation makes one path common:
1. Topics → a topic → run the Quiz and earn coins.
2. Press browser Back, the natural way to return to the Topics list, since `topic.html`'s Home goes to `/`.

On a bfcache restore, `DOMContentLoaded` doesn't fire again. The `coinschanged` events were dispatched in the other page's `window`. So the badge still shows the balance from before the quiz. Plan 24-02's truth, "Both sub-screens show a live coin counter that reflects the same balance as every other page", doesn't hold on this path. The same stale state already affected `index.html`, including the practice-count badge. The new hub pages make the path much more common.
**Fix:** In `coins.js`, also refresh on bfcache restore and on changes made in other tabs:

```js
window.addEventListener("pageshow", function (e) { if (e.persisted) updateDisplay(); });
window.addEventListener("storage", function (e) { if (e.key === KEY) updateDisplay(); });
```

### WR-02: Inconsistent `"practice"` detection now shows a topic title over the practice list

**File:** `assets/js/tapvocab.js:471`, `:480`, `:506`
**Issue:** Line 471 detects practice case-insensitively (`category.toLowerCase() === "practice"`), and so do line 481 and `setupQuizMode`'s `isPracticeCategory`. Lines 480 and 506 still use a strict `category === "practice"`. The diff edited both lines and kept that mismatch. Before, a URL such as `?cat=Practice` got the heading "Practice" instead of "⭐ Practice". Now, `?cat=Practice&topic=Colores` loads the **practice list** (and the quiz's remove-from-practice behavior) under the heading **"Colores"**.

There is also an undocumented precedence rule: `cat=practice` beats `topic`, while `topic` beats any other `cat`. Neither CLAUDE.md nor the code states this.
**Fix:** Compute the flag once and use it everywhere:

```js
const isPractice = category.toLowerCase() === "practice";
...
if (isPractice) { words = getPracticeList(); }
else if (topic) { ... }
...
titleEl.textContent = isPractice ? "⭐ Practice" : displayName;   // lines 480 and 506
errorEl.textContent = isPractice ? "Your practice list is empty..." : topic ? ... : ...;
```

Also add a one-line comment giving the precedence (`practice` > `topic` > `cat`).

## Info

### IN-01: `category` is set to the bogus value "topic" on every `?topic=` page

**File:** `assets/js/tapvocab.js:460-462`
**Issue:** When only `?topic=` is passed, `opts.category` is `""`, so line 460 falls back to `inferCategoryFromPath()` and gets `"topic"` from `/topic.html`. That value is then passed to `initBrowseMode`, `setupModeSwitching` and `setupQuizMode`. It's harmless today because only the practice check reads it. But any future category-based logic on a topic page would quietly get `"topic"`.
**Fix:** `const category = (opts && opts.category) || (topic ? "" : inferCategoryFromPath());`. You'll need to declare `topic` first.

### IN-02: Topic heading shows the raw slug (`Casa_Familia`, `Comida_Bebida`) instead of the hub label

**File:** `assets/js/tapvocab.js:462`, `:480`, `:506`
**Issue:** `displayName = topic` writes the slug straight into the `h1`. The user taps "🍽️ Comida y Bebida" on `topics.html` and lands on a page titled "Comida_Bebida". `document.title` also stays the generic "Tap‑to‑Vocab – Topic" on every topic page. 24-CONTEXT lists this as optional polish, so this is informational only.
**Fix:** `const displayName = (topic || category).replace(/_/g, " ");` is enough for the current slugs. Alternatively, pass a `&label=` from the hub button. Set `document.title` to match.

### IN-03: topics.html and unidades.html are near-identical copies with inline styles

**File:** `topics.html:1-38`, `unidades.html:1-34`
**Issue:** The two pages match line for line apart from the title, emoji, instruction text and button list. All layout uses inline `style=` attributes copied from `numbers.html`, so there are now three copies of the same header and stack markup. Any change to the hub layout, such as a back-to-Topics link, has to be made in three places.
**Fix:** At minimum, move the repeated inline styles into classes in `styles.css` (for example `.hub-header`, `.hub-hint`, `.hub-stack`).

### IN-04: Unidad 5A and Unidad 5B share the same emoji

**File:** `unidades.html:27-28`
**Issue:** Both buttons start with `5️⃣`, so the only difference between them is the final letter. On this single-column list they read as duplicates at a glance.
**Fix:** Cosmetic. Keep the shared emoji and rely on the label, or tell them apart another way, for example `5️⃣ Unidad 5 A` / `5️⃣ Unidad 5 B` in bold, or a different glyph for 5B.

---

_Reviewed: 2026-09-11T04:42:20Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
