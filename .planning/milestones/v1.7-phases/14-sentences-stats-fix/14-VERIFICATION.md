---
phase: 14-sentences-stats-fix
verified: 2026-04-17T18:30:00Z
status: human_needed
score: 4/4 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Tap words one by one in a 4-word sentence and observe stats panel after each tap"
    expected: "Correct count increments by 1 after each correct word tap (1, 2, 3, 4) — not jumping to 1 only on completion"
    why_human: "Requires a running browser session; can't verify timing of DOM updates and stats panel render programmatically"
  - test: "Tap an incorrect word and observe stats panel"
    expected: "Incorrect count increments by 1 immediately"
    why_human: "Requires interactive browser session to verify live stat update"
  - test: "Tap words 1, 2, 3 correctly in a 5-word sentence, then click word 2's slot to undo words 2 and 3, then re-tap words 2, 3, 4, 5"
    expected: "Stats panel shows 5 correct increments total (not 7 due to undo inflation)"
    why_human: "WR-01 from code review flags a stats-inflation bug with the undo mechanic — needs human to confirm severity and decide if fix is required before shipping"
---

# Phase 14: sentences-stats-fix Verification Report

**Phase Goal:** Fix Build Sentences stats so correct word taps count individually per click, not once per completed sentence — making sentences.js consistent with all other game modes.
**Verified:** 2026-04-17T18:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Each correct word tap in Build Sentences immediately increments the correct count by 1 | ✓ VERIFIED | `SessionStats.record(true)` at line 208, directly after `placedWords.push(word)` in correct-word branch |
| 2 | Tapping an incorrect word increments the incorrect count by 1 (unchanged) | ✓ VERIFIED | `SessionStats.record(false)` at line 196 in wrong-word branch — unchanged |
| 3 | Completing a sentence with N words yields N correct count increments, not 1 | ✓ VERIFIED | `record(true)` is absent from the completion block (lines 237-248); confirmed by grep of `placedWords.length === words.length` block returning no SessionStats matches |
| 4 | Stats board totals reflect word-level interactions, consistent with Fill-in-Blank and Conjugation | ✓ VERIFIED (code path) | Call site matches per-interaction pattern used in fill-blank.js and conjugation.js; final UI verification needs human |

**Score:** 4/4 truths verified (code path)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `assets/js/sentences.js` | `SessionStats.record(true)` called per correct word tap | ✓ VERIFIED | Line 208 — immediately after `placedWords.push(word)` in correct-word branch; exactly 1 occurrence |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| word btn onclick (correct-word branch) | `SessionStats.record(true)` | inline call after `placedWords.push(word)` | ✓ WIRED | Lines 207-208: push then record(true) — pattern matches plan specification |
| word btn onclick (wrong-word branch) | `SessionStats.record(false)` | inline call in wrong-word branch | ✓ WIRED | Line 196 — unchanged from previous implementation |
| sentence-completion block | `SessionStats.record(true)` | (should NOT exist) | ✓ REMOVED | grep of `placedWords.length === words.length` block confirms no SessionStats.record in completion path |

### Data-Flow Trace (Level 4)

Not applicable — this phase modifies a call site location, not a data rendering pipeline. SessionStats is an in-memory object with no async data source to trace.

### Behavioral Spot-Checks

Step 7b: SKIPPED — verification requires a running browser session with interactive word taps. The static code analysis confirms call sites are correctly placed; live behavior is routed to human verification.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| STAT-FIX-01 | 14-01-PLAN.md | In Build Sentences, each correct word click increments the correct count individually (not once per completed sentence), matching per-interaction counting behavior of other modes | ✓ SATISFIED | `SessionStats.record(true)` on line 208 fires per word tap; removed from sentence-completion block |

Note: REQUIREMENTS.md still shows `STAT-FIX-01` as `[ ]` (unchecked) and the traceability table shows "Pending". This is a documentation gap — the implementation is complete but REQUIREMENTS.md was not updated to reflect completion.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `assets/js/sentences.js` | 208 + 214-229 | `record(true)` fires per tap but undo handler (slot.onclick) removes words without reversing stat increments — re-tapping undone words produces duplicate correct credits | ⚠️ Warning | Stats inflate when player uses the undo mechanic; a 4-word sentence can show more than 4 correct credits if words are undone and re-tapped |
| `assets/js/sentences.js` | 153 | `SessionStats.reset()` fires inside `initSentenceBuilder()` which is called both on page load AND on sentence-manager save — stats silently discarded when user saves manager mid-session | ⚠️ Warning | In-progress session stats lost on sentence-manager save with no user feedback |

Neither anti-pattern is a stub or placeholder. They are functional issues introduced by (WR-01) the interaction of the new per-tap recording with the existing undo mechanic, and (WR-02) a pre-existing reset-on-reinit pattern exposed by the new call context. Both were flagged in the code review (14-REVIEW.md). Neither blocks reading the correct call site placement, but WR-01 in particular affects whether the phase goal is fully achieved in the undo scenario.

### Human Verification Required

#### 1. Per-tap stat increment (happy path)

**Test:** Serve the site locally (`python3 -m http.server 8080` from `tap-to-vocab/`). Navigate to `/sentences.html`. Start a sentence with 4 words. Tap each word correctly one at a time. After each tap, open the stats panel (Statistics button).
**Expected:** Correct count shows 1, 2, 3, 4 after each successive correct tap — not remaining at 0 until sentence completion.
**Why human:** Requires live browser interaction; correct-count DOM update timing cannot be verified by static analysis.

#### 2. Incorrect tap stat increment

**Test:** Same session. Tap an incorrect word deliberately.
**Expected:** Incorrect count increments by 1 immediately after the wrong tap.
**Why human:** Requires live browser interaction.

#### 3. Undo inflation (WR-01 from code review)

**Test:** On a 5-word sentence, tap words 1-3 correctly (+3 correct). Click word 2's slot to undo words 2 and 3 (correct count should ideally decrement or hold). Re-tap words 2, 3, 4, 5 to complete the sentence.
**Expected (ideal):** Correct count = 5 (one per unique word position committed).
**Expected (actual with current code):** Correct count = 7 (3 initial + 4 re-taps) — inflated by undo.
**Why human:** Need to decide whether this inflation is an acceptable known limitation or a blocker that requires the `recordedPositions` Set fix described in 14-REVIEW.md WR-01.

#### 4. Stats reset on sentence-manager save (WR-02 from code review)

**Test:** Complete 3 sentences (correct count = 9+). Open the sentence manager via the Manage button. Make no changes, click Save.
**Expected (ideal):** Stats panel still shows the accumulated correct count.
**Expected (actual with current code):** Stats reset to 0/0 silently.
**Why human:** Need to decide whether this is acceptable or requires the one-time reset fix described in 14-REVIEW.md WR-02.

### Gaps Summary

No hard gaps blocking the primary code-path goal. The single `SessionStats.record(true)` call is correctly placed on the per-tap branch, the completion-block call is correctly removed, and `record(false)` is unchanged. STAT-FIX-01 is satisfied at the implementation level.

Two behavioral issues surfaced via code review (14-REVIEW.md) warrant human decision before this phase is considered fully shipped:

1. **WR-01 (undo inflation):** Stats overcounting when player undoes and re-taps words. Fix requires a `recordedPositions` Set guard or reverting to completion-block recording for `record(true)`. The code review provides an exact fix.

2. **WR-02 (manager-save reset):** `SessionStats.reset()` fires on every `initSentenceBuilder()` call including sentence-manager saves, silently discarding in-progress stats. Fix requires moving reset to `init()` only.

REQUIREMENTS.md traceability table still shows STAT-FIX-01 as "Pending" — this should be updated to "Complete" once the human verification items above are resolved.

---

_Verified: 2026-04-17T18:30:00Z_
_Verifier: Claude (gsd-verifier)_
