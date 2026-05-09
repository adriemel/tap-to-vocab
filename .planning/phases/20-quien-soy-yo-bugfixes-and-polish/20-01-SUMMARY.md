---
phase: 20-quien-soy-yo-bugfixes-and-polish
plan: "01"
subsystem: quien-soy
tags: [bugfix, tts, mobile, css, accessibility]
dependency_graph:
  requires: []
  provides: [FIX-TTS, FIX-SKIP, FIX-SCROLL, FIX-ENDSCREEN, FIX-TYPO]
  affects: [quien-soy.html, assets/css/styles.css, data/quien-soy-sentences.txt]
tech_stack:
  added: []
  patterns: [voice-gate polling, isAnswering guard, safe-area-inset-bottom, viewport-fit=cover]
key_files:
  created: []
  modified:
    - quien-soy.html
    - assets/css/styles.css
    - data/quien-soy-sentences.txt
decisions:
  - Skip handler intentionally omits chosenAnswers.push and appendBubble — skipped questions leave no trace in final paragraph
  - startWhenReady() voice-gate polls _voicesLoaded at 50ms intervals to resolve Chrome/Android first-question TTS race condition
  - skipBtn starts with disabled attribute in HTML source to block taps before TSV data loads
metrics:
  duration: "2m 12s"
  completed: "2026-05-09T08:11:14Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
---

# Phase 20 Plan 01: Quien-Soy Bugfixes and Polish Summary

**One-liner:** Five targeted fixes — TTS voice-gate, skip button with isAnswering guard, safe-area padding, end-screen mobile layout, and accent typo — polishing the Quién Soy Yo chat simulator shipped in Phase 19.

## What Was Built

Fixed five known bugs and one data typo in the Quién Soy Yo chat simulator:

1. **TTS race condition (FIX-TTS):** Replaced the bare `showQuestion(0)` call in the `.then()` callback with a `startWhenReady()` polling function that waits until `_voicesLoaded` is true (or TTS is unavailable) before starting. This prevents the first question from firing TTS before the browser has loaded voices — the silent-first-question bug on Chrome/Android.

2. **Skip button (FIX-SKIP):** Added a third button `#qs-skip` (`Saltar`) to `#qs-strip` with `disabled` in HTML source. JS handler uses the `isAnswering` guard to prevent double-advance, cancels ongoing TTS, and advances `currentIndex` by 1 after a 200ms delay. Skipped questions produce no bubble and are not pushed to `chosenAnswers`. The button is enabled/disabled alongside `btn1`/`btn2` in `showQuestion()` and `onChoiceTap()`.

3. **Scroll overlap on mobile (FIX-SCROLL):** Updated `.qs-chat` bottom padding from `88px` to `calc(120px + env(safe-area-inset-bottom, 0px))` so the last bubble scrolls above the fixed answer strip plus iOS home-indicator area. Updated `.qs-answer-strip` bottom padding from `12px` to `calc(12px + env(safe-area-inset-bottom, 0px))`. Added `viewport-fit=cover` to the meta viewport tag to activate safe-area CSS variables.

4. **End-screen button layout (FIX-ENDSCREEN):** Added `@media (max-width: 480px)` rule that switches `.qs-end-actions` to `flex-direction: column` and sets `.qs-end-actions .btn` to `width: 100%` — all three action buttons stack vertically at full width on 375px screens.

5. **Typo in data file (FIX-TYPO):** Corrected `tambien` to `también` (added accent on second e) in row 15 of `data/quien-soy-sentences.txt`. This ensures correct TTS pronunciation when the browser speaks that sentence.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | e1b9cfe | fix(20-01): fix data typo, safe-area padding, skip CSS, end-screen media query |
| 2 | f6a9a0d | feat(20-01): add skip button, voice-gate TTS, and viewport-fit=cover to quien-soy.html |

## Decisions Made

- **Skip does not record answers:** Skipping leaves no chat bubble and does not push to `chosenAnswers[]`. The final paragraph only reflects questions the user actively answered. This was a design decision confirmed in the plan's RESEARCH.md open-questions section.
- **startWhenReady polls at 50ms:** This is short enough to not feel laggy but avoids the race condition that caused the first question to sometimes speak before voices loaded. The `_voicesLoaded` flag is already managed by the existing `voiceschanged` event listener.
- **skipBtn disabled in HTML source:** The attribute is set in the HTML (not only via JS) so no tap can reach the handler before `startWhenReady()` calls `showQuestion(0)`, which would invoke `showEndScreen()` with an empty `questions` array.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all functionality is fully wired.

## Threat Flags

No new security surface introduced. The `isAnswering` guard (T-20-01) is implemented in the skip handler at the top of the click listener. The `speechSynthesis.cancel()` call (T-20-02) is contained and consistent with existing usage in the codebase.

## Self-Check: PASSED

- `data/quien-soy-sentences.txt` contains "también" — VERIFIED
- `assets/css/styles.css` contains 2x `safe-area-inset-bottom`, 3x `qs-skip` rules, 1x `max-width: 480px` in qs block — VERIFIED
- `quien-soy.html` contains `viewport-fit=cover`, `id="qs-skip" disabled`, `startWhenReady` (3 matches), `if (isAnswering) return;` (2 matches) — VERIFIED
- Commits e1b9cfe and f6a9a0d exist in git log — VERIFIED
