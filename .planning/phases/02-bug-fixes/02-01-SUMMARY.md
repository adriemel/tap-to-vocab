---
phase: 02-bug-fixes
plan: "01"
subsystem: core-gameplay
tags: [bug-fix, coin-system, speech-synthesis, localStorage]
dependency_graph:
  requires: []
  provides: [quiz-coin-refund, ios-voice-loading, storage-quota-feedback]
  affects: [tapvocab.js, sentences.js, conjugation.js]
tech_stack:
  added: []
  patterns: [guard-pattern, synchronous-first-async-fallback]
key_files:
  created: []
  modified:
    - tap-to-vocab/assets/js/tapvocab.js
    - tap-to-vocab/assets/js/sentences.js
    - tap-to-vocab/assets/js/conjugation.js
decisions:
  - "BUG-01: spendCoins not guarded on return value — back navigation always proceeds regardless of coin balance"
  - "BUG-02: synchronous getVoices() before voiceschanged listener — handles both Chrome (sync) and iOS/Safari (async early-fire)"
  - "BUG-05: .textContent not .innerHTML for error message to prevent any injection risk"
metrics:
  duration: "~2 minutes"
  completed_date: "2026-03-10"
  tasks_completed: 3
  files_modified: 3
requirements_satisfied:
  - BUG-01
  - BUG-02
  - BUG-05
---

# Phase 02 Plan 01: JavaScript Bug Fixes (Coin Refund, iOS Voice, localStorage Feedback) Summary

**One-liner:** Three isolated JS patches: quiz back-button coin refund via CoinTracker.spendCoins, synchronous-first voice loading for iOS/Safari, and visible "Storage full" error in all three localStorage catch blocks.

## What Was Built

Fixed three JavaScript logic bugs across `tapvocab.js`, `sentences.js`, and `conjugation.js` — each a targeted one-to-five-line change with no structural modifications.

### BUG-01: Coin refund on quiz back button (tapvocab.js)
Added `if (window.CoinTracker) CoinTracker.spendCoins(1);` immediately after `correctCount--` in the `btnQuizBack.onclick` handler's `else if (lastAnswer.wasCorrect)` branch. Uses the identical guard style to the existing `CoinTracker.addCoin()` call. The return value of `spendCoins` is intentionally ignored — back navigation always proceeds.

### BUG-02: iOS/Safari voice loading (tapvocab.js)
Replaced the event-listener-only voice initialization with a synchronous-first pattern:
1. `speechSynthesis.getVoices()` called synchronously on page load — works in Chrome/Firefox where voices are available immediately
2. `voiceschanged` listener retained for iOS/Safari where voices load asynchronously (and the event may fire before script runs)

The `u.lang = "es-ES"` fallback in `speakSpanish` was intentionally preserved as-is.

### BUG-05: localStorage quota error feedback (all three files)
Added visible error display to the three `catch (e)` blocks that previously only called `console.warn`. All three now also do:
```javascript
var el = document.getElementById("error");
if (el) { el.textContent = "Storage full — changes could not be saved."; el.style.display = "block"; }
```
Applied to: `savePracticeList` (tapvocab.js), `saveEnabledSentences` (sentences.js), `saveEnabledVerbs` (conjugation.js).

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | BUG-01 coin refund on quiz back | ff63616 | tapvocab.js |
| 2 | BUG-02 iOS/Safari voice loading | ff63616 | tapvocab.js |
| 3 | BUG-05 localStorage quota feedback | ff63616 | tapvocab.js, sentences.js, conjugation.js |

## Deviations from Plan

None — plan executed exactly as written. All three fixes are isolated additions with no other logic altered.

## Verification

1. `tapvocab.js` contains `CoinTracker.spendCoins(1)` in `else if (lastAnswer.wasCorrect)` branch after `correctCount--` — confirmed at line 329
2. `tapvocab.js` voice init has synchronous `getVoices()` call before `voiceschanged` listener, wrapped in `if (typeof speechSynthesis !== "undefined")` — confirmed at lines 29-39
3. All three catch blocks show `#error` element with "Storage full" text on quota exception — confirmed in all three files

## Self-Check: PASSED

- [x] tap-to-vocab/assets/js/tapvocab.js — modified and committed
- [x] tap-to-vocab/assets/js/sentences.js — modified and committed
- [x] tap-to-vocab/assets/js/conjugation.js — modified and committed
- [x] Commit ff63616 exists in nested repo
