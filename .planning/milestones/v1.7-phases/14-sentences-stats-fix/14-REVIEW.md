---
phase: 14-sentences-stats-fix
reviewed: 2026-04-17T18:00:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - assets/js/sentences.js
findings:
  critical: 0
  warning: 2
  info: 1
  total: 3
status: issues_found
---

# Phase 14: Code Review Report

**Reviewed:** 2026-04-17T18:00:00Z
**Depth:** standard
**Files Reviewed:** 1
**Status:** issues_found

## Summary

The primary change — moving `SessionStats.record(true)` from the sentence-completion block to the per-correct-word-tap branch — is implemented correctly and matches the plan specification exactly. The call sits on line 208, immediately after `placedWords.push(word)`, and is absent from the completion block (lines 238-253). The `record(false)` call on wrong taps (line 196) is untouched.

Two warnings were found: one is a stats-inflation bug introduced by the interaction between the new per-tap recording and the existing word-undo mechanic; the other is a session stats reset that fires on every sentence-manager save, discarding in-progress stats. One info item covers a potential empty-token edge case in sentence tokenization.

## Warnings

### WR-01: Correct-word stats inflate when the player uses the undo mechanic

**File:** `assets/js/sentences.js:208` (also 214-229)

**Issue:** `SessionStats.record(true)` fires on every correct-word tap, but the slot-click undo handler (lines 218-224) removes words from `placedItems` and `placedWords` without reversing the stat increments already recorded for those words. If a player taps words 1, 2, 3 correctly (+3 correct), then clicks word 2's slot to undo words 2 and 3, then re-taps words 2 and 3 (+2 more correct), the final tally is 5 correct for a 3-word sentence. This compounds across multiple undos.

**Fix:** Record the correct stat only once the word is definitively committed (i.e., on sentence completion), or decrement the counter when words are removed. The simplest approach consistent with the plan's intent (one increment per successfully tapped word, matching fill-blank's one-per-answer model) is to track how many times each word-position has been successfully tapped and only record the first correct tap per position:

```javascript
// In loadSentence(), add a Set to track already-recorded positions:
const recordedPositions = new Set();

// In the correct-word branch, replace the bare record(true) with:
placedWords.push(word);
const posIdx = placedWords.length - 1; // index just pushed
if (window.SessionStats && !recordedPositions.has(posIdx)) {
  SessionStats.record(true);
  recordedPositions.add(posIdx);
}

// In the slot onclick undo handler, remove the undone positions from the Set:
const removed = placedItems.splice(itemIndex);
removed.forEach(r => {
  const idx = /* position of r in original words array */ words.indexOf(r.word, itemIndex);
  recordedPositions.delete(idx);
  r.slot.remove();
  r.bankBtn.classList.remove("used");
});
```

Alternatively, record the correct stat only inside the completion block (restoring original behavior) and rely on wrong-tap recording for the per-interaction granularity the plan describes — acknowledging that a "correct stat" means "sentence completed", not "individual word tapped".

---

### WR-02: SessionStats.reset() fires on every sentence-manager save, silently discarding in-progress stats

**File:** `assets/js/sentences.js:153`

**Issue:** `initSentenceBuilder(activeSentences)` is called from two places: initial page load (line 341) and inside the sentence-manager save callback (line 335). Both calls reach line 153 where `if (window.SessionStats) SessionStats.reset()` executes. A user who has completed several sentences, opens the manager to tweak their list, and saves will lose all accumulated stats for that session without any warning.

**Fix:** Either gate the reset so it only runs on the very first call (e.g., using a `hasStarted` flag), or move the reset to the top-level `init()` function where it runs only once at page load:

```javascript
// In init(), before calling initSentenceBuilder for the first time:
if (window.SessionStats) SessionStats.reset();
const activeSentences = getActiveSentences();
initSentenceBuilder(activeSentences);

// Remove line 153 from initSentenceBuilder entirely.
```

This preserves stats across manager-saves while still resetting cleanly on page load.

---

## Info

### IN-01: `sentence.es.split(/\s+/)` may produce a leading empty token if the field has leading whitespace

**File:** `assets/js/sentences.js:167`

**Issue:** `filterSentences` (line 36) trims `w.es` only for the regex test — it does not mutate the stored entry. If a TSV row has a leading space in the `es` column, `sentence.es.split(/\s+/)` returns `["", "word1", ...]` as the first token is empty string. The word bank would render an invisible button and the correct sequence would require matching an empty string first, effectively breaking that sentence.

**Fix:** Trim `sentence.es` at the split site:

```javascript
const words = sentence.es.trim().split(/\s+/);
```

---

_Reviewed: 2026-04-17T18:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
