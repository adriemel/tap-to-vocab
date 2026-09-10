---
phase: 17
slug: numbers-hub-learning-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-28
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual smoke test (no automated test framework — project excludes automated testing) |
| **Config file** | none |
| **Quick run command** | `python3 -m http.server 8000` then verify page in browser |
| **Full suite command** | Manual verification against all 5 success criteria |
| **Estimated runtime** | ~5 minutes manual |

---

## Sampling Rate

- **After every task commit:** Visual check that changed page loads without error in browser
- **After every plan wave:** Full manual smoke test of all 5 success criteria
- **Before `/gsd-verify-work`:** Full suite must pass (all 5 success criteria TRUE)
- **Max feedback latency:** ~5 minutes (manual browser check)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 17-01-01 | 01 | 1 | NUM-01 | — | No URL param injection | manual | n/a — visual check | ❌ W0 | ⬜ pending |
| 17-01-02 | 01 | 1 | NUM-02 | — | N/A | manual | n/a — visual check | ❌ W0 | ⬜ pending |
| 17-01-03 | 01 | 1 | NUM-03 | — | Render item.n and item.es from NUMBERS constant only — never inject raw range param into innerHTML | manual | n/a — check rendered list | ❌ W0 | ⬜ pending |
| 17-01-04 | 01 | 1 | NUM-04 | — | N/A | manual | n/a — click and verify URL | ❌ W0 | ⬜ pending |
| 17-01-05 | 01 | 1 | NUM-08 | — | N/A | manual | n/a — click all nav links | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- No test infrastructure required — project explicitly excludes automated testing (PROJECT.md Out of Scope)

*Existing manual verification approach covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| "Qué número es?" button appears between Locations and Play Games on home | NUM-01 | Static DOM — no automated test runner | Open index.html, visually confirm button position |
| Numbers hub shows 5 range buttons stacked vertically | NUM-02 | Visual layout check | Open numbers.html, confirm 5 buttons in column |
| Learning page lists correct number/Spanish pairs for each range | NUM-03 | Dynamic DOM rendering | Open numbers-learn.html?range=1-20, verify "1 — uno" through "20 — veinte" |
| "Take a Test" button navigates to quiz page with correct ?range param | NUM-04 | Navigation flow | Click button, verify URL includes same range param |
| Home and Back to Numbers links work on all 3 pages | NUM-08 | Multi-page navigation | Click each link on numbers.html, numbers-learn.html, numbers-quiz.html |

---

## Validation Sign-Off

- [ ] All tasks have manual verify steps documented
- [ ] Sampling continuity: visual check after each task commit
- [ ] Wave 0: no test infrastructure needed (manual-only project)
- [ ] No watch-mode flags
- [ ] Feedback latency < 5 min per commit
- [ ] `nyquist_compliant: true` set in frontmatter after execution

**Approval:** pending
