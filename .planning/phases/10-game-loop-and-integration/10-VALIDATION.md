---
phase: 10
slug: game-loop-and-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — zero-dependency static site; no test runner |
| **Config file** | none |
| **Quick run command** | Open `tap-to-vocab/locations.html` in browser; drop on correct zone; verify feedback |
| **Full suite command** | Manual playthrough of all 10 exercises on 375px viewport (DevTools device emulation) |
| **Estimated runtime** | ~5 minutes (manual) |

---

## Sampling Rate

- **After every task commit:** Open locations.html in browser; confirm drag engine still works and game state updates
- **After every plan wave:** Full manual playthrough of all 10 exercises on 375px viewport
- **Before `/gsd:verify-work`:** All 7 Phase 10 success criteria AND all remaining Phase 9 gaps resolved
- **Max feedback latency:** 5 minutes (manual browser test)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 0 | SCEN-02, SCEN-03, SCEN-04 | manual | Open locations.html; verify 10 zones visible, cerca-de present, detras-de dashed, all zones ≥44px | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | GAME-02 | manual | Drop on correct zone; verify success sound plays, confetti bursts, #coin-counter increments | ❌ W0 | ⬜ pending |
| 10-01-03 | 01 | 1 | GAME-03 | manual | Drop on wrong zone; verify #feedback text shows "Falsch!", draggable snaps back to origin | ❌ W0 | ⬜ pending |
| 10-01-04 | 01 | 1 | GAME-04 | manual | After each correct drop/skip, verify #progress-badge updates (e.g., "2 / 10") | ❌ W0 | ⬜ pending |
| 10-01-05 | 01 | 1 | GAME-05 | manual | Click Skip; verify currentIndex advances, no coin awarded, back button enabled | ❌ W0 | ⬜ pending |
| 10-01-06 | 01 | 1 | GAME-06 | manual | Complete all 10 exercises; verify confetti burst and completion message with "🎉 All 10 done!" | ❌ W0 | ⬜ pending |
| 10-02-01 | 02 | 1 | NAV-01 | manual | Open index.html; confirm "📍 Locations" button visible, full-width, links to /locations.html | ❌ W0 | ⬜ pending |
| 10-02-02 | 02 | 1 | NAV-02 | manual | From locations.html click Home; verify redirect to /. Click Back after 1 exercise; verify returns to exercise 1 | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tap-to-vocab/locations.html` — add cerca-de zone div, fix 4 touch targets to min 44px, apply zone-detras depth cue (dashed border + box-shadow), add zone labels
- [ ] `tap-to-vocab/assets/js/locations.js` — add EXERCISES constant, game state vars (currentIndex, history, advanceTimer), and new public functions: startGame(), loadExercise(), checkDrop(), advanceExercise(), showCompletion()
- [ ] `tap-to-vocab/locations.html` — add prompt card (#prompt-card, #prompt-es, #prompt-de), header with #coin-counter + #progress-badge, controls (.controls with #btn-back, #btn-skip, #btn-home), #feedback div; update script load order; add `<script>LocationsGame.startGame();</script>`
- [ ] `tap-to-vocab/index.html` — add `.btn-locations` anchor to .grid-two-col, below .btn-fill-blank
- [ ] `tap-to-vocab/assets/css/styles.css` — add .btn-locations rule (grid-column: 1/-1, dark gradient, accent border)

*(No automated test infrastructure needed — project uses manual browser testing throughout)*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Correct drop triggers success sound, confetti, coin | GAME-02 | Web Audio API + DOM animation — no headless runner | Open locations.html; drop draggable on correct zone; listen for C5-E5-G5 chime; check confetti; verify #coin-counter increments by 1 |
| Wrong drop shows error, snaps back | GAME-03 | DOM state + CSS transition — no headless runner | Drop on wrong zone; verify #feedback shows "Falsch!"; verify draggable animates back to origin (0.25s ease) |
| Progress badge updates | GAME-04 | DOM text update | Check #progress-badge text after each action: should show "N / 10" where N = exercises completed + 1 |
| Skip advances without coin | GAME-05 | Coin state is localStorage | Click Skip; verify #progress-badge increments; open DevTools > Application > localStorage > confirm coins unchanged |
| Completion screen with celebration | GAME-06 | confettiBurst + DOM replacement | Complete all 10; verify confetti fires, #prompt-card replaced with "🎉 All 10 done!" message, Skip button hidden |
| Locations button on home page | NAV-01 | Visual layout check | Load index.html; confirm "📍 Locations" button spans full grid width below "Fill in" button |
| Home + Back navigation | NAV-02 | Browser navigation | Click Home from locations.html; confirm lands on /. Complete 2 exercises; click Back; confirm returns to exercise 2 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5 minutes
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
