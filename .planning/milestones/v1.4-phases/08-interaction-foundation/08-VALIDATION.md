---
phase: 8
slug: interaction-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — zero-dependency static site; no test runner |
| **Config file** | none |
| **Quick run command** | Open `locations.html` in browser, drag object manually |
| **Full suite command** | Manual verification against success criteria checklist |
| **Estimated runtime** | ~5 minutes manual |

---

## Sampling Rate

- **After every task commit:** Open browser, drag object to each zone + drag to miss (verify snap-back)
- **After every plan wave:** Full success-criteria checklist on both desktop and a real mobile device
- **Before `/gsd:verify-work`:** All 4 phase success criteria must be TRUE

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 8-01-01 | 01 | 1 | GAME-01 | manual | Open locations.html, drag with mouse | ❌ Wave 0 | ⬜ pending |
| 8-01-02 | 01 | 1 | GAME-01 | manual | Open locations.html on phone, drag with finger | ❌ Wave 0 | ⬜ pending |
| 8-01-03 | 01 | 1 | GAME-01 | manual | Touch-drag on mobile, verify no page scroll | ❌ Wave 0 | ⬜ pending |
| 8-01-04 | 01 | 1 | SCEN-01 | manual | Inspect element, verify cursor:grab CSS applied | ❌ Wave 0 | ⬜ pending |
| 8-01-05 | 01 | 1 | SCEN-05 | manual | Drag over each zone, verify zone-hover class applied | ❌ Wave 0 | ⬜ pending |
| 8-01-06 | 01 | 1 | SCEN-05 | manual | Drag away from zone, verify zone-hover removed | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tap-to-vocab/locations.html` — minimal scaffold with draggable + drop zones for manual testing
- [ ] `tap-to-vocab/assets/js/locations.js` — IIFE drag engine module (`window.LocationsGame`)

*No test framework installation required — project uses manual browser testing throughout.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag works with mouse on desktop | GAME-01 | No automated DOM event simulation available | Open locations.html, click-drag object to zone, verify drop result |
| Drag works with finger on mobile | GAME-01 | Touch input requires real device | Open on phone, finger-drag to zone |
| Page does not scroll during touch drag | GAME-01 | touch-action:none must suppress browser default | Touch-drag vertically on mobile; page must not scroll |
| No offset jump on initial grab | GAME-01 | Visual correctness check | Grab element by its edge; element must not snap/jump |
| Drop zones highlight on hover | SCEN-05 | CSS class visual check | Drag over each zone; border/background must change |
| Snap-back on miss | GAME-01 | Animation check | Release over empty space; element must animate back |
| pointercancel treated as miss | GAME-01 | iOS diagonal drag edge case | On iOS, drag diagonally; element must snap back cleanly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 300s (manual browser test)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
