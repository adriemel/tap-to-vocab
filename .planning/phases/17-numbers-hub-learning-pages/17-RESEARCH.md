# Phase 17: Numbers Hub & Learning Pages - Research

**Researched:** 2026-04-28
**Domain:** Vanilla HTML/CSS/JS static page construction — navigation, data display, URL routing
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NUM-01 | "Qué número es?" button on home screen between Locations and Play Games | index.html button pattern: `<a class="btn btn-numbers" href="/numbers.html">` + CSS `.grid-two-col .btn-numbers` spans both columns |
| NUM-02 | Numbers hub shows 5 range buttons (1-20, 21-40, 41-60, 61-80, 81-100) stacked vertically | Inline HTML list with `<a class="btn">` links; `?range=1-20` URL param pattern |
| NUM-03 | Learning page shows every number in range paired with Spanish word | Hardcoded JS constant (NUMBERS const array) + loop to render number/word rows |
| NUM-04 | Learning page has "Take a Test" button navigating to quiz page | `<a href="/numbers-quiz.html?range=1-20">Take a Test</a>` link |
| NUM-08 | Every numbers page has Home link and "Back to Numbers" link | Home: `location.href='/'`; Back: `location.href='/numbers.html'` — same pattern as existing pages |
</phase_requirements>

---

## Summary

Phase 17 adds three static HTML pages to the existing zero-dependency site: a numbers hub (`numbers.html`), a learning page (`numbers-learn.html`), and a stub quiz page (`numbers-quiz.html`, shell only — the quiz interaction is Phase 18). All navigation is handled via `href` links or `location.href` assignments, consistent with every other page in the project.

The numbers dataset is a hardcoded JS constant (decided in STATE.md) — no TSV fetch, no async loading. Spanish numerals 1–100 are a closed set with no ambiguity. The dataset can be defined inline in a `<script>` block on each page or extracted to `assets/js/numbers-data.js` shared across phases 17 and 18.

The primary pattern challenge is URL-parameter-driven page content: both the learning page and quiz page receive the selected range via a `?range=1-20` query parameter and filter the NUMBERS constant accordingly.

**Primary recommendation:** Create three HTML pages using the established `.container > .card` layout with CSS custom properties from `styles.css`. Store the NUMBERS constant in a dedicated `assets/js/numbers-data.js` loaded by all three pages. Hub passes `?range=X-Y` to the learning page; learning page passes the same param to the quiz page.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Numbers dataset (1–100 + Spanish words) | Browser / Client | — | Hardcoded JS constant, no server needed |
| Range selection (which 20 numbers to show) | Browser / Client | — | URL query param `?range=1-20` parsed with URLSearchParams |
| Learning page number list rendering | Browser / Client | — | JS loop renders rows into DOM |
| "Take a Test" navigation | Browser / Client | — | Simple `href` link with same ?range param |
| Home / Back navigation | Browser / Client | — | `location.href='/'` and `location.href='/numbers.html'` |
| Styling | CDN / Static | — | styles.css, same CSS variables used on all pages |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla HTML/CSS/JS | N/A | All page construction | Project constraint — zero dependencies [VERIFIED: CLAUDE.md] |

### No External Dependencies
This project explicitly prohibits external libraries. [VERIFIED: CLAUDE.md — "No external CDN or library dependencies"]

### Installation
No installation required. Static files only.

---

## Architecture Patterns

### System Architecture Diagram

```
index.html
  |
  | (tap "Qué número es?" button — href=/numbers.html)
  v
numbers.html  (Hub)
  |
  | (tap range button — href=/numbers-learn.html?range=1-20)
  v
numbers-learn.html  (Learning page — reads ?range param, renders NUMBERS[1..20])
  |
  | (tap "Take a Test" button — href=/numbers-quiz.html?range=1-20)
  v
numbers-quiz.html  (Quiz stub — Phase 18 fills in interaction)
```

Navigation back-links exist on every page:
- numbers-learn.html: "Back to Numbers" → numbers.html, "Home" → index.html
- numbers-quiz.html: "Back to Numbers" → numbers.html, "Home" → index.html

### Recommended File Structure
```
/numbers.html              # Hub page — range selector
/numbers-learn.html        # Learning page — number/word list
/numbers-quiz.html         # Quiz page — stub (Phase 17 shell; Phase 18 fills)
/assets/js/numbers-data.js # NUMBERS constant shared across all three pages
```

### Pattern 1: Full-Width Feature Button on Home Page (index.html)
**What:** Add a `<a class="btn btn-numbers" href="/numbers.html">` inside `.grid-two-col`, spanning both columns. Add matching CSS `.grid-two-col .btn-numbers { grid-column: 1 / -1; ... }` in styles.css.
**When to use:** Every full-width feature button on the home grid uses this pattern.
**Example:** [VERIFIED: index.html, styles.css]
```html
<!-- index.html — insert between btn-locations and btn-games -->
<a class="btn btn-numbers" href="/numbers.html">🔢 Qué número es?</a>
```
```css
/* styles.css */
.grid-two-col .btn-numbers {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #2a3a5a 0%, #1a2540 100%);
  border: 2px solid var(--accent);
  font-weight: 700;
}
```

### Pattern 2: URL Query Parameter for Range
**What:** Hub page links include `?range=1-20`. Learning and quiz pages parse it with URLSearchParams.
**When to use:** When a single HTML page serves multiple data subsets.
**Example:** [VERIFIED: topic.html uses `?cat=...` via the same pattern]
```javascript
const params = new URLSearchParams(location.search);
const range = params.get("range") || "1-20";  // e.g. "1-20"
const [lo, hi] = range.split("-").map(Number); // lo=1, hi=20
```

### Pattern 3: Page Structure (.container > .card)
**What:** All pages use `.container > .card` wrapper. Header row has page title + Home/nav links.
**When to use:** Every page in this project.
**Example:** [VERIFIED: fill-blank.html, locations.html, topic.html — all share this structure]
```html
<div class="container">
  <div class="card">
    <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
      <h1 style="margin:0">🔢 Números</h1>
      <div style="display:flex; gap:8px;">
        <a class="btn secondary" href="/">🏠 Home</a>
        <a class="btn secondary" href="/numbers.html">← Numbers</a>
      </div>
    </div>
    <!-- page content -->
  </div>
</div>
```

### Pattern 4: Hardcoded Data Constant Shared Across Pages
**What:** A JS file exports a `window.NUMBERS` array (IIFE pattern), loaded via `<script>` on each page that needs it.
**When to use:** Small closed dataset used across multiple pages (matches existing IIFE module convention).
**Example:** [VERIFIED: CLAUDE.md — "all use the IIFE pattern, export to window"]
```javascript
// assets/js/numbers-data.js
(function () {
  window.NUMBERS = [
    { n: 1,  es: "uno" },
    { n: 2,  es: "dos" },
    // ... through 100
  ];
})();
```

### Pattern 5: Home Button Navigation
**What:** `location.href = '/'` for Home; `location.href = '/numbers.html'` for Back to Numbers.
**When to use:** All pages use this for Home navigation.
**Example:** [VERIFIED: locations.js line 152 — `location.href = '/'`]
```javascript
document.getElementById('btn-home').onclick = function () { location.href = '/'; };
document.getElementById('btn-back-numbers').onclick = function () { location.href = '/numbers.html'; };
```

### Pattern 6: Learning Page Number List Rendering
**What:** Filter NUMBERS by range, then render each item as a row showing `{n} — {es}`.
**When to use:** numbers-learn.html
**Example:** [ASSUMED — standard DOM rendering, no equivalent list-of-items page exists to reference directly]
```javascript
const list = window.NUMBERS.filter(item => item.n >= lo && item.n <= hi);
const container = document.getElementById('number-list');
list.forEach(item => {
  const row = document.createElement('div');
  row.className = 'number-row';
  row.innerHTML = `<span class="number-numeral">${item.n}</span>
                   <span class="number-dash">—</span>
                   <span class="number-word">${item.es}</span>`;
  container.appendChild(row);
});
```

### Pattern 7: Script Load Order
**What:** The project requires specific script load order: `coins.js` → (game-init.js if game) → `shared-utils.js` → page JS.
**When to use:** Every page. Numbers pages are NOT coin-awarding pages (numbers is passive explore/learn), so game-init.js is NOT needed.
**Example:** [VERIFIED: CLAUDE.md — "Script load order: coins.js → (if game page: game-init.js) → shared-utils.js → [page js]"]

Numbers pages do not need coins.js or shared-utils.js either — they have no coins, no TTS (Phase 18), no shuffle. They only need numbers-data.js and an inline script.

Numbers quiz page (Phase 18) will need shared-utils.js and possibly coins.js when TTS and flip cards are added — but Phase 17 only creates the stub shell.

### Anti-Patterns to Avoid
- **Fetching numbers as TSV:** Decided against in STATE.md — use hardcoded constant. No async loading needed.
- **Using `window.history` variable name:** Reserved — use `gameHistory` or similar. For numbers pages this is not relevant since there is no back-stack navigation system, just simple links.
- **Relying on buttons inside hidden parent divs:** History from the project — if content is hidden, standalone buttons must be outside the hidden container.
- **Hardcoding range content per page (5 separate learning HTML files):** Use one learning page with `?range=` URL param — much less duplication.
- **Forgetting absolute asset paths:** All paths must be `/assets/...` not relative `../assets/...` — the project uses absolute root paths.

---

## Numbers Dataset

The full Spanish numerals 1–100 that will populate the NUMBERS constant:

| Range | Numbers | Notes |
|-------|---------|-------|
| 1–20  | uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez, once, doce, trece, catorce, quince, dieciséis, diecisiete, dieciocho, diecinueve, veinte | Irregular teens; dieciséis has accent |
| 21–40 | veintiuno...treinta, treinta y uno...cuarenta | Compound: veinti + uno; treinta y uno pattern |
| 41–60 | cuarenta y uno...sesenta | "cuarenta y N" pattern |
| 61–80 | sesenta y uno...ochenta | "sesenta y N" / "setenta y N" patterns |
| 81–100| ochenta y uno...cien | "ochenta y N" / "noventa y N"; 100 = cien (not ciento) |

[ASSUMED — training knowledge for Spanish numerals, not verified against an authoritative source in this session. Planner should validate the exact spelling of each numeral, particularly: dieciséis (accent), veintiuno vs veintiún, cien vs ciento.]

Key spellings to verify:
- 16: dieciséis (accent on é)
- 21: veintiuno (masculine standalone) vs veintiún (before noun)
- 100: cien (standalone) — the NUMBERS constant should use cien

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Data as TSV | Custom async loader | Hardcoded JS constant | Decided in STATE.md; no async complexity, no fetch needed |
| Range routing | Separate HTML file per range (5 files) | Single page + URLSearchParams | Standard web pattern, much less duplication |
| CSS framework | Bootstrap/Tailwind | Existing styles.css variables | Project constraint; CSS vars already provide all needed styles |

---

## Common Pitfalls

### Pitfall 1: Forgetting Absolute Asset Paths
**What goes wrong:** Using `href="assets/css/styles.css"` instead of `href="/assets/css/styles.css"` causes 404 when pages are at root.
**Why it happens:** Relative paths work in some directory layouts but not when the project uses a static server with root-relative paths.
**How to avoid:** Always use `/assets/...` paths. [VERIFIED: CLAUDE.md — "All asset paths are absolute from root"]
**Warning signs:** CSS not loading, fonts look wrong.

### Pitfall 2: Numbers Page Not in Coin System (Correct)
**What goes wrong:** Adding `coins.js` to numbers pages by default, matching other feature pages.
**Why it happens:** Habit of adding coins.js everywhere.
**How to avoid:** Numbers is a passive explore/learn feature — no coin rewards (REQUIREMENTS.md "Out of Scope" section explicitly states this). Load coins.js only if needed for the counter display. Actually — looking at locations.html, it does show a coin badge. Numbers pages in Phase 17 are simpler: no coin badge needed unless consistency requires it. Planner should decide if coin counter display is desired.
**Warning signs:** n/a

### Pitfall 3: Range Parse Failure
**What goes wrong:** `?range=1-20` split on `-` gives `["1", "20"]` correctly, but if range is missing from URL the page shows nothing.
**Why it happens:** Direct URL access or missing param.
**How to avoid:** Default to "1-20" if param absent: `const range = params.get("range") || "1-20"`.
**Warning signs:** Empty page when URL accessed directly.

### Pitfall 4: button vs anchor for Navigation
**What goes wrong:** Using `<button onclick="location.href='/numbers.html'">` instead of `<a href="/numbers.html">`.
**Why it happens:** Consistency with JS-wired buttons on other pages.
**How to avoid:** For pure navigation links (Home, Back to Numbers), use `<a class="btn secondary">` — better semantics, works without JS, consistent with how topic.html's home button is implemented. [VERIFIED: topic.html uses `<button id="btn-home-quiz">` but this requires JS; `<a>` links work without JS]
**Warning signs:** Navigation breaks if JS error occurs earlier on page.

### Pitfall 5: numbers-quiz.html Phase 17 Stub vs Phase 18 Full
**What goes wrong:** Phase 17 creates a quiz stub; Phase 18 fills it in. If the stub includes partial JS that conflicts with Phase 18's implementation, Phase 18 becomes harder.
**How to avoid:** Phase 17 quiz stub should only include the HTML shell (page structure, navigation links, empty `<div id="quiz-grid">`) and NO JS logic. A comment like `<!-- JS added in Phase 18 -->` is sufficient. The script block for numbers-data.js can be included so Phase 18 has the constant available.
**Warning signs:** Phase 18 executor confused by partial quiz JS already present.

---

## Code Examples

### numbers-data.js — NUMBERS Constant Structure
```javascript
// Source: [ASSUMED — IIFE pattern from CLAUDE.md]
(function () {
  window.NUMBERS = [
    { n: 1,   es: "uno" },
    { n: 2,   es: "dos" },
    { n: 3,   es: "tres" },
    { n: 4,   es: "cuatro" },
    { n: 5,   es: "cinco" },
    { n: 6,   es: "seis" },
    { n: 7,   es: "siete" },
    { n: 8,   es: "ocho" },
    { n: 9,   es: "nueve" },
    { n: 10,  es: "diez" },
    { n: 11,  es: "once" },
    { n: 12,  es: "doce" },
    { n: 13,  es: "trece" },
    { n: 14,  es: "catorce" },
    { n: 15,  es: "quince" },
    { n: 16,  es: "dieciséis" },
    { n: 17,  es: "diecisiete" },
    { n: 18,  es: "dieciocho" },
    { n: 19,  es: "diecinueve" },
    { n: 20,  es: "veinte" },
    { n: 21,  es: "veintiuno" },
    { n: 22,  es: "veintidós" },
    { n: 23,  es: "veintitrés" },
    { n: 24,  es: "veinticuatro" },
    { n: 25,  es: "veinticinco" },
    { n: 26,  es: "veintiséis" },
    { n: 27,  es: "veintisiete" },
    { n: 28,  es: "veintiocho" },
    { n: 29,  es: "veintinueve" },
    { n: 30,  es: "treinta" },
    { n: 31,  es: "treinta y uno" },
    { n: 32,  es: "treinta y dos" },
    // ... pattern continues: "X y N" for 31-99
    { n: 40,  es: "cuarenta" },
    { n: 50,  es: "cincuenta" },
    { n: 60,  es: "sesenta" },
    { n: 70,  es: "setenta" },
    { n: 80,  es: "ochenta" },
    { n: 90,  es: "noventa" },
    { n: 100, es: "cien" },
  ];
})();
```

### numbers-learn.html — Range Rendering Script
```javascript
// Source: [ASSUMED — standard DOM pattern consistent with project conventions]
(function () {
  const params = new URLSearchParams(location.search);
  const range = params.get("range") || "1-20";
  const [lo, hi] = range.split("-").map(Number);

  // Update page title
  document.getElementById("range-title").textContent = range;

  // Render list
  const list = window.NUMBERS.filter(item => item.n >= lo && item.n <= hi);
  const container = document.getElementById("number-list");
  list.forEach(item => {
    const row = document.createElement("div");
    row.className = "number-row";
    row.innerHTML =
      '<span class="number-numeral">' + item.n + '</span>' +
      '<span class="number-dash"> — </span>' +
      '<span class="number-word">' + item.es + '</span>';
    container.appendChild(row);
  });

  // "Take a Test" button links to quiz with same range
  document.getElementById("btn-take-test").href = "/numbers-quiz.html?range=" + range;
})();
```

### numbers.html — Hub Range Buttons
```html
<!-- Source: [ASSUMED — consistent with .btn pattern in styles.css] -->
<div class="controls" style="flex-direction:column; gap:12px;">
  <a class="btn" href="/numbers-learn.html?range=1-20">1 – 20</a>
  <a class="btn" href="/numbers-learn.html?range=21-40">21 – 40</a>
  <a class="btn" href="/numbers-learn.html?range=41-60">41 – 60</a>
  <a class="btn" href="/numbers-learn.html?range=61-80">61 – 80</a>
  <a class="btn" href="/numbers-learn.html?range=81-100">81 – 100</a>
</div>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-game data as TSV fetch | Hardcoded constant for closed datasets | locations.html inline EXERCISES (v1.4) | Zero async complexity; instant load |
| Separate HTML file per variant | Single HTML + URLSearchParams | topic.html `?cat=` (v1.0) | One file to maintain |

**Existing precedents in this project:**
- `topic.html?cat=Animales` — single page, URL param drives content [VERIFIED: topic.html]
- `locations.js` inline EXERCISES constant — no TSV for closed dataset [VERIFIED: STATE.md decision log]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Spanish numeral spellings (dieciséis, veintiuno, veinticuatro, etc.) | Numbers Dataset + Code Examples | Wrong spelling displayed to learner; must verify full list before committing NUMBERS constant |
| A2 | 100 = "cien" (not "ciento") in the context of this app | Numbers Dataset | Minor pedagogical error if wrong; ciento is used in compound numbers 101-199 which are out of scope |
| A3 | numbers-data.js IIFE exporting to window.NUMBERS is the right sharing mechanism | Pattern 4 | If Phase 18 needs a different interface, the constant can be accessed differently — low risk |
| A4 | Phase 17 quiz stub requires no JS (HTML shell only) | Pitfall 5 | If Phase 18 plan relies on stub having a specific scaffold, misalignment — mitigated by clear handoff note |
| A5 | Coin badge not needed on numbers pages (passive learning) | Pitfall 2 | Visual inconsistency vs. other feature pages — planner should decide |

---

## Open Questions

1. **Coin badge on numbers pages?**
   - What we know: REQUIREMENTS.md "Out of Scope" says no coin rewards for numbers. All current feature pages (locations, fill-blank, sentences) show a coin badge in the header.
   - What's unclear: Should numbers pages show the coin counter display for visual consistency, even though no coins are earned there?
   - Recommendation: Include the coin counter display (loads coins.js) for visual consistency. Omitting it creates a different-looking page. The badge is read-only display — no coins are awarded.

2. **"Back to Numbers" label and placement**
   - What we know: NUM-08 says "Back to Numbers" link. Existing pages use "← Prev" or "🏠 Home" in a `.controls` row.
   - What's unclear: Should "Back to Numbers" be in the header area (visible at top) or in a controls row at the bottom?
   - Recommendation: Header area — users need it immediately without scrolling past the content list.

3. **numbers-quiz.html stub depth for Phase 17**
   - What we know: Phase 18 adds the flip-card grid. Phase 17 success criteria item 4 says learning page must have a "Take a Test" button that navigates to the quiz page.
   - What's unclear: Does the quiz page need to exist for Phase 17 to pass (the button just can't 404), or is a full stub with navigation needed?
   - Recommendation: Create a minimal quiz stub with correct navigation (Home + Back to Numbers) and a placeholder message "Quiz coming soon" so the navigation chain is fully testable in Phase 17.

---

## Environment Availability

Step 2.6: SKIPPED — this phase creates vanilla HTML/CSS/JS files only. No external tools, runtimes, or services required beyond a static HTTP server (already confirmed available in project).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual smoke test (no automated test framework — see PROJECT.md "Out of Scope") |
| Config file | none |
| Quick run command | `python3 -m http.server 8000` then verify in browser |
| Full suite command | Manual verification against all 5 success criteria |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NUM-01 | "Qué número es?" button appears between Locations and Play Games on home screen | manual smoke | n/a — visual check | ❌ Wave 0 (no test files) |
| NUM-02 | Hub shows 5 range buttons stacked vertically | manual smoke | n/a — visual check | ❌ Wave 0 |
| NUM-03 | Learning page lists numbers 1-20 (and other ranges) with Spanish words | manual smoke | n/a — check rendered list | ❌ Wave 0 |
| NUM-04 | "Take a Test" button navigates to quiz page for correct range | manual smoke | n/a — click and verify URL | ❌ Wave 0 |
| NUM-08 | Home and Back to Numbers links work on all 3 pages | manual smoke | n/a — click all links | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Visual check that changed page loads without error
- **Per wave merge:** Full manual smoke test of all 5 success criteria
- **Phase gate:** All 5 success criteria TRUE before `/gsd-verify-work`

### Wave 0 Gaps
- No test infrastructure exists; this project explicitly excludes automated testing (PROJECT.md Out of Scope)
- Verification is manual smoke testing throughout

---

## Security Domain

Numbers pages are static read-only HTML pages with no user input, no authentication, no data submission, and no dynamic server interaction. ASVS categories V2, V3, V4, V6 do not apply. V5 (Input Validation) is trivially handled: the only user-controlled input is the `?range=` URL param, which is parsed as two integers and filtered against a hardcoded array — no DOM injection possible if the rendering code uses `textContent` or sets numeric properties rather than `innerHTML` with the param value directly.

**One caution:** Do NOT inject the raw `range` param string into innerHTML. Use it only for filtering — render item.n and item.es from the NUMBERS constant, never render the URL param value directly into DOM.

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: CLAUDE.md] — Project architecture, script load order, asset path conventions, IIFE pattern
- [VERIFIED: index.html] — Home page button structure, `.grid-two-col` grid, full-width button pattern
- [VERIFIED: assets/css/styles.css] — CSS custom properties (--bg, --card, --ink, --accent, etc.), `.btn`, `.btn-locations`, `.grid-two-col` patterns
- [VERIFIED: topic.html] — `?cat=` URL param pattern, `.container > .card` page structure, navigation button placement
- [VERIFIED: locations.html, fill-blank.html] — Home button pattern, page header structure
- [VERIFIED: locations.js line 152] — `location.href = '/'` home navigation pattern
- [VERIFIED: .planning/STATE.md] — Decision: numbers data = hardcoded constant; phase split (17 = static pages, 18 = quiz/TTS)
- [VERIFIED: .planning/REQUIREMENTS.md] — NUM-01 through NUM-08 requirements; Out of Scope: no coins for numbers
- [VERIFIED: WhichNumberQuizz.png] — 4-column grid layout for quiz cards (Phase 18 reference)
- [VERIFIED: .planning/config.json] — nyquist_validation: true

### Secondary (MEDIUM confidence)
- [VERIFIED: assets/js/shared-utils.js] — SharedUtils module pattern; confirmed numbers-learn.html does not need it in Phase 17

### Tertiary (LOW confidence / ASSUMED)
- Spanish numeral spellings for full 1–100 dataset — training knowledge, must be validated by author before committing NUMBERS constant

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — project stack is fully known, no external dependencies
- Architecture: HIGH — directly mirrors patterns already proven in 16 prior phases of this project
- Pitfalls: HIGH — derived from documented bugs and decisions in STATE.md / MEMORY.md
- Numbers data spellings: LOW — assumed from training, flagged for validation

**Research date:** 2026-04-28
**Valid until:** Indefinite — static site with no external dependencies; nothing will change unless project architecture changes
