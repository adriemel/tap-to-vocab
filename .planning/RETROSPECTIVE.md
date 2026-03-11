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

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 4 | 12 | First milestone — audit-first quality pass established as pattern |

### Top Lessons (Verified Across Milestones)

1. **Audit before fixing** — reveals scope more accurately than assumptions
2. **Generic shared utilities beat domain-specific duplication** — SharedUtils pattern scales well
