---
phase: 22
slug: qu-hora-es-time-telling-practice-tool
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-02
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — zero-dependency static site, no test runner, no `package.json`, no CI |
| **Config file** | none — Wave 0 adds a standalone Node script, not a framework |
| **Quick run command** | `node hora-phrase.test.js` (once Wave 0 script exists) |
| **Full suite command** | Manual browser click-through (desktop + mobile) covering all 9 requirements |
| **Estimated runtime** | ~1s (unit script) / ~5 min (manual pass) |

---

## Sampling Rate

- **After every task commit:** For phrase-logic tasks, run `node hora-phrase.test.js` against the 9 worked examples in RESEARCH.md Pattern 1. For UI/dial tasks, no automated check exists — defer to plan wave manual check.
- **After every plan wave:** Full manual click-through in a real browser (desktop + one mobile device/emulator) covering all 9 requirements.
- **Before `/gsd:verify-work`:** All 9 requirements manually verified once; `hora-phrase.test.js` (if created) shows all worked examples passing.
- **Max feedback latency:** ~5 seconds (unit script) / manual pass is the binding constraint for UI/audio requirements.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 22-01-xx | 01 | 1 | HORA-04, HORA-06, HORA-07, HORA-09 | — | N/A | unit | `node hora-phrase.test.js` | ❌ W0 | ⬜ pending |
| 22-01-xx | 01 | 1 | HORA-01 | — | N/A | manual | — (visual/navigation check) | N/A | ⬜ pending |
| 22-02-xx | 02 | 2 | HORA-02, HORA-03 | — | N/A | manual | — (visual + real pointer/touch check) | N/A | ⬜ pending |
| 22-02-xx | 02 | 2 | HORA-05, HORA-08 | — | N/A | manual | — (audio output not scriptable) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `hora-phrase.test.js` (repo root or phase-local scratch location, planner's call) — plain `assert`-based Node script, zero dependencies, asserting the extracted phrase-building function against the 9 worked examples in RESEARCH.md. Optional but cheap (~40 lines); directly de-risks the highest-stakes correctness surface (Spanish grammar rules) in this phase.
- [ ] No fixtures/conftest needed — the function is pure and the test cases are the literal worked-example table in RESEARCH.md.

*If the planner decides the manual worked-example check during implementation is sufficient without a persisted test script, that's consistent with this project's established all-manual-QA precedent (phases 17-21) — the script is a nice-to-have, not a hard requirement.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Home button navigates to clock page | HORA-01 | Navigation/visual, no test framework in repo | Click "Qué hora es?" button on home screen, confirm clock page loads |
| Dials render with correct ranges and respond to drag | HORA-02, HORA-03 | Requires real pointer/touch interaction; no browser automation tooling in this project | Load clock page, drag hour dial through 00–23, drag minute dial through 5-min steps, confirm smartwatch-picker-style behavior |
| CTA speaks the phrase via TTS | HORA-05 | Audio output is not scriptable in this stack | Tap "Qué hora es?", confirm phrase is spoken aloud (Web Speech API) |
| Repeat re-speaks without recompute | HORA-08 | Requires observing that dragging dials after a tap does not affect Repeat's output until CTA is tapped again | Tap CTA, drag dials without re-tapping CTA, tap Repeat, confirm it speaks the previously displayed phrase, not the new dial values |
| Changing dial + re-tapping produces new phrase | HORA-09 | End-to-end UI flow; logic itself is unit-covered but the wiring is not | Set a time, tap CTA, change dials, tap CTA again, confirm new phrase matches new dial values |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s (unit) / manual pass required for UI+audio requirements
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
