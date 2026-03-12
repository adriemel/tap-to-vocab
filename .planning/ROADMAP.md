# Roadmap: Tap-to-Vocab

## Milestones

- ✅ **v1.0 Quality MVP** — Phases 1-4 (shipped 2026-03-11)
- ✅ **v1.1 Mobile Polish & Bug Fix** — Phase 5 (shipped 2026-03-11)
- ✅ **v1.2 Browse Mode Layout Fix** — Phase 6 (shipped 2026-03-11)
- 🚧 **v1.3 Jungle Run Parrot Stomp** — Phase 7 (in progress)

## Phases

<details>
<summary>✅ v1.0 Quality MVP (Phases 1-4) — SHIPPED 2026-03-11</summary>

- [x] Phase 1: Audit (3/3 plans) — completed 2026-03-10
- [x] Phase 2: Bug Fixes (2/2 plans) — completed 2026-03-10
- [x] Phase 3: Code Cleanup (4/4 plans) — completed 2026-03-10
- [x] Phase 4: UI & Mobile Polish (3/3 plans) — completed 2026-03-11

Full details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### ✅ v1.1 Mobile Polish & Bug Fix (Shipped 2026-03-11)

**Milestone Goal:** Fix mobile layout issues on sentences and conjugation pages and repair the Show mode regression in verb conjugation so every interaction works correctly on a 375px viewport.

- [x] **Phase 5: Mobile UI Polish & Bug Fix** - Fix layout, nav buttons, and Show mode on sentences and conjugation pages (completed 2026-03-11)

### ✅ v1.2 Browse Mode Layout Fix (Shipped 2026-03-11)

**Milestone Goal:** Fix the browse mode button layout regression on topic.html (categories) introduced by v1.1 — restore two-row control layout so all 6 buttons fit on 375px viewports without overflow.

- [x] **Phase 6: Browse Mode Layout Fix** — Fix browse mode nav controls to display in two rows at 375px (completed 2026-03-11)

### 🚧 v1.3 Jungle Run Parrot Stomp (In Progress)

**Milestone Goal:** Add a stomp mechanic to Jungle Run — when the monkey lands on top of a flying parrot while descending, the parrot is destroyed and the monkey bounces upward to continue running.

- [x] **Phase 7: Parrot Stomp Mechanic** — Implement stomp detection, collision discrimination, bounce, and feedback in jungle-run.html (completed 2026-03-12)

## Phase Details

### Phase 7: Parrot Stomp Mechanic
**Goal**: Players can stomp parrots by landing on them from above — destroying the parrot, bouncing upward, and receiving immediate feedback — while side/head-on collisions still end the game
**Depends on**: Phase 6
**Requirements**: STOMP-01, STOMP-02, STOMP-03, STOMP-04
**Success Criteria** (what must be TRUE):
  1. When the monkey is falling (moving downward) and lands on a parrot, the parrot disappears and the game continues — no game over screen
  2. When the monkey hits a parrot from the side or head-on, the game over screen appears as before
  3. After stomping a parrot, the monkey visibly bounces upward before resuming normal physics
  4. A particle explosion appears at the parrot's location immediately when stomped
  5. A distinct sound plays on stomp that is audibly different from the normal death/collision sound
**Plans**: 1 plan

Plans:
- [ ] 07-01-PLAN.md — jungle-run.html: stomp collision discrimination, bounce, sound, particles (STOMP-01, STOMP-02, STOMP-03, STOMP-04)

### Phase 6: Browse Mode Layout Fix
**Goal**: Users can access all browse mode controls on topic.html at 375px without overflow — Prev/Next/Show/Star on row 1, Home/Hear on row 2
**Depends on**: Phase 5
**Requirements**: BRWS-01
**Success Criteria** (what must be TRUE):
  1. On topic.html browse mode at 375px, Row 1 shows Prev, Next, Show, Star (✩) — 4 buttons side by side with no overflow
  2. On topic.html browse mode at 375px, Row 2 shows Home (🏠) and Hear (▶︎) — 2 buttons with no overflow
  3. sentences.html and conjugation.html nav rows are unaffected — still single row, no wrapping
**Plans**: 1 plan

Plans:
- [x] 06-01-PLAN.md — topic.html browse mode: fix two-row button layout (BRWS-01)

### Phase 5: Mobile UI Polish & Bug Fix
**Goal**: Users can navigate and practice on sentences and conjugation pages without layout breakage or mode-switching bugs on mobile
**Depends on**: Phase 4
**Requirements**: UI-01, UI-02, UI-03, UI-04, BUG-01
**Success Criteria** (what must be TRUE):
  1. On sentences.html at 375px, visible spacing exists between the page header and the game panel — they are not cramped together
  2. On sentences.html, the Home button appears inline with Prev/Reset/Next and shows only a house icon (no text label)
  3. On conjugation.html at 375px, the header row (gear icon, title, coin badge, verb count) fits on one line with no text wrapping
  4. On conjugation.html, the Home button appears inline with Prev/Reset/Next and shows only a house icon (no text label)
  5. On conjugation.html, switching Practice → Show → Practice → Show displays verb conjugations correctly every time (no blank Show screen)
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md — sentences.html: header spacing + icon-only Home button (UI-01, UI-02)
- [x] 05-02-PLAN.md — conjugation.html: header fit + icon-only Home buttons + Show mode bug fix (UI-03, UI-04, BUG-01)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Audit | v1.0 | 3/3 | Complete | 2026-03-10 |
| 2. Bug Fixes | v1.0 | 2/2 | Complete | 2026-03-10 |
| 3. Code Cleanup | v1.0 | 4/4 | Complete | 2026-03-10 |
| 4. UI & Mobile Polish | v1.0 | 3/3 | Complete | 2026-03-11 |
| 5. Mobile UI Polish & Bug Fix | v1.1 | 2/2 | Complete | 2026-03-11 |
| 6. Browse Mode Layout Fix | v1.2 | 1/1 | Complete | 2026-03-11 |
| 7. Parrot Stomp Mechanic | 1/1 | Complete   | 2026-03-12 | - |
