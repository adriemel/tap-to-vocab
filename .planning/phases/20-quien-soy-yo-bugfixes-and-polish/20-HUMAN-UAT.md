---
status: partial
phase: 20-quien-soy-yo-bugfixes-and-polish
source: [20-VERIFICATION.md]
started: 2026-05-09T10:00:00Z
updated: 2026-05-09T10:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. TTS fires on first question (no silent start)
expected: Question 1 audio plays within ~500ms of page load in Chrome, without user tap. The startWhenReady() voice-gate should resolve the race condition.
result: [pending]

### 2. Last chat bubble visible above answer strip at 375px
expected: At 375px DevTools width, no chat bubble is hidden behind the fixed .qs-answer-strip at any point during a full playthrough (14 questions).
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
