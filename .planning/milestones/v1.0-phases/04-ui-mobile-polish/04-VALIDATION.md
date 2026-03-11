---
phase: 4
slug: ui-mobile-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — automated testing explicitly out of scope per REQUIREMENTS.md |
| **Config file** | none |
| **Quick run command** | Visual inspection of modified page at 375px viewport in browser |
| **Full suite command** | Open each page in browser, resize to 375px, check for overflow and tap targets |
| **Estimated runtime** | ~5 minutes (manual) |

---

## Sampling Rate

- **After every task commit:** Visually inspect the modified page at 375px viewport
- **After every plan wave:** Full walk-through of all pages at 375px
- **Before `/gsd:verify-work`:** All 6 pages pass visual inspection at both desktop and 375px

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| vocab-style | 01 | 1 | UI-01, UI-02, UI-03, MOB-03 | manual | Visual check vocab.html at 375px + desktop | ❌ N/A | ⬜ pending |
| tap-targets | 01 | 1 | MOB-02 | manual | Browser devtools element inspection for min-height | ❌ N/A | ⬜ pending |
| mobile-grid | 01 | 1 | MOB-01 | manual | Resize to 375px, check grid-two-col wrapping | ❌ N/A | ⬜ pending |
| fill-blank-margin | 01 | 1 | UI-03 | manual | Visual check fill-blank.html header alignment | ❌ N/A | ⬜ pending |
| jungle-run-colors | 01 | 2 | UI-01 | manual | Visual check jungle-run.html overlay buttons | ❌ N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — no test infrastructure is expected for this project. Verification is manual.

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All pages use CSS variables | UI-01 | No CSS test framework; static site | Open each page at desktop width, check elements match dark theme |
| Every page has home/back nav | UI-02 | Navigation presence requires visual + click test | Open each page, confirm home/back button visible and functional |
| No misalignment at desktop | UI-03 | Layout correctness is visual | Inspect header row, buttons, and content areas on each page |
| Usable at 375px | MOB-01 | Responsive layout requires viewport resize | Resize browser to 375px, confirm no content is cut off |
| 44px tap targets | MOB-02 | CSS min-height requires devtools measurement | Inspect .word-btn, .choice-btn, .btn-wrong, .btn-correct height in devtools |
| No horizontal scroll at 375px | MOB-03 | Overflow requires visual + scroll test | Resize to 375px, attempt horizontal scroll on each page |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 300s (5 min manual review per wave)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
