# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Quality MVP

**Shipped:** 2026-03-11
**Phases:** 4 | **Plans:** 12

### What Was Built
- Systematic audit of all 11 app pages — 30+ severity-rated issues documented in CONCERNS.md
- 6 bug fixes: quiz coin refund, iOS/Safari voice loading, game lives guard, favicon (11 pages), localStorage error feedback, voices.html crash guard
- SharedUtils.loadTSV() — eliminated duplicate TSV parsers, single fix point for all TSV parsing
- home.js (from index.html inline scripts) and game-init.js (from 3 copy-pasted game lives guards)
- vocab.html fully integrated into dark theme design system with CoinTracker and Home navigation
- 44px minimum tap targets on all learning interaction buttons; 375px mobile layout verified on all pages

### What Worked
- **Audit-first ordering**: Starting with a full audit before any fixes prevented premature optimization and revealed 8+ issues that would have been missed (scheduleMusic bug turned out to not be a bug, vocab.html was entirely orphaned, etc.)
- **Requirement-to-phase traceability**: Requirements were tightly mapped to phases; completion was unambiguous at every step
- **Atomic commits per task**: Every task produced a focused, reviewable commit — easy to track what changed and why
- **IIFE reuse pattern**: Extracting home.js and game-init.js was clean because the existing codebase already used consistent IIFE conventions
- **Generic TSV loader design**: loadTSV returning unfiltered rows (callers own filtering) was the right abstraction — keeps SharedUtils neutral, avoids over-engineering

### What Was Inefficient
- **ROADMAP.md plans list not updated to "complete" during execution**: Phase 2 showed "1/2 complete" and Phase 4 showed "Plans: TBD" in the progress table — STATE updates and plan checkboxes drifted from actual completion
- **STATE.md percent stuck at 33%** despite 100% completion — the gsd-tools milestone complete command didn't auto-update it correctly
- **Multiple redundant doc commits** (04-03 PLAN.md created then updated in two separate sessions) — planning artifacts sometimes required rework

### Patterns Established
- **Tap target compliance**: Add min-height:44px to each interactive button class individually, never to base .btn (protects compact quiz-nav-row buttons)
- **Canvas game CSS isolation**: Declare :root CSS variables in inline `<style>` block for canvas game pages — do NOT link styles.css (breaks full-screen layout)
- **Generic TSV loading**: All TSV files via SharedUtils.loadTSV; domain filtering inline at call site
- **IIFE module for home-page logic**: All home-page JS in assets/js/home.js; index.html is pure HTML with zero inline JS
- **Shared game initialization**: game-init.js as IIFE exporting window.GameInit — single file for all cross-game initialization helpers

### Key Lessons
1. **Audit before fixing** is worth the investment even for a known codebase — the scheduleMusic false-alarm and vocab.html orphan status would have caused wasted work without it
2. **Rewriting stale docs from scratch beats patching** — CLAUDE.md had too many structural mismatches to patch safely; a fresh rewrite was faster and more accurate
3. **Don't link global CSS to canvas pages** — styles.css body padding/margin is always a layout bomb for full-screen canvas games

### Cost Observations
- Model: claude-sonnet-4-6 (balanced profile)
- Notable: All 12 plans completed in 2 days with no blockers or rollbacks

---

## Milestone: v1.1 — Mobile Polish & Bug Fix

**Shipped:** 2026-03-11
**Phases:** 1 | **Plans:** 2

### What Was Built
- Header spacing fix on sentences.html at 375px (margin-top on .sentence-target)
- Icon-only Home button (🏠) inline with Prev/Reset/Next on both sentences.html and conjugation.html
- Conjugation header made single-row at 375px (flex-shrink adjustments)
- Show mode bug fix in conjugation.js: `flex-wrap: nowrap` on `.controls` scoped to `@media (max-width: 600px)`

### What Worked
- **Tight scoped plans**: Each plan touched 1-2 files with clear before/after criteria
- **Regression catch by scoping CSS**: The bug (v1.1 unintentionally broke browse mode) was caught and deferred cleanly to v1.2 rather than left silent

### What Was Inefficient
- **CSS scope unintended side effect**: Adding `flex-wrap: nowrap` globally to `.controls` in media query broke topic.html browse mode — caught late and required v1.2 to fix

### Key Lessons
1. Scoped CSS changes (add to a new class, not a shared class) prevent cross-page regressions

---

## Milestone: v1.2 — Browse Mode Layout Fix

**Shipped:** 2026-03-11
**Phases:** 1 | **Plans:** 1

### What Was Built
- New `.browse-controls` class on topic.html browse mode container
- CSS restores 4+2 two-row layout at 375px (Row 1: Prev/Next/Show/Star; Row 2: Home/Hear)
- sentences.html and conjugation.html nowrap behavior unaffected

### What Worked
- **Single-file, single-class fix**: Clean isolation with zero risk to other pages
- **Regression testing criterion in plan**: Plan explicitly stated sentences/conjugation must be unaffected — verified

### Key Lessons
1. When fixing a CSS regression, introduce a new scoped class rather than adjusting the shared class again

---

## Milestone: v1.3 — Jungle Run Parrot Stomp

**Shipped:** 2026-03-12
**Phases:** 1 | **Plans:** 1

### What Was Built
- Stomp detection in Jungle Run game loop: `velY > 0 && monkeyY <= pp.y + 4` discriminates fall-from-above from side hit
- Bounce physics: `STOMP_BOUNCE_VEL = -10`, `onGround = false` after stomp
- `playStompSound()`: dual oscillator (800→200Hz sine pop + 120→50Hz triangle thud) — distinct from sawtooth squawk
- Double particle burst at stomp point in parrot body + wing colors
- `score++` on stomp — rewards skill-based play

### What Worked
- **Single-file scope**: Entire mechanic in one HTML file — no cross-file coordination needed
- **Velocity-based discrimination**: Using `velY > 0` as the primary stomp gate was clean and correct — no positional ambiguity
- **Tight tolerance (pp.y + 4)**: Required deliberate jump-on-top; didn't accidentally trigger on grazes
- **10-minute execution**: Plan was precise enough that implementation matched spec exactly with zero deviations

### What Was Inefficient
- None notable — this was a well-scoped, fast phase

### Patterns Established
- **Collision discrimination pattern**: Check velocity direction (`velY > 0`) AND spatial position before classifying collision outcome — applicable to future game enemy types
- **Dual oscillator sound design**: Two oscillators with different waveforms give a percussive, layered sound without requiring audio files

### Key Lessons
1. For single-file game features, tight `velY`-based gates are cleaner than complex hitbox math
2. `break` after collision processing prevents cascade/double-effects in the same frame — always include it when looping over game objects

### Cost Observations
- Model: claude-sonnet-4-6 (balanced profile)
- Notable: 1 plan, ~10 min execution, 0 deviations from plan

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 4 | 12 | First milestone — audit-first quality pass established as pattern |
| v1.1 | 1 | 2 | CSS scope regression introduced — caught and deferred cleanly |
| v1.2 | 1 | 1 | Single-class scoped fix for v1.1 regression |
| v1.3 | 1 | 1 | First game mechanic addition — velocity-based collision discrimination |

### Top Lessons (Verified Across Milestones)

1. **Audit before fixing** — reveals scope more accurately than assumptions
2. **Generic shared utilities beat domain-specific duplication** — SharedUtils pattern scales well
3. **Scoped CSS classes prevent cross-page regressions** — introduce new class rather than modifying shared class
4. **Velocity-based gates are the right primitive for game collision classification** — clean, deterministic, no positional ambiguity
