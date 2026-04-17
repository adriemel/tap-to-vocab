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
- ✓ Mobile layout fixed on sentences.html and conjugation.html at 375px — v1.1
- ✓ Show mode regression in verb conjugation repaired — v1.1
- ✓ Browse mode button layout restored to two-row layout at 375px — v1.2
- ✓ Parrot stomp mechanic added to Jungle Run (fall-from-above kills parrot, bounces monkey) — v1.3
- ✓ Stomp collision discrimination: side/head-on still triggers game over — v1.3
- ✓ Distinct stomp audio and particle explosion feedback — v1.3
- ✓ Locations drag-and-drop game (locations.html + locations.js) with Pointer Events API — v1.4
- ✓ 9 spatial drop zones around reference box with detrás-de depth cue and distance band — v1.4
- ✓ Game loop: 10-exercise sequence, success/error feedback, coin awards, progress badge, completion screen — v1.4
- ✓ Locations button on home screen — v1.4
- ✓ Locations prompt shows Spanish-only — German translation hidden (LOC-01) — v1.5
- ✓ delante-de drop zone correctly positioned without overlapping debajo-de (LOC-02) — v1.5
- ✓ debajo-de blob given isometric perspective tilt (skewX -34deg) for visual depth — v1.5

- ✓ Statistics board (correct/incorrect + accuracy %) in all four learning modes — v1.6
- ✓ Statistics button in each mode, auto-shown at session end — v1.6
- ✓ Homepage: "Tiempo" and "Idiomas" moved under "Palabras" section — v1.6
- ✓ Shuffle verified in all learning modes — v1.6

### Active

- [ ] Build Sentences stats: count each correct word click individually, not once per completed sentence (STAT-FIX-01)

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
- v1.4 codebase: ~6,820 LOC — added locations.html (265 LOC) + locations.js (201 LOC)
- All known bugs fixed; CONCERNS.md accurately reflects remaining lower-priority issues
- Game count: 4 mini-games (Coin Dash, Jungle Run, Tower Stack) + 4 learning games (Sentences, Conjugation, Fill-in-Blank, Locations)

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
| Stomp zone tolerance `pp.y + 4` (not full half-height `pp.y + 8`) | Requires deliberate jump-on-top, not accidental graze | ✓ Good — skill-based without being punishing |
| `break` after stomp collision block | Prevents multi-parrot processing in one frame | ✓ Good — no double-effects or cascade kills |
| `score++` on stomp | Simple reward for skill, consistent with banana scoring | ✓ Good — no separate bonus mechanic needed |
| Dual oscillator stomp sound (sine pop + triangle thud) | Single oscillator wasn't distinct enough from squawk | ✓ Good — audibly differentiated from death sound |
| Pointer Events API (not HTML5 DnD) for drag | HTML5 DnD API doesn't fire on iOS Safari touch | ✓ Good — single code path for mouse + touch |
| CSS-positioned divs (not canvas) for drop zones | Native touch targets, CSS transitions, no frame loop needed | ✓ Good — 44px targets easy to verify and adjust |
| Inline EXERCISES constant (not TSV) | 10 prepositions are a fixed closed set; no fetch latency | ✓ Good — zero async complexity |
| entre excluded from prepositions set | Requires two reference objects; single-box layout constraint | ✓ Good — clean MVP boundary, noted in REQUIREMENTS |
| cerca-de merged into al-lado-de zone (final) | Added separately, labeled, then merged in fix commit — labels cluttered scene and two zones confused users | ✓ Good — 9 zones cleaner than 10 in practice |
| gameHistory (not history) variable name | window.history built-in shadowing would silently break Back navigation | ✓ Good — naming discipline prevents subtle bug |
| display:none on #prompt-de (not DOM removal) | Minimal targeted change; removes German text without restructuring prompt card HTML | ✓ Good — LOC-01 fixed in one attribute change |
| Zone geometry via math comment in CSS (not magic numbers) | Self-documenting: box geometry comment shows x-center=140 calculation for delante-de left:111 | ✓ Good — future zone adjustments are reasoned not guessed |

### Deferred

- TSV caching with revalidation strategy instead of cache: "no-store"
- Service worker for offline fallback
- Coin economy upper cap — prevent unrealistic accumulation
- User state using stable IDs (not text strings) — survives vocabulary edits

---
## Current Milestone: v1.7 Stats Fix

**Goal:** Fix the word-click counting asymmetry in Build Sentences stats so correct taps count per word (matching all other modes).

**Target features:**
- Fix sentences.js: move SessionStats.record(true) from sentence-completion to per-correct-word-click

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-17 after v1.7 milestone started*
