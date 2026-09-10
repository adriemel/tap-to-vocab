# Phase 17: Numbers Hub & Learning Pages - Pattern Map

**Mapped:** 2026-04-28
**Files analyzed:** 6
**Analogs found:** 6 / 6

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `numbers.html` | page (hub/selector) | request-response | `games.html` | role-match (hub listing links) |
| `numbers-learn.html` | page (list renderer) | transform (filter + DOM render) | `fill-blank.html` + `games.html` | role-match |
| `numbers-quiz.html` | page (stub shell) | request-response | `fill-blank.html` | role-match |
| `assets/js/numbers-data.js` | module / data constant | — | `assets/js/coins.js` (IIFE pattern) | exact (IIFE + window export) |
| `index.html` (modify) | page (home) | — | `index.html` lines 51-88 of styles.css | exact (btn-locations pattern) |
| `assets/css/styles.css` (modify) | config/styles | — | styles.css lines 79-84 (`.btn-locations`) | exact (same block to copy) |

---

## Pattern Assignments

### `numbers.html` (hub page — range selector)

**Analog:** `games.html`

**Page shell pattern** (games.html lines 1-25):
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>">
  <title>Game Zone – Tap-to-Vocab</title>
  <link rel="stylesheet" href="/assets/css/styles.css" />
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>Game Zone</h1>
      <p style="text-align:center; color:var(--muted); margin-top:-8px; margin-bottom:20px;">
        Pick a game to play!
      </p>
      <div id="game-grid" class="game-grid"></div>
      <div class="controls" style="margin-top:24px;">
        <a class="btn secondary" href="/">Back to Learning</a>
      </div>
    </div>
  </div>
```

**Adaptation for numbers.html:** Replace `game-grid` with a vertically-stacked `.controls`-style `<div>` holding five `<a class="btn">` links (one per range). Replace the back link with `<a class="btn secondary" href="/">🏠 Home</a>`. No JS needed — pure HTML anchor links.

**Hub button list pattern** (inline HTML, no analog — use .btn directly from styles.css):
```html
<!-- Inside .container > .card -->
<div style="display:flex; flex-direction:column; gap:12px; margin-top:16px;">
  <a class="btn" href="/numbers-learn.html?range=1-20">1 – 20</a>
  <a class="btn" href="/numbers-learn.html?range=21-40">21 – 40</a>
  <a class="btn" href="/numbers-learn.html?range=41-60">41 – 60</a>
  <a class="btn" href="/numbers-learn.html?range=61-80">61 – 80</a>
  <a class="btn" href="/numbers-learn.html?range=81-100">81 – 100</a>
</div>
```

**Script load order:** No coins.js, no shared-utils.js, no JS at all needed for numbers.html (pure anchor navigation).

---

### `numbers-learn.html` (learning page — number/word list)

**Primary analog:** `fill-blank.html` (page structure) + `topic.html` (URL param pattern)

**Page shell and header pattern** (fill-blank.html lines 1-25):
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>">
  <title>Fill in the Blank – Tap‑to‑Vocab</title>
  <link rel="stylesheet" href="/assets/css/styles.css" />
</head>
<body>
  <div class="container">
    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;">
        <h1 style="margin:0">✏️ Fill in the Blank</h1>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge coin-badge" id="coin-counter"><span class="coin-icon"></span> 0</span>
        </div>
      </div>
      <!-- page content -->
    </div>
  </div>
  <script src="/assets/js/coins.js"></script>
```

**Adaptation for numbers-learn.html:** Header row has title `🔢 Números — <span id="range-title"></span>` on the left; navigation links `<a class="btn secondary" href="/">🏠 Home</a>` and `<a class="btn secondary" href="/numbers.html">← Numbers</a>` on the right (no coin-badge needed per RESEARCH.md Pitfall 2, or include it read-only for visual consistency — planner decides). Content area is `<div id="number-list"></div>`. Below it: `<a id="btn-take-test" class="btn" href="#">Take a Test →</a>`.

**URL query param pattern** (topic.html lines 142-144):
```javascript
const params = new URLSearchParams(location.search);
const cat = params.get("cat") || "";
```
Adaptation for numbers-learn.html:
```javascript
const params = new URLSearchParams(location.search);
const range = params.get("range") || "1-20";
const [lo, hi] = range.split("-").map(Number);
```

**DOM render loop pattern** (games.html lines 41-55 — same createElement + appendChild pattern):
```javascript
var grid = document.getElementById("game-grid");
GAMES.forEach(function (g) {
  var card = document.createElement("a");
  card.href = g.url;
  card.className = "game-card";
  card.innerHTML = '<span class="game-card-icon">' + g.icon + '</span>' + ...;
  grid.appendChild(card);
});
```
Adaptation for numbers-learn.html:
```javascript
const list = window.NUMBERS.filter(item => item.n >= lo && item.n <= hi);
const container = document.getElementById("number-list");
list.forEach(item => {
  const row = document.createElement("div");
  row.className = "number-row";
  // Use textContent on child spans — never inject range param directly into innerHTML
  const numEl = document.createElement("span");
  numEl.className = "number-numeral";
  numEl.textContent = item.n;
  const dashEl = document.createElement("span");
  dashEl.className = "number-dash";
  dashEl.textContent = " — ";
  const wordEl = document.createElement("span");
  wordEl.className = "number-word";
  wordEl.textContent = item.es;
  row.appendChild(numEl);
  row.appendChild(dashEl);
  row.appendChild(wordEl);
  container.appendChild(row);
});
document.getElementById("btn-take-test").href = "/numbers-quiz.html?range=" + range;
```

**Script load order** (fill-blank.html lines 77-83):
```html
<script src="/assets/js/coins.js"></script>
<script src="/assets/js/shared-utils.js"></script>
...
<script src="/assets/js/fill-blank.js"></script>
<script>FillBlank.init();</script>
```
Adaptation for numbers-learn.html: `coins.js` (if showing coin badge) → `numbers-data.js` → inline `<script>` with the render IIFE. No shared-utils.js needed (no shuffle, TTS, or sounds in Phase 17).

---

### `numbers-quiz.html` (Phase 17 stub — shell only)

**Analog:** `fill-blank.html` (same `.container > .card` page shell)

**Stub shell pattern** — copy page structure from fill-blank.html lines 1-14, then add a minimal card body:
```html
<div class="container">
  <div class="card">
    <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
      <h1 style="margin:0">🔢 Quiz</h1>
      <div style="display:flex; gap:8px;">
        <a class="btn secondary" href="/">🏠 Home</a>
        <a class="btn secondary" href="/numbers.html">← Numbers</a>
      </div>
    </div>
    <!-- JS added in Phase 18 -->
    <div id="quiz-grid"></div>
    <p style="color:var(--muted); text-align:center; margin-top:24px;">Quiz coming soon</p>
  </div>
</div>
<script src="/assets/js/numbers-data.js"></script>
<!-- Phase 18 will add quiz JS here -->
```

No inline script logic in Phase 17. The `numbers-data.js` script tag is included so Phase 18 has the constant immediately available without needing to add it.

---

### `assets/js/numbers-data.js` (new IIFE module — window.NUMBERS constant)

**Analog:** `assets/js/coins.js` (exact — same IIFE pattern, same window export)

**IIFE module pattern** (coins.js lines 6-46):
```javascript
(function () {
  const KEY = "tapvocab_coins";
  // ... internal functions ...
  window.CoinTracker = { addCoin: addCoin, getCoins: getCoins, spendCoins: spendCoins, resetCoins: resetCoins };
})();
```

**Adaptation for numbers-data.js:**
```javascript
(function () {
  window.NUMBERS = [
    { n: 1,  es: "uno" },
    { n: 2,  es: "dos" },
    // ... full list through 100 ...
    { n: 100, es: "cien" }
  ];
})();
```

Key conventions from coins.js to follow:
- Single IIFE wrapping entire file (lines 6 and 46)
- `window.NUMBERS` assignment is the only side effect
- No `"use strict"` — not used in any existing module
- No ES module syntax (`export`) — all modules use `window` assignment

---

### `index.html` (modify — add "Qué número es?" button)

**Analog:** `index.html` lines 52-53 (`.btn-locations` button, same structure)

**Exact pattern to copy** (index.html lines 52-53):
```html
<!-- 📍 Locations - spans both columns -->
<a class="btn btn-locations" href="/locations.html">&#128205; Locations</a>
```

**New button to insert** (between `btn-locations` line and `btn-games` line):
```html
<!-- 🔢 Numbers - spans both columns -->
<a class="btn btn-numbers" href="/numbers.html">🔢 Qué número es?</a>
```

Insertion point in index.html: after line 53 (`btn-locations`), before line 56 (`btn-games`).

---

### `assets/css/styles.css` (modify — add .btn-numbers rule)

**Analog:** styles.css lines 79-84 (`.btn-locations` block — exact match)

**Exact pattern to copy** (styles.css lines 79-84):
```css
.grid-two-col .btn-locations {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #3c4f6a 0%, #2a364a 100%);
  border: 2px solid var(--accent);
  font-weight: 700;
}
```

**New rule to add** (insert after line 84, before `.grid-two-col .btn-games`):
```css
.grid-two-col .btn-numbers {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #2a3a5a 0%, #1a2540 100%);
  border: 2px solid var(--accent);
  font-weight: 700;
}
```

Note: Uses a slightly different dark blue than `.btn-locations` to avoid an identical appearance — differentiates the two adjacent full-width buttons visually while staying in the same cool-blue palette.

---

## Shared Patterns

### Page Shell (.container > .card)
**Source:** `fill-blank.html` lines 15-18 and `locations.html` lines 200-210
**Apply to:** `numbers.html`, `numbers-learn.html`, `numbers-quiz.html`
```html
<div class="container">
  <div class="card">
    <!-- header row: flex, space-between, align-center, flex-wrap -->
    <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
      <h1 style="margin:0">PAGE TITLE</h1>
      <div style="display:flex; gap:8px;">
        <a class="btn secondary" href="/">🏠 Home</a>
        <!-- back link if needed -->
      </div>
    </div>
    <!-- page content here -->
  </div>
</div>
```

### Absolute Asset Paths
**Source:** Every page in the project
**Apply to:** All three new HTML pages
```html
<link rel="stylesheet" href="/assets/css/styles.css" />
<script src="/assets/js/coins.js"></script>
<script src="/assets/js/numbers-data.js"></script>
```
Never use relative paths (`../assets/...`). Always root-relative (`/assets/...`).

### CSS Custom Properties
**Source:** `assets/css/styles.css` lines 1-10
**Apply to:** Any inline styles in new pages
```css
/* Available variables */
--bg: #152238
--card: #121831
--ink: #e8ecff
--muted: #aeb6d9
--accent: #6ca8ff
--ok: #3ddc97
--warn: #ffcc66
--error: #ff6b9d
```

### .btn Base Class
**Source:** `assets/css/styles.css` lines 127-145
**Apply to:** All button/link elements in new pages
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 12px;
  background: #1a2350;
  color: var(--ink);
  border: 1px solid #2a3a80;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.15s ease, transform 0.1s ease;
}
.btn.secondary { background: transparent; border-color: #3a4b90; }
```

### IIFE Module Pattern
**Source:** `assets/js/coins.js` lines 6 and 44-46; `assets/js/shared-utils.js` lines 6 and 164-174
**Apply to:** `assets/js/numbers-data.js`
```javascript
(function () {
  // module internals
  window.EXPORT_NAME = { ... };
})();
```

### Home Navigation via anchor
**Source:** `fill-blank.html` line 42, `games.html` line 21 (`<a class="btn secondary" href="/">`)
**Apply to:** All three new pages — prefer `<a href="/">` over `<button onclick="location.href='/'">` for pure navigation (works without JS, better semantics).

---

## No Analog Found

All files have adequate analogs. No files require falling back to RESEARCH.md patterns exclusively.

| File | Note |
|---|---|
| `assets/js/numbers-data.js` (data content) | Spanish numeral spellings are ASSUMED from training knowledge — planner should verify the full 1–100 list before committing (see RESEARCH.md Assumptions Log A1) |

---

## Metadata

**Analog search scope:** `/home/desire/tap-to-vocab/*.html`, `/home/desire/tap-to-vocab/assets/js/*.js`, `/home/desire/tap-to-vocab/assets/css/styles.css`
**Files scanned:** `index.html`, `fill-blank.html`, `locations.html`, `games.html`, `topic.html`, `assets/js/coins.js`, `assets/js/shared-utils.js`, `assets/css/styles.css`
**Pattern extraction date:** 2026-04-28
