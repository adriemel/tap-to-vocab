# Tap-to-Vocab

## What This Is

Tap-to-Vocab is a Spanish vocabulary learning web app deployed as a static site on GitHub Pages at tapvocab.fun. It offers multiple practice modes — vocab browse/quiz, sentence building, verb conjugation, and fill-in-blank exercises — plus a coin-reward system with mini-games. No backend, no framework, no build step.

## Core Value

Every interaction must work correctly and feel polished so nothing interrupts the learning flow. Bugs and inconsistency erode trust in a learning tool.

## Requirements

### Validated

- ✓ Vocabulary browsing by category with Spanish TTS pronunciation — existing
- ✓ Quiz mode with flip cards and coin rewards — existing
- ✓ Sentence building game — existing
- ✓ Verb conjugation practice — existing
- ✓ Fill-in-blank grammar exercises — existing
- ✓ Coin economy (earn, spend, track via localStorage) — existing
- ✓ Games hub with 3 mini-games (Coin Dash, Jungle Run, Tower Stack) — existing
- ✓ Shared utilities (SharedUtils, CoinTracker) — existing
- ✓ Multi-page static site, zero external dependencies — existing

### Active

- [ ] Audit all pages for broken functionality and mobile layout issues
- [ ] Fix all medium/high severity bugs identified in audit + CONCERNS.md
- [ ] Eliminate duplicated TSV parsing logic (fill-blank.js, conjugation.js → SharedUtils)
- [ ] Consistent visual style across all pages (spacing, typography, color usage)
- [ ] Navigation clarity — easy to move between pages and modes
- [ ] Mobile/responsive layout works correctly on all pages
- [ ] Fix known bugs: back-button coin refund, Web Speech API reliability, game-lives fragility, missing favicon
- [ ] Update stale CLAUDE.md files to reflect current architecture

### Out of Scope

- New game modes or features — this milestone is quality, not growth
- ESM modules / build pipeline — not worth the migration cost for this project size
- Authentication / user accounts — by design, single-user public app
- Backend or server — static-only, GitHub Pages

## Context

- Stack: Vanilla HTML/CSS/JS, no framework, no build step
- Pattern: IIFE modules exporting to `window`, manual `<script>` load ordering
- Data: TSV files fetched at runtime (`cache: "no-store"`)
- State: localStorage for coins/practice list/settings; sessionStorage for game lives
- Known debt: duplicated TSV loaders in fill-blank.js and conjugation.js, inline scripts in index.html, stale CLAUDE.md
- Known bugs: documented in `.planning/codebase/CONCERNS.md`

## Constraints

- **Tech stack**: Vanilla HTML/CSS/JS only — no framework, no bundler, no Node in production
- **Deployment**: GitHub Pages static hosting — no server-side logic possible
- **No new features**: scope is strictly quality improvement and bug fixing

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Audit before fixing | Don't assume scope — find all issues systematically | — Pending |
| Keep IIFE pattern | Migration to ESM not worth cost for project size | — Pending |
| Consolidate TSV loaders into SharedUtils | Reduces duplication, single place to fix future TSV changes | — Pending |

---
*Last updated: 2026-03-10 after initialization*
