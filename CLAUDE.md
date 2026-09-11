# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tap-to-Vocab is a Spanish-German vocabulary learning web app deployed at **tapvocab.fun** via GitHub Pages. It is a zero-dependency static site — no build step, no package manager, no frameworks. Just vanilla HTML, CSS, and JavaScript.

## Development

There is no build, lint, or test command. To develop locally, serve the root directory with any static HTTP server:

```
python3 -m http.server 8000
# or
npx serve .
```

All asset paths are absolute from root (`/assets/...`, `/data/...`), so file:// won't work — a local server is required.

## Architecture

**Data flow:** TSV files in `/data/` drive all content. User state (practice list, enabled sentences, coin balance) lives in `localStorage`. Game lives are passed between pages via `sessionStorage`.

**Pages and routing:**
- `index.html` — Home grid linking to the Topics/Unidades sub-screens plus the tool/game buttons
- `topics.html` — sub-screen listing the 9 topics, each opening `topic.html?topic=<Topic>`
- `unidades.html` — sub-screen listing the 5 unidades, each opening `topic.html?cat=Unidad<N>`
- `topic.html?cat=<Name>` / `topic.html?topic=<Topic>` — Browse/Quiz page. `?cat=<Name>` filters on the `category` column (special case: `?cat=practice` reads from localStorage); `?topic=<Topic>` filters on the `topics` column. The two parameters are deliberately separate rather than merged: five names — `Colores`, `Animales`, `Numeros`, `Saludar`, `Casa_Familia` — exist in both columns with different row counts, so merging them would change what existing `?cat=` bookmarks show.
- `sentences.html` — Sentence building game
- `conjugation.html` — Verb conjugation practice
- `fill-blank.html` — Fill-in-the-blank grammar game
- `vocab.html` — Standalone spelling practice card (receives word via URL params `?w=...&de=...`)
- `voices.html` — Debug utility for Web Speech API voices

**JavaScript modules** (all use the IIFE pattern, export to `window`):
- `assets/js/coins.js` → `window.CoinTracker` — coin persistence via localStorage; `addCoin()`, `getCoins()`, `spendCoins(amount)`, `resetCoins()`; auto-updates any `#coin-counter` element
- `assets/js/shared-utils.js` → `window.SharedUtils` — `shuffleArray(arr)`, `loadWords(path)` (words.tsv-specific), `loadTSV(path)` (generic any-TSV, returns header-keyed row objects), `playSuccessSound()`, `playErrorSound()`, `showSuccessAnimation()`, `confettiBurst(count)`
- `assets/js/home.js` — home page logic: practice count badge, Games button (spend 10 coins + set sessionStorage game_lives), Reset Coins button
- `assets/js/game-init.js` → `window.GameInit` — `requireLives(selector)`: returns false and inserts error HTML when sessionStorage game_lives is missing or 0 (direct URL bypass guard)
- `assets/js/tapvocab.js` → `window.TapVocabTSV` — Browse mode, Quiz mode with flip cards, practice list (localStorage), speech synthesis
- `assets/js/sentences.js` → `window.SentenceBuilder` — sentence building game, word bank scrambling, sentence manager modal
- `assets/js/conjugation.js` → `window.VerbConjugation` — verb conjugation practice (tap-to-fill table), Show mode, verb manager modal
- `assets/js/fill-blank.js` → `window.FillBlank` — fill-in-the-blank game with multiple-choice answers

**Shared patterns:**
- All learning game pages (tapvocab, sentences, conjugation, fill-blank) load `shared-utils.js` before their own JS
- Script load order: `coins.js` → (if game page: `game-init.js`) → `shared-utils.js` → `[page js]`
- TSV loading: `SharedUtils.loadTSV(path)` for any TSV; `SharedUtils.loadWords(path)` for words.tsv specifically
- Shuffle: `SharedUtils.shuffleArray(arr)` — Fisher-Yates, non-mutating
- `coins.js` auto-updates any `#coin-counter` element via DOMContentLoaded + coinschanged CustomEvent listener
- Speech uses Web Speech API with preference for "Monica" es-ES voice, falling back to any Spanish voice

## Adding Vocabulary

Add rows to `data/words.tsv` (tab-separated). Categories prefixed with `x` (e.g., `xAnimales`) are excluded from the main navigation but remain in the file. The home screen no longer lists categories directly: to add a new unidad, add a button in `unidades.html`; to add a new topic, add a button in `topics.html`. `index.html` does not need to change either way.

## Key Conventions

- Dark theme with CSS custom properties defined in `:root` of `styles.css`
- Mobile-first responsive design using `clamp()` for font sizes
- No external CDN or library dependencies — everything is self-contained
- `cache: "no-store"` on TSV fetches to always get fresh data

### General information
the git repo is in a nested directory
