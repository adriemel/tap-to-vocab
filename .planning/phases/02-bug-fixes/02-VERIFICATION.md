---
phase: 02-bug-fixes
verified: 2026-03-10T00:00:00Z
status: human_needed
score: 6/6 must-haves verified
gaps:
  - truth: "REQUIREMENTS.md status markers are out of sync with the actual implementation"
    status: partial
    reason: "BUG-03, BUG-04, and BUG-06 are fully implemented in code but REQUIREMENTS.md still marks them as Pending (unchecked [ ] checkbox). The traceability table also shows them as Pending. This is a documentation-only gap — no code is broken."
    artifacts:
      - path: ".planning/REQUIREMENTS.md"
        issue: "Lines 16-18 show [ ] for BUG-03, BUG-04, BUG-06; traceability table lines 69-71 show Pending for the same"
    missing:
      - "Mark BUG-03, BUG-04, BUG-06 as [x] complete in REQUIREMENTS.md"
      - "Update traceability table status from Pending to Complete for BUG-03, BUG-04, BUG-06"
human_verification:
  - test: "Tap a vocabulary word on iOS/Safari"
    expected: "Audio plays immediately without silence, even when the voiceschanged event fired before the script ran"
    why_human: "iOS/Safari behavior cannot be verified programmatically — requires a real device or Safari simulator"
  - test: "Fill localStorage to quota (DevTools: localStorage.setItem('__fill', 'x'.repeat(5000000))), then toggle a star on any word in topic.html"
    expected: "The #error paragraph becomes visible with text 'Storage full — changes could not be saved.'"
    why_human: "Requires live browser interaction to trigger the quota exception"
  - test: "Open any game URL directly (/games/coin-dash.html, /games/jungle-run.html, /games/tower-stack.html, /games.html) with no sessionStorage set"
    expected: "In-page error message appears with home link; game does not start; no silent redirect occurs"
    why_human: "Requires browser interaction to verify the DOM manipulation and that the game loop did not start"
  - test: "Load voices.html in a browser that does not support the Web Speech API (or simulate: delete window.speechSynthesis in DevTools before load)"
    expected: "Page loads without any JS error in the console; table is empty"
    why_human: "Requires a non-speechSynthesis environment to test the guard branch"
---

# Phase 02: Bug Fixes Verification Report

**Phase Goal:** Fix all six identified bugs (BUG-01 through BUG-06) to improve app stability, UX correctness, and cross-browser compatibility.
**Verified:** 2026-03-10
**Status:** gaps_found — code changes all verified; one documentation gap in REQUIREMENTS.md
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Pressing quiz back after correct answer decrements coin counter by 1 | VERIFIED | `tapvocab.js` line 329: `if (window.CoinTracker) CoinTracker.spendCoins(1); // BUG-01: refund coin on back` — placed immediately after `correctCount--` in the `else if (lastAnswer.wasCorrect)` branch |
| 2 | Tapping a vocab word on iOS/Safari produces audio (no silent failure) | VERIFIED (code) | `tapvocab.js` lines 29–41: synchronous `speechSynthesis.getVoices()` call added before the `voiceschanged` listener, wrapped in `if (typeof speechSynthesis !== "undefined")`. `u.lang = "es-ES"` fallback preserved. Needs human test on device. |
| 3 | localStorage quota exceeded shows visible "Storage full" message | VERIFIED | All three catch blocks patched: `tapvocab.js` lines 79–80, `sentences.js` lines 28–29, `conjugation.js` lines 24–25 — all set `el.textContent = "Storage full — changes could not be saved."` and `el.style.display = "block"` |
| 4 | Direct navigation to game URLs shows in-page error with home link (no silent redirect) | VERIFIED | coin-dash.html line 128–133, tower-stack.html line 126–133: `insertAdjacentHTML` + `return` inside IIFE. jungle-run.html line 134–139: same pattern using `#overlay-start h2` selector. games.html lines 29–32: `else` branch replaces `.card` innerHTML — no top-level `return`. Zero `location.replace("/")` guard calls remain in any of the four files. |
| 5 | No favicon 404 on any of the 11 app pages | VERIFIED | All 11 HTML files have `<link rel="icon" href="data:image/svg+xml,...">` at line 6. Data-URI approach requires no path resolution for subdirectory pages. Confirmed by grep: 11 files, 1 match each. |
| 6 | voices.html loads without JS error in non-speechSynthesis browsers | VERIFIED | `voices.html` line 38: `if (!('speechSynthesis' in window)) return [];` — guard added at top of `listVoices()`. Returns `[]` (not bare `undefined`) so the `.filter()` call at the usage site does not crash. CONCERNS.md line 115: scheduleMusic entry updated to `Severity: Resolved (Not a Bug)` with accurate description. |

**Score:** 6/6 truths verified in code

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `tap-to-vocab/assets/js/tapvocab.js` | Coin refund + iOS voice + storage error display | VERIFIED | Line 329: `spendCoins(1)`; Lines 29–41: sync voice init; Lines 79–80: storage error |
| `tap-to-vocab/assets/js/sentences.js` | Storage error display in catch | VERIFIED | Lines 28–29: `Storage full` pattern in `saveEnabledSentences` catch |
| `tap-to-vocab/assets/js/conjugation.js` | Storage error display in catch | VERIFIED | Lines 24–25: `Storage full` pattern in `saveEnabledVerbs` catch |
| `tap-to-vocab/games/coin-dash.html` | In-page error + favicon | VERIFIED | Lines 6, 128–133: favicon + guard with `insertAdjacentHTML` + `return` |
| `tap-to-vocab/games/jungle-run.html` | In-page error + favicon | VERIFIED | Lines 6, 134–139: favicon + guard with `insertAdjacentHTML` + `return`; note: uses hardcoded `#ff6b6b`/`#6ca8ff` instead of CSS vars — cosmetic inconsistency only |
| `tap-to-vocab/games/tower-stack.html` | In-page error + favicon | VERIFIED | Lines 6, 126–133: favicon + guard |
| `tap-to-vocab/games.html` | In-page error + favicon | VERIFIED | Lines 6, 29–33: favicon + `if (lives <= 0)` branch replaces `.card` innerHTML, game grid in `else` |
| `tap-to-vocab/index.html` | Favicon | VERIFIED | Line 6: data-URI favicon |
| `tap-to-vocab/topic.html` | Favicon | VERIFIED | Line 6: data-URI favicon |
| `tap-to-vocab/sentences.html` | Favicon | VERIFIED | Line 6: data-URI favicon |
| `tap-to-vocab/conjugation.html` | Favicon | VERIFIED | Line 6: data-URI favicon |
| `tap-to-vocab/fill-blank.html` | Favicon | VERIFIED | Line 6: data-URI favicon |
| `tap-to-vocab/vocab.html` | Favicon | VERIFIED | Line 6: data-URI favicon |
| `tap-to-vocab/voices.html` | speechSynthesis guard + favicon | VERIFIED | Lines 6, 38: favicon + `if (!('speechSynthesis' in window)) return []` |
| `.planning/codebase/CONCERNS.md` | Accurate scheduleMusic entry | VERIFIED | Line 115: `Severity: Resolved (Not a Bug)` with full explanation |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `tapvocab.js` btnQuizBack handler | `CoinTracker.spendCoins(1)` | `if (window.CoinTracker)` guard | WIRED | Line 329 — inside `else if (lastAnswer.wasCorrect)` branch after `correctCount--` |
| `tapvocab.js` voice init | `speechSynthesis.getVoices()` synchronous call | `if (typeof speechSynthesis !== "undefined")` | WIRED | Lines 29–34 — sync check before listener registration |
| `savePracticeList` catch (tapvocab.js) | `#error` element display | `document.getElementById("error")` | WIRED | Lines 79–80 |
| `saveEnabledSentences` catch (sentences.js) | `#error` element display | `document.getElementById("error")` | WIRED | Lines 28–29 |
| `saveEnabledVerbs` catch (conjugation.js) | `#error` element display | `document.getElementById("error")` | WIRED | Lines 24–25 |
| `games.html` inline script | In-page error message | `if (lives <= 0)` branch | WIRED | Lines 29–33 — wraps entire card innerHTML |
| `coin-dash.html` IIFE | In-page error + return | `insertAdjacentHTML` + `return` | WIRED | Lines 128–133 |
| `jungle-run.html` IIFE | In-page error + return | `insertAdjacentHTML` + `return` | WIRED | Lines 134–139 — inserts after `#overlay-start h2`, not `.card h1` (minor selector deviation from plan; functionally correct) |
| `tower-stack.html` IIFE | In-page error + return | `insertAdjacentHTML` + `return` | WIRED | Lines 126–133 |
| `voices.html` listVoices() | speechSynthesis guard | `if (!('speechSynthesis' in window)) return []` | WIRED | Line 38 — at top of function; returns `[]` (safer than bare `return undefined`) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| BUG-01 | 02-01-PLAN | Quiz back refunds coin on correct answer undo | SATISFIED | `tapvocab.js` line 329 |
| BUG-02 | 02-01-PLAN | iOS/Safari voice loading fallback | SATISFIED (code) | `tapvocab.js` lines 29–41; needs device test |
| BUG-03 | 02-02-PLAN | Game lives in-page error on direct navigation | SATISFIED | All 4 game pages patched; `location.replace("/")` guards removed |
| BUG-04 | 02-02-PLAN | Favicon on all 11 pages | SATISFIED | All 11 pages confirmed |
| BUG-05 | 02-01-PLAN | localStorage quota feedback | SATISFIED | All 3 catch blocks patched |
| BUG-06 | 02-02-PLAN | voices.html crash guard + CONCERNS.md correction | SATISFIED | Guard at line 38; CONCERNS.md corrected |

**Documentation gap:** REQUIREMENTS.md still shows `[ ]` (unchecked) for BUG-03, BUG-04, and BUG-06 at lines 16–18, and the traceability table at lines 69–71 shows "Pending" for all three. This is inconsistent with the implemented code. BUG-01, BUG-02, and BUG-05 are correctly marked `[x]` in REQUIREMENTS.md.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `games/jungle-run.html` | 136 | Hardcoded `#ff6b6b` and `#6ca8ff` colors instead of `var(--error)` and `var(--accent)` | Info | Cosmetic — error message will still display but won't follow theme changes |

No TODO/FIXME/PLACEHOLDER patterns found. No stub implementations. No silent `return null` or empty handlers.

### Human Verification Required

### 1. iOS/Safari Voice Audio (BUG-02)

**Test:** On an iOS device with Safari, open topic.html?cat=Animales and tap any vocabulary word
**Expected:** Audio plays immediately, even if voiceschanged fired before the script ran
**Why human:** iOS/Safari Web Speech API behavior cannot be replicated in a desktop environment

### 2. localStorage Quota Error Display (BUG-05)

**Test:** In DevTools console on topic.html, run `localStorage.setItem('__fill', 'x'.repeat(5000000))`, then star/unstar a word
**Expected:** The `#error` paragraph becomes visible with text "Storage full — changes could not be saved."
**Why human:** Quota exception only triggers in a live browser with real localStorage limits

### 3. Game Direct Navigation Error Display (BUG-03)

**Test:** Open /games/coin-dash.html directly in a browser with no prior sessionStorage; repeat for jungle-run and tower-stack and games.html
**Expected:** In-page error with "No games remaining" text and a home link appears; game loop does not start
**Why human:** Requires browser DOM observation to confirm the message appears and no canvas activity begins

### 4. voices.html in Non-speechSynthesis Browser (BUG-06)

**Test:** Load voices.html in a browser without Web Speech API support (e.g., simulate by overriding before script runs)
**Expected:** Page loads; table is empty; no JavaScript error in console
**Why human:** Requires an environment without speechSynthesis support

### Gaps Summary

There are no code gaps blocking the phase goal. All six bugs are fixed in the codebase.

The only gap is a documentation inconsistency: REQUIREMENTS.md was not updated after plan 02-02 executed. BUG-03, BUG-04, and BUG-06 remain marked as Pending in the requirements file even though the implementing code is confirmed present and wired. This needs a one-line fix per requirement in `.planning/REQUIREMENTS.md`.

Additionally, jungle-run.html uses hardcoded CSS color values in its error message rather than CSS variables — a cosmetic inconsistency that does not affect goal achievement.

---

_Verified: 2026-03-10_
_Verifier: Claude (gsd-verifier)_
