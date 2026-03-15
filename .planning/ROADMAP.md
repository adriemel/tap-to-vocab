# Roadmap: Tap-to-Vocab

## Milestones

- ✅ **v1.0 Quality MVP** — Phases 1-4 (shipped 2026-03-11)
- ✅ **v1.1 Mobile Polish & Bug Fix** — Phase 5 (shipped 2026-03-11)
- ✅ **v1.2 Browse Mode Layout Fix** — Phase 6 (shipped 2026-03-11)
- ✅ **v1.3 Jungle Run Parrot Stomp** — Phase 7 (shipped 2026-03-12)
- ✅ **v1.4 Locations** — Phases 8-10 (shipped 2026-03-15)
- 🚧 **v1.5 Locations Bug Fixes** — Phase 11 (in progress)

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

<details>
<summary>✅ v1.4 Locations (Phases 8-10) — SHIPPED 2026-03-15</summary>

- [x] Phase 8: Interaction Foundation (1/1 plan) — completed 2026-03-14
- [x] Phase 9: Scene Layout (1/1 plan) — completed 2026-03-14
- [x] Phase 10: Game Loop & Integration (2/2 plans) — completed 2026-03-15

Full details: `.planning/milestones/v1.4-ROADMAP.md`

</details>

### ✅ v1.5 Locations Bug Fixes (SHIPPED 2026-03-15)

**Milestone Goal:** Fix two visual/UX bugs in locations.html — remove German from the prompt header and correct the delante-de drop zone position.

#### Phase 11: Locations UI Fixes

**Plans:** 1/1 plans complete

- [x] 11-01-PLAN.md — Hide German prompt text and reposition delante-de zone

## Phase Details

### Phase 11: Locations UI Fixes
**Goal**: Users see a clean Spanish-only prompt and all drop zones are correctly positioned without overlap
**Depends on**: Phase 10 (v1.4 complete)
**Requirements**: LOC-01, LOC-02
**Success Criteria** (what must be TRUE):
  1. The prompt card shows only the Spanish preposition — no German translation text is visible at any point during a game session
  2. The "delante de" drop zone is visually centered in front of the box's front face
  3. The "delante de" zone does not visually overlap the "debajo de" zone at any viewport size the game supports
  4. Dragging the object onto the correct zone still awards a coin and advances the exercise for both affected zones
**Plans**: 1 plan

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
| 8. Interaction Foundation | v1.4 | 1/1 | Complete | 2026-03-14 |
| 9. Scene Layout | v1.4 | 1/1 | Complete | 2026-03-14 |
| 10. Game Loop & Integration | v1.4 | 2/2 | Complete | 2026-03-15 |
| 11. Locations UI Fixes | v1.5 | Complete    | 2026-03-15 | 2026-03-15 |
