# Phase 24: Topics & Unidades Navigation - Pattern Map

**Mapped:** 2026-09-10
**Files analyzed:** 6 (2 created, 4 modified)
**Analogs found:** 6 / 6

All line numbers below were re-verified directly against the current working tree (not copied from CONTEXT.md, which had drifted slightly — see notes per file).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|--------------------|------|-----------|-----------------|---------------|
| `topics.html` (new) | route / static hub page | request-response (static markup, no fetch) | `numbers.html` | exact structural match, missing coin-counter |
| `unidades.html` (new) | route / static hub page | request-response (static markup, no fetch) | `numbers.html` | exact structural match, missing coin-counter |
| `index.html` (modified) | route / static hub page | request-response | itself (no external analog needed — editing in place) | n/a (self-edit) |
| `assets/css/styles.css` (modified) | config/style | n/a | `.grid-two-col .btn-numbers` / `.btn-practice` rules in same file | exact (variant-rule pattern) |
| `topic.html` (modified, inline script) | route + controller (inline JS) | request-response (reads URL param, calls into JS module) | itself, `params.get("cat")` block | exact (self-edit, extend one line) |
| `assets/js/tapvocab.js` (modified) | service/module (`initFromTSV`) | CRUD-ish / transform (filters an in-memory TSV row array) | itself, `initFromTSV` | exact (self-edit, extend filter) |

## Pattern Assignments

### `topics.html` / `unidades.html` (new, static hub pages)

**Analog:** `numbers.html` (full file, 30 lines — quoted in full below)

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔢</text></svg>">
  <title>Números – Tap‑to‑Vocab</title>
  <link rel="stylesheet" href="/assets/css/styles.css" />
</head>
<body>
  <div class="container">
    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
        <h1 style="margin:0">🔢 Números</h1>
        <a class="btn secondary" href="/">🏠 Home</a>
      </div>
      <p style="text-align:center; color:var(--muted); margin-top:-8px; margin-bottom:20px;">
        Select a range to study
      </p>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <a class="btn" href="/numbers-learn.html?range=1-20">1 – 20</a>
        <a class="btn" href="/numbers-learn.html?range=21-40">21 – 40</a>
        <a class="btn" href="/numbers-learn.html?range=41-60">41 – 60</a>
        <a class="btn" href="/numbers-learn.html?range=61-80">61 – 80</a>
        <a class="btn" href="/numbers-learn.html?range=81-100">81 – 100</a>
      </div>
    </div>
  </div>
</body>
</html>
```

**What this file LACKS that `topics.html`/`unidades.html` need (NAV-05 / criterion 5):**
1. No `<span class="badge coin-badge" id="coin-counter">` element anywhere.
2. No `<script src="/assets/js/coins.js">` tag — without it, even if the badge markup were added, it would never update (coins.js is what wires `#coin-counter` on `DOMContentLoaded` + `coinschanged`).

**Where to source the missing coin-counter markup:** `topic.html:16-24` (quoted below) is the canonical header row that already pairs an `<h1>` with `#coin-counter` in the same flex row as a control button. Graft its coin-badge `<span>` into the `numbers.html` header `<div>` (which already has the flex row + `<h1>` + a `.btn.secondary` Home link — just add the badge as a sibling of the `<h1>` before or after it, same as `topic.html` does with the counter/coin-counter pair).

`topic.html:16-24` (canonical header row with coin badge — quoted verbatim):
```html
  <div class="container">
    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
        <h1 id="title" style="margin-bottom:0;">Category</h1>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge coin-badge" id="coin-counter"><span class="coin-icon"></span> 0</span>
          <span class="badge" id="counter">0 / 0</span>
        </div>
      </div>
```

For the sub-screens (no `#counter` needed — that's quiz progress, N/A here), the merged header should look like:
```html
<div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
  <h1 style="margin:0">📚 Topics</h1>
  <div style="display:flex; align-items:center; gap:8px;">
    <span class="badge coin-badge" id="coin-counter"><span class="coin-icon"></span> 0</span>
    <a class="btn secondary" href="/">🏠 Home</a>
  </div>
</div>
```
(Merging `numbers.html`'s Home-button-in-the-header-row layout with `topic.html`'s coin-badge-in-a-flex-group pattern — both flex-row idioms coexist in the codebase, this is the natural combination.)

**Script tag to add** (place after `</html>`-adjacent closing `</div>` of `.container`, before `</body>`, mirroring where `topic.html:138` places it): `<script src="/assets/js/coins.js"></script>`. No other script is needed — `topics.html`/`unidades.html` are static, no `shared-utils.js`, no page-specific JS module (per CONTEXT.md Claude's Discretion: "no JS, no runtime read of words.tsv").

**Button list to substitute** (in place of `numbers.html`'s 5 range links), using the `?topic=`/`?cat=` params per CONTEXT.md decisions:

`topics.html` (9 buttons, `?topic=` param, order = 6 existing in home-screen order then 3 new):
```html
<a class="btn" href="/topic.html?topic=Colores">🎨 Colores</a>
<a class="btn" href="/topic.html?topic=Animales">🦊 Animales</a>
<a class="btn" href="/topic.html?topic=Numeros">🔢 Numeros</a>
<a class="btn" href="/topic.html?topic=Saludar">👋 Saludar</a>
<a class="btn" href="/topic.html?topic=Palabras">🧩 Palabras</a>
<a class="btn" href="/topic.html?topic=Casa_Familia">🏠 Casa y Familia</a>
<a class="btn" href="/topic.html?topic=Calendario">🗓️ Calendario</a>
<a class="btn" href="/topic.html?topic=Comida_Bebida">🍽️ Comida y Bebida</a>
<a class="btn" href="/topic.html?topic=Escuela">🎒 Escuela</a>
```
Slugs verified directly against `data/words.tsv`'s unique `topics` column values: `Animales, Calendario, Casa_Familia, Colores, Comida_Bebida, Escuela, Numeros, Palabras, Saludar` — exactly these 9, matching CONTEXT.md.

`unidades.html` (5 buttons, `?cat=` param unchanged — same URLs the old home buttons used, plus the new Unidad5B which never had a home-screen button):
```html
<a class="btn" href="/topic.html?cat=Unidad2">2️⃣ Unidad 2</a>
<a class="btn" href="/topic.html?cat=Unidad3">3️⃣ Unidad 3</a>
<a class="btn" href="/topic.html?cat=Unidad4">4️⃣ Unidad 4</a>
<a class="btn" href="/topic.html?cat=Unidad5A">5️⃣ Unidad 5A</a>
<a class="btn" href="/topic.html?cat=Unidad5B">5️⃣ Unidad 5B</a>
```
Verified `category` column in `data/words.tsv` has exactly `Unidad2, Unidad3, Unidad4, Unidad5A, Unidad5B` (plus `Animales, Casa_Familia, Colores, Numeros, Palabras, xAnimales, xCasa_Familia`). Note: `index.html` today only links `Unidad2/3/4/5A` — Unidad5B has never had a home-screen entry point until this phase's `unidades.html`.

**`<title>` and favicon emoji:** follow `numbers.html`'s pattern (`<title>Números – Tap‑to‑Vocab</title>` and an inline SVG data-URI favicon using the page's emoji). Use `📚`/`📖` respectively to match the new home-screen button emoji (D-03).

---

### `index.html` (modified)

**Role:** static hub page. No analog needed outside itself — this is an in-place edit.

**Block to delete verbatim** (`index.html:29-38`, the 10 category `<a>` lines — note: CONTEXT.md said "lines ~29-41" but line 39 is a blank line and lines 40-41 are a comment + the Practice button, which must NOT be deleted):
```html
        <a class="btn" href="/topic.html?cat=Colores">🎨 Colores</a>
        <a class="btn" href="/topic.html?cat=Animales">🦊 Animales</a>
        <a class="btn" href="/topic.html?cat=Numeros">🔢 Numeros</a>
        <a class="btn" href="/topic.html?cat=Saludar">👋 Saludar</a>
        <a class="btn" href="/topic.html?cat=Palabras">🧩 Palabras</a>
        <a class="btn" href="/topic.html?cat=Casa_Familia">🏠 Casa y Familia</a>
        <a class="btn" href="/topic.html?cat=Unidad2">2️⃣ Unidad 2</a>
        <a class="btn" href="/topic.html?cat=Unidad3">3️⃣ Unidad 3</a>
        <a class="btn" href="/topic.html?cat=Unidad4">4️⃣ Unidad 4</a>
        <a class="btn" href="/topic.html?cat=Unidad5A">5️⃣ Unidad 5A</a>
```

**Neighbouring block that MUST stay byte-identical** (`index.html:40-41`, the comment + Practice button — first thing after the deleted block, proves NAV-02):
```html
        <!-- ⭐ Practice with dynamic count - spans both columns -->
        <a id="practice-btn" class="btn btn-practice" href="/topic.html?cat=practice">⭐ Practice</a>
```

**New markup to insert** in place of the deleted block (D-01: side by side in `.grid-two-col`, D-02: default `.btn` colours + taller via new classes, D-03: emoji + name only):
```html
        <a class="btn btn-topics" href="/topics.html">📚 Topics</a>
        <a class="btn btn-unidades" href="/unidades.html">📖 Unidades</a>
```
These are two ordinary (non-spanning) `.btn` children — per CONTEXT.md's "Established Patterns" note, `.grid-two-col`'s `1fr 1fr` columns already lay two non-spanning children side by side automatically; no new `grid-column` rule is needed (that's what `.btn-practice` etc. add explicitly via `grid-column: 1 / -1` to span both — the new buttons must NOT get that property).

**`.grid-two-col` container itself** — unchanged, but quoted here for reference (`index.html:28`): `<div class="grid-two-col">` wraps both the new pair and every existing spanning button; do not touch this line.

---

### `assets/css/styles.css` (modified)

**Analog for the base `.btn` rule** (`styles.css:134-145`):
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
  user-select:none;
  transition: background 0.15s ease, transform 0.1s ease;
}
```
D-02 says: keep this exact fill (`#1a2350`) and 1px border (`#2a3a80`) — no gradient, no accent border, no `font-weight: 700`. Only `padding` changes.

**Analog for `.grid-two-col` container and its plain-`.btn` child rule** (`styles.css:39-49`):
```css
.grid-two-col {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr; /* Force 2 equal columns */
}

.grid-two-col .btn {
  width: 100%; /* Ensure buttons fill their grid cell */
  text-align: center;
  justify-content: center;
}
```

**Analog for an existing variant rule that DOES span + accent** (`styles.css:86-91`, `.btn-numbers` — quoted to show the pattern shape the new rules should follow structurally, even though D-02 rejects the accent/span parts):
```css
.grid-two-col .btn-numbers {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #2a3a5a 0%, #1a2540 100%);
  border: 2px solid var(--accent);
  font-weight: 700;
}
```

**New rules to add**, modeled on the shape above but honoring D-02 (no gradient/border/span) and D-04 (bottom gap only on the new row, touching nothing below it):
```css
.grid-two-col .btn-topics,
.grid-two-col .btn-unidades {
  padding: 20px 16px;
}

.grid-two-col .btn-unidades {
  margin-bottom: 16px; /* D-04: one larger gap before ⭐ Practice; exact px is Claude's call */
}
```
Note: only one of the two buttons needs the `margin-bottom` (they sit in the same grid row, side by side) — apply it to whichever button is visually last in DOM order (`.btn-unidades`, per the layout in CONTEXT.md's ASCII diagram) so it doesn't double up if grid quirks ever stack them on narrow screens. Alternatively, wrap both in a class like `.topics-unidades-row` — either approach satisfies D-04's requirement that "no rule touches `.btn-practice` or anything below it."

**Narrow-viewport override that will also apply** (`styles.css:1186-1191`, already exists — new buttons inherit this automatically since they remain plain `.grid-two-col .btn` elements, just flag it so the executor knows taller padding gets overridden below 420px):
```css
@media (max-width: 420px) {
  .grid-two-col .btn {
    font-size: 0.85rem;
    padding: 10px 8px;
  }
}
```
If D-02's "taller" look must survive on narrow phones, the new `.btn-topics`/`.btn-unidades` padding rule needs higher specificity inside that same media query too (e.g. add `.grid-two-col .btn-topics, .grid-two-col .btn-unidades { padding: 16px 8px; }` inside the `@media (max-width: 420px)` block) — otherwise on small screens they will collapse to the same 10px padding as every other button, silently undoing D-02. This is a judgment call for the plan/executor; noting it here since CONTEXT.md did not mention this interaction.

**Coin badge CSS already exists and needs no changes** (`styles.css:1194-1200`, `.coin-badge`) — the new pages just add the markup + script tag; the CSS class is shared and untouched.

---

### `topic.html` (modified, inline script)

**Analog:** itself — the current inline script block, quoted verbatim (`topic.html:141-145`):
```html
  <script>
    const params = new URLSearchParams(location.search);
    const cat = params.get("cat") || "";
    TapVocabTSV.initFromTSV({ category: cat });
```
(Line numbers verified directly: the `<script>` opening tag is at line 141, `params.get("cat")` at 143, the `initFromTSV` call at 144.)

**What must differ:** add a `topic` read and pass it through as a second, distinct `opts` key (per CONTEXT.md's discretion note: a new `?topic=` param, not an OR-merge into `?cat=`):
```html
  <script>
    const params = new URLSearchParams(location.search);
    const cat = params.get("cat") || "";
    const topic = params.get("topic") || "";
    TapVocabTSV.initFromTSV({ category: cat, topic: topic });
```
The rest of the file (fallback CSS `:has()` shim at `topic.html:146-156`) is untouched.

---

### `assets/js/tapvocab.js` (modified, `initFromTSV`)

**Analog:** itself. Exact current line numbers (re-verified — CONTEXT.md's "460-472" is close but the filter line itself is at 472, not 471, and the practice-check is at 469, not 466):

**`opts` destructuring** (`tapvocab.js:459-463`):
```javascript
  async function initFromTSV(opts) {
    const category = (opts && opts.category) || inferCategoryFromPath();
    const tsvPath = (opts && opts.tsvPath) || "/data/words.tsv";
    const titleEl = document.getElementById("title");
    const errorEl = document.getElementById("error");
```

**Practice special case + core filter** (`tapvocab.js:469-473`):
```javascript
      if (category.toLowerCase() === "practice") {
        words = getPracticeList();
      } else {
        words = shuffleArray(rows.filter(r => r.category.toLowerCase() === category.toLowerCase()));
      }
```

**Empty-result branch, including the `titleEl`/error text that references the raw slug** (`tapvocab.js:475-497`):
```javascript
      if (!words.length) {
        titleEl.textContent = category === "practice" ? "⭐ Practice" : category;
        errorEl.textContent = category.toLowerCase() === "practice"
          ? "Your practice list is empty. Mark words with ⭐ to add them."
          : "No words found for category: " + category;
        errorEl.style.display = "block";

        // Hide non-functional UI
        document.getElementById("browse-mode").style.display = "none";
        const mt = document.querySelector(".mode-tabs");
        if (mt) mt.style.display = "none";

        // Create a visible Home button below the error
        const homeDiv = document.createElement("div");
        homeDiv.className = "controls";
        homeDiv.style.marginTop = "16px";
        const hb = document.createElement("button");
        hb.className = "btn secondary";
        hb.textContent = "🏠 Home";
        hb.onclick = function () { location.href = "/"; };
        homeDiv.appendChild(hb);
        errorEl.after(homeDiv);
        return;
      }

      titleEl.textContent = category === "practice" ? "⭐ Practice" : category;
```

**What must differ:** the `opts` destructure needs a `topic` field, and the filter expression needs an OR branch for `r.topics`. Per CONTEXT.md's integration note, `r.topics` can be `""` for the 171 untagged sentence rows and `undefined` for practice-list entries restored from `localStorage` (those objects are `{es, de, category}` only — see `CONVENTIONS.md`'s `localStorage Keys` table, `practiceList` value shape `{es, de, category}`, no `topics` key at all). Any new comparison must guard with `(r.topics || "")` before calling `.toLowerCase()`, mirroring the project's established TSV-parsing guard convention (`.planning/codebase/CONVENTIONS.md` "TSV Parsing Pattern" section: `(cols[i] || "").trim()`).

Suggested shape (illustrative, not prescriptive — the plan owns the exact wording):
```javascript
    const category = (opts && opts.category) || inferCategoryFromPath();
    const topic = (opts && opts.topic) || "";
    ...
      if (category.toLowerCase() === "practice") {
        words = getPracticeList();
      } else if (topic) {
        words = shuffleArray(rows.filter(r => (r.topics || "").toLowerCase() === topic.toLowerCase()));
      } else {
        words = shuffleArray(rows.filter(r => r.category.toLowerCase() === category.toLowerCase()));
      }
```
Note the existing `category` branch already assumes `r.category` is always a truthy string (no `|| ""` guard) — this is safe today because every row's `category` column is always populated. `r.topics`, in contrast, is knowingly blank/absent for a subset of rows, so the new branch needs the guard even though the sibling branch doesn't have one.

**Title-rendering note** (`tapvocab.js:476` and `:500`) — both branches render `category` raw, not `topic`. If a `?topic=` URL is used, `category` will be `""` (topic.html's inline script only sets `category: cat` from `params.get("cat")`, which will be empty when only `?topic=` is present), so the title would render as blank/empty rather than the topic slug. The plan must either pass `topic` into the title logic too, or set a display value before calling `titleEl.textContent`. CONTEXT.md flags the underscore-to-space cleanup (`Casa_Familia` → "Casa y Familia") as optional polish, but rendering nothing at all for topic pages would be a regression, not merely inelegant — worth flagging to the planner as a must-fix, not purely discretionary.

**Quiz-complete modal's Practice button** (`tapvocab.js:352-354`, confirmed via grep — matches CONTEXT.md exactly):
```javascript
    modalPractice.onclick = () => {
      location.href = "/topic.html?cat=practice";
    };
```
No change needed here — `?cat=practice` must keep working and this phase does not touch it.

---

## Shared Patterns

### Coin counter + coins.js auto-wiring
**Source:** `assets/js/coins.js` (module referenced, not modified this phase) + markup at `topic.html:21`
**Apply to:** `topics.html`, `unidades.html`
```html
<span class="badge coin-badge" id="coin-counter"><span class="coin-icon"></span> 0</span>
```
Plus `<script src="/assets/js/coins.js"></script>` before `</body>`. No other JS required — `coins.js` self-initializes on `DOMContentLoaded` and listens for the `coinschanged` `CustomEvent`.

### Button-variant CSS pattern
**Source:** `assets/css/styles.css:51-92` (the `.grid-two-col .btn-*` block)
**Apply to:** new `.btn-topics` / `.btn-unidades` rules
Every existing tool button follows `grid-column: 1/-1` + accent gradient + `border: 2px solid var(--*)` + `font-weight: 700`. The new rules are a deliberate **exception** to this pattern per D-02 — they must NOT copy the `grid-column`, gradient, or accent-border lines, only the *convention of having a dedicated `.grid-two-col .btn-xxx` class* to hold layout-only overrides (padding, margin).

### Static hub-page skeleton
**Source:** `numbers.html` (full file)
**Apply to:** `topics.html`, `unidades.html`
`.container` > `.card` > header flex row (`h1` + controls) > instruction paragraph (optional, not required by any NAV requirement) > `display:flex; flex-direction:column; gap:12px` button stack. CONTEXT.md leaves single-column vs 2-column stack as Claude's discretion; `numbers.html`'s single-column stack is the literal precedent if the plan doesn't call out a 2-column grid explicitly.

## No Analog Found

None. All 6 files in scope have a strong same-repo analog (four are self-edits of files already fully understood; two new files map cleanly onto `numbers.html` + `topic.html`'s header row).

## Verified Blast-Radius Check (grep, not assumption)

`grep -rn "cat=" --include="*.html" --include="*.js" .` (excluding `.planning/`) returns exactly:
- `index.html:29-38` — the 10 category buttons being deleted (confirmed lines, not 29-41 as CONTEXT.md estimated — 39 is blank, 40 is a comment, 41 is the Practice button which stays)
- `index.html:41` — `?cat=practice` (Practice button, untouched)
- `assets/js/tapvocab.js:354` — `?cat=practice` (quiz-complete modal's Practice button, untouched)

`grep -n "topic.html" -r` (excluding `.planning/`) additionally returns only a comment (`tapvocab.js:61`) and the `og:url` meta tag in `topic.html` itself (self-reference, irrelevant).

**Confirmed: CONTEXT.md's claim holds exactly.** No other file in the repo links to `/topic.html?cat=...`. Deleting the 10 category lines from `index.html` has zero blast radius beyond that file; `?cat=practice` is unaffected because it lives on a different line (41) that is explicitly preserved.

## Metadata

**Analog search scope:** repo root (`*.html`), `assets/js/`, `assets/css/styles.css`, `data/words.tsv` (for slug/value verification)
**Files scanned:** `numbers.html`, `topic.html`, `index.html`, `assets/js/tapvocab.js`, `assets/css/styles.css`, `data/words.tsv`
**Pattern extraction date:** 2026-09-10
