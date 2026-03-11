# Phase 4: UI & Mobile Polish - Research

**Researched:** 2026-03-10
**Domain:** Vanilla HTML/CSS responsive design, mobile tap targets, CSS variable audit
**Confidence:** HIGH — all findings are derived from direct code inspection of the actual project files

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UI-01 | All pages use consistent button styles, spacing, and typography from established CSS variables — no one-off overrides | CSS audit identifies all raw hex deviations; CONCERNS.md confirms pattern |
| UI-02 | Navigation is clear and consistent — every page has an obvious way to go back or return home | Per-page navigation audit complete; vocab.html is the only stranded page |
| UI-03 | Visual polish pass — no visually unfinished elements (misaligned items, inconsistent padding, mismatched font sizes) | Inline style audit identifies specific HTML attributes to migrate |
| MOB-01 | All pages are usable and visually correct at 375px viewport width (iPhone SE) | grid-two-col issue documented; word-btn min-height gap identified |
| MOB-02 | Tap targets are minimum 44px height/width on all interactive elements | word-btn and vocab.html buttons are the two at-risk elements |
| MOB-03 | No horizontal overflow or scroll on any page at 375px width | No overflow confirmed on all pages EXCEPT vocab.html (inline table) |
</phase_requirements>

---

## Summary

Phase 4 is a CSS audit and remediation phase, not a feature-building phase. The project already has a strong foundation: a centralized `styles.css` with CSS variables in `:root`, a `.btn` component class, and responsive media queries at 600px. The polish work is about finding and eliminating the exceptions — raw hex colors, inline `style=""` attributes, and the one page (`vocab.html`) that is completely outside the design system.

The most significant single item is `vocab.html`. It uses a light theme (`body { background: white; }`) with hardcoded hex colors and no link to `styles.css`. It is also orphaned (no page links to it) and has no navigation. Bringing vocab.html into the design system is the most impactful visual consistency change in this phase.

For all other pages, the work is precision editing: converting inline `style="..."` attributes to class-driven CSS where they conflict with the design system, ensuring `.word-btn` and `.choice-btn` meet the 44px tap-target minimum, and verifying the `grid-two-col` layout does not degrade at 375px.

**Primary recommendation:** Fix vocab.html first (it is completely outside the system), then audit inline style attributes across all pages for inconsistencies, then verify tap target minimums.

---

## Current Design System Inventory

The project has a well-defined design system already in place.

### CSS Variables (`:root` in `styles.css`)

| Variable | Value | Purpose |
|----------|-------|---------|
| `--bg` | `#0b1020` | Page background |
| `--card` | `#121831` | Card/container background |
| `--ink` | `#e8ecff` | Primary text |
| `--muted` | `#aeb6d9` | Secondary text |
| `--accent` | `#6ca8ff` | Interactive/links |
| `--ok` | `#3ddc97` | Success/correct state |
| `--warn` | `#ffcc66` | Warning/quiz tab |
| `--error` | `#ff6b9d` | Error/wrong state |

**Confidence:** HIGH — read directly from `styles.css:1-10`

### Raw Hex Colors in styles.css (Not Variables)

The stylesheet uses many raw hex values for border colors and background tints. These are consistently applied but are not variables. They represent "the dark navy palette" — variants of the bg/card colors. The planner does NOT need to convert these to variables. They are consistent within `styles.css`. The problem is when HTML pages use different hex values inline.

Key raw hex values used consistently in styles.css:
- `#1a2350` — button and card background (darker navy)
- `#2a3a80` — border color for cards and buttons
- `#0f1540` — darker background for stat boxes and build area
- `#121a3a` — word card background
- `#243688` — border for stat boxes

**Confidence:** HIGH — read directly from `styles.css`

---

## Architecture Patterns

### How Pages Are Structured

Every page (except vocab.html and games/jungle-run.html) follows this pattern:

```html
<body>
  <div class="container">       <!-- max-width:760px, margin:auto, padding:16px -->
    <div class="card">          <!-- bg:--card, border-radius:16px, padding:20px -->
      <div style="display:flex; ...header row...">
        <h1>...</h1>
        <span class="badge coin-badge" id="coin-counter">...</span>
      </div>
      <!-- page content using classes from styles.css -->
      <div class="controls">    <!-- flex, gap:8px, flex-wrap, margin-top:12px -->
        <button class="btn secondary" id="btn-home">🏠 Home</button>
      </div>
    </div>
  </div>
</body>
```

**Key insight for UI-02:** The home button is consistently present in this pattern. All learning pages (topic.html, sentences.html, conjugation.html, fill-blank.html) have a `🏠 Home` button in their controls row.

### Inline Style Usage (Current State)

Inline `style=""` attributes are used extensively across pages. Most are benign (layout helpers), but some create visual inconsistency.

**Benign inline styles (do not fix):**
- Header row layout: `style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;"`
- Show/hide states: `style="display:none;"`
- Progress badge: `style="display:flex; align-items:center; gap:8px;"`

These are effectively single-use layout rules. Converting them to classes would add unnecessary CSS with no visual benefit.

**Problematic inline styles (candidates for review):**
- `fill-blank.html`: header `<h1>✏️ Fill in the Blank</h1>` has no margin-bottom:0 override — h1 has `margin: 0 0 12px` by default, but the header row uses flexbox and the h1 is inside it without `style="margin:0"`. This creates 12px bottom gap inside the flexbox header.
- `index.html`: The Reset Coins button is a fully inline-styled button at `position:fixed; bottom:16px; right:16px` — this is fine as a dev-only utility and does not need to use the design system.

### Responsive Breakpoints in styles.css

| Breakpoint | What Changes |
|------------|--------------|
| `max-width: 600px` | btn padding/font-size, word-card padding, big/quiz-word font-size, flip-card min-height, conj-pronoun/conj-row, choice-btn sizes |
| `max-height: 700px AND max-width: 600px` | Aggressive space reduction for iPhone SE height — conj-row padding, container padding, card padding, h1 font-size |
| `min-width: 601px AND max-width: 900px` | grid-two-col keeps 2 columns (no change needed) |
| `hover: hover` | word-btn translateY hover (prevents sticky hover on touch) |

**Confidence:** HIGH — read directly from `styles.css:615-1125`

---

## Page-by-Page Audit Summary

### index.html
**UI-01:** Uses CSS variables via classes. The Reset Coins button uses inline styles but is a developer tool — acceptable.
**UI-02:** No back button needed (it IS the home page). Navigation is outbound-only.
**UI-03:** Header row with h1 and coin badge has `margin-bottom:4px` on outer div — intentional tight spacing.
**MOB-01/MOB-03:** `grid-two-col` at 375px gives ~155px column width. Buttons with long text like "🏠 Casa y Familia" may wrap to 2 lines within the button cell. This is functional but ergonomically imperfect. The grid does NOT overflow horizontally — each cell stays within its column.
**MOB-02:** `.btn` has `padding: 12px 16px`. At standard font size (1rem = 16px), height = line-height × font-size + 2 × padding-top = 1.4 × 16 + 24 = ~46px. Meets 44px. At the 600px breakpoint, padding reduces to `10px 12px`: height = ~43px — borderline. May need min-height: 44px.

**Concerns from audit:** `grid-two-col` narrow buttons at 375px (CONCERNS.md, Low severity).

### topic.html
**UI-01:** All elements use classes from styles.css. Coin badge, mode-tabs, flip-card, quiz-modal all use CSS variables.
**UI-02:** Browse mode has `#btn-home`. Quiz mode has `#btn-home-quiz`. Quiz complete modal has `#modal-home`. Navigation is complete in all states. PASS.
**UI-03:** No visible misalignment issues identified during audit.
**MOB-01/MOB-03:** Responsive breakpoints exist. Quiz flip card reduces to 280px min-height at 600px. No overflow at 375px.
**MOB-02:** `.btn-wrong` and `.btn-correct` have `padding: 10px 16px` — height ~42px at 600px breakpoint (`padding: 10px 12px`). Borderline.

### sentences.html
**UI-01:** Uses design system classes throughout.
**UI-02:** `#btn-home` present in controls row. PASS.
**UI-03:** The header has `display:flex` with gear button + h1 on left, coin badge + progress on right. Consistent with other pages.
**MOB-01/MOB-03:** Word bank uses `flex-wrap: wrap` — tiles reflow. Build area is `min-height: 100px` with flex-wrap. No overflow expected.
**MOB-02:** `.word-btn` has `padding: 10px 16px`, at 600px breakpoint stays `padding: 10px 16px`. Height ~42px — borderline. CONCERNS.md notes this.

### conjugation.html
**UI-01:** Uses design system. The `.conj-table`, `.conj-row`, `.conj-pronoun`, `.conj-slot` classes are all in styles.css.
**UI-02:** Practice mode: `#btn-home` in `#practice-controls`. Show mode: `#btn-home-show` in `#show-controls`. PASS.
**UI-03:** The `sentence-target` is reused for the verb header — working as intended but semantically unusual.
**MOB-01/MOB-03:** Extra-small screen media query at `max-height:700px AND max-width:600px` is already in place. No overflow expected.
**MOB-02:** `.word-btn` same issue as sentences.html. `.conj-slot` has `min-height: 38px` (reduced to 36px at 600px, 28px at extra-small). At 28px the slot itself is below 44px but it's not an interactive target — tiles are tapped from the word bank, not the slot. Word bank tiles are the interactive targets, same as sentences.html.

### fill-blank.html
**UI-01:** Uses design system classes.
**UI-02:** `#btn-home` present in controls row. PASS.
**UI-03:** The `<h1>` in the header row lacks `style="margin:0"` override. The `.card` uses `padding: 20px` and the header row is `display:flex`. Without `margin:0` on `h1`, the default `margin: 0 0 12px` from styles.css creates 12px gap below the h1 inside the header flexbox. This is likely the cause of any vertical misalignment in the header.
**MOB-01/MOB-03:** `.choices` uses `flex-wrap: wrap` with `gap: 12px`. `.choice-btn` has `min-width: 120px`. At 375px, 3 buttons at 120px + gaps would be ~384px — they will wrap to 2 rows. This is the correct behavior. No overflow.
**MOB-02:** `.choice-btn` has `padding: 14px 28px` — height ~43px at standard font. At 600px breakpoint: `padding: 12px 20px` — height ~40px. Below 44px. Needs `min-height: 44px`.

### vocab.html
**UI-01:** FAILS entirely. Uses a light theme with inline `<style>` block. No `styles.css` link. Raw hex values: `#ddd`, `#555`. No CSS variables.
**UI-02:** FAILS. No back button, no home link. User is stranded unless they use browser back.
**UI-03:** Visual design is completely inconsistent with the rest of the app (white background vs dark theme).
**MOB-01/MOB-03:** Page layout is basic — single column with `max-width: 720px`. No overflow expected. However, it is visually jarring vs the rest of the app.
**MOB-02:** Button padding `0.6rem 1rem` at 18px base font — height ~46px. Meets 44px.

**vocab.html is the largest single task in this phase.**

### games.html
**UI-01:** Uses `styles.css`. Uses `.btn.secondary` for back button. Inline `<script>` uses `var(--error)`, `var(--muted)` via style string injection — technically uses variables but in an unusual way.
**UI-02:** "Back to Learning" `<a>` with class `btn secondary` links to `/`. Navigation present. PASS.
**UI-03:** No `coin-counter` badge shown. Page title "Game Zone" with muted subtitle. Clean layout.
**MOB-01/MOB-03:** `.game-grid` uses `repeat(auto-fit, minmax(200px, 1fr))` — at 375px one column (200px+ doesn't fit 2 at 375px with padding). Game cards stack vertically. Correct behavior.
**MOB-02:** `.game-card` has `padding: 28px 20px` — large enough. PASS.

### games/coin-dash.html and games/tower-stack.html
**UI-01:** Uses `styles.css` plus inline `<style>`. The inline styles use `var(--warn)`, `var(--ink)`, `var(--muted)` — CSS variables are referenced. Consistent with design system.
**UI-02:** Has `← Back` button linking to `/games.html`. Game-over overlay has navigation. PASS.
**MOB-01/MOB-03:** Canvas scales via `resizeCanvas()` CSS scaling. At 375px: ~371px canvas. No overflow.
**MOB-02:** Game overlay buttons: `.btn` has `padding: 10px 24px` (inline style). Height ~42px. Borderline but these are game-start/restart buttons, not learning interactions.

### games/jungle-run.html
**UI-01:** Does NOT use `styles.css`. Has its own full inline style block with raw hex colors (`#0b1a2e`, `#f0a030`, `#e8e0d6`, `#ccc`, `#555`). These do NOT use CSS variables.
**UI-02:** `.hud-back` fixed overlay links to `/games.html`. Game-over has navigation. PASS for function, but the back button is styled inconsistently (gray text vs rest of app).
**UI-03:** Intentionally full-screen canvas game — visual consistency with the learning pages is not expected or required. However, the overlay buttons use hardcoded `#f0a030` instead of `var(--warn)`.
**MOB-01/MOB-03:** Canvas scales responsively. No overflow.
**MOB-02:** Overlay `.btn` has `padding: 10px 24px`. Height ~42px. Same borderline issue.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 44px tap targets | Custom JS tap-area enlargers | `min-height: 44px` CSS | Pure CSS, no JS needed |
| Dark theme for vocab.html | New color palette | Existing CSS variables | All colors already defined in `:root` |
| Navigation component | Custom JS router | `<a href="/">` with `.btn.secondary` class | Pattern already established on all other pages |
| Horizontal overflow detection | JS scroll detection | `overflow-x: hidden` on container + visual inspection | Simple CSS |

**Key insight:** Every fix in this phase is CSS-only or HTML-only. No new JavaScript is needed for UI consistency and mobile polish.

---

## Common Pitfalls

### Pitfall 1: Over-Migrating Inline Styles
**What goes wrong:** Converting ALL inline `style=""` attributes to CSS classes. This creates CSS bloat for single-use layout declarations that are perfectly readable inline.
**Why it happens:** "Consistency" is misapplied — not every inline style is a problem.
**How to avoid:** Only convert inline styles that: (a) use colors/values inconsistent with the design system, OR (b) create layout issues on mobile. Leave flexbox layout helpers alone.
**Warning signs:** If you're creating CSS classes named `.header-row` or `.flex-center`, you're probably over-migrating.

### Pitfall 2: Breaking vocab.html's URL-Param Contract
**What goes wrong:** Refactoring vocab.html to load from TSV during the design system integration.
**Why it happens:** The page looks unfinished and it's tempting to "fully integrate" it.
**How to avoid:** vocab.html receives its word content via URL params (`?w=`, `?de=`). This is by design. Phase 4 only changes its visual styling — it does NOT add navigation to it from topic.html (that would be a new feature, out of scope).
**Warning signs:** If you're modifying topic.html to add links to vocab.html, stop.

### Pitfall 3: Touching Game Logic During CSS Fixes
**What goes wrong:** While editing `jungle-run.html` for color variables, accidentally breaking the canvas resize or game loop.
**Why it happens:** Large inline script + inline styles in the same file create temptation to "clean up" JS too.
**How to avoid:** Edit only the `<style>` block in game files. Never touch the `<script>` block for Phase 4 work.

### Pitfall 4: min-height on flex children
**What goes wrong:** Adding `min-height: 44px` to `.btn` globally breaks the compact buttons in the quiz nav row (`quiz-nav-row .btn` has `font-size: 0.85rem; padding: 8px 12px`).
**Why it happens:** Global rules affect all `.btn` instances.
**How to avoid:** Add `min-height: 44px` only to the specific selectors that need it (`.choice-btn`, `.word-btn`, `.btn-wrong`, `.btn-correct`). Do NOT add it to `.btn` globally.

### Pitfall 5: vocab.html Navigation Scope
**What goes wrong:** Adding a full nav bar with coin counter and progress badge to vocab.html.
**Why it happens:** The page looks incomplete without them.
**How to avoid:** vocab.html only needs: (1) link to `styles.css`, (2) a home button, (3) CSS variables for colors. No coins, no progress badge, no TSV loading. It is a standalone word card that receives data via URL.

---

## Code Examples

### Adding 44px min-height to specific interactive elements
```css
/* Source: MDN + Apple HIG 44pt guideline */
/* Apply to specific selectors, NOT globally to .btn */
.choice-btn,
.word-btn {
  min-height: 44px;
}

/* At 600px breakpoint, maintain min-height even with reduced padding */
@media (max-width: 600px) {
  .choice-btn,
  .word-btn {
    min-height: 44px;
    padding: 10px 14px; /* reduce horizontal padding, not vertical */
  }
}
```

### vocab.html minimal design system integration
```html
<!-- Replace the inline <style> block and add these to <head> -->
<link rel="stylesheet" href="/assets/css/styles.css" />
<script src="/assets/js/coins.js"></script>

<!-- Add a home button inside the .card -->
<div class="controls" style="margin-top: 16px;">
  <a class="btn secondary" href="/">🏠 Home</a>
</div>
```

### Replacing vocab.html inline colors with CSS variables
```css
/* Before (inline style block in vocab.html) */
body { font: 18px/1.4 system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; }
.card { border: 1px solid #ddd; border-radius: 12px; padding: 1rem; }
.hint { color: #555; }

/* After — no inline style block needed; styles.css provides these */
/* body, .card, .container are already styled by styles.css */
/* .hint → use color: var(--muted) inline or a small scoped rule */
```

### Checking grid-two-col at 375px
The current grid uses `grid-template-columns: 1fr 1fr` with `.container` padding of 16px.
Available width at 375px = 375 - 2×16 - 2×20 (card padding) = 303px. Each column = ~146px.
`.btn` with long text will wrap. Solutions:
```css
/* Option A: reduce font-size for category buttons at narrow viewport */
@media (max-width: 420px) {
  .grid-two-col .btn {
    font-size: 0.85rem;
    padding: 10px 8px;
  }
}

/* Option B: allow text to wrap (current behavior) and ensure min-height */
/* This is acceptable — wrapped text is readable */
```

---

## Specific Issues to Address (Prioritized)

These are derived from CONCERNS.md audit findings and direct code inspection.

### Priority 1 (Blocks UI-02): vocab.html Has No Navigation
- File: `tap-to-vocab/vocab.html`
- Add a home link (`<a href="/" class="btn secondary">🏠 Home</a>`)
- Fixes: UI-02

### Priority 2 (Blocks UI-01): vocab.html Not in Design System
- File: `tap-to-vocab/vocab.html`
- Replace inline `<style>` block with `<link rel="stylesheet" href="/assets/css/styles.css" />`
- Convert hardcoded colors to CSS variables or class-based equivalents
- Fixes: UI-01, UI-03, MOB-03 (the `<table>` in voices.html has overflow but voices.html is a dev tool, not user-facing)

### Priority 3 (Blocks MOB-02): word-btn / choice-btn Below 44px at Breakpoints
- Files: `assets/css/styles.css`
- `.word-btn` and `.choice-btn` need `min-height: 44px`
- Fixes: MOB-02

### Priority 4 (MOB-01): grid-two-col Narrow Buttons at 375px
- File: `assets/css/styles.css`
- Category buttons with long labels wrap to 2 lines in ~146px cells
- Either reduce font-size at narrow viewport, or reduce horizontal padding
- Fixes: MOB-01

### Priority 5 (UI-03): fill-blank.html h1 Margin
- File: `tap-to-vocab/fill-blank.html`
- `<h1>` in header row needs `style="margin:0"` to match other pages
- Fixes: UI-03

### Priority 6 (UI-01): jungle-run.html Does Not Use CSS Variables
- File: `tap-to-vocab/games/jungle-run.html`
- Inline `<style>` block uses hardcoded hex colors
- Replace with CSS variables where applicable (overlay colors, button colors)
- This is LOW priority because it's a full-screen canvas game — users don't expect it to match the app's UI exactly. Consider doing it for completeness but it's not a visible inconsistency during normal gameplay.

---

## State of the Art

| Old Approach | Current Approach | Impact for Phase 4 |
|--------------|------------------|--------------------|
| Separate CSS per page | Single `styles.css` for all pages | vocab.html is the only outlier — one fix covers all |
| Fixed pixel tap targets | `min-height: 44px` per Apple/Google HIG | Straightforward CSS addition |
| Hardcoded colors everywhere | CSS variables in `:root` | Variables already defined; just need to replace inline hex values |

**The Apple Human Interface Guidelines (HIG)** specify 44pt minimum tap targets. On web at 96dpi = 44px. **Google Material Design** specifies 48dp minimum. The project should target 44px minimum to satisfy the Apple standard (the more conservative of the two).

**Confidence:** HIGH — this is established cross-platform guidance, not library-specific.

---

## Open Questions

1. **Should vocab.html be integrated with CoinTracker (correct answers award coins)?**
   - What we know: vocab.html currently has no CoinTracker. All other learning pages do.
   - What's unclear: Phase 4 scope says "every page has a visible home navigation control" and "use established CSS variables." Adding coins may be feature creep.
   - Recommendation: Add coins only if it's trivial (1-2 lines). The primary Phase 4 goal is visual consistency, not feature parity. Adding `<script src="/assets/js/coins.js"></script>` and calling `CoinTracker.addCoin()` in the correct answer handler is trivial. Do it.

2. **Should jungle-run.html's inline styles be replaced with styles.css?**
   - What we know: jungle-run.html does NOT link styles.css. It has full-screen canvas layout that is fundamentally different from the rest of the app.
   - What's unclear: Does "consistent CSS variables" apply to a full-screen immersive game?
   - Recommendation: At minimum, update the game-overlay button colors (`#f0a030` → `var(--warn)`) to use variables. Do NOT try to make it link to styles.css — the full-screen layout would conflict.

3. **Does the btn-wrong / btn-correct pair on topic.html meet 44px?**
   - What we know: `padding: 10px 16px`, reduced to `padding: 10px 12px` at 600px. Height at 600px = ~42px.
   - Recommendation: Add `min-height: 44px` to `.btn-wrong` and `.btn-correct` in the 600px media query section.

---

## Validation Architecture

`nyquist_validation` is enabled in `.planning/config.json`. However, the project explicitly has "Automated testing suite" listed as OUT OF SCOPE in REQUIREMENTS.md. There are no test files, no test framework, and no test configuration in the project.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — automated testing explicitly out of scope per REQUIREMENTS.md |
| Config file | None |
| Quick run command | Visual inspection at 375px viewport in browser |
| Full suite command | Open each page in browser, resize to 375px, check for overflow, check tap targets |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UI-01 | CSS variables used, no one-off overrides | manual | grep for raw hex values in HTML files | ❌ No automated test |
| UI-02 | Every page has home/back navigation | manual | Visual check per page | ❌ No automated test |
| UI-03 | No misaligned elements, consistent padding | manual | Visual check at desktop width | ❌ No automated test |
| MOB-01 | Usable at 375px | manual | Browser resize to 375px | ❌ No automated test |
| MOB-02 | 44px tap targets | manual | Browser dev tools element inspection | ❌ No automated test |
| MOB-03 | No horizontal scroll at 375px | manual | Browser resize to 375px, check scroll | ❌ No automated test |

### Sampling Rate
- **Per task commit:** Visual check the modified page at 375px
- **Per wave merge:** Full walk-through of all pages at 375px
- **Phase gate:** All 6 pages pass visual inspection before `/gsd:verify-work`

### Wave 0 Gaps
None — no test infrastructure is expected for this project. Verification is manual.

---

## Sources

### Primary (HIGH confidence)
- Direct file inspection: `tap-to-vocab/tap-to-vocab/assets/css/styles.css` — all CSS values, breakpoints, and variables confirmed by reading the file
- Direct file inspection: All 6 HTML pages + 4 game pages — navigation, inline styles, and structure confirmed
- Direct file inspection: `.planning/codebase/CONCERNS.md` — all audit findings read directly

### Secondary (MEDIUM confidence)
- Apple Human Interface Guidelines — 44pt minimum tap target guideline (widely documented, stable for 10+ years)
- WCAG 2.5.5 (Target Size) — 44px minimum for enhanced conformance (Level AAA)

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — vanilla CSS, no libraries, all confirmed by code inspection
- Architecture: HIGH — read directly from all project files
- Pitfalls: HIGH — derived from audit findings in CONCERNS.md and direct code patterns observed
- Mobile targets: HIGH — CSS values read directly, math verified

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable project, no external dependencies to change)
