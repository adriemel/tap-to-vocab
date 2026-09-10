---
status: partial
phase: 14-sentences-stats-fix
source: [14-VERIFICATION.md]
started: 2026-04-17T00:00:00Z
updated: 2026-04-17T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Happy path per-tap increment
expected: Stats panel shows correct count incrementing by 1 after each word tap (1, 2, 3, 4 for a 4-word sentence), not jumping to 1 only at sentence completion
result: [pending]

### 2. Incorrect tap increment
expected: Tapping a wrong word increments the incorrect count by 1 immediately (unchanged behavior)
result: [pending]

### 3. Undo inflation (WR-01 from code review)
expected: Decision needed — undoing a placed word and re-tapping it currently double-counts the correct stat. Accept as known limitation, or apply a `recordedPositions` Set fix?
result: [pending]

### 4. Sentence manager save resets stats (WR-02 from code review)
expected: Decision needed — `initSentenceBuilder()` calls `SessionStats.reset()` on every run including manager-save callbacks, silently wiping stats mid-session. Move reset to `init()` only, or accept?
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
