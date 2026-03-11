---
phase: 02
slug: bug-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — automated testing is explicitly out of scope (REQUIREMENTS.md) |
| **Config file** | none |
| **Quick run command** | Manual browser verification (see Manual-Only Verifications below) |
| **Full suite command** | Manual browser check of all 6 bug fixes across affected pages |
| **Estimated runtime** | ~10 minutes full pass |

---

## Sampling Rate

- **After every task commit:** Manual spot-check the specific fix in browser DevTools
- **After every plan wave:** Full manual pass across all 6 requirements
- **Before `/gsd:verify-work`:** All 6 requirements verified manually
- **Max feedback latency:** ~2 minutes per fix

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | BUG-01 | manual | n/a | n/a | ⬜ pending |
| 02-01-02 | 01 | 1 | BUG-02 | manual | n/a | n/a | ⬜ pending |
| 02-01-03 | 01 | 1 | BUG-05 | manual | n/a | n/a | ⬜ pending |
| 02-02-01 | 02 | 1 | BUG-03 | manual | n/a | n/a | ⬜ pending |
| 02-02-02 | 02 | 1 | BUG-04 | manual | n/a | n/a | ⬜ pending |
| 02-02-03 | 02 | 1 | BUG-06 | manual | n/a | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — no test infrastructure needed for this phase (testing is explicitly out of scope per REQUIREMENTS.md).

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Back button in quiz mode refunds 1 coin | BUG-01 | No test framework | Open topic.html, enter quiz, get correct answer, press back — coin counter must decrease by 1 |
| First word tap on iOS speaks Spanish | BUG-02 | iOS device required | Test on iOS Safari — tap vocabulary word, confirm audio plays |
| Direct game URL shows error, not redirect | BUG-03 | Browser navigation required | Open /games/coin-dash.html without sessionStorage set — must see error message + home link |
| No favicon 404 in console on any page | BUG-04 | DevTools inspection | Open each page in browser, check Network tab — no 404 for favicon |
| localStorage quota exceeded shows message | BUG-05 | Manual quota fill | Fill localStorage to quota, trigger save — must see visible error text |
| voices.html loads in non-speechSynthesis browser | BUG-06 | Browser environment required | Open voices.html with speechSynthesis disabled or in unsupported browser — page must load without crash |

---

## Validation Sign-Off

- [ ] All tasks have manual verify instructions above
- [ ] Sampling continuity: each fix checked immediately after commit
- [ ] Wave 0: N/A (no test infrastructure needed)
- [ ] No watch-mode flags
- [ ] Feedback latency < 2 min per fix
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
