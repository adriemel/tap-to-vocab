---
phase: 13
slug: session-statistics
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-12
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — zero-dependency static site, no test runner |
| **Config file** | none |
| **Quick run command** | Manual browser smoke test (open page, answer questions, check stats overlay) |
| **Full suite command** | Manual smoke across all 4 game pages |
| **Estimated runtime** | ~5 minutes manual |

This project has no automated test infrastructure. CLAUDE.md confirms: "There is no build, lint, or test command."

---

## Sampling Rate

- **After every task commit:** Grep-verify acceptance criteria (exact strings in files)
- **After every plan wave:** Grep-verify all acceptance criteria for completed plans
- **Before `/gsd-verify-work`:** Manual browser smoke test across all 4 games
- **Max feedback latency:** Immediate (file-based grep checks)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|--------|
| 13-01-01 | 01 | 1 | STATS-01, STATS-04 | N/A | grep | `grep -c "SessionStats" tap-to-vocab/assets/js/stats.js` | ⬜ pending |
| 13-01-02 | 01 | 1 | STATS-01, STATS-02 | N/A | grep | `grep -c "stats-modal" tap-to-vocab/sentences.html` | ⬜ pending |
| 13-01-03 | 01 | 1 | STATS-02 | N/A | grep | `grep -c "stats.js" tap-to-vocab/sentences.html` | ⬜ pending |
| 13-02-01 | 02 | 2 | STATS-01, STATS-02, STATS-03, STATS-04 | N/A | grep | `grep -c "SessionStats.record" tap-to-vocab/assets/js/sentences.js` | ⬜ pending |
| 13-02-02 | 02 | 2 | STATS-01, STATS-02, STATS-03, STATS-04 | N/A | grep | `grep -c "SessionStats.record" tap-to-vocab/assets/js/conjugation.js` | ⬜ pending |
| 13-03-01 | 03 | 2 | STATS-01, STATS-02, STATS-03, STATS-04 | N/A | grep | `grep -c "SessionStats.record" tap-to-vocab/assets/js/fill-blank.js` | ⬜ pending |
| 13-03-02 | 03 | 2 | STATS-01, STATS-02, STATS-03, STATS-04 | N/A | grep | `grep -c "SessionStats.record" tap-to-vocab/assets/js/locations.js` | ⬜ pending |
| 13-04-01 | 04 | 3 | STATS-01, STATS-02, STATS-03, STATS-04 | N/A | manual | Human checkpoint — browser smoke test | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework installation needed — verification is file-based grep checks + manual browser smoke testing.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Counts update in real time on correct/wrong answer | STATS-01 | No automated DOM/event testing | Open each game, answer right and wrong, verify counter values update in stats panel |
| Stats button opens panel mid-session | STATS-02 | Requires browser interaction | Click Stats button mid-session, verify panel opens, close, verify game continues |
| Panel auto-opens at session end | STATS-03 | Requires completing a session | Complete all exercises in each game, verify stats panel auto-shows with final counts |
| Counts reset on new round | STATS-04 | Requires replay flow | Complete session, note counts, reload/restart, verify panel shows 0/0/100% |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` grep verify or are manual-only with documented test instructions
- [x] No Wave 0 dependencies — no test infrastructure to install
- [x] Grep-verifiable acceptance criteria on every auto task
- [x] Manual checkpoint (plan 04) covers behavioral STATS-01 through STATS-04
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
