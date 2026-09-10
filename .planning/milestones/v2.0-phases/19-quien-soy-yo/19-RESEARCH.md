# Phase 19: Quién Soy Yo — Chat Simulator - Research

**Researched:** 2026-05-08
**Domain:** Vanilla HTML/CSS/JS chat simulator with Web Speech API TTS
**Confidence:** HIGH

---

## Summary

Phase 19 adds a standalone chat simulator page (`quien-soy.html`) where users practice a Spanish self-introduction by tapping answer choices that animate in as WhatsApp-style bubbles. The entire feature is implemented using the project's established zero-dependency vanilla pattern — an inline IIFE script inside the HTML page, CSS classes appended to `styles.css`, and a `SharedUtils.loadTSV()`-like fetch for the data file.

The data file `quien-soy-sentences.txt` sits at the repo root and is **ISO-8859-1 encoded** — unlike every other data file which is UTF-8. This is the only structural issue that needs to be resolved before fetch-based loading will work correctly. The recommended fix is to re-encode the file to UTF-8 (one `iconv` command) and move it to `/data/` to follow the existing data-file pattern.

The TTS pattern from `numbers-quiz.html` is a verbatim drop-in: cache the Spanish voice, cancel any current utterance, then speak. The chat state machine is simple — index into a 14-item question array, advance on tap, swap to end screen after question 14. No coin logic, no scoring, no game-lives guard needed per REQUIREMENTS.md.

**Primary recommendation:** Build `quien-soy.html` as an inline IIFE (Phase 18 pattern), re-encode the data file to UTF-8 and place it in `/data/`, use `SharedUtils.loadTSV()` for loading, and copy the TTS block verbatim from `numbers-quiz.html`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Chat flow state machine | Browser/Client | — | Entirely client-side; index + array = no server needed |
| TSV data loading | Browser/Client | — | `fetch('/data/quien-soy-sentences.txt')` at page load |
| Bubble rendering | Browser/Client | — | DOM manipulation in IIFE script |
| TTS (question + answer) | Browser/Client | — | Web Speech API, already used in numbers-quiz.html |
| CSS chat UI | CDN/Static | — | New `qs-*` classes appended to styles.css |
| Home button integration | Browser/Client | — | One new `<a>` element in index.html |

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHAT-01 | "Quién soy yo" button on home screen below "Qué número es?" | Add `.btn-quien-soy` `<a>` inside `.grid-two-col` in index.html after `.btn-numbers` |
| CHAT-02 | First question appears as left-aligned grey bubble on page load | IIFE loads data, renders first `.qs-bubble.question` after fetch resolves |
| CHAT-03 | Two answer-choice buttons visible at bottom for each question | `.qs-choice` buttons in `.qs-answer-strip` (fixed bottom bar) |
| CHAT-04 | Tapping a choice appends chosen answer as right-aligned colored bubble | Event listener appends `.qs-bubble.answer.right`, disables both buttons |
| CHAT-05 | After short delay, next question appears | `setTimeout(showNextQuestion, 1200)` after answer bubble lands |
| CHAT-06 | Chat scroll follows latest bubble | `bubble.scrollIntoView({ behavior: 'smooth', block: 'end' })` after appending |
| AUDIO-01 | TTS reads question when it appears | Call `speak(question)` immediately after appending question bubble |
| AUDIO-02 | TTS reads chosen answer after it lands | `setTimeout(() => speak(answer), 400)` after answer bubble appended |
| END-01 | End screen with "¡Muy bien!" heading appears after Q14 | State check `if (currentIndex >= questions.length)` triggers end-screen swap |
| END-02 | Full introduction paragraph (all chosen answers + closing) | `chosenAnswers.join(' ') + ' ¡Muchas gracias por escuchar!'` |
| END-03 | TTS auto-reads paragraph on end screen load | `setTimeout(() => speak(fullParagraph), 300)` in showEndScreen() |
| END-04 | Replay button re-reads paragraph | `onclick = () => speak(fullParagraph)` |
| END-05 | Start Again button resets to question 1 | Reset state, hide end screen, show chat, call `showQuestion(0)` |
| END-06 | Home button goes to index.html | `window.location.href = 'index.html'` or `<a href="/">` |
| DATA-01 | Questions/choices/answers loaded from quien-soy-sentences.txt | `fetch('/data/quien-soy-sentences.txt')` using SharedUtils.loadTSV pattern |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- **Zero-dependency static site** — no build step, no npm, no frameworks. Every solution is vanilla HTML/CSS/JS.
- **No external CDN or library dependencies** — everything self-contained.
- **All asset paths are absolute from root** — `/assets/...`, `/data/...`; file:// protocol will not work.
- **Script load order** — `coins.js` first, then `shared-utils.js`, then page JS (inline IIFE or separate file).
- **IIFE pattern** — JS modules exported to `window`; inline IIFEs used for page-specific logic (Phase 18 pattern).
- **TSV loading** — `fetch(path, { cache: "no-store" })` with `\r?\n` line splitting and dynamic header parsing.
- **Dark theme** — CSS custom properties from `:root` in `styles.css`; no new color values.
- **`coins.js` auto-updates `#coin-counter`** — include coins.js `<script>` tag even when no coins are awarded (for counter display consistency).
- **CSS class prefixes** — new classes for this phase use `qs-` prefix, appended after the `nq-*` block at the bottom of `styles.css`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JS (IIFE) | ES5/ES6 | Page logic | Project's established pattern — no frameworks |
| Web Speech API | Browser built-in | TTS | Already used in tapvocab.js and numbers-quiz.html |
| CSS Custom Properties | Browser built-in | Theming | All colors from `--bg`, `--card`, `--accent`, etc. |
| `fetch()` | Browser built-in | Load TSV data | Used by SharedUtils.loadTSV pattern |

[VERIFIED: codebase grep — numbers-quiz.html, tapvocab.js, shared-utils.js]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SharedUtils | project | shuffleArray, loadTSV | Load data file (not shuffling — sequence is fixed) |
| CoinTracker (coins.js) | project | `#coin-counter` element | Include for header coin display; no coins awarded |

[VERIFIED: CLAUDE.md, codebase grep]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline IIFE | Separate quien-soy.js | UI-SPEC explicitly mandates inline IIFE (consistent with Phase 18); separate file adds a file without benefit |
| SharedUtils.loadTSV | Inline fetch+parse | SharedUtils is already loaded; reusing it keeps code DRY |
| Re-encode file to UTF-8 | TextDecoder('windows-1252') | Re-encoding is simpler (one command), consistent with all other data files, no JS complexity |

---

## Architecture Patterns

### System Architecture Diagram

```
index.html (.btn-quien-soy)
       |
       v (click)
quien-soy.html
  |
  |- <script> coins.js
  |- <script> shared-utils.js
  |- Inline IIFE
       |
       +-- fetch('/data/quien-soy-sentences.txt', {cache:'no-store'})
       |         |
       |         v (Response.text() -> split -> parse header -> 14 row objects)
       |   questions[] = [{question, label1, label2, answer1, answer2}, ...]
       |
       +-- State: { currentIndex, chosenAnswers[], chatEl, stripEl, endEl }
       |
       +-- showQuestion(i)
       |     |-- append .qs-bubble.question.left -> TTS speak(question)
       |     |-- update progress pill "i+1 / 14"
       |     |-- set button labels + re-enable buttons
       |     `-- scrollIntoView on new bubble
       |
       +-- onChoiceTap(choiceIndex)
       |     |-- disable both buttons
       |     |-- chosenAnswers.push(answerText)
       |     |-- append .qs-bubble.answer.right -> scrollIntoView
       |     |-- setTimeout(400) -> TTS speak(answer)
       |     |-- setTimeout(1200) -> if last question: showEndScreen()
       |     `--                    else: showQuestion(currentIndex++)
       |
       `-- showEndScreen()
             |-- build fullParagraph = chosenAnswers.join(' ') + ' ¡Muchas gracias por escuchar!'
             |-- swap: hide .qs-page, show .qs-end
             |-- setTimeout(300) -> TTS speak(fullParagraph)
             |-- Replay btn -> speak(fullParagraph)
             |-- Start Again btn -> reset state, show .qs-page, hide .qs-end, showQuestion(0)
             `-- Home btn -> window.location.href = '/'
```

### Recommended Project Structure

```
tap-to-vocab/
├── quien-soy.html           # New page (inline IIFE, no separate JS file)
├── data/
│   └── quien-soy-sentences.txt  # Re-encoded to UTF-8, moved from root
├── assets/css/
│   └── styles.css           # Append qs-* block at bottom (after nq-* block)
└── index.html               # Add .btn-quien-soy button inside .grid-two-col
```

### Pattern 1: Inline IIFE Page (Phase 18 canonical)

**What:** Full page logic inside a `<script>` tag as an immediately-invoked function expression. No external JS file needed.

**When to use:** Single-purpose pages with self-contained logic, consistent with Phase 18 (numbers-quiz.html).

```javascript
// Source: numbers-quiz.html (verified in codebase)
<script src="/assets/js/numbers-data.js"></script>
<script>
(function () {
  // all page logic here
  // access SharedUtils, CoinTracker via window globals
})();
</script>
```

For quien-soy.html, no separate data script is needed — data comes from fetch():

```javascript
// Source: pattern from fill-blank.js + numbers-quiz.html
<script src="/assets/js/coins.js"></script>
<script src="/assets/js/shared-utils.js"></script>
<script>
(function () {
  // TTS setup (verbatim from numbers-quiz.html lines 27-62)
  // fetch + parse + init
  SharedUtils.loadTSV('/data/quien-soy-sentences.txt').then(function(rows) {
    var questions = rows.filter(function(r) {
      return r['Question'] && r['Answer choice 1'] && r['Answer choice 2'];
    });
    if (!questions.length) { showError(); return; }
    initChat(questions);
  }).catch(function() { showError(); });
})();
</script>
```

[VERIFIED: codebase — numbers-quiz.html, shared-utils.js]

### Pattern 2: TTS cancel-then-speak (verbatim from numbers-quiz.html)

**What:** Cache Spanish voice on load, cancel any current utterance, speak with es-ES lang.

**When to use:** Every TTS call in this phase — question appears, answer lands.

```javascript
// Source: numbers-quiz.html lines 27-62 (verified in codebase)
let _cachedSpanishVoice = null;

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
  if (_initialVoices.length) { getSpanishVoice(); }
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.addEventListener("voiceschanged", function() { getSpanishVoice(); });
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

[VERIFIED: numbers-quiz.html exact source, tapvocab.js lines 12-53]

### Pattern 3: TSV loading with SharedUtils.loadTSV

**What:** Fetch a TSV, split on `\r?\n`, parse header row for column names, return array of row objects.

**Column names in quien-soy-sentences.txt:**
- `Question` — the question text (e.g., "¿Cómo te llamas?")
- `Choices (1,2)` — comma+space separated button labels (e.g., "Bjarne, Basti")
- `Answer choice 1` — full answer text for choice 1
- `Answer choice 2` — full answer text for choice 2

**Choices column parsing** — split on `', '` (comma followed by space) with `maxsplit=1`:

```javascript
// Source: derived from data analysis (verified against all 14 rows)
var parts = row['Choices (1,2)'].split(', ');  // always exactly one ', ' separator
var label1 = parts[0];     // e.g. "Bjarne"
var label2 = parts[1];     // e.g. "Basti"
// Note: use split(', ', 2) or split(/, (.+)/) if a label could contain ', '
// Current data: no label contains ', ' — simple split works
```

[VERIFIED: manual parse of all 14 rows from quien-soy-sentences.txt]

### Pattern 4: Chat state machine

**States:**

| State | Entry Condition | Exit Condition |
|-------|----------------|----------------|
| `loading` | Page load | fetch resolves |
| `questioning` | `showQuestion(i)` called | User taps a choice button |
| `answering` | Choice tapped | setTimeout(1200ms) fires |
| `ended` | `currentIndex >= 14` | Start Again tapped |

**State variable:**
```javascript
// All state lives in IIFE closure
var currentIndex = 0;        // which question we're on (0-13)
var chosenAnswers = [];       // accumulate for end-screen paragraph
var isAnswering = false;      // prevent double-tap during delay
```

[VERIFIED: derived from UI-SPEC interaction contract section]

### Pattern 5: Home button addition (index.html)

**What:** Insert a full-width `.btn-quien-soy` anchor inside `.grid-two-col` between `.btn-numbers` and `.btn-games`.

```html
<!-- Source: index.html verified pattern — btn-numbers at line 56 -->
<!-- Insert after the btn-numbers line, before btn-games -->
<a class="btn btn-quien-soy" href="/quien-soy.html">💬 Quién soy yo</a>
```

CSS in styles.css (after `nq-*` block):
```css
/* ── Quién Soy Yo home button ─── */
.grid-two-col .btn-quien-soy {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #2a1f5a 0%, #1a1440 100%);
  border: 2px solid var(--accent);
  font-weight: 700;
}
```

[VERIFIED: index.html lines 56-59, styles.css lines 86-91 btn-numbers pattern]

### Anti-Patterns to Avoid

- **Modifying existing JS files** — Phase 19 adds only new files and appends to styles.css + index.html. No changes to shared-utils.js, coins.js, or any existing .js module.
- **Separate quien-soy.js file** — UI-SPEC mandates inline IIFE. Do not create a separate JS file.
- **Loading quien-soy-sentences.txt as UTF-8 without re-encoding** — The file is ISO-8859-1. `fetch().text()` defaults to UTF-8 and will garble all accented Spanish characters. Must re-encode to UTF-8 first.
- **Parsing `Choices (1,2)` with `.split(',')` alone** — Without `maxsplit=1` or splitting on `', '`, a label like "48 y 45, 44 y 43" would split into 3 parts. Use `.split(', ')` (comma-space).
- **Using setTimeout without disabling buttons** — Double-tap between questions is possible if buttons aren't disabled immediately on first tap.
- **Placing quien-soy-sentences.txt in root after re-encoding** — Move it to `/data/` to match the pattern of all other data files.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TTS voice selection | Custom voice picker | Existing pattern from numbers-quiz.html | Handles Monica preference, async voice loading, iOS fallback — already battle-tested |
| TSV parsing | Custom parser | `SharedUtils.loadTSV()` | Handles `\r?\n`, header mapping, empty cols — already handles the gotchas |
| Smooth scroll | Custom scroll logic | `element.scrollIntoView({ behavior: 'smooth', block: 'end' })` | Browser built-in, single call |
| Animation | JS animation library | CSS `@keyframes qs-bubble-in` | CSS-only, follows existing pattern in styles.css |

**Key insight:** The project's existing utilities cover every non-trivial operation. The IIFE just orchestrates them.

---

## Data File Analysis

### File: `quien-soy-sentences.txt`

| Property | Value |
|----------|-------|
| Location | Repo root (`/quien-soy-sentences.txt`) |
| Encoding | **ISO-8859-1** (NOT UTF-8) — critical gotcha |
| Line endings | CRLF (`\r\n`) |
| Columns | 4 (tab-separated) |
| Data rows | 14 (exactly one per question) |
| Header row | `Question`, `Choices (1,2)`, `Answer choice 1`, `Answer choice 2` |

**Encoding risk:** `fetch().text()` uses UTF-8 by default. The file contains bytes like `0xbf` (¿), `0xe1` (á), `0xf3` (ó) that are not valid UTF-8 start bytes. Without re-encoding, all Spanish accented characters and inverted punctuation will be garbled or throw an error.

**Resolution (REQUIRED before implementation):**
```bash
iconv -f ISO-8859-1 -t UTF-8 quien-soy-sentences.txt > data/quien-soy-sentences.txt
```
Then remove the original file from repo root. The UI-SPEC marks the file as "read-only, no changes" meaning the *content* is frozen — re-encoding the bytes does not change content.

**Choice label parsing:**
The `Choices (1,2)` column uses `", "` (comma + space) as the separator between two labels. Split with `value.split(', ')` — safe for all 14 rows (verified by exhaustive parse). No label itself contains `", "`.

**Row count:** Always exactly 14 rows. The UI-SPEC progress pill shows "N / 14" hardcoded. This is correct — no dynamic count calculation needed, but using `questions.length` is cleaner and should be preferred over the hardcoded `14`.

[VERIFIED: python3 analysis of actual file bytes]

---

## CSS Additions

All new classes use `qs-` prefix. Append to `styles.css` after the `nq-*` block (currently ending at line 1344). See UI-SPEC for full property values.

**Sections to add:**
1. `.qs-page`, `.qs-header`, `.qs-progress`, `.qs-chat`, `.qs-answer-strip` — chat layout
2. `.qs-bubble-row`, `.qs-bubble`, `.qs-bubble.question`, `.qs-bubble.answer` — chat bubbles
3. `@keyframes qs-bubble-in` — bubble entry animation
4. `.qs-choice`, `.qs-choice:hover`, `.qs-choice:active`, `.qs-choice:disabled` — answer buttons
5. `.qs-end`, `.qs-end-card`, `.qs-end-heading`, `.qs-intro-text`, `.qs-end-actions` — end screen
6. `.grid-two-col .btn-quien-soy` — home page button

**Key color decisions (from UI-SPEC):**
- Question bubble: `background: var(--card)` — the grey-blue card color
- Answer bubble: `background: var(--accent)` with `color: #0b1020` (dark text on light accent)
- End heading: `color: var(--ok)` — green celebration color

[VERIFIED: 19-UI-SPEC.md full review, styles.css CSS variable values confirmed]

---

## Common Pitfalls

### Pitfall 1: ISO-8859-1 Encoding in Data File

**What goes wrong:** `fetch('/quien-soy-sentences.txt').then(r => r.text())` silently returns garbled text. `¿Cómo te llamas?` becomes `?C?mo te llamas?` or throws depending on browser strictness. TTS receives garbled input and may speak gibberish or fail silently.

**Why it happens:** `Response.text()` in the Fetch API always decodes as UTF-8. The file is ISO-8859-1. The bytes for `¿` (0xBF) and `ó` (0xF3) are not valid UTF-8.

**How to avoid:** Re-encode the file to UTF-8 before implementation begins. Move to `/data/` to follow project pattern. One command: `iconv -f ISO-8859-1 -t UTF-8 quien-soy-sentences.txt > data/quien-soy-sentences.txt`.

**Warning signs:** TTS speaks `C o m o` without accent, or progress pill shows `?` instead of `¿`.

### Pitfall 2: Double-Tap Between Questions

**What goes wrong:** User taps a choice, the 1200ms delay starts, and the user taps again before the next question renders — triggering `onChoiceTap` twice, advancing the index by 2 and skipping a question.

**Why it happens:** The answer strip buttons remain enabled during the transition delay.

**How to avoid:** Disable both `.qs-choice` buttons immediately on tap (`btn.disabled = true`). Re-enable them only when `showQuestion()` runs for the next item.

**Warning signs:** Fewer than 14 bubbles appear, or progress counter jumps by 2.

### Pitfall 3: TTS Queuing on End Screen

**What goes wrong:** The "Start Again" resets state and calls `showQuestion(0)` which calls `speak(question)`. If the end-screen TTS is still reading the full paragraph, the two utterances overlap.

**Why it happens:** `speak()` calls `cancel()` before speaking, but a new `speak()` called during an active `cancel()` may be dropped on some browsers (iOS Safari timing quirk).

**How to avoid:** Use the `setTimeout(..., 100)` deferral pattern already present in the codebase (tapvocab.js line 222). The 100ms gap lets the cancel settle before the new utterance is queued.

**Warning signs:** On iOS, tapping "Start Again" produces silence or partial speech.

### Pitfall 4: Choices Column Parsing with Plain `.split(',')`

**What goes wrong:** `"48 y 45, 44 y 43".split(',')` returns 3 elements: `["48 y 45", " 44 y 43"]` — wait, actually 2 here — but `"Gymnasium Langen, Hogwarts".split(',')` returns 2 which is correct. The safe concern is using no-space split when one label contains a comma.

**Why it happens:** The current data has no label containing a plain comma. But robustness demands `split(', ')` (comma+space) or `split(/,\s*(.*)/)` with maxsplit to handle future data changes.

**How to avoid:** Always use `choices.split(', ')` (splitting on comma-space). This is documented by the UI-SPEC and verified against all 14 current rows.

### Pitfall 5: quien-soy.html Layout — Full-height chat area

**What goes wrong:** `.qs-chat` scroll area doesn't fill available height; the fixed `.qs-answer-strip` overlaps the last bubble; chat content is hidden behind the button strip.

**Why it happens:** Without `min-height: 0` on flex children or explicit `padding-bottom: 88px` on the scroll area, the fixed-position answer strip covers content.

**How to avoid:** Per UI-SPEC: `.qs-chat` must have `padding-bottom: 88px` (= 24px lg + 64px strip height). The `.qs-page` is `height: 100dvh; display: flex; flex-direction: column;` and `.qs-chat` is `flex: 1; overflow-y: auto`.

---

## Code Examples

### Loading and Parsing TSV

```javascript
// Source: SharedUtils.loadTSV pattern (shared-utils.js) + column name from data analysis
SharedUtils.loadTSV('/data/quien-soy-sentences.txt').then(function(rows) {
  var questions = rows
    .filter(function(r) {
      return r['Question'] && r['Answer choice 1'] && r['Answer choice 2'];
    })
    .map(function(r) {
      var choiceParts = (r['Choices (1,2)'] || '').split(', ');
      return {
        question:  r['Question'],
        label1:    choiceParts[0] || 'Opción 1',
        label2:    choiceParts[1] || 'Opción 2',
        answer1:   r['Answer choice 1'],
        answer2:   r['Answer choice 2']
      };
    });
  if (!questions.length) { showError(); return; }
  initChat(questions);
}).catch(function(err) {
  console.error('Failed to load conversation data:', err);
  showError();
});
```

### Appending a Bubble

```javascript
// Source: derived from UI-SPEC component inventory (verified spec)
function appendBubble(text, side) {
  // side: 'left' (question) or 'right' (answer)
  var row = document.createElement('div');
  row.className = 'qs-bubble-row ' + side;

  var bubble = document.createElement('div');
  bubble.className = 'qs-bubble ' + (side === 'left' ? 'question' : 'answer');
  bubble.textContent = text;

  row.appendChild(bubble);
  chatEl.appendChild(row);

  // Scroll new bubble into view (CHAT-06)
  bubble.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return bubble;
}
```

### End Screen Paragraph Assembly

```javascript
// Source: derived from UI-SPEC copywriting contract
function buildParagraph(chosenAnswers) {
  return chosenAnswers.join(' ') + ' ¡Muchas gracias por escuchar!';
}
```

### Start Again Reset

```javascript
// Source: derived from UI-SPEC states and transitions
function startAgain() {
  window.speechSynthesis.cancel();
  currentIndex = 0;
  chosenAnswers = [];
  chatEl.innerHTML = '';           // clear all bubbles
  endEl.style.display = 'none';
  pageEl.style.display = '';       // or 'flex' depending on .qs-page display value
  showQuestion(0);
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate page JS files (e.g., tapvocab.js) | Inline IIFE for single-purpose pages | Phase 18 | No extra HTTP request; logic co-located with markup |
| Manual fetch + TSV parse per page | SharedUtils.loadTSV() | Phase 3+ | Single source of truth for TSV parsing |

**No deprecated approaches apply to this phase.** The Web Speech API has been stable across all Phase 18 implementation. `speechSynthesis.cancel()` + `speak()` pattern is the established safe sequence.

---

## Environment Availability

Step 2.6: SKIPPED — this phase is purely code/config changes with no external dependencies beyond the browser's Web Speech API, which is a client-side feature (not a server-side tool). No new CLI tools, databases, or services required.

---

## Runtime State Inventory

Step 2.5: NOT APPLICABLE — This is a greenfield page addition, not a rename/refactor/migration phase. No stored data references a name being changed. The only "state" consideration is that `localStorage` and `sessionStorage` are not used by this feature at all (per REQUIREMENTS.md: no coin rewards, no score tracking).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual browser verification (no automated test framework in project) |
| Config file | none |
| Quick run command | `python3 -m http.server 8000` then open `http://localhost:8000/quien-soy.html` |
| Full suite command | Same — manual smoke test across the full flow |

This project has no automated test infrastructure (confirmed: no test/ directory, no jest.config, no pytest.ini, no package.json test scripts). All validation is manual smoke-testing.

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Verification |
|--------|----------|-----------|-------------|
| CHAT-01 | Button appears on home screen | manual | Visual check on index.html |
| CHAT-02 | First question appears as left bubble on load | manual | Open quien-soy.html, confirm grey bubble |
| CHAT-03 | Two answer buttons visible at bottom | manual | Check answer strip on page load |
| CHAT-04 | Tapping choice appends right bubble | manual | Tap choice, confirm blue bubble appears on right |
| CHAT-05 | Next question appears after delay | manual | Wait 1.2s after tapping, confirm new left bubble |
| CHAT-06 | Chat scrolls to show latest bubble | manual | Advance several questions, confirm scroll follows |
| AUDIO-01 | TTS reads question on appear | manual | Listen — Spanish voice speaks question text |
| AUDIO-02 | TTS reads chosen answer after landing | manual | Listen — 400ms after tap, voice speaks answer |
| END-01 | End screen appears after Q14 | manual | Answer all 14 questions, confirm end screen swap |
| END-02 | Full paragraph displayed correctly | manual | Check all 14 chosen answers joined + closing |
| END-03 | TTS auto-reads paragraph on end screen | manual | Listen on end screen load |
| END-04 | Replay re-reads paragraph | manual | Tap Replay, confirm TTS restarts |
| END-05 | Start Again resets to Q1 | manual | Tap Start Again, confirm chat clears + Q1 bubble |
| END-06 | Home navigates to index.html | manual | Tap Inicio, confirm navigation |
| DATA-01 | Questions/choices loaded from file | manual | Verify question text matches quien-soy-sentences.txt |

### Sampling Rate

- **Per task commit:** Open `http://localhost:8000/quien-soy.html` in browser, click through 3 questions
- **Per wave merge:** Full 14-question run + end screen + all 3 end-screen buttons
- **Phase gate:** Full flow verified before `/gsd-verify-work`, including TTS on desktop + mobile (or iOS simulator)

### Wave 0 Gaps

None — no test framework to install. All validation is manual browser testing. No test files needed.

---

## Security Domain

This phase has no authentication, no user input processed server-side, no external API calls, no data storage, and no cryptographic operations. The only external data is a static TSV file fetched from the same origin. ASVS categories V2 (Authentication), V3 (Session Management), V4 (Access Control), and V6 (Cryptography) do not apply.

**V5 Input Validation:** The TSV data is static, not user-provided. The only user interaction is tapping one of two pre-defined button choices — there is no text input field, no free-form data entry, and no data sent anywhere. No input validation controls are needed.

**Content Security:** All resources are same-origin static files. No CSP changes needed.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `split(', ')` (comma-space) correctly splits all current and future choice labels | Data File Analysis | If a future choice label contains `', '` internally, parsing would produce wrong labels; use `split(/, (.+)/)` for robustness |
| A2 | GitHub Pages serves `.txt` files without an explicit `charset=utf-8` header, meaning `fetch().text()` applies UTF-8 interpretation | Pitfall 1 | If GitHub Pages does add `charset=utf-8` header, re-encoding is still correct and harmless |
| A3 | The `quien-soy-sentences.txt` re-encoding to UTF-8 is acceptable even though UI-SPEC marks the file as "read-only, no changes" | Data File Analysis | UI-SPEC's "no changes" refers to content (questions/answers); byte-level re-encoding is a prerequisite for correct loading |

---

## Open Questions

1. **Data file location — root vs. /data/**
   - What we know: File currently lives at `/quien-soy-sentences.txt`; all other data files live in `/data/`
   - What's unclear: Whether to move the file to `/data/` at the same time as re-encoding it
   - Recommendation: Move to `/data/quien-soy-sentences.txt` — consistent with project pattern, fetch path becomes `/data/quien-soy-sentences.txt`, matching SharedUtils convention

2. **`aria-label` on choice buttons**
   - What we know: UI-SPEC requires `aria-label` set to full answer text (not the short label) for screen reader context
   - What's unclear: Whether to set this via HTML attribute or JS
   - Recommendation: Set via JS when updating button labels (`btn.setAttribute('aria-label', answerText)`)

---

## Sources

### Primary (HIGH confidence)

- `numbers-quiz.html` (codebase) — canonical Phase 18 inline IIFE pattern, TTS implementation verbatim copy source
- `assets/js/shared-utils.js` (codebase) — SharedUtils.loadTSV() source code, column parsing pattern
- `assets/js/tapvocab.js` (codebase) — TTS getSpanishVoice() and speakSpanish() reference implementation
- `assets/css/styles.css` (codebase) — CSS variable values, `nq-*` block location (line 1270), `btn-numbers` pattern (line 86)
- `index.html` (codebase) — `.grid-two-col` structure, `.btn-numbers` insertion point (line 56)
- `.planning/phases/19-quien-soy-yo/19-UI-SPEC.md` — approved visual/interaction contract
- `quien-soy-sentences.txt` (codebase) — Python3 byte-level analysis of encoding, column names, row count

### Secondary (MEDIUM confidence)

- `CLAUDE.md` — project constraints, script load order, zero-dependency mandate
- `.planning/REQUIREMENTS.md` — all 15 v2.0 requirements text
- `.planning/STATE.md` — accumulated decisions about the feature

### Tertiary (LOW confidence)

- None

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all verified against codebase source files
- Architecture: HIGH — derived from UI-SPEC and Phase 18 analog (both verified)
- Data file: HIGH — byte-level Python analysis of actual file
- Pitfalls: HIGH — encoding issue confirmed by actual byte inspection; others derived from known JS patterns
- TTS pattern: HIGH — verbatim from numbers-quiz.html and tapvocab.js

**Research date:** 2026-05-08
**Valid until:** 2026-06-08 (stable vanilla stack; no external dependencies to go stale)
