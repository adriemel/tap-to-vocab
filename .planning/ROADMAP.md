# Roadmap: Tap-to-Vocab

## Milestones

- ✅ **v1.0 Quality MVP** — Phases 1-4 (shipped 2026-03-11)
- ✅ **v1.1 Mobile Polish & Bug Fix** — Phase 5 (shipped 2026-03-11)
- ✅ **v1.2 Browse Mode Layout Fix** — Phase 6 (shipped 2026-03-11)
- ✅ **v1.3 Jungle Run Parrot Stomp** — Phase 7 (shipped 2026-03-12)
- ✅ **v1.4 Locations** — Phases 8-10 (shipped 2026-03-15)
- ✅ **v1.5 Locations Bug Fixes** — Phase 11 (shipped 2026-03-15)
- ✅ **v1.6 Polish & Stats** — Phases 12-13 (shipped 2026-04-13)
- 🔄 **v1.7 Stats Fix** — Phase 14 (in progress)

## v1.6 Phases

<details>
<summary>✅ v1.6 Polish & Stats (Phases 12-13) — SHIPPED 2026-04-13</summary>

### Phase 12: Homepage & Visual Tweaks

**Goal:** Consolidate Tiempo/Idiomas under the Palabras section and lighten the global background color.

**Requirements:** HOME-01, VIS-01

**Success criteria:**
1. Homepage displays Tiempo and Idiomas buttons visually grouped within the Palabras section — no longer as standalone rows
2. Global `--bg` CSS variable value is perceptibly lighter; dark theme is preserved but less oppressive
3. No layout regressions at 375px mobile width

---

### Phase 13: Session Statistics

**Goal:** Add a live per-session stats board (correct/incorrect + accuracy %) to Build Sentences, Verbs, Fill-in-Blank, and Locations — accessible via a button during the session and auto-shown at session end.

**Requirements:** STATS-01, STATS-02, STATS-03, STATS-04

**Plans:** 4 plans

Plans:
- [x] 13-01-PLAN.md — Create stats.js module + add stats modal/button/script-tag to all 4 game HTML pages
- [x] 13-02-PLAN.md — Wire SessionStats into sentences.js and conjugation.js
- [x] 13-03-PLAN.md — Wire SessionStats into fill-blank.js and locations.js
- [x] 13-04-PLAN.md — Manual smoke-test checkpoint across all 4 games

**Success criteria:**
1. Correct/incorrect counts and accuracy % update in real time as the user answers in each of the four modes
2. A "Statistics" button is visible in each mode's UI and opens the stats board without losing session state
3. Stats board appears automatically when a session completes (all exercises done) with final correct/incorrect and accuracy %
4. Starting a new round (replay/restart) resets all counts to zero — no stats persist between rounds

</details>

## v1.7 Phases

### Phase 14: sentences-stats-fix

**Goal:** Fix Build Sentences stats so correct word taps count individually per click, not once per completed sentence — making sentences.js consistent with all other game modes.

**Depends on:** Phase 13

**Requirements:** STAT-FIX-01

**Success Criteria** (what must be TRUE):
  1. Tapping each correct word in Build Sentences increments the correct count by 1 immediately — stats update word-by-word, not sentence-by-sentence
  2. Tapping an incorrect word still increments the incorrect count by 1 per tap (unchanged behavior)
  3. After completing a sentence with N correct word taps, the correct count has increased by N (not by 1)
  4. Stats board totals in Build Sentences are proportional to the number of word interactions, consistent with Fill-in-Blank, Conjugation, and Locations

**Plans:** 1 plan

Plans:
- [ ] 14-01-PLAN.md — Move SessionStats.record(true) from sentence-completion block to correct-word-tap branch

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

<details>
<summary>✅ v1.5 Locations Bug Fixes (Phase 11) — SHIPPED 2026-03-15</summary>

- [x] Phase 11: Locations UI Fixes (1/1 plan) — completed 2026-03-15

Full details: `.planning/milestones/v1.5-ROADMAP.md`

</details>

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
| 11. Locations UI Fixes | v1.5 | 1/1 | Complete | 2026-03-15 |
| 12. Homepage & Visual Tweaks | v1.6 | 1/1 | Complete | 2026-04-12 |
| 13. Session Statistics | v1.6 | 4/4 | Complete | 2026-04-13 |
| 14. sentences-stats-fix | v1.7 | 0/1 | Not started | - |
