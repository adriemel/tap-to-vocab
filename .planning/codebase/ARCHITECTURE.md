# Architecture

## Pattern

**Static Single-Page Application (multi-page static site)**

No framework, no build step, no server. Pure HTML + CSS + JS deployed via GitHub Pages. Each HTML page is an independent entry point. Shared logic lives in shared utility files loaded via `<script>` tags.

## Architectural Layers

```
Browser
  └── HTML pages (entry points)
        ├── assets/css/styles.css         (global styles)
        ├── assets/js/coins.js            (CoinTracker — loaded first on all pages)
        ├── assets/js/shared-utils.js     (SharedUtils — loaded second on game pages)
        └── assets/js/<page-specific>.js  (game logic — loaded last)
```

## Data Flow

```
User opens page
  → HTML loads scripts in order: coins.js → shared-utils.js → page-js
  → page-js calls fetch("/data/<file>.tsv", { cache: "no-store" })
  → TSV parsed into JS objects (header-indexed, dynamic column lookup)
  → Words/sentences filtered by category or punctuation
  → UI rendered from filtered data
  → User interactions → localStorage writes (coins, practice list, enabled sentences)
```

## Entry Points (HTML Pages)

| File | Purpose | JS Module |
|------|---------|-----------|
| `index.html` | Home grid, category navigation | Inline script only |
| `topic.html` | Browse + Quiz mode for vocab | `tapvocab.js` → `window.TapVocabTSV` |
| `sentences.html` | Sentence building game | `sentences.js` → `window.SentenceBuilder` |
| `conjugation.html` | Verb conjugation practice | `conjugation.js` → `window.ConjugationPractice` |
| `fill-blank.html` | Fill-in-the-blank exercises | `fill-blank.js` (IIFE, no export) |
| `vocab.html` | Standalone spelling card (URL params) | Inline script |
| `voices.html` | Web Speech API debug tool | Inline script |
| `games.html` | Game selection hub | Inline script |
| `games/coin-dash.html` | Coin Dash mini-game | Inline script |
| `games/jungle-run.html` | Jungle Run mini-game | Inline script |
| `games/tower-stack.html` | Tower Stack mini-game | Inline script |

## Module Pattern

All JS files use **IIFE (Immediately Invoked Function Expression)** for encapsulation and export to `window`:

```js
(function () {
  // private scope
  function privateHelper() { ... }

  // public API
  window.ModuleName = { publicMethod };
})();
```

Script load order on game pages: `coins.js` → `shared-utils.js` → `[game].js`

## State Management

All persistent state uses `localStorage`:

| Key | Owner | Format |
|-----|-------|--------|
| `tapvocab_coins` | `CoinTracker` (coins.js) | Number string |
| `practiceList` | tapvocab.js | JSON array of `{es, de, category}` |
| `enabledSentences` | sentences.js | JSON object `{[german_text]: boolean}` |

Session state (transient):
- `sessionStorage.game_lives` — lives counter passed from index to games

## Key Abstractions

**SharedUtils** (`assets/js/shared-utils.js`) — `window.SharedUtils`
- `shuffleArray(arr)` — Fisher-Yates, non-mutating (spread copy)
- `loadWords(tsvPath)` — generic TSV loader for words.tsv format
- `playSuccessSound()` — Web Audio API C5-E5-G5 sine chime
- `playErrorSound()` — Web Audio API sawtooth 150Hz buzz
- `showSuccessAnimation()` — random emoji float + success sound
- `confettiBurst(count)` — CSS animation confetti particles

**CoinTracker** (`assets/js/coins.js`) — `window.CoinTracker`
- Manages coin economy via localStorage
- Dispatches `coinschanged` CustomEvent on change
- Auto-updates any `#coin-counter` DOM element

## Routing

No client-side router. Navigation uses:
- `<a href="...">` for page navigation
- Query params: `topic.html?cat=<Category>` for category routing
- URL params: `vocab.html?w=<word>&de=<translation>` for word cards
- `location.href = "/"` for programmatic navigation

## Data Layer

All content is static TSV files fetched at runtime:

| File | Format | Consumer |
|------|--------|----------|
| `data/words.tsv` | `category\tes\tde` | tapvocab.js, sentences.js |
| `data/verbs.tsv` | `infinitive\tde\tyo\ttu\tél\tnosotros\tvosotros\tellos` | conjugation.js |
| `data/fill-in-blank.tsv` | `category\tde\tes_with_blank\tcorrect_answer\twrong_answers` | fill-blank.js |

TSV parsing always uses dynamic header lookup (not hardcoded indices) to handle column reordering.
