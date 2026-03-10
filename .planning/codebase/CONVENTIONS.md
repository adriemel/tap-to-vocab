# Conventions

## Code Style

**Language:** Vanilla ES6+ JavaScript (no TypeScript, no transpilation)

**Module pattern:** All JS files use IIFE for encapsulation:
```js
(function () {
  // private
  window.ExportName = { publicAPI };
})();
```

**No external dependencies** — zero npm packages, no CDN libraries, no build tools.

## Naming

| Context | Convention | Example |
|---------|-----------|---------|
| `window` exports | PascalCase | `window.SharedUtils`, `window.CoinTracker` |
| Functions | camelCase | `shuffleArray()`, `loadWords()` |
| Constants | UPPER_SNAKE_CASE | `STORAGE_KEY`, `KEY` |
| DOM variables | camelCase + type hint | `btnNext`, `errorEl`, `choicesEl` |
| CSS IDs | kebab-case | `#coin-counter`, `#btn-back` |
| CSS classes | kebab-case | `.flip-card`, `.mode-tab`, `.coin-badge` |
| CSS vars | `--` + kebab | `--bg`, `--card`, `--accent` |
| TSV categories | PascalCase | `Colores`, `Unidad2`, `Casa_Familia` |

## TSV Parsing Pattern

Always use dynamic header lookup — never hardcode column indices:

```js
const header = lines[0].split("\t").map(h => h.trim());
const idx = {
  category: header.indexOf("category"),
  es: header.indexOf("es"),
  de: header.indexOf("de")
};
// Access: (cols[idx.es] || "").trim()  ← always guard with || ""
```

Guard against incomplete rows: `(cols[i] || "").trim()` — prevents crashes on missing columns.

Filter out incomplete rows after parsing:
```js
.filter(r => r.de && r.es_with_blank && r.correct_answer)
```

## Fetch Pattern

All TSV files fetched with `cache: "no-store"` to bypass browser cache:
```js
const res = await fetch(tsvPath, { cache: "no-store" });
if (!res.ok) throw new Error("Failed to load " + tsvPath);
```

## Shuffle Pattern

Fisher-Yates, non-mutating (always returns a new array):
```js
function shuffleArray(arr) {
  const copy = [...arr];
  for (let j = copy.length - 1; j > 0; j--) {
    const k = Math.floor(Math.random() * (j + 1));
    [copy[j], copy[k]] = [copy[k], copy[j]];
  }
  return copy;
}
```

## Audio Pattern

Web Audio API via lazy-initialized singleton `AudioContext`:
```js
let _audioCtx = null;
function getAudioContext() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === "suspended") _audioCtx.resume();
  return _audioCtx;
}
```

Wrapped in try/catch — audio failures are `console.warn` not errors.

## DOM Navigation Pattern

Back button uses history array tracking (not `history.back()`):
```js
let history = []; // stores visited indices
// on skip/complete: history.push(currentIndex); advance();
// on back: currentIndex = history.pop(); render();
```

## localStorage Keys

| Key | Module | Value |
|-----|--------|-------|
| `tapvocab_coins` | `coins.js` | Stringified integer |
| `practiceList` | `tapvocab.js` | JSON array of `{es, de, category}` |
| `enabledSentences` | `sentences.js` | JSON object `{[german_text]: boolean}` |

Always guard localStorage reads with try/catch and provide defaults:
```js
try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
catch { return []; }
```

## Error Handling

- TSV load failures: shown in `#error` element, `display: block`
- Audio failures: `console.warn` only, never thrown
- Empty word lists: hide browse/quiz UI, show `#error` + create standalone Home button
- localStorage failures: `console.warn`, continue without saving

## CSS Conventions

Single stylesheet: `assets/css/styles.css`

CSS custom properties defined in `:root`:
```css
:root {
  --bg: ...; --card: ...; --ink: ...; --muted: ...;
  --accent: ...; --ok: ...; --warn: ...; --error: ...;
}
```

Dark theme by default. Mobile-first with `clamp()` for responsive font sizes.

Button classes:
- `.btn` — standard button
- `.btn.secondary` — muted/back button
- `.btn-practice`, `.btn-sentences`, `.btn-verbs`, `.btn-fill-blank`, `.btn-games` — full-width feature buttons (span both grid columns)

## Script Load Order

All game pages follow this order:
1. `coins.js` — CoinTracker available globally
2. `shared-utils.js` — SharedUtils available globally
3. `[page].js` — game logic (can reference both globals)

## Flip Card Reset Pattern

Between quiz questions, instantly reset without visible animation:
```js
inner.style.transition = "none";
flipCard.classList.remove("flipped");
void inner.offsetHeight; // force reflow
inner.style.transition = ""; // restore
```
