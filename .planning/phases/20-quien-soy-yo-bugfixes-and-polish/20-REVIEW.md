---
phase: 20-quien-soy-yo-bugfixes-and-polish
reviewed: 2026-05-09T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - quien-soy.html
  - assets/css/styles.css
  - data/quien-soy-sentences.txt
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 20: Code Review Report

**Reviewed:** 2026-05-09
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

This phase adds a skip button to `quien-soy.html`, adjusts iOS safe-area padding in `styles.css`, and fixes two data errors in `quien-soy-sentences.txt` (answer order swap on Q13, missing accent on "también"). The data fixes and CSS changes are clean. The JavaScript has three issues worth fixing before shipping: an unguarded `speechSynthesis.cancel()` call that will throw on unsupported browsers, a `startWhenReady` polling loop with no upper timeout bound that can silently hang, and unnecessary defensive complexity in the skip handler. No critical (security/crash) issues found.

## Warnings

### WR-01: Unguarded `speechSynthesis.cancel()` in skip handler

**File:** `quien-soy.html:209`
**Issue:** The skip button's click handler calls `window.speechSynthesis.cancel()` directly without first checking whether the Web Speech API exists. Every other speech call in the file goes through `speakSpanish()`, which guards with `try/catch`. On a browser that does not support the Speech Synthesis API, line 209 throws `TypeError: Cannot read properties of undefined (reading 'cancel')`, preventing any skip action.
**Fix:**
```javascript
// Replace line 209:
window.speechSynthesis.cancel();

// With a guarded call matching the pattern used elsewhere:
if (typeof speechSynthesis !== 'undefined') {
  window.speechSynthesis.cancel();
}
```

---

### WR-02: `startWhenReady` polling loop has no maximum wait / fallback timeout

**File:** `quien-soy.html:283–290`
**Issue:** The polling loop calls itself every 50ms until `_voicesLoaded` is true. On some browsers (particularly Firefox and some Android WebViews), `voiceschanged` never fires. The existing TTS initialization code already handles this by falling back to `voices[0]` — but `startWhenReady` never calls `showQuestion(0)` in that scenario, so the game silently never starts. The user sees a blank chat area with disabled buttons and no error message.

`_voicesLoaded` is only set to `true` in two places: (a) synchronously if `getVoices()` returns non-empty at load time, and (b) in the `voiceschanged` listener. If neither fires, the loop runs forever.
**Fix:**
```javascript
function startWhenReady(attemptsLeft) {
  if (attemptsLeft === undefined) attemptsLeft = 60; // 3-second max wait
  if (_voicesLoaded || typeof speechSynthesis === 'undefined' || attemptsLeft <= 0) {
    showQuestion(0);
  } else {
    setTimeout(function () { startWhenReady(attemptsLeft - 1); }, 50);
  }
}
startWhenReady();
```

---

### WR-03: Hardcoded question count in initial progress pill

**File:** `quien-soy.html:19`
**Issue:** The HTML initialises the progress pill as `1 / 14`. The `14` is a hardcoded assumption about the number of rows in the TSV. If the data file grows or shrinks (e.g., a row is filtered out due to missing fields), the pill will flash the wrong total for the brief interval between page paint and the first `showQuestion(0)` call. It also creates a maintenance coupling between the HTML and the data file.
**Fix:**
```html
<!-- Replace: -->
<div class="qs-progress" id="qs-progress" aria-live="polite">1 / 14</div>

<!-- With: -->
<div class="qs-progress" id="qs-progress" aria-live="polite">…</div>
```
The JS already overwrites this value on every `showQuestion()` call, so using a neutral placeholder eliminates the coupling.

---

## Info

### IN-01: Skip handler wraps immediate logic in a redundant one-shot closure

**File:** `quien-soy.html:211–224`
**Issue:** The skip click handler defines `go()` and calls it immediately on the next line. The `done` flag inside `go()` is redundant because `isAnswering = true` (set at line 205) already prevents re-entry — the handler returns early at line 204 on any subsequent tap. The closure adds indirection without benefit.
**Fix:**
```javascript
skipBtn.addEventListener('click', function () {
  if (isAnswering) return;
  isAnswering = true;
  btn1.disabled = true;
  btn2.disabled = true;
  skipBtn.disabled = true;
  if (typeof speechSynthesis !== 'undefined') window.speechSynthesis.cancel();
  setTimeout(function () {
    currentIndex++;
    if (currentIndex >= questions.length) {
      showEndScreen();
    } else {
      showQuestion(currentIndex);
    }
    isAnswering = false;
  }, 200);
});
```

---

### IN-02: No focus management when end screen is shown

**File:** `quien-soy.html:233–243`
**Issue:** When `showEndScreen()` runs, the main page is hidden and the end section becomes visible, but keyboard focus remains on the now-hidden buttons (btn1/btn2/skipBtn, all of which are `disabled`). A keyboard-only or screen-reader user will be stranded. The `aria-hidden="false"` is set on the end section but focus is never moved into it.
**Fix:**
```javascript
function showEndScreen() {
  pageEl.style.display = 'none';
  endEl.classList.add('visible');
  endEl.setAttribute('aria-hidden', 'false');

  var paragraph = buildParagraph();
  introTextEl.textContent = paragraph;

  // Move focus to the end card heading so keyboard users land in the right place
  var heading = endEl.querySelector('.qs-end-heading');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }

  setTimeout(function () { speakSpanish(paragraph); }, 300);
}
```

---

### IN-03: `lang` attribute on `<html>` is `"en"` but all content is Spanish

**File:** `quien-soy.html:2`
**Issue:** `<html lang="en">` declares English as the document language, but all visible content (questions, answers, UI labels like "Saltar", "Empezar de nuevo") is in Spanish. Screen readers use this attribute to select a TTS voice. The page does set `u.lang = "es-ES"` programmatically for speech synthesis, but the document-level declaration is misleading for assistive technology that reads static text (e.g., button labels).
**Fix:**
```html
<html lang="es">
```

---

_Reviewed: 2026-05-09_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
