# Structure

## Repository Layout

```
tap-to-vocab/              ← git root (outer directory)
└── tap-to-vocab/          ← actual codebase (NESTED — important!)
    ├── index.html
    ├── topic.html
    ├── sentences.html
    ├── conjugation.html
    ├── fill-blank.html
    ├── vocab.html
    ├── voices.html
    ├── games.html
    ├── games/
    │   ├── coin-dash.html
    │   ├── jungle-run.html
    │   └── tower-stack.html
    ├── assets/
    │   ├── css/
    │   │   └── styles.css           ← single global stylesheet
    │   └── js/
    │       ├── coins.js             ← CoinTracker (loaded first, all pages)
    │       ├── shared-utils.js      ← SharedUtils (loaded second, game pages)
    │       ├── tapvocab.js          ← Browse + Quiz vocab game
    │       ├── sentences.js         ← Sentence building game
    │       ├── conjugation.js       ← Verb conjugation practice
    │       └── fill-blank.js        ← Fill-in-the-blank exercises
    ├── data/
    │   ├── words.tsv                ← Main vocab (category, es, de)
    │   ├── verbs.tsv                ← Verb conjugations (8 columns)
    │   └── fill-in-blank.tsv        ← Grammar exercises (5 columns)
    ├── CLAUDE.md                    ← Claude Code instructions
    ├── CNAME                        ← GitHub Pages custom domain (tapvocab.fun)
    └── README.md
```

> **IMPORTANT:** The working codebase is in `tap-to-vocab/tap-to-vocab/`. All file paths in the app are absolute from this inner directory root (e.g., `/assets/css/styles.css`, `/data/words.tsv`).

## Key File Paths

| Purpose | Path |
|---------|------|
| Homepage | `tap-to-vocab/index.html` |
| Global CSS | `tap-to-vocab/assets/css/styles.css` |
| Shared JS | `tap-to-vocab/assets/js/shared-utils.js` |
| Coin system | `tap-to-vocab/assets/js/coins.js` |
| Main vocab game | `tap-to-vocab/assets/js/tapvocab.js` |
| Sentence game | `tap-to-vocab/assets/js/sentences.js` |
| Conjugation game | `tap-to-vocab/assets/js/conjugation.js` |
| Fill-blank game | `tap-to-vocab/assets/js/fill-blank.js` |
| Vocab data | `tap-to-vocab/data/words.tsv` |
| Verb data | `tap-to-vocab/data/verbs.tsv` |
| Grammar data | `tap-to-vocab/data/fill-in-blank.tsv` |
| Custom domain | `tap-to-vocab/CNAME` |

## Naming Conventions

**Files:**
- HTML pages: lowercase hyphenated (`fill-blank.html`, `coin-dash.html`)
- JS modules: lowercase hyphenated matching their HTML counterpart (`fill-blank.js`)
- Data files: lowercase hyphenated TSV (`fill-in-blank.tsv`, `words.tsv`)
- CSS: single file (`styles.css`)

**JavaScript:**
- Module exports: PascalCase on `window` (`SharedUtils`, `CoinTracker`, `TapVocabTSV`)
- Functions: camelCase (`shuffleArray`, `loadWords`, `playSuccessSound`)
- Constants: `UPPER_SNAKE_CASE` (`STORAGE_KEY`, `KEY`)
- DOM element variables: camelCase with type suffix (`btnNext`, `errorEl`, `germanEl`)

**CSS:**
- IDs: hyphenated lowercase (`#coin-counter`, `#quiz-mode`, `#btn-back`)
- Classes: hyphenated lowercase (`.flip-card`, `.mode-tab`, `.coin-badge`)
- CSS variables: `--` prefix lowercase (`--bg`, `--card`, `--ink`, `--muted`, `--accent`, `--ok`, `--warn`, `--error`)

**Data:**
- TSV categories: PascalCase or joined words (`Colores`, `Casa_Familia`, `Unidad2`)
- Categories prefixed with `x` are hidden from navigation (`xAnimales`)

## Deployment

- Hosted on GitHub Pages via the `main` branch
- Custom domain `tapvocab.fun` set via `CNAME` file
- No CI/CD pipeline — pushing to main deploys automatically
- All asset paths are absolute from root, so a local static server is required for development (`python3 -m http.server 8000`)
