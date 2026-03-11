# Tap-to-Vocab

## What This Is

Tap-to-Vocab is a Spanish vocabulary learning web app deployed as a static site on GitHub Pages at tapvocab.fun. It offers multiple practice modes — vocab browse/quiz, sentence building, verb conjugation, and fill-in-blank exercises — plus a coin-reward system with mini-games. No backend, no framework, no build step. As of v1.0, the app is fully audited, all known bugs are fixed, and every page uses a consistent dark theme and mobile layout.

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
- ✓ All pages audited for broken functionality and mobile layout issues — v1.0
- ✓ All medium/high severity bugs fixed (coin refund, iOS voice, game lives, favicon, localStorage) — v1.0
- ✓ Duplicated TSV parsing consolidated (SharedUtils.loadTSV) — v1.0
- ✓ Consistent visual style across all pages using CSS variables — v1.0
- ✓ Navigation clarity — every page has back or home control — v1.0
- ✓ Mobile/responsive layout verified correct on all pages at 375px — v1.0
- ✓ 44px minimum tap targets on all learning interaction buttons — v1.0
- ✓ CLAUDE.md updated to accurately reflect current architecture — v1.0

### Active

- [ ] TSV caching with revalidation strategy instead of cache: "no-store"
- [ ] Service worker for offline fallback
- [ ] Coin economy upper cap — prevent unrealistic accumulation
- [ ] User state using stable IDs (not text strings) — survives vocabulary edits

### Out of Scope

- New game modes or features — maintain quality-first approach before growth
- ESM modules / build pipeline — not worth the migration cost for this project size
- Authentication / user accounts — by design, single-user public app
- Backend or server — static-only, GitHub Pages
- Automated testing suite — not justified for project size

## Context

- Stack: Vanilla HTML/CSS/JS, no framework, no build step
- Pattern: IIFE modules exporting to `window`, manual `<script>` load ordering
- Data: TSV files fetched at runtime (`cache: "no-store"`)
- State: localStorage for coins/practice list/settings; sessionStorage for game lives
- JS modules: coins.js → game-init.js (games only) → shared-utils.js → [page js]
- Known debt: in-game scores (mini-games) not connected to CoinTracker; user state keyed by text strings
- v1.0 codebase: ~6,350 LOC across 11 HTML pages + 8 JS modules + 1 CSS file
- All known bugs fixed; CONCERNS.md accurately reflects remaining lower-priority issues

## Constraints

- **Tech stack**: Vanilla HTML/CSS/JS only — no framework, no bundler, no Node in production
- **Deployment**: GitHub Pages static hosting — no server-side logic possible

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Audit before fixing | Don't assume scope — find all issues systematically | ✓ Good — revealed 8+ issues not previously documented |
| Keep IIFE pattern | Migration to ESM not worth cost for project size | ✓ Good — refactoring stayed clean, no friction |
| Consolidate TSV loaders into SharedUtils | Reduces duplication, single place to fix future TSV changes | ✓ Good — SharedUtils.loadTSV now generic for fill-blank + conjugation |
| scheduleMusic in loop() is correct iOS keepalive | Code review confirmed it's not a per-frame scheduling bug | ✓ Good — CONCERNS.md corrected |
| :root CSS variables inline in jungle-run.html | Linking styles.css would break full-screen canvas layout | ✓ Good — established pattern for canvas game pages |
| min-height:44px on specific button classes, not .btn globally | .btn used for compact quiz-nav-row buttons too | ✓ Good — quiz compact buttons preserved |
| home.js IIFE wraps both original script blocks | reset-coins was outside DOMContentLoaded, consolidating is safe | ✓ Good — cleaner, single listener |
| CLAUDE.md rewritten from scratch | Too many stale structural claims to safely patch in-place | ✓ Good — accurate docs for all future sessions |

---
*Last updated: 2026-03-11 after v1.0 milestone*
