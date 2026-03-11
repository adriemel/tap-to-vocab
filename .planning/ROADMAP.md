# Roadmap: Tap-to-Vocab

## Milestones

- ✅ **v1.0 Quality MVP** — Phases 1-4 (shipped 2026-03-11)
- ✅ **v1.1 Mobile Polish & Bug Fix** — Phase 5 (shipped 2026-03-11)
- 🚧 **v1.2 Browse Mode Layout Fix** — Phase 6 (in progress)

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

### 🚧 v1.2 Browse Mode Layout Fix (In Progress)

**Milestone Goal:** Fix the browse mode button layout regression on topic.html (categories) introduced by v1.1 — restore two-row control layout so all 6 buttons fit on 375px viewports without overflow.

- [x] **Phase 6: Browse Mode Layout Fix** — Fix browse mode nav controls to display in two rows at 375px (completed 2026-03-11)

## Phase Details

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
- [ ] 06-01-PLAN.md — topic.html browse mode: fix two-row button layout (BRWS-01)

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
- [ ] 05-01-PLAN.md — sentences.html: header spacing + icon-only Home button (UI-01, UI-02)
- [ ] 05-02-PLAN.md — conjugation.html: header fit + icon-only Home buttons + Show mode bug fix (UI-03, UI-04, BUG-01)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Audit | v1.0 | 3/3 | Complete | 2026-03-10 |
| 2. Bug Fixes | v1.0 | 2/2 | Complete | 2026-03-10 |
| 3. Code Cleanup | v1.0 | 4/4 | Complete | 2026-03-10 |
| 4. UI & Mobile Polish | v1.0 | 3/3 | Complete | 2026-03-11 |
| 5. Mobile UI Polish & Bug Fix | v1.1 | 2/2 | Complete | 2026-03-11 |
| 6. Browse Mode Layout Fix | 1/1 | Complete   | 2026-03-11 | — |
