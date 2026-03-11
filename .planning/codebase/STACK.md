# Technology Stack

**Analysis Date:** 2026-03-10

## Languages

**Primary:**
- HTML5 - All pages (`index.html`, `topic.html`, `sentences.html`, `conjugation.html`, `fill-blank.html`, `vocab.html`, `voices.html`, `games.html`, `games/*.html`)
- CSS3 - Single stylesheet (`assets/css/styles.css`), uses CSS custom properties, `clamp()`, CSS Grid, `@keyframes`
- JavaScript (ES2017+) - All interactive logic (`assets/js/*.js`), uses async/await, spread operators, destructuring, arrow functions, IIFE pattern

**Secondary:**
- TSV (Tab-Separated Values) - All data files (`data/words.tsv`, `data/verbs.tsv`, `data/fill-in-blank.tsv`)

## Runtime

**Environment:**
- Browser-only. No server-side runtime. No Node.js in production.
- Development: any static HTTP server (e.g. `python3 -m http.server 8000` or `npx serve .`)

**Package Manager:**
- None. Zero dependencies. No `package.json`, no lockfile.

## Frameworks

**Core:**
- None. Vanilla HTML/CSS/JS only. No React, Vue, Angular, or any UI framework.

**Testing:**
- None. No test framework or test files present.

**Build/Dev:**
- None. No build step, no bundler, no transpiler, no minifier.
- Static file serving only. All asset paths are absolute from root (`/assets/...`, `/data/...`).

## Key Dependencies

**None — the project has zero external dependencies.**

All functionality is implemented using browser-native APIs only:

- **Fetch API** — TSV data loading with `cache: "no-store"` in `assets/js/shared-utils.js`, `assets/js/conjugation.js`, `assets/js/fill-blank.js`
- **Web Audio API** (`AudioContext` / `webkitAudioContext`) — Sound effects in `assets/js/shared-utils.js`. Success sound: C5-E5-G5 sine chime. Error sound: 150Hz sawtooth.
- **Web Speech API** (`SpeechSynthesis`, `SpeechSynthesisUtterance`) — Spanish pronunciation in `assets/js/tapvocab.js`. Prefers "Monica" es-ES voice.
- **Canvas API** (`HTMLCanvasElement.getContext("2d")`, `requestAnimationFrame`) — Games in `games/jungle-run.html`, `games/coin-dash.html`, `games/tower-stack.html`
- **localStorage** — Persistent state: coin balance (`tapvocab_coins`), practice list, enabled sentences/verbs
- **sessionStorage** — Transient state: game lives (`game_lives`) set in `index.html` before navigating to `games.html`
- **CustomEvent** (`coinschanged`) — Coin UI updates dispatched by `assets/js/coins.js`

## Configuration

**Environment:**
- No environment variables. No `.env` file.
- All configuration is hardcoded (TSV file paths, audio frequencies, coin costs).

**Build:**
- No build config files. No `tsconfig.json`, `.eslintrc`, `.prettierrc`, `webpack.config.js`, `vite.config.js`, or similar.

**CSS custom properties** (defined in `:root` of `assets/css/styles.css`):
- `--bg`, `--card`, `--ink`, `--muted`, `--accent`, `--ok`, `--warn`, `--error`

## Platform Requirements

**Development:**
- Any static HTTP server (absolute paths require a server; `file://` protocol does not work)
- Modern browser with ES2017+ support

**Production:**
- GitHub Pages static hosting at `tapvocab.fun` (CNAME file present)
- Repository: `https://github.com/adriemel/tap-to-vocab.git`
- No server, no CI/CD pipeline detected, no build step required

---

*Stack analysis: 2026-03-10*
