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

## Milestone: v1.4 — Locations

**Shipped:** 2026-03-15
**Phases:** 3 (8-10) | **Plans:** 4

### What Was Built
- Pointer Events drag engine (locations.js IIFE) with `setPointerCapture`, grab-offset tracking, hide/elementFromPoint/unhide zone detection — mouse + touch with no page scroll
- 9 CSS-positioned drop zones around a centered reference box; detrás-de depth cue (dashed border + inset box-shadow); spatial distance band (lejos far upper-right, cerca/al-lado near-right)
- Game loop: 10-exercise `EXERCISES` constant, `checkDrop()` with coin + confetti feedback, progress badge, skip, completion screen
- Home page Locations button wired with `.btn-locations` CSS matching full-width button pattern

### What Worked
- **Pointer Events API choice**: A single code path for mouse and touch was the right call — no separate touch event handlers needed, iOS Safari drag without page scroll just works
- **CSS div zones (not canvas)**: Native 44px touch targets, CSS transitions for hover highlights, no frame-loop complexity — exactly the right abstraction for a turn-based game
- **Phase 10 fixing Phase 9 gaps explicitly**: Verifier found Phase 9 gaps; Plan 10-01 was scoped specifically to fix them before adding game logic — clean sequential resolution
- **`EXERCISES` as inline constant**: No fetch latency, no async error handling — 10 fixed prepositions don't need a TSV file

### What Was Inefficient
- **Phase 9 generated many fix commits** (6 fix commits for scene layout): The initial scene layout had multiple spatial/sizing iterations before settling. A more iterative visual-checkpoint-first approach (open browser first, adjust) would have reduced this cycle
- **cerca-de zone added, then merged twice**: Plan added it as separate zone, labeled, then a fix commit merged it back into al-lado-de. The final design decision (merged) should have been the starting assumption

### Patterns Established
- **Drag engine pattern**: `setPointerCapture` + grab offset on `pointerdown`; `position:fixed` during drag (viewport coords match clientX/clientY without scroll math); `pointercancel` treated as `pointerup` for iOS diagonal-drag safety
- **Zone hit detection pattern**: Hide draggable → `elementFromPoint(clientX, clientY)` → unhide draggable → walk up DOM to find `[data-zone]` — cleaner than coordinate overlap math
- **CSS ::before for visual blob + div for touch target**: Visual and interactive surface are separate, enabling independent sizing. Zone label below with `.zone-label` absolute span

### Key Lessons
1. **For CSS spatial layouts on mobile, open the browser first** — absolute positioning on small screens requires visual iteration that static analysis cannot replace
2. **Merge design decisions early**: If cerca-de and al-lado-de represent the same spatial concept for the user, define it as one zone from the start; don't build-then-merge
3. **`pointercancel` safety is free**: Always add `pointercancel` handler identical to `pointerup` — costs one line, prevents iOS diagonal-drag from leaving ghost state

### Cost Observations
- Model: claude-sonnet-4-6 (balanced profile)
- Notable: Phase 9 generated 6 fix commits vs 2 for Phase 10 — scene layout requires more visual iteration than logic implementation

---

## Milestone: v1.5 — Locations Bug Fixes

**Shipped:** 2026-03-15
**Phases:** 1 | **Plans:** 1

### What Was Built
- `#prompt-de` hidden with `display:none`; JS line removed from `loadExercise()` — Spanish-only prompt (LOC-01)
- delante-de zone repositioned to `left:111px, top:295px` — centered on box front face (x=140), 1px clear of debajo-de bottom (LOC-02)
- debajo-de blob given `skewX(-34deg)` + outline border — matches encima-de's isometric perspective style (polish addition, not in original plan)

### What Worked
- **Exact interface context in the plan**: Plan included precise line numbers, before/after code snippets, and computed geometry (x-center=140, debajo-de bottom=294px) — implementation was mechanical with zero exploration needed
- **Human checkpoint for visual verification**: Code-level checks (grep) caught LOC-01/02 automatically; human visual check caught UX nuances that automated checks can't (tilt, visual separation feel)
- **Targeted display:none over DOM restructuring**: Hiding the element in place was safer than removing it — no risk of breaking JS references

### What Was Inefficient
- **Out-of-band polish iteration**: The debajo-de blob tilt went through 3 CSS iterations (rotate → skewX → size adjustment) outside the formal plan. A visual design decision checkpoint before implementation would have saved the iteration cycles

### Patterns Established
- **Zone geometry comment as documentation**: Inline CSS comment with box geometry math (`// x-center = (100+180)/2 = 140`) makes spatial reasoning explicit — no magic numbers
- **display:none + remove JS population**: For hiding a UI element that's still populated by JS, always do both: hide in CSS AND remove the JS assignment to avoid dead data writes

### Key Lessons
1. **Plan-level precision pays off for visual bugs** — exact coordinates computed in the plan (not during execution) make CSS fixes mechanical
2. **Visual CSS iteration needs a design decision first** — knowing the desired tilt style before touching code avoids multiple commits for the same property

### Cost Observations
- Model: claude-sonnet-4-6 (balanced profile)
- Notable: ~15 min execution for 2-file, 2-req milestone; 3 CSS iterations for blob polish outside plan scope

---

## Milestone: v1.8 — Content & Settings

**Shipped:** 2026-04-24
**Phases:** 2 | **Plans:** 2

### What Was Built
- 6 new verbs appended to verbs.tsv (saber, hacer, beber, vivir, entender, comer) — conjugation pool 13 → 19
- Per-category checkbox filter in Build Sentences — replaces 50+ individual sentence toggles with ~8 category checkboxes
- `getCategoryFilter`/`saveCategoryFilter` with `localStorage["sentenceCategories"]`, try/catch quota handling

### What Worked
- **Data-only phase is the fastest possible phase**: Phase 15 required zero JS/HTML changes — conjugation.js already loaded TSV rows dynamically. Pure data-entry with grep-based verification ran in minutes
- **Category-keyed filter design**: Using category names from allSentences (not from localStorage) as the index means tampered localStorage is silently ignored — security came for free from the architecture
- **XSS safety by default**: Rendering category labels via `label.textContent` instead of `innerHTML` required no extra effort but closed the XSS vector completely

### What Was Inefficient
- **Code reviewer checked wrong path**: The static-site repo has files at both root level (`assets/js/sentences.js`) and in an untracked `tap-to-vocab/` subdirectory. The reviewer checked the untracked copy and filed a false-positive critical finding. The orchestrator caught and dismissed it, but required a manual explanation
- **REQUIREMENTS.md checkboxes not auto-updated**: Both DATA-02 and SENT-01 were complete but remained unchecked — the gsd-tools traceability update didn't fire. Required manual correction at milestone close

### Patterns Established
- **Category-filter pattern**: `categories[]` built from `allSentences`, `filterMap` loaded from storage, missing keys default to `true` — additive opt-out model means new content is always visible by default
- **Independent localStorage keys for refactored features**: New `sentenceCategories` key alongside old `enabledSentences` — no migration needed, no user data loss, no rollback risk

### Key Lessons
1. **Data-only phases are zero-risk**: When the app already has a generic loader, adding vocabulary is just TSV rows — no code path to break
2. **Untracked subdirectories in a repo confuse static analysis tools** — document the authoritative file locations prominently (done in CLAUDE.md)
3. **Opt-out defaults protect new content**: Defaulting new categories to `true` means vocabulary additions are immediately usable without user action

### Cost Observations
- Model: claude-sonnet-4-6 (balanced profile)
- Notable: Both phases completed in a single session on the same day — small, well-scoped milestone with no dependencies to wait on

---

## Milestone: v2.1 — Qué Hora Es?

**Shipped:** 2026-08-02
**Phases:** 1 | **Plans:** 4

### What Was Built
- `buildTimePhrase(hour24, minute)` — pure, dual-exported (window/CommonJS) Spanish time-grammar engine, with a 12-case + 288-state invariant Node test (`hora-phrase.test.js`) — the project's first automated test
- `hora.html` — standalone clock page: two reel-picker dials (hour 00–23, minute in 5-min steps), colon separator, CTA, phrase card
- Pointer Events reel-drag: value-model (integer index + closure pixel remainder), 40px/step, wraparound both directions, active-drag highlight
- Spanish TTS wiring reusing the project's Monica-voice pattern; Repeat button sentinel-isolated in source to guarantee it never recomputes from live dial state

### What Worked
- **Isolating the highest-risk logic as a pure, tested function first**: The grammar engine (traditional Spanish time phrasing has two well-documented pitfalls — period-from-wrong-hour, Es-la/Son-las-from-wrong-hour) shipped with zero bugs because it was built and proven in Wave 1, before any UI touched it in Wave 2/3
- **Sequential single-plan waves with explicit dependency chains**: Each of the 4 plans built cleanly on the prior wave's DOM/state contract (documented in each plan's `<interfaces>` block) — zero cross-plan wiring gaps, zero rework
- **Sentinel comments for behavior isolation**: Bracketing the Repeat handler with `// --- repeat-handler-start/end ---` let both the plan's own acceptance gate and the code reviewer mechanically prove it never recomputes — a cheap technique worth reusing anywhere "must never touch X" is a hard requirement
- **Reusing an established pattern (locations.js Pointer Events, tapvocab.js TTS block) instead of inventing new ones**: Both ported almost verbatim, and both worked correctly on the first human UAT pass

### What Was Inefficient
- **The scheduled `gsd-verifier` subagent hit an account session-usage limit mid-run** and had to be completed inline by the orchestrator instead — not a process failure, but a reminder that agent-spawn cost adds up over a 4-wave + code-review + verification sequence in one session
- **`git log --grep` without anchoring the search pattern matched an unrelated historical commit** twice during this milestone (once computing the code-review diff base, once computing milestone timeline stats) — cost a few minutes each time to notice the polluted date/file range and recompute from the actual `test(22-01):`-prefixed commit instead
- **The CLI's `milestone.complete` and `phase.complete` roadmap/requirement scans pulled in two already-shipped-but-never-archived phases (17, 18)** into v2.1's stats and MILESTONES.md entry, because those phase directories were still sitting unarchived in `.planning/phases/` from a prior milestone close that skipped the phase-archival step — required manual correction of the auto-generated milestone entry

### Patterns Established
- **Dual-export pure-logic modules for correctness-critical grammar/calculation code**: `window.X` + `module.exports` in one IIFE lets the same file be both the shipped browser module and the Node-testable unit — zero build step, zero test framework, full coverage
- **Value-model drag state (index + pixel remainder in a closure), not scroll-position-derived**: Second confirmed use after `locations.js`'s discrete drag-and-drop — now the established pattern for any future draggable/scrollable custom control in this codebase
- **Sentinel-comment isolation for "must never call X" handlers**: A reusable technique for any interaction where an automated gate needs to mechanically prove absence of a specific function call inside a specific block

### Key Lessons
1. **Pure functions with their own test file are worth the departure from "zero automated tests"** when the logic has enough hidden pitfalls (here: 2 documented grammar traps) that manual-only verification would likely have missed an edge case
2. **`git log --all --grep="<plan-id>"` is not safe for computing date ranges or diff bases** in a repo with enough history — always verify the matched commit's date/subject before trusting it as a boundary; prefer anchored patterns like `--grep="(22-01)"` or `--grep="^test(22-01)"`
3. **Un-archived phase directories from a prior milestone silently pollute the next milestone's auto-generated stats** — worth an explicit `/gsd:cleanup` pass before starting a new milestone if a prior close skipped phase archival
4. **A single-phase milestone still benefits from the full completion ceremony** (code review, verification, retrospective) — the overhead was small and it caught 3 real (if non-blocking) code-quality warnings that would otherwise have gone unrecorded

### Cost Observations
- Model: claude-sonnet-5 (balanced profile), executor waves ran on `sonnet`
- Sessions: 1 (all 4 waves + code review + verification + milestone close in one session)
- Notable: hit an account session-usage limit once during the phase verifier subagent spawn; inline recovery worked without losing any verification rigor

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 4 | 12 | First milestone — audit-first quality pass established as pattern |
| v1.1 | 1 | 2 | CSS scope regression introduced — caught and deferred cleanly |
| v1.2 | 1 | 1 | Single-class scoped fix for v1.1 regression |
| v1.3 | 1 | 1 | First game mechanic addition — velocity-based collision discrimination |
| v1.4 | 3 | 4 | First drag-and-drop game — Pointer Events API, CSS zone layout, 3-phase delivery |
| v1.5 | 1 | 1 | Visual bug fix — plan-level geometry precision enables mechanical CSS implementation |
| v1.8 | 2 | 2 | Data + UI refactor — data-only phase fastest execution; category filter pattern established |
| v2.1 | 1 | 4 | First automated test in the repo — pure dual-exported grammar function with Node assert coverage |

### Top Lessons (Verified Across Milestones)

1. **Audit before fixing** — reveals scope more accurately than assumptions
2. **Generic shared utilities beat domain-specific duplication** — SharedUtils pattern scales well
3. **Scoped CSS classes prevent cross-page regressions** — introduce new class rather than modifying shared class
4. **Velocity-based gates are the right primitive for game collision classification** — clean, deterministic, no positional ambiguity
5. **Open the browser first for CSS spatial layouts** — static code review cannot verify absolute positioning on mobile; visual iteration is required and should be budgeted
6. **Data-only phases are zero-risk** — when the app has a generic loader, adding content is just rows in a file; no code path to break
7. **Pure, dual-exported functions are worth a real test file when the logic has documented pitfalls** — the zero-automated-testing stance is a default, not a hard rule, and correctness-critical grammar/calculation logic is the right exception
7. **Opt-out defaults protect new content** — new vocabulary/categories default to enabled so additions are immediately usable without user action
