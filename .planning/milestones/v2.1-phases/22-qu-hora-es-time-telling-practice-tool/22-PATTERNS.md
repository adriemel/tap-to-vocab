# Phase 22: Qué Hora Es? — Pattern Map

**Mapped:** 2026-08-02
**Files analyzed:** 3 (1 new page, 2 modified files)
**Analogs found:** 3 / 3

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|-----------------|----------------|
| `hora.html` (new) | route/component (self-contained inline-IIFE page) | request-response (compute phrase on tap) + event-driven (pointer drag) | `numbers-quiz.html` (structure/TTS) + `quien-soy.html` (hidden-until-ready UI state) + `locations.js`/`locations.html` (drag mechanics) | exact (composite of 3 analogs — no single file covers both TTS-page and drag-picker patterns) |
| `index.html` | component (static nav) | request-response (link navigation) | itself — precedent already exists at lines 58-59 (`.btn-quien-soy`) | exact |
| `assets/css/styles.css` | config/style | n/a | `.grid-two-col .btn-quien-soy` (lines 1350-1355), `.card` (lines 27-32), `.nq-card-inner` (lines 1284-1294), `:root` (lines 1-10) | exact |

## Pattern Assignments

### `hora.html` (new page — inline IIFE)

**Analog for page skeleton/head/script-load order:** `numbers-quiz.html` (lines 1-24), simpler than `quien-soy.html` since this phase has no TSV fetch.

**Page shell pattern** (`numbers-quiz.html:1-22`):
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔢</text></svg>">
  <title>Números Quiz – Tap‑to‑Vocab</title>
  <link rel="stylesheet" href="/assets/css/styles.css" />
</head>
<body>
  <div class="container">
    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:16px;">
        <h1 style="margin:0">🔢 Quiz</h1>
        <div style="display:flex; gap:8px;">
          <a class="btn secondary" href="/">🏠 Home</a>
        </div>
      </div>
      <!-- feature content goes here -->
    </div>
  </div>
```
Use icon 🕐 per UI-SPEC, title "Qué hora es? – Tap‑to‑Vocab", `<h1>🕐 Qué hora es?</h1>`, single `🏠 Home` link (per UI-SPEC Copywriting Contract — no back-link, no hub page, matching the `quien-soy.html` single-standalone-page precedent rather than `numbers-quiz.html`'s hub-back-link).

**Script load order** (per CLAUDE.md convention — this page needs no coins.js/game-init.js since it's a pure practice tool, no scoring):
```html
<script>
(function () {
  ... all logic inline, IIFE wrapper, no window export needed ...
})();
</script>
```
`numbers-quiz.html` loads only its data script before the inline IIFE (no `coins.js`/`shared-utils.js` needed there either since it does no TSV fetch/shuffle). `hora.html` needs neither `coins.js` (no scoring, per CONTEXT.md "no scoring, coins, or stats") nor `shared-utils.js` (no TSV load, no shuffle needed) — closest precedent for "zero shared-utils dependency" is `numbers-quiz.html`.

---

**TTS pattern — copy verbatim, use the SIMPLER `tapvocab.js`/`numbers-quiz.html` variant** (not `quien-soy.html`'s chained-callback variant):

**Analog:** `assets/js/tapvocab.js:13-53` (identical copy already exists inline in `numbers-quiz.html:26-62`)

```javascript
// Source: assets/js/tapvocab.js:13-53 == numbers-quiz.html:26-62 (verbatim duplicate)
let _cachedSpanishVoice = null;
let _voicesLoaded = false;

function getSpanishVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const normalize = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const monica = voices.find(v => normalize(v.name).includes("monica") && v.lang.toLowerCase().startsWith("es"));
  if (monica) { _cachedSpanishVoice = monica; return monica; }
  const preferred = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith("es"));
  _cachedSpanishVoice = preferred[0] || voices[0] || null;
  return _cachedSpanishVoice;
}

if (typeof speechSynthesis !== "undefined") {
  var _initialVoices = speechSynthesis.getVoices();
  if (_initialVoices.length) { _voicesLoaded = true; getSpanishVoice(); }
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.addEventListener("voiceschanged", function () {
      _voicesLoaded = true;
      getSpanishVoice();
    });
  }
}

function speakSpanish(text) {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    const v = getSpanishVoice();
    if (v) u.voice = v;
    u.rate = 0.95; u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  } catch (e) { console.warn("Speech synthesis failed:", e); }
}
```

**Why the simpler variant, not `quien-soy.html`'s** (`quien-soy.html:80-114`, which wraps `speak()` in a `setTimeout(...,100)` + `onend`/`onerror` callback param): that wrapper exists solely to sequence multiple chained utterances (question → answer → next question, `quien-soy.html:201-204`). HORA-04/05/08 only ever speak one static phrase per tap — no chaining — so `tapvocab.js`'s plain synchronous-call version (already proven in `numbers-quiz.html`) is sufficient and simpler. Call sites: `speakSpanish(phrase)` on the "Qué hora es?" CTA tap, `speakSpanish(lastPhrase)` on Repeat tap.

---

**Repeat button + hidden-until-first-use pattern:**

**Analog:** `quien-soy.html:67-70` (end-screen replay button) + `quien-soy.html:50,54` (`hidden` attribute idiom)

```html
<!-- quien-soy.html:67-70 — Repeat/Replay button label + placement convention -->
<button type="button" class="btn" id="qs-replay">↺ Replay</button>
```
```html
<!-- quien-soy.html:50, 54 — hidden-until-ready idiom (attribute, not display:none inline style) -->
<section class="qs-chat" id="qs-chat" aria-live="polite" aria-label="Conversación" hidden></section>
<div class="qs-answer-strip" id="qs-strip" hidden>
```
Apply to `hora.html`: `<button type="button" class="btn" id="hora-repeat" hidden>↺ Repeat</button>` — remove the `hidden` attribute the first time the CTA handler successfully sets `lastPhrase`. Repeat's click handler must ONLY call `speakSpanish(lastPhrase)` — never recompute (see RESEARCH.md Pitfall 4).

```javascript
// Closure-scoped state pattern (quien-soy.html:132-136 style)
var lastPhrase = null;

document.getElementById('hora-cta').addEventListener('click', function () {
  var hour = getReelValue(hourReel);
  var minute = getReelValue(minuteReel);
  lastPhrase = buildTimePhrase(hour, minute);
  document.getElementById('hora-phrase-output').textContent = lastPhrase;
  speakSpanish(lastPhrase);
  var repeatBtn = document.getElementById('hora-repeat');
  repeatBtn.hidden = false;
});

document.getElementById('hora-repeat').addEventListener('click', function () {
  if (!lastPhrase) return;
  speakSpanish(lastPhrase); // never recompute — Pitfall 4
});
```

---

### Reel picker drag mechanics

**Analog:** `assets/js/locations.js:1-33` (Pointer Events wiring skeleton) — adapt from absolute-position drag-and-drop to `translateY` step-quantized continuous scroll.

**Imports/module pattern** (`locations.js:1-10`):
```javascript
(function () {
  var shiftX, shiftY, originLeft, originTop, snapTimer;
  var onDropCallback = null;
  var activeDraggable = null;

  function init(draggableEl, onDrop) {
    onDropCallback = onDrop;
    draggableEl.addEventListener('pointerdown', onPointerDown);
    draggableEl.ondragstart = function () { return false; }; // disable native image drag on desktop Chrome
  }
```

**Pointer wiring pattern to adapt** (`locations.js:12-33`):
```javascript
function onPointerDown(e) {
  if (!e.isPrimary) return; // ignore secondary touches (multi-touch) — REQUIRED guard, repeat on move/up too
  var el = e.currentTarget;
  if (snapTimer) { clearTimeout(snapTimer); snapTimer = null; }

  var rect = el.getBoundingClientRect();
  shiftX = e.clientX - rect.left;
  shiftY = e.clientY - rect.top;
  originLeft = rect.left;
  originTop = rect.top;

  el.style.position = 'fixed';
  el.style.zIndex = '1000';
  el.style.transition = 'none';  // disable transition during active drag (idiom to reuse)
  el.style.left = (e.clientX - shiftX) + 'px';
  el.style.top = (e.clientY - shiftY) + 'px';

  activeDraggable = el;
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointercancel', onPointerUp); // iOS diagonal drag safety
}
```
For the reel picker, replace `el.style.left/top` absolute positioning with `dragOffsetPx` accumulation + `translateY`, and replace `originLeft/originTop` snap-back with step-quantized settle (see RESEARCH.md Pattern 2, mechanics 2-3). Reuse verbatim: the `!e.isPrimary` guard, `setPointerCapture`-adjacent capture-safe event wiring (locations.js uses document-level listeners added on pointerdown/removed on pointerup — same idiom applies here), and the `pointercancel` safety listener.

**Release/settle transition pattern** (`locations.js:86-98`, adapt duration/easing per UI-SPEC's 250ms `cubic-bezier(0.4,0.2,0.2,1)` instead of locations.js's `0.25s ease`):
```javascript
function snapBack(el) {
  el.style.transition = 'left 0.25s ease, top 0.25s ease';
  el.style.left = originLeft + 'px';
  el.style.top = originTop + 'px';
  snapTimer = setTimeout(function () {
    el.style.position = '';
    el.style.transition = '';
    ...
  }, 260);
}
```
Adapt to: `el.style.transition = 'transform 0.25s cubic-bezier(0.4, 0.2, 0.2, 1)'; el.style.transform = 'translateY(0)';` then clear the active-drag highlight class after the same duration.

**`touch-action: none` convention** — required on the reel container, confirmed existing precedent:
```css
/* locations.html:169-175 — #draggable */
#draggable {
  position: absolute;
  ...
  touch-action: none;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  ...
}
```
Apply identical `touch-action: none; user-select: none; -webkit-user-select: none;` to the new `.hora-reel` container class — without this, touch-drag fights the page's native scroll (RESEARCH.md Pitfall 3).

---

### `buildTimePhrase(hour24, minute)` — pure function (no direct codebase analog; new domain logic)

No existing file in this codebase performs Spanish grammar generation — this is genuinely new logic, not a copy-adapt case. Use RESEARCH.md's fully-specified `buildTimePhrase` implementation (RESEARCH.md lines 143-179) verbatim as the starting point; it has been hand-verified against 9 worked examples (RESEARCH.md lines 181-192). Write as a standalone function inside the IIFE with zero DOM/global dependencies, per RESEARCH.md's Validation Architecture recommendation (so it can optionally be lifted into a Node-runnable assert script, `hora-phrase.test.js`, without refactoring).

---

## Shared Patterns

### Home button — new full-width nav entry
**Source:** `index.html:58-59` (`.btn-quien-soy` placement) + `assets/css/styles.css:1350-1355`
**Apply to:** `index.html` (add below the Quién soy yo button) and new `.btn-hora` CSS class

```html
<!-- index.html:58-59 -->
<!-- 💬 Quién soy yo - spans both columns -->
<a class="btn btn-quien-soy" href="/quien-soy.html">💬 Quién soy yo</a>
```
```css
/* assets/css/styles.css:1350-1355 */
.grid-two-col .btn-quien-soy {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #2a1f5a 0%, #1a1440 100%);
  border: 2px solid var(--accent);
  font-weight: 700;
}
```
New button: `<a class="btn btn-hora" href="/hora.html">🕐 Qué hora es?</a>` placed directly below the `.btn-quien-soy` line in `index.html`; new `.grid-two-col .btn-hora` CSS class reuses the exact same gradient/border/font-weight combo verbatim per UI-SPEC's explicit instruction ("Reuse that gradient/border combo verbatim rather than inventing a new one").

### Card container styling
**Source:** `assets/css/styles.css:27-32` (`.card`), `assets/css/styles.css:207-213` / `532-538` (`.stat`/`.result-item` — one-shade-darker recessed background)
**Apply to:** `.hora-clock-card`, `.hora-reel` container, `.hora-phrase-card`

```css
/* .card — assets/css/styles.css:27-32 */
.card {
  background: var(--card);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,.35);
}
```
```css
/* .result-item / .stat — recessed darker background, assets/css/styles.css:207-213, 532-538 */
.result-item {
  background: #0f1540;
  border: 1px solid #243688;
  border-radius: 12px;
  padding: 16px 20px;
  text-align: center;
  min-width: 100px;
}
```
UI-SPEC calls for `.hora-clock-card`/`.hora-phrase-card` to use `var(--card)` at `16px` radius (matches `.card` exactly), and the reel container itself to use the one-shade-darker `#0f1540` recessed background (matches `.result-item`/`.stat` exactly) — both are direct existing conventions, not new colors.

### Active-press / active-drag transform feedback idiom
**Source:** `assets/css/styles.css:150` (`.btn:active`), `assets/css/styles.css:433-435` (`.flip-card-front:active`)
**Apply to:** `.hora-reel.dragging` (active-drag highlight, D-04)

```css
/* assets/css/styles.css:150 */
.btn:active { transform: translateY(1px); }
```
```css
/* assets/css/styles.css:433-435 */
.flip-card-front:active {
  transform: scale(0.98);
}
```
Both existing examples scale/translate *down* on interaction; D-04 explicitly wants the reel to scale *up* while dragging (`scale(1.05)`) to visually distinguish "actively scrolling a reel" from "tapping a button" — same idiom family (transform + short transition on interaction state), inverted direction per CONTEXT.md decision.

### Disable-transition-during-drag / re-enable-on-release idiom
**Source:** `assets/js/locations.js:25` (`el.style.transition = 'none'` on pointerdown) + `assets/js/locations.js:87` (`el.style.transition = 'left 0.25s ease, top 0.25s ease'` on release) — same idiom also used for flip-card reset per MEMORY.md ("Quiz Mode Details": temporarily disable transition, force reflow, restore transition)
**Apply to:** Reel drag start/end (RESEARCH.md mechanic 5)

Set `transition: none` on `pointerdown`, restore the 250ms `cubic-bezier(0.4,0.2,0.2,1)` transition only on `pointerup`/`pointercancel` — ensures the reel tracks the finger 1:1 with zero lag during drag, then animates smoothly to the settled value on release.

### Transition-timing/easing precedent for snap animations
**Source:** `assets/css/styles.css:1288` (`.nq-card-inner`)
```css
.nq-card-inner {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  transition: transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1);
  transform-style: preserve-3d;
}
```
UI-SPEC explicitly cites this exact easing curve (`cubic-bezier(0.4, 0.2, 0.2, 1)`) as the precedent to reuse for the reel's 250ms settle transition — "same easing already used by `.nq-card-inner` flip transition, for visual-language consistency."

### CSS custom properties (colors) — no new values needed
**Source:** `assets/css/styles.css:1-10` (`:root`)
```css
:root {
  --bg:#152238;
  --card:#121831;
  --ink:#e8ecff;
  --muted:#aeb6d9;
  --accent:#6ca8ff;
  --ok:#3ddc97;
  --warn:#ffcc66;
  --error:#ff6b9d;
}
```
Every color in UI-SPEC maps to one of these — apply directly, do not introduce new hex values (except the already-established `#0f1540`/`#243688` recessed-panel pair used by `.result-item`/`.stat`, which is itself a reusable existing convention, not new).

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `buildTimePhrase()` grammar function | utility (pure function) | transform | No prior Spanish-grammar-generation logic exists anywhere in this codebase — every other page is data-driven from TSV files, not computed from rules. RESEARCH.md's fully-specified, hand-verified implementation (lines 143-179) is the reference to use instead of a codebase analog. |
| Reel/scroll-picker rendering (value + ±2 faded neighbors) | component | transform | No existing reel/wheel-picker UI exists in this codebase (closest prior interactions are flip-cards and drag-to-drop-zone, neither of which renders a scrolling value list). Build fresh per UI-SPEC's Component Specification section (row pitch, opacity-by-distance, re-render-on-step-change strategy from RESEARCH.md mechanic 4), using only `locations.js`'s event-wiring skeleton as the drag-mechanics analog.

## Metadata

**Analog search scope:** `assets/js/*.js`, `assets/css/styles.css`, root-level `*.html` pages (`index.html`, `numbers-quiz.html`, `quien-soy.html`, `locations.html`)
**Files scanned:** 7 (`tapvocab.js`, `locations.js`, `locations.html`, `index.html`, `quien-soy.html`, `numbers-quiz.html`, `assets/css/styles.css`)
**Pattern extraction date:** 2026-08-02
