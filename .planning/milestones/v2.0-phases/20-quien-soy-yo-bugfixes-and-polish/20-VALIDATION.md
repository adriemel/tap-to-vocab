---
phase: 20
slug: quien-soy-yo-bugfixes-and-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-09
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — zero-dependency static site |
| **Config file** | none |
| **Quick run command** | `python3 -m http.server 8000` (serve, then check in browser) |
| **Full suite command** | manual browser verification (see below) |
| **Estimated runtime** | ~3 minutes manual check |

---

## Sampling Rate

- **After every task commit:** Open quien-soy.html in browser and verify the specific fix
- **After every plan wave:** Run full manual verification checklist
- **Before `/gsd-verify-work`:** All manual-only verifications must pass

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Fix | Automated Command | Status |
|---------|------|------|-----|-------------------|--------|
| 20-01-01 | 01 | 1 | TTS first question | `grep "voicesLoaded\|_voicesLoaded" quien-soy.html` | ⬜ pending |
| 20-01-02 | 01 | 1 | Skip button HTML | `grep -c "qs-skip" quien-soy.html` | ⬜ pending |
| 20-01-03 | 01 | 1 | Skip button JS | `grep "onSkipTap\|skipBtn" quien-soy.html` | ⬜ pending |
| 20-01-04 | 01 | 1 | Mobile padding fix | `grep "safe-area-inset-bottom" assets/css/styles.css` | ⬜ pending |
| 20-01-05 | 01 | 1 | End-screen column layout | `grep "flex-direction.*column" assets/css/styles.css` | ⬜ pending |
| 20-01-06 | 01 | 1 | Typo fix (también) | `grep "también" data/quien-soy-sentences.txt` | ⬜ pending |

---

## Wave 0 Requirements

None — no test framework to install. Verification is via grep commands and browser inspection.

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| TTS speaks on first question load | Web Speech API timing is browser-dependent | Open quien-soy.html fresh (no cache); confirm audio plays for first question without tapping |
| Skip button advances without adding to paragraph | No automated test for audio/state | Tap Skip on Q1; verify Q2 appears, paragraph on end screen omits Q1 answer |
| No scroll/overlap at 375px on iOS | Requires real device or Safari devtools | DevTools → responsive → iPhone SE; check answer strip doesn't cover last bubble |
| End-screen buttons stack cleanly at 375px | Visual layout | DevTools → responsive → 375px; verify 3 buttons are full-width stacked |
| `también` renders with accent in bubble | Encoding visual | Advance to row 14 (last question); confirm bubble shows "también" not "tambien" |
| Paragraph reads correctly via Replay after mixed choices | Audio | Go through all 14 Qs; tap Replay on end screen; confirm reading matches shown text |

---

## Validation Sign-Off

- [ ] All tasks have grep-verifiable acceptance criteria
- [ ] Manual browser check covers all 6 fixes
- [ ] No watch-mode flags
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
