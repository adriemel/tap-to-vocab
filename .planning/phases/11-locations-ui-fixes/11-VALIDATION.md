---
phase: 11
slug: locations-ui-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual browser testing (no test framework — vanilla static site) |
| **Config file** | none |
| **Quick run command** | `python3 -m http.server 8000` then open locations.html |
| **Full suite command** | Visual inspection in browser at localhost:8000/locations.html |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Load locations.html in browser, verify change visually
- **After every plan wave:** Run full visual check against all 4 success criteria
- **Before `/gsd:verify-work`:** Full visual suite must pass
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | LOC-01 | manual | open locations.html, start game, verify no German text in prompt | ✅ | ⬜ pending |
| 11-01-02 | 01 | 1 | LOC-02 | manual | open locations.html, verify delante-de zone centered on front face, no overlap with debajo-de | ✅ | ⬜ pending |
| 11-01-03 | 01 | 1 | LOC-01+02 | manual | drag to correct zones, verify coins awarded and exercises advance | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements (no test framework in use — static site with manual visual verification).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Prompt shows only Spanish preposition | LOC-01 | Visual UI check; no test framework | Load locations.html, start game, confirm prompt card has no German text |
| delante-de zone centered on front face | LOC-02 | Visual layout check | Load locations.html, compare zone position visually against box front face |
| No overlap between delante-de and debajo-de | LOC-02 | Visual overlap check | Load at multiple viewport widths, confirm no visual overlap |
| Coin awarded on correct zone drop | LOC-01+02 | End-to-end interaction | Drop item on correct zone, confirm coin counter increments |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
