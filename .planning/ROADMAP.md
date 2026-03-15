# Roadmap: Tap-to-Vocab

## Milestones

- ✅ **v1.0 Quality MVP** — Phases 1-4 (shipped 2026-03-11)
- ✅ **v1.1 Mobile Polish & Bug Fix** — Phase 5 (shipped 2026-03-11)
- ✅ **v1.2 Browse Mode Layout Fix** — Phase 6 (shipped 2026-03-11)
- ✅ **v1.3 Jungle Run Parrot Stomp** — Phase 7 (shipped 2026-03-12)
- ✅ **v1.4 Locations** — Phases 8-10 (shipped 2026-03-15)

## Phases

<details>
<summary>✅ v1.0 Quality MVP (Phases 1-4) — SHIPPED 2026-03-11</summary>

- [x] Phase 1: Audit (3/3 plans) — completed 2026-03-10
- [x] Phase 2: Bug Fixes (2/2 plans) — completed 2026-03-10
- [x] Phase 3: Code Cleanup (4/4 plans) — completed 2026-03-10
- [x] Phase 4: UI & Mobile Polish (3/3 plans) — completed 2026-03-11

Full details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v1.1 Mobile Polish & Bug Fix (Phase 5) — SHIPPED 2026-03-11</summary>

- [x] Phase 5: Mobile UI Polish & Bug Fix (2/2 plans) — completed 2026-03-11

Full details: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>✅ v1.2 Browse Mode Layout Fix (Phase 6) — SHIPPED 2026-03-11</summary>

- [x] Phase 6: Browse Mode Layout Fix (1/1 plan) — completed 2026-03-11

Full details: `.planning/milestones/v1.2-ROADMAP.md`

</details>

<details>
<summary>✅ v1.3 Jungle Run Parrot Stomp (Phase 7) — SHIPPED 2026-03-12</summary>

- [x] Phase 7: Parrot Stomp Mechanic (1/1 plan) — completed 2026-03-12

Full details: `.planning/milestones/v1.3-ROADMAP.md`

</details>

### ✅ v1.4 Locations (Shipped 2026-03-15)

**Milestone Goal:** A drag-and-drop spatial prepositions game teaching 10 Spanish location expressions via interactive placement of a draggable object relative to a reference box. Works on both desktop and mobile (Pointer Events API).

- [x] **Phase 8: Interaction Foundation** - Working drag-and-drop on mouse and touch using Pointer Events API (completed 2026-03-14)
- [x] **Phase 9: Scene Layout** - Complete visual scene with reference box and 9 distinct, correctly positioned drop zones (completed 2026-03-14)
- [x] **Phase 10: Game Loop & Integration** - Fully playable game with exercise sequencing, feedback, progress, and home navigation (completed 2026-03-15)

## Phase Details

### Phase 8: Interaction Foundation
**Goal**: Users can drag an object with their finger or mouse and receive correct/wrong feedback on drop
**Depends on**: Nothing (first v1.4 phase)
**Requirements**: GAME-01, SCEN-01, SCEN-05
**Success Criteria** (what must be TRUE):
  1. User can pick up the draggable object on both desktop (mouse) and mobile (touch/finger) without the page scrolling during drag
  2. The draggable object follows the pointer precisely during drag, with no jarring offset jump from initial tap point
  3. Drop zones highlight visually when the dragged object is hovering over them
  4. Releasing the object on a zone triggers a hit detection result (correct or incorrect); releasing outside any zone returns the object to its origin
**Plans**: 1 plan

Plans:
- [x] 08-01-PLAN.md — Pointer Events drag engine (locations.js IIFE + locations.html test scaffold)

### Phase 9: Scene Layout
**Goal**: The scene correctly represents all 10 prepositions with unambiguous, visually distinct drop zones on a 375px mobile screen
**Depends on**: Phase 8
**Requirements**: SCEN-02, SCEN-03, SCEN-04
**Success Criteria** (what must be TRUE):
  1. A reference box ("la caja") is centered in the scene and all 10 preposition drop zones are visible and correctly positioned around it without overlap
  2. The "detrás de" zone has a depth or shadow visual treatment that distinguishes it from "delante de" — a user who reads neither label can see one is in front and one is behind
  3. The "cerca de", "al lado de", and "lejos de" zones occupy visually distinct distance bands — a user can tell near from adjacent from far without reading the labels
  4. Every drop zone has a minimum 44px touch target on a 375px-wide screen
**Plans**: 1 plan

Plans:
- [x] 09-01-PLAN.md — 10-zone scene layout (reference box, drop zones, detrás depth cue, distance band trio, visual checkpoint)

### Phase 10: Game Loop & Integration
**Goal**: Users can play through all 10 prepositions in sequence, receive feedback, track progress, and reach the completion screen — accessible from the home page
**Depends on**: Phase 9
**Requirements**: GAME-02, GAME-03, GAME-04, GAME-05, GAME-06, NAV-01, NAV-02
**Success Criteria** (what must be TRUE):
  1. User sees a prompt card with the Spanish preposition and German translation; dropping the object on the correct zone plays success sound, triggers confetti, and awards a coin
  2. User sees an error message and the object snaps back to origin when dropped on the wrong zone
  3. User sees a progress badge (e.g., "3 / 10") that updates after each correct drop or skip
  4. User can skip the current preposition and advance to the next without being stuck
  5. User reaches a completion screen with celebration feedback when all 10 prepositions are done, and can navigate home from any point in the game
**Plans**: 2 plans

Plans:
- [x] 10-01-PLAN.md — Scene gap fixes (cerca-de zone, detrás depth cue, touch targets, labels) + locations.js game loop (EXERCISES, startGame, loadExercise, checkDrop, advanceExercise, showCompletion)
- [x] 10-02-PLAN.md — locations.html game page shell (prompt card, header, controls, script order) + index.html Locations button + styles.css .btn-locations rule

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Audit | v1.0 | 3/3 | Complete | 2026-03-10 |
| 2. Bug Fixes | v1.0 | 2/2 | Complete | 2026-03-10 |
| 3. Code Cleanup | v1.0 | 4/4 | Complete | 2026-03-10 |
| 4. UI & Mobile Polish | v1.0 | 3/3 | Complete | 2026-03-11 |
| 5. Mobile UI Polish & Bug Fix | v1.1 | 2/2 | Complete | 2026-03-11 |
| 6. Browse Mode Layout Fix | v1.2 | 1/1 | Complete | 2026-03-11 |
| 7. Parrot Stomp Mechanic | v1.3 | 1/1 | Complete | 2026-03-12 |
| 8. Interaction Foundation | 1/1 | Complete   | 2026-03-14 | - |
| 9. Scene Layout | v1.4 | 0/1 | Not started | - |
| 10. Game Loop & Integration | 2/2 | Complete   | 2026-03-15 | - |
