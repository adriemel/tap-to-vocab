---
phase: 9
slug: scene-layout
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — zero-dependency static site; no test runner |
| **Config file** | none |
| **Quick run command** | Open `tap-to-vocab/locations.html` in browser; verify 10 zones visible |
| **Full suite command** | Manual visual check on 375px viewport (DevTools iPhone 12 Pro emulation or real device) |
| **Estimated runtime** | ~2 minutes manual |

---

## Sampling Rate

- **After every task commit:** Open locations.html in browser; visually confirm all 10 zones visible and non-overlapping
- **After every plan wave:** Full criteria checklist on 375px viewport
- **Before `/gsd:verify-work`:** All 4 Phase 9 success criteria must be TRUE
- **Max feedback latency:** ~2 minutes (manual browser check)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | SCEN-02 | manual | Open locations.html; count `[data-zone]` elements = 10 | ❌ Wave 0 | ⬜ pending |
| 09-01-02 | 01 | 1 | SCEN-02 | manual | Drag to each of the 10 zones; confirm drop callback fires | ❌ Wave 0 | ⬜ pending |
| 09-01-03 | 01 | 1 | SCEN-02 | manual | DevTools inspect each zone; computed height/width >= 44px | ❌ Wave 0 | ⬜ pending |
| 09-01-04 | 01 | 1 | SCEN-03 | manual | View detrás de and delante de; depth cue visible without reading labels | ❌ Wave 0 | ⬜ pending |
| 09-01-05 | 01 | 1 | SCEN-04 | manual | View cerca/al lado/lejos zones; near vs far visually distinct without labels | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tap-to-vocab/locations.html` — replace 2-zone scaffold with 10-zone full scene
- [ ] No new JS files required — `locations.js` is unchanged; all zones use existing `[data-zone]` contract

*No test framework to install — project uses manual browser testing throughout.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All 10 zones visible, no overlap | SCEN-02 | Visual layout — no DOM test can verify spatial non-overlap | Open locations.html at 375px; inspect all 10 zones are visible and non-overlapping |
| detrás de visually distinguishable from delante de | SCEN-03 | Visual perception — requires human judgment | View both zones; confirm depth/shadow cue is perceivable without reading labels |
| cerca/al lado/lejos occupy distinct distance bands | SCEN-04 | Visual perception — requires human judgment | View three zones; cover labels; can you tell near from adjacent from far? |
| 44px touch target on all zones | SCEN-02 | Touch target size — DevTools required | DevTools → Inspect each zone → Computed tab → height/width >= 44px |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
