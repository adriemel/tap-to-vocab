---
phase: 18-numbers-quiz
reviewed: 2026-04-29T00:00:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - assets/css/styles.css
  - numbers-quiz.html
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 18: Code Review Report

**Reviewed:** 2026-04-29
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Phase 18 adds `numbers-quiz.html` — a flip-card grid for Spanish number quiz — and appends ~67 lines of `.nq-*` CSS to `assets/css/styles.css`. The implementation is clean and safe overall: all DOM insertion uses `textContent` exclusively (no XSS vectors), URL parameter validation correctly catches `NaN`, out-of-bounds, and inverted ranges via a fallback to `1-20`, and `speechSynthesis.cancel()` is called before `speak()` to prevent queue buildup. The `backface-visibility: hidden` rule is correctly applied to both card faces via a combined selector.

Three warnings need attention: a missing null-guard on `window.NUMBERS`, a subtle `cancel()`-before-utterance-assignment ordering issue that can produce a no-op on some browsers, and a missing responsive breakpoint for the 4-column grid on very narrow viewports. Two info items cover a redundant CSS rule and the absence of an empty-state render path.

---

## Warnings

### WR-01: `window.NUMBERS` accessed without null guard — runtime crash if script fails to load

**File:** `numbers-quiz.html:78`
**Issue:** `window.NUMBERS.filter(...)` is called unconditionally. If `numbers-data.js` fails to load (network error, 404, GitHub Pages cache miss during deploy), `window.NUMBERS` is `undefined` and `.filter()` throws a `TypeError`, leaving the page blank with no user-facing feedback. Both scripts are synchronous `<script>` tags, so a load failure of the first silently breaks the second.
**Fix:**
```javascript
var nums = (window.NUMBERS || []).filter(function (item) {
  return item.n >= lo && item.n <= hi;
});
if (!nums.length) {
  grid.textContent = "No numbers found for this range.";
  return;
}
```

---

### WR-02: `speechSynthesis.cancel()` called after utterance is configured but before `speak()` — safe on Chrome, silent no-op risk on Safari/Firefox

**File:** `numbers-quiz.html:59-60`
**Issue:** The utterance `u` is fully constructed and `voice` is set before `cancel()` is called. On most browsers this is fine, but on some WebKit implementations `cancel()` resets internal state in a way that can cause the immediately following `speak(u)` to be dropped if the synthesis engine is in a transitional state after cancel (especially on iOS Safari when the queue was previously idle). The safer pattern, copied from `tapvocab.js`, calls `cancel()` as the very first action before even constructing the utterance.

The current code:
```javascript
const u = new SpeechSynthesisUtterance(text);
u.lang = "es-ES";
const v = getSpanishVoice();
if (v) u.voice = v;
u.rate = 0.95; u.pitch = 1.0;
window.speechSynthesis.cancel();   // cancel AFTER setup
window.speechSynthesis.speak(u);
```

**Fix:** Move `cancel()` to before utterance construction:
```javascript
window.speechSynthesis.cancel();   // cancel FIRST
const u = new SpeechSynthesisUtterance(text);
u.lang = "es-ES";
const v = getSpanishVoice();
if (v) u.voice = v;
u.rate = 0.95; u.pitch = 1.0;
window.speechSynthesis.speak(u);
```

---

### WR-03: No responsive breakpoint for `.nq-grid` — 4 columns are too narrow on small phones

**File:** `assets/css/styles.css:1271-1276`
**Issue:** `.nq-grid` is hardcoded to `repeat(4, 1fr)` with no responsive override. On a 320px-wide viewport with 16px container padding on each side and 3 × 8px gaps, each card is approximately 56px wide. At that width, the `clamp(1.2rem, 5vw, 1.8rem)` number text computes to ~16px, and `clamp(0.65rem, 2.8vw, 1rem)` word text computes to ~9px — both are legible but extremely tight for the default 1–20 range (20 cards). For ranges up to 100 this becomes severe. The existing project breakpoint at 600px is the right place to add a column override.
**Fix:**
```css
@media (max-width: 480px) {
  .nq-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
}

@media (max-width: 340px) {
  .nq-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## Info

### IN-01: Duplicate `.flip-card-front` CSS rule block (unrelated to phase 18 but pre-existing)

**File:** `assets/css/styles.css:422` and `assets/css/styles.css:653`
**Issue:** `.flip-card-front` is declared twice: once at line 422 (combined with `.flip-card-back` at 407, then individually with background/border/cursor at 422) and again at line 653 for the `animation` property only. This is pre-existing and not a phase-18 regression, but the second block was likely meant to be appended to the first. No functional bug — cascade order means line 653 wins for `animation`. Worth consolidating if the rule is ever edited.
**Fix:** Merge the `animation: fadeIn 0.3s ease-out` declaration into the `.flip-card-front` block at line 422.

---

### IN-02: No empty-state render when `nums` array is empty after filtering

**File:** `numbers-quiz.html:78-123`
**Issue:** If the URL is crafted with a valid but data-absent range (e.g., `?range=50-60` when `window.NUMBERS` only covers 1–100 but no entries land in range due to a hypothetical future data change, or `?range=99-99`), `nums` will be empty and the grid renders nothing — a blank card with no explanation. This is a minor UX gap rather than a crash, but it pairs naturally with the WR-01 null guard fix above.
**Fix:** After filtering (and after adding the null guard from WR-01), add:
```javascript
if (!nums.length) {
  var msg = document.createElement("p");
  msg.style.textAlign = "center";
  msg.style.color = "var(--muted)";
  msg.textContent = "No numbers in range " + lo + "–" + hi + ".";
  grid.appendChild(msg);
  return;
}
```

---

_Reviewed: 2026-04-29_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
