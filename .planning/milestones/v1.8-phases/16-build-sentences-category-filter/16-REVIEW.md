---
phase: 16-build-sentences-category-filter
reviewed: 2026-04-24T00:00:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - tap-to-vocab/assets/js/sentences.js
  - tap-to-vocab/sentences.html
findings:
  critical: 1
  warning: 2
  info: 2
  total: 5
status: issues_found
---

# Phase 16: Code Review Report

**Reviewed:** 2026-04-24T00:00:00Z
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Reviewed the two files modified by phase 16 (Build Sentences Category Filter). The plan called for replacing the per-sentence toggle list in the sentence manager modal with per-category checkboxes, persisted under a new `sentenceCategories` localStorage key.

The critical finding is that the phase 16 implementation has NOT been applied to the files on disk. Both `sentences.js` and `sentences.html` are in their pre-phase-16 state: `sentences.js` still contains the old `enabledSentences`-keyed per-sentence filter logic, and `sentences.html` still shows `<h2>Select Sentences</h2>`. The 16-01-SUMMARY.md claims completion with four commits, but those commits are not present in the working tree copy of these files.

Two additional code quality warnings exist in `sentences.js` regardless of phase status.

---

## Critical Issues

### CR-01: Phase 16 changes not applied — files on disk are pre-phase-16

**File:** `tap-to-vocab/assets/js/sentences.js:8-352`, `tap-to-vocab/sentences.html:60`

**Issue:** The 16-01-SUMMARY.md reports four completed commits (b3f44bc, 5b5ff08, 4035330, 94f81ec) implementing per-category checkboxes. However, the actual files on disk contain none of the phase 16 changes:

- `STORAGE_KEY_CATEGORIES` / `getCategoryFilter` / `saveCategoryFilter` are absent from `sentences.js`
- `openSentenceManager` still renders one checkbox per sentence (old `sent-${idx}` ids at lines 74, 81)
- `init()` still filters by `enabledMap[s.es]` (line 325) instead of `filterMap[s.category]`
- `sentences.html` still has `<h2>Select Sentences</h2>` (line 60) instead of `<h2>Filter by Category</h2>`
- `btnManage.onclick` still passes `enabledMap` as `newEnabledMap` (line 332) — old callback signature

Grep verification:
```
grep -c 'STORAGE_KEY_CATEGORIES\|getCategoryFilter\|saveCategoryFilter\|filterMap\[s\.category\]' sentences.js
# Output: 0  (should be non-zero if phase applied)
grep -n 'Filter by Category' sentences.html
# Output: (empty)  (should match line 60)
```

**Fix:** The phase 16 tasks must be executed. Apply the four changes from the plan:
1. Add `STORAGE_KEY_CATEGORIES`, `getCategoryFilter`, `saveCategoryFilter` to `sentences.js`
2. Replace `openSentenceManager` body with the per-category rendering from plan task T2
3. Replace the `init()` filter block with the category-based version from plan task T3
4. Update `sentences.html` line 60 from `Select Sentences` to `Filter by Category`

---

## Warnings

### WR-01: `openSentenceManager` registers new `checkbox.addEventListener` on every open without cleanup

**File:** `tap-to-vocab/assets/js/sentences.js:76`

**Issue:** Each time the sentence manager modal is opened, `openSentenceManager` creates fresh DOM elements and attaches `change` event listeners via `addEventListener`. This is fine on its own because `listEl.innerHTML = ""` (line 67) clears the old elements before re-rendering. However, the `btnSelectAll.onclick` and `btnDeselectAll.onclick` handlers (lines 90, 97) are reassigned on every open. If the same `enabledMap` object reference changes between calls, there is a stale closure risk: the `onSave` callback at line 114 closes over the local `enabledMap`, but `btnSave.onclick` is also reassigned on every open (line 111), so the closure is fresh. This is acceptable. The warning is about the `checkbox.addEventListener` pattern: unlike `.onclick`, `addEventListener` accumulates listeners if the element persists across calls. Since the element is freshly created each time (not reused), no actual accumulation occurs. No bug — but if the pattern is ever refactored to reuse checkboxes, this will become a listener leak.

**Fix:** Document this assumption explicitly, or switch to `.onchange` for consistency with the button handlers:
```javascript
// Change:
checkbox.addEventListener("change", () => {
  enabledMap[sentence.es] = checkbox.checked;
});
// To:
checkbox.onchange = () => {
  enabledMap[sentence.es] = checkbox.checked;
};
```

### WR-02: Unguarded DOM element access in `initSentenceBuilder` — `btnReset`, `btnSkip`, `btnHome`, `targetEl`, `buildAreaEl`, `wordBankEl`, `progressEl` not null-checked

**File:** `tap-to-vocab/assets/js/sentences.js:122-131, 158-175, 264-289`

**Issue:** `initSentenceBuilder` retrieves seven DOM elements without null checks, then immediately uses them without guarding. `btnBack` and `btnStats`/`btnStatsClose` are guarded (`if (btnBack)`, `if (btnStats)`), but the others are not. If any required element is missing (e.g., from a future HTML refactor or if the function is called before the DOM is ready), accessing `.textContent`, `.innerHTML`, `.classList`, or `.onclick` on `null` throws a TypeError that crashes the game silently.

The page currently always provides these elements, so no runtime crash exists today — but the inconsistency (some guarded, some not) is a latent bug waiting for a refactor.

**Fix:** Either add null checks for all required elements at the top of `initSentenceBuilder` and return early with an error, or document the assumption that these are required. Minimal fix:
```javascript
// At the top of initSentenceBuilder, after the element lookups:
if (!targetEl || !buildAreaEl || !wordBankEl || !progressEl || !btnReset || !btnSkip || !btnHome) {
  console.error("SentenceBuilder: required DOM elements missing");
  if (errorEl) { errorEl.textContent = "Page structure error."; errorEl.style.display = "block"; }
  return;
}
```

---

## Info

### IN-01: Dead code — `getEnabledSentences` and `saveEnabledSentences` are retained but unused after phase 16

**File:** `tap-to-vocab/assets/js/sentences.js:8, 15-31`

**Issue:** Once phase 16 is applied, `STORAGE_KEY_ENABLED`, `getEnabledSentences`, and `saveEnabledSentences` will be unused. The summary notes these were kept "for backwards compatibility," but they are never called from anywhere after the refactor — they just silently persist in the IIFE. This is not a bug (the old localStorage key is harmless), but the dead code adds noise and could confuse future maintainers.

**Fix:** After phase 16 is confirmed working, remove the three declarations (lines 8, 15-22, 24-31). If backward compatibility with old `enabledSentences` data genuinely matters, add a one-time migration at the top of `init()` and then delete.

### IN-02: Error message exposes internal exception text to end users

**File:** `tap-to-vocab/assets/js/sentences.js:344`

**Issue:** `errorEl.textContent = "Could not load vocabulary: " + e.message;` surfaces the raw JavaScript error message (e.g., network error details, file path information) directly to the user. For a static educational app with no sensitive data this is low risk, but the pattern can leak implementation details.

**Fix:** Show a user-friendly message and log the detail to console:
```javascript
console.error("SentenceBuilder init failed:", e);
errorEl.textContent = "Could not load vocabulary. Please refresh the page.";
errorEl.style.display = "block";
```

---

_Reviewed: 2026-04-24T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
