---
phase: 12-homepage-visual-tweaks
reviewed: 2026-04-12T00:00:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - tap-to-vocab/index.html
  - tap-to-vocab/assets/css/styles.css
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 12: Code Review Report

**Reviewed:** 2026-04-12
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Reviewed `index.html` (homepage markup) and `assets/css/styles.css` (global stylesheet). No critical security or data-loss issues were found. The CSS is well-organized with clear section comments and consistent use of CSS custom properties.

Three warnings were identified: a broken navigation link to `locations.html` (the page exists but the feature is not listed in CLAUDE.md's routing table — low risk but worth confirming), a duplicate rule block for `.flip-card-front` that overrides part of an earlier declaration, and a `.grid-two-col` responsive breakpoint that re-declares the already-set default (redundant but harmless). Four info-level items cover a hardcoded font stack using generic system fonts (against project aesthetics guidelines), inline styles that belong in the stylesheet, commented-out-style whitespace, and a magic `z-index: 100` on the Reset button.

---

## Warnings

### WR-01: Duplicate `.flip-card-front` rule block silently overrides animation

**File:** `tap-to-vocab/assets/css/styles.css:416` and `:647`

**Issue:** `.flip-card-front` is defined twice. The first block (line 416) sets `background`, `border`, `cursor`, and `transition`. The second block (line 647) only sets `animation: fadeIn 0.3s ease-out`. Because the second block appears after the first, any future property added to the second block will silently override the first. More importantly, the intent (animation on the front face) is split from the main rule, making maintenance confusing — a developer editing line 416's block will not see that `animation` is set elsewhere.

**Fix:** Merge the `animation` property into the first `.flip-card-front` block and remove the duplicate:
```css
/* line 416 — add animation here, delete the block at line 647 */
.flip-card-front {
  background: linear-gradient(135deg, #1a2350 0%, #121a3a 100%);
  border: 2px solid #2a3a80;
  cursor: pointer;
  transition: background 0.2s ease;
  animation: fadeIn 0.3s ease-out;
}
```

---

### WR-02: Redundant responsive breakpoint for `.grid-two-col`

**File:** `tap-to-vocab/assets/css/styles.css:693`

**Issue:** The `@media (min-width: 601px) and (max-width: 900px)` block re-declares `grid-template-columns: repeat(2, 1fr)` for `.grid-two-col`. The base (non-media) rule at line 42 already sets `grid-template-columns: 1fr 1fr`, which is identical. This means the breakpoint rule has no effect at all — the grid was already two columns at those viewport widths. This suggests the breakpoint was a remnant from a time when the base rule used `auto-fit`, and it was never removed when the base rule was changed to a fixed two-column layout.

**Fix:** Remove the now-redundant media block entirely:
```css
/* DELETE this block (lines 693-697) — base rule already handles it */
@media (min-width: 601px) and (max-width: 900px) {
  .grid-two-col {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

### WR-03: `locations.html` linked but undocumented — confirm page is complete

**File:** `tap-to-vocab/index.html:59`

**Issue:** The homepage links to `/locations.html` but this page is not documented in `CLAUDE.md`'s routing table (which lists `index.html`, `topic.html`, `sentences.html`, `conjugation.html`, `fill-blank.html`, `vocab.html`, `voices.html`). The file does exist on disk, so this is not a 404 — but the omission from architecture docs suggests it may be an in-progress page that was wired up before it was ready, or CLAUDE.md was not updated after adding it.

**Fix:** Verify that `locations.html` is production-ready. If it is, add it to the routing table in `CLAUDE.md`. If it is still in progress, consider either removing the link from `index.html` or hiding it with a `disabled` style until it is ready.

---

## Info

### IN-01: Hardcoded system-ui font stack violates project aesthetics guidelines

**File:** `tap-to-vocab/assets/css/styles.css:17`

**Issue:** The `html, body` font declaration uses `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial` — the canonical generic "AI slop" font stack that `CLAUDE.md` (global) explicitly calls out as something to avoid. The global instructions say: "Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics."

**Fix:** Replace with a distinctive web-safe or Google Fonts import. Since this is a zero-dependency static site, a single `@import` from Google Fonts is the lowest-friction option:
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');

html, body {
  font-family: 'Outfit', system-ui, sans-serif; /* system-ui as fallback only */
  ...
}
```
Alternatively, use a self-hosted variable font if CDN dependencies are a concern.

---

### IN-02: Heavy use of inline styles on homepage elements

**File:** `tap-to-vocab/index.html:20,24,68`

**Issue:** Three elements carry significant inline `style` attributes:
- Line 20: `display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:4px;` on the header row div
- Line 24: `text-align:center; color:var(--muted); margin-top:8px; margin-bottom:20px;` on the subtitle paragraph
- Line 68: A long inline style block on the Reset Coins button (position, background, border, color, font-size, padding, border-radius, cursor, z-index, backdrop-filter)

Inline styles bypass the stylesheet, cannot be overridden by media queries, and make visual tweaks harder to apply globally.

**Fix:** Extract these into named classes in `styles.css`. Suggested names:
```css
/* In styles.css */
.home-header-row { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:4px; }
.home-subtitle { text-align:center; color:var(--muted); margin-top:8px; margin-bottom:20px; }
.btn-reset-coins { position:fixed; bottom:16px; right:16px; background:rgba(30,20,50,0.85); border:1px solid #3a2a50; color:var(--muted); font-size:.8rem; padding:8px 10px; border-radius:10px; cursor:pointer; z-index:100; backdrop-filter:blur(4px); }
```

---

### IN-03: Magic `z-index: 100` on Reset Coins button

**File:** `tap-to-vocab/index.html:68`

**Issue:** The Reset Coins button uses a hardcoded `z-index: 100` inline. The `.quiz-modal` and `.sentence-manager-modal` both use `z-index: 1000`. This is not currently a bug — 100 vs 1000 keeps the button below modals — but with no named constant or comment, the relationship is invisible.

**Fix:** When extracting to a CSS class (see IN-02), add a comment documenting the stacking intent:
```css
.btn-reset-coins {
  z-index: 100; /* Below modals (z-index: 1000) — intentionally stays behind overlays */
  ...
}
```

---

### IN-04: HTML comment noise and trailing whitespace

**File:** `tap-to-vocab/index.html:46,49,52,55,58,61`

**Issue:** Every full-width button in `.grid-two-col` has a repetitive HTML comment above it (`<!-- ⭐ Practice ... -->`, `<!-- 🔤 Build Sentences ... -->`, etc.) that merely restates the button text. These add visual clutter with no informational value. Additionally, line 45 has trailing whitespace and line 70 has a double blank line before `</body>`.

**Fix:** Remove the restating comments. Retain comments only where the markup is non-obvious (e.g., the `grid-column: 1 / -1` span behaviour). Trim trailing whitespace.

---

_Reviewed: 2026-04-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
