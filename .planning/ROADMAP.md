# Roadmap: Tap-to-Vocab Quality Milestone

## Overview

This milestone addresses quality, not growth. The work moves in a deliberate order: first audit to find everything broken, then fix actual bugs, then clean up structural debt, then unify the visual and mobile experience. Each phase delivers a verifiable improvement to the app's reliability and polish.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Audit** - Systematically document all broken functionality and issues across every page (completed 2026-03-10)
- [ ] **Phase 2: Bug Fixes** - Eliminate all broken functionality found in audit and CONCERNS.md
- [ ] **Phase 3: Code Cleanup** - Remove duplication and extract structure for maintainability
- [ ] **Phase 4: UI & Mobile Polish** - Consistent visual style and correct mobile layout on all pages

## Phase Details

### Phase 1: Audit
**Goal**: Every page has been tested and all broken functionality, layout issues, and code quality problems are documented
**Depends on**: Nothing (first phase)
**Requirements**: AUDT-01
**Success Criteria** (what must be TRUE):
  1. A written issue list exists covering every page in the app
  2. Each issue has a severity rating and a clear description of the broken behavior
  3. No page has been skipped — vocab, quiz, sentences, conjugation, fill-blank, games hub, and all three mini-games are covered
  4. CONCERNS.md is updated with any issues found beyond what was already documented
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Audit learning pages: index.html, topic.html, sentences.html, conjugation.html, fill-blank.html
- [ ] 01-02-PLAN.md — Audit standalone pages: vocab.html, voices.html
- [ ] 01-03-PLAN.md — Audit games cluster: games.html, coin-dash.html, jungle-run.html, tower-stack.html

### Phase 2: Bug Fixes
**Goal**: All identified broken functionality is fixed — coins, voice, game navigation, favicon, and storage errors all behave correctly
**Depends on**: Phase 1
**Requirements**: BUG-01, BUG-02, BUG-03, BUG-04, BUG-05, BUG-06
**Success Criteria** (what must be TRUE):
  1. Using the back button in quiz mode after a correct answer removes the coin that was awarded for that answer
  2. Tapping a vocabulary word on iOS/Safari speaks the word aloud — no silent failure, even if a Spanish voice is unavailable
  3. Navigating directly to a game URL (e.g., /games/coin-dash.html) starts the game with valid lives, not a broken state
  4. No favicon 404 appears in the browser console on any page
  5. If localStorage quota is exceeded, the user sees a visible error message rather than a silent no-op
  6. All additional broken behaviors discovered during audit are resolved
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Fix JS logic bugs: coin refund on back (BUG-01), iOS voice loading (BUG-02), localStorage error feedback (BUG-05)
- [ ] 02-02-PLAN.md — Fix structural bugs: game lives silent redirect (BUG-03), favicon on all pages (BUG-04), voices.html crash guard + CONCERNS.md correction (BUG-06)

### Phase 3: Code Cleanup
**Goal**: Duplicated TSV parsing and inline scripts are consolidated — the codebase has one place for each shared concern
**Depends on**: Phase 2
**Requirements**: STRCT-01, STRCT-02, STRCT-03, STRCT-04
**Success Criteria** (what must be TRUE):
  1. fill-blank.js and conjugation.js load TSV data through SharedUtils — no standalone TSV loaders outside SharedUtils
  2. index.html contains no inline script blocks — coin display and reset button logic live in a dedicated JS file
  3. All three mini-games share a single game-lives initialization function — the sessionStorage fallback logic is not copy-pasted across files
  4. CLAUDE.md files accurately describe the current architecture (SharedUtils, CoinTracker, script load order) with no references to old patterns
**Plans**: 4 plans

Plans:
- [ ] 03-01-PLAN.md — Add SharedUtils.loadTSV() and remove standalone TSV loaders from fill-blank.js and conjugation.js (STRCT-01)
- [ ] 03-02-PLAN.md — Extract index.html inline scripts to home.js (STRCT-02)
- [ ] 03-03-PLAN.md — Extract game lives guard to game-init.js and update all three game files (STRCT-03)
- [ ] 03-04-PLAN.md — Update CLAUDE.md to accurately reflect current architecture (STRCT-04)

### Phase 4: UI & Mobile Polish
**Goal**: Every page looks consistent and is fully usable on a 375px mobile screen with no overflow or misalignment
**Depends on**: Phase 3
**Requirements**: UI-01, UI-02, UI-03, MOB-01, MOB-02, MOB-03
**Success Criteria** (what must be TRUE):
  1. Every page uses the established CSS variables (--bg, --card, --ink, --accent, etc.) with no one-off color or spacing overrides that break visual consistency
  2. Every page has a visible, working back or home navigation control — a user is never stranded on a page
  3. No page has misaligned elements, inconsistent padding, or mismatched font sizes visible at desktop size
  4. All pages are fully usable at 375px viewport width with no content cut off or overlapping
  5. All interactive elements (buttons, flip cards, word tiles) have tap targets of at least 44px height and width
  6. No page produces horizontal scroll at 375px width
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Audit | 3/3 | Complete   | 2026-03-10 |
| 2. Bug Fixes | 1/2 | In Progress|  |
| 3. Code Cleanup | 0/4 | Not started | - |
| 4. UI & Mobile Polish | 0/TBD | Not started | - |
