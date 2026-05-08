# Phase 19: Quién Soy Yo — Chat Simulator - Pattern Map

**Mapped:** 2026-05-08
**Files analyzed:** 4 new/modified files
**Analogs found:** 4 / 4

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `tap-to-vocab/quien-soy.html` | page (inline IIFE) | request-response + event-driven | `tap-to-vocab/numbers-quiz.html` | exact |
| `tap-to-vocab/index.html` | page (markup only) | — | `tap-to-vocab/index.html` (btn-numbers block) | exact |
| `tap-to-vocab/assets/css/styles.css` | config (CSS append) | — | `styles.css` nq-* block (lines 1271–1344) | exact |
| `tap-to-vocab/data/quien-soy-sentences.txt` | data file | file-I/O | `tap-to-vocab/data/fill-in-blank.tsv` | role-match |

---

## Pattern Assignments

### `tap-to-vocab/quien-soy.html` (page, inline IIFE — event-driven state machine)

**Primary analog:** `tap-to-vocab/numbers-quiz.html`
**Secondary analog (state machine + loadTSV):** `tap-to-vocab/assets/js/fill-blank.js`

---

#### HTML shell pattern (numbers-quiz.html lines 1–23)

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💬</text></svg>">
  <title>Quién soy yo – Tap‑to‑Vocab</title>
  <link rel="stylesheet" href="/assets/css/styles.css" />
</head>
<body>
  <!-- page markup here -->
  <script src="/assets/js/coins.js"></script>
  <script src="/assets/js/shared-utils.js"></script>
  <script>
  (function () {
    /* all page logic */
  })();
  </script>
</body>
</html>
```

Key differences from numbers-quiz.html for quien-soy.html:
- Add `<script src="/assets/js/coins.js"></script>` before shared-utils (numbers-quiz.html omits it because no coin-counter; quien-soy.html needs `#coin-counter` per CLAUDE.md convention)
- No `<script src="/assets/js/numbers-data.js"></script>` — data comes from fetch inside the IIFE
- Body markup: `.qs-page` (chat area) + `.qs-end` (end screen), both siblings inside `<body>` or a wrapper

---

#### TTS block — verbatim copy from numbers-quiz.html lines 27–62

```javascript
// Copy verbatim — paste as first block inside the IIFE
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

NOTE: The UI-SPEC describes a `setTimeout(100)` wrapper inside `speak()` (to let `cancel()` settle on iOS). Merge this into the `speakSpanish` body:

```javascript
function speakSpanish(text) {
  try {
    window.speechSynthesis.cancel();
    setTimeout(function() {
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "es-ES";
      var v = getSpanishVoice();
      if (v) u.voice = v;
      u.rate = 0.95; u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    }, 100);
  } catch (e) { console.warn("Speech synthesis failed:", e); }
}
```

---

#### Data loading pattern (analog: fill-blank.js lines 144–161 + shared-utils.js lines 41–55)

```javascript
// SharedUtils.loadTSV signature (shared-utils.js lines 41–55):
// fetch(path, {cache:"no-store"}) -> split \r?\n -> header row -> array of {colName: value} objects
// All values already .trim()'d; missing cols return ""

SharedUtils.loadTSV('/data/quien-soy-sentences.txt').then(function(rows) {
  var questions = rows
    .filter(function(r) {
      return r['Question'] && r['Answer choice 1'] && r['Answer choice 2'];
    })
    .map(function(r) {
      var choiceParts = (r['Choices (1,2)'] || '').split(', ');
      return {
        question: r['Question'],
        label1:   choiceParts[0] || 'Opción 1',
        label2:   choiceParts[1] || 'Opción 2',
        answer1:  r['Answer choice 1'],
        answer2:  r['Answer choice 2']
      };
    });
  if (!questions.length) { showError(); return; }
  initChat(questions);
}).catch(function(err) {
  console.error('Failed to load conversation data:', err);
  showError();
});
```

Error display pattern (analog: fill-blank.js line 157–160):
```javascript
function showError() {
  var errorEl = document.getElementById('qs-error');
  if (errorEl) {
    errorEl.textContent = 'No se pudo cargar la conversación. Recarga la página.';
    errorEl.style.display = 'block';
  }
}
```

---

#### State machine pattern (analog: fill-blank.js lines 34–141)

```javascript
// All state lives in IIFE closure — same approach as fill-blank.js lines 34–36
var currentIndex = 0;
var chosenAnswers = [];
var isAnswering = false;   // guard against double-tap during 1200ms delay

// DOM refs cached at init (same pattern as fill-blank.js lines 10–17)
var chatEl   = document.getElementById('qs-chat');
var stripEl  = document.getElementById('qs-strip');
var pageEl   = document.getElementById('qs-page');
var endEl    = document.getElementById('qs-end');
var btn1     = document.getElementById('qs-btn1');
var btn2     = document.getElementById('qs-btn2');
var progressEl = document.getElementById('qs-progress');
```

Advance-then-disable pattern (analog: fill-blank.js lines 80–103, adapted):
```javascript
function onChoiceTap(choiceIndex) {
  if (isAnswering) return;          // guard — same concept as fill-blank's advanceTimer check
  isAnswering = true;
  btn1.disabled = true;             // disable immediately — fill-blank uses classList.add("disabled")
  btn2.disabled = true;

  var q = questions[currentIndex];
  var answerText = choiceIndex === 0 ? q.answer1 : q.answer2;
  chosenAnswers.push(answerText);

  appendBubble(answerText, 'right');
  setTimeout(function() { speakSpanish(answerText); }, 400);

  setTimeout(function() {
    currentIndex++;
    if (currentIndex >= questions.length) {
      showEndScreen();
    } else {
      showQuestion(currentIndex);
    }
    isAnswering = false;
  }, 1200);
}
```

---

#### End screen / reset pattern (analog: fill-blank.js lines 120–141)

```javascript
// home nav — same as fill-blank.js line 138
btnHome.onclick = function() { location.href = '/'; };

// start-again reset — mirrors fill-blank's index/history reset
function startAgain() {
  window.speechSynthesis.cancel();
  currentIndex = 0;
  chosenAnswers = [];
  chatEl.innerHTML = '';
  endEl.style.display = 'none';
  pageEl.style.display = 'flex';
  showQuestion(0);
}
```

---

### `tap-to-vocab/index.html` — ADD btn-quien-soy button

**Analog:** `tap-to-vocab/index.html` lines 55–56 (btn-numbers block)

Insert after line 56 (`.btn-numbers` anchor), before line 58 (`.btn-games` button):

```html
<!-- 💬 Quién soy yo - spans both columns -->
<a class="btn btn-quien-soy" href="/quien-soy.html">💬 Quién soy yo</a>
```

Exact insertion context (lines 55–59 of index.html):
```html
        <!-- 🔢 Numbers - spans both columns -->
        <a class="btn btn-numbers" href="/numbers.html">🔢 Qué número es?</a>

        <!-- INSERT NEW BUTTON HERE -->

        <!-- 🎮 Games - spans both columns, always visible -->
        <button class="btn btn-games" id="btn-games">🎮 Play Games (10 <span class="coin-icon"></span>)</button>
```

---

### `tap-to-vocab/assets/css/styles.css` — APPEND qs-* block after line 1344

**Analog for full-width button:** `styles.css` lines 86–91 (btn-numbers pattern)

```css
/* btn-numbers pattern to replicate for btn-quien-soy (styles.css lines 86–91): */
.grid-two-col .btn-numbers {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #2a3a5a 0%, #1a2540 100%);
  border: 2px solid var(--accent);
  font-weight: 700;
}
```

New `.btn-quien-soy` class — use a distinctly different gradient (purple-indigo tones) from existing buttons:

```css
/* ── Quién Soy Yo — Home button ─── */
.grid-two-col .btn-quien-soy {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #2a1f5a 0%, #1a1440 100%);
  border: 2px solid var(--accent);
  font-weight: 700;
}
```

**Analog for nq-* CSS structure** (styles.css lines 1271–1344) — use same organization pattern:
- Named sections with `/* ── Name ─── */` comment headers
- One property group per class
- Media queries at the bottom of the block

Full qs-* CSS block to append at line 1345 (after nq-* block ends):

```css
/* ═══════════════════════════════════════════════════
   Quién Soy Yo — Chat Simulator  (qs-*)
   ═══════════════════════════════════════════════════ */

/* ── Page layout ─── */
.qs-page {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  overflow: hidden;
}

.qs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #1e2d6b;
  flex-shrink: 0;
}

.qs-header h1 {
  margin: 0;
  font-size: clamp(1.1rem, 3vw, 1.4rem);
}

.qs-progress {
  font-size: 0.82rem;
  color: var(--muted);
  background: #0d1740;
  border: 1px solid #1e2d6b;
  border-radius: 12px;
  padding: 4px 10px;
}

.qs-chat {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 88px;    /* 88px = 24px gap + 64px strip height */
  display: flex;
  flex-direction: column;
}

.qs-answer-strip {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg);
  border-top: 1px solid #1e2d6b;
  padding: 8px 16px 12px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

/* ── Chat bubbles ─── */
.qs-bubble-row {
  display: flex;
  width: 100%;
  margin-bottom: 8px;
}

.qs-bubble-row.left  { justify-content: flex-start; }
.qs-bubble-row.right { justify-content: flex-end; }

.qs-bubble {
  max-width: 75%;
  border-radius: 18px;
  padding: 12px 16px;
  font-size: 1rem;
  line-height: 1.5;
  animation: qs-bubble-in 0.2s ease-out;
}

.qs-bubble.question {
  background: var(--card);
  color: var(--ink);
  border-bottom-left-radius: 4px;
}

.qs-bubble.answer {
  background: var(--accent);
  color: #0b1020;
  border-bottom-right-radius: 4px;
}

@keyframes qs-bubble-in {
  from { opacity: 0; transform: translateY(8px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1);    }
}

/* ── Answer buttons ─── */
.qs-choice {
  flex: 1;
  min-height: 48px;
  border-radius: 12px;
  background: #0d1740;
  border: 1.5px solid var(--accent);
  color: var(--ink);
  font-size: 0.875rem;
  font-weight: 700;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
}

.qs-choice:hover    { background: rgba(108, 168, 255, 0.12); }
.qs-choice:active   { transform: scale(0.97); }
.qs-choice:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

/* ── End screen ─── */
.qs-end {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 32px 16px;
  background: var(--bg);
}

.qs-end.visible { display: flex; }

.qs-end-card {
  background: var(--card);
  border-radius: 20px;
  padding: 32px 24px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid #2a3a80;
}

.qs-end-heading {
  font-size: clamp(1.6rem, 2.8vw, 2.2rem);
  font-weight: 700;
  color: var(--ok);
  text-align: center;
  margin: 0 0 16px;
}

.qs-intro-label {
  font-size: 0.82rem;
  color: var(--muted);
  margin-bottom: 8px;
}

.qs-intro-text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--ink);
  background: #0d1740;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #1e2d6b;
  margin-bottom: 24px;
}

.qs-end-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.qs-end-actions .btn {
  flex: 1;
  min-width: 120px;
}

/* ── Error state ─── */
#qs-error {
  display: none;
  color: var(--error);
  text-align: center;
  padding: 24px 16px;
  font-size: 1rem;
}
```

---

### `tap-to-vocab/data/quien-soy-sentences.txt` — Re-encoding to UTF-8

**No structural code changes.** This is a pre-implementation shell command, not a JS/CSS pattern.

**Analog:** Every other file in `tap-to-vocab/data/` — all UTF-8, all TSV.

```bash
# Run from repo root before implementation:
iconv -f ISO-8859-1 -t UTF-8 quien-soy-sentences.txt > tap-to-vocab/data/quien-soy-sentences.txt
# Verify:
file tap-to-vocab/data/quien-soy-sentences.txt   # should report "UTF-8 Unicode text"
```

**Column names** (header row, verified against file):
- `Question` — the question text
- `Choices (1,2)` — comma-space separated short labels (e.g., `"Bjarne, Basti"`)
- `Answer choice 1` — full answer text for button 1
- `Answer choice 2` — full answer text for button 2

**TSV loading** uses `SharedUtils.loadTSV('/data/quien-soy-sentences.txt')` — same path prefix as all other data files.

---

## Shared Patterns

### Script load order
**Source:** `tap-to-vocab/fill-blank.html` lines 77–83 / `tap-to-vocab/index.html` lines 14–15
**Apply to:** `quien-soy.html`
```html
<script src="/assets/js/coins.js"></script>
<script src="/assets/js/shared-utils.js"></script>
<script>
(function () { /* inline IIFE */ })();
</script>
```

### CSS custom property usage
**Source:** `tap-to-vocab/assets/css/styles.css` lines 1–10
**Apply to:** All new `qs-*` CSS rules
```css
:root {
  --bg:    #152238;   /* page background, chat area background */
  --card:  #121831;   /* question bubble bg, end-screen card bg */
  --ink:   #e8ecff;   /* primary text in bubbles */
  --muted: #aeb6d9;   /* progress pill, disabled text */
  --accent:#6ca8ff;   /* answer bubble bg, choice button border, btn-quien-soy border */
  --ok:    #3ddc97;   /* "¡Muy bien!" heading only */
}
```
Never use hard-coded color values where a CSS variable exists.

### Full-width grid button (home page)
**Source:** `styles.css` lines 51–56 (btn-practice) and 86–91 (btn-numbers)
**Apply to:** `.btn-quien-soy`
Pattern: `grid-column: 1 / -1` + named gradient + `border: 2px solid var(--color)` + `font-weight: 700`

### loadTSV + filter + init
**Source:** `tap-to-vocab/assets/js/fill-blank.js` lines 144–161
**Apply to:** Data loading block inside `quien-soy.html` IIFE
Pattern: `SharedUtils.loadTSV(path).then(rows => filter+map -> initX()).catch(err -> showError())`

### DOM error display
**Source:** `fill-blank.js` lines 156–160, `fill-blank.html` line 46
**Apply to:** `quien-soy.html` error state
Pattern: hidden `<div id="qs-error" class="error">` shown by setting `style.display = 'block'` and `textContent`

---

## No Analog Found

All four files have close codebase analogs. No entries in this section.

---

## Metadata

**Analog search scope:** `/home/desire/tap-to-vocab/` (repo root — site files not in nested subdirectory)
**Files read:** numbers-quiz.html, index.html, fill-blank.html, assets/js/shared-utils.js, assets/js/fill-blank.js, assets/css/styles.css (sections: lines 1–10, 39–108, 1271–1344)
**Pattern extraction date:** 2026-05-08
