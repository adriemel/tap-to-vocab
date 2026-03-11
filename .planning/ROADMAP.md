# Roadmap: Tap-to-Vocab

## Milestones

- ✅ **v1.0 Quality MVP** — Phases 1-4 (shipped 2026-03-11)
- 🚧 **v1.1 Mobile Polish & Bug Fix** — Phase 5 (in progress)

## Phases

<details>
<summary>✅ v1.0 Quality MVP (Phases 1-4) — SHIPPED 2026-03-11</summary>

- [x] Phase 1: Audit (3/3 plans) — completed 2026-03-10
- [x] Phase 2: Bug Fixes (2/2 plans) — completed 2026-03-10
- [x] Phase 3: Code Cleanup (4/4 plans) — completed 2026-03-10
- [x] Phase 4: UI & Mobile Polish (3/3 plans) — completed 2026-03-11

Full details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v1.1 Mobile Polish & Bug Fix (In Progress)

**Milestone Goal:** Fix mobile layout issues on sentences and conjugation pages and repair the Show mode regression in verb conjugation so every interaction works correctly on a 375px viewport.

- [ ] **Phase 5: Mobile UI Polish & Bug Fix** - Fix layout, nav buttons, and Show mode on sentences and conjugation pages

## Phase Details

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
| 5. Mobile UI Polish & Bug Fix | v1.1 | 0/2 | Not started | - |
