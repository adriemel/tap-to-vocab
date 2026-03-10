# Concerns

## Technical Debt

### No Shared Module Loading System
**Severity: Medium**

JS modules are loaded via `<script>` tags with manual ordering. If load order breaks (e.g., game JS before `shared-utils.js`), runtime crashes occur with no helpful error. No module system (ESM imports, bundler) to enforce dependency order.

File: `tap-to-vocab/index.html`, `tap-to-vocab/sentences.html`, etc.

### Duplicated TSV Parsing Logic
**Severity: Low**

`fill-blank.js` and `conjugation.js` each contain their own TSV loader (`loadSentences`, `loadVerbs`). These mirror the pattern in `SharedUtils.loadWords` but aren't shared. Future TSV format changes require updating multiple loaders.

Files: `assets/js/fill-blank.js:9-33`, `assets/js/conjugation.js`

### Inline Scripts in HTML
**Severity: Low**

`index.html` contains inline `<script>` blocks for coin counter display and the reset button handler. These are harder to maintain/test than dedicated JS modules.

File: `tap-to-vocab/index.html:14-36`, `84-90`

## Known Bugs / Fragile Areas

### Web Speech API Voice Availability
**Severity: Medium — Platform-dependent**

Voice loading is async and unreliable. `speechSynthesis.getVoices()` returns empty on first call in some browsers. The code caches the voice via `voiceschanged` event, but on iOS/Safari the timing differs. Falls back to any available voice which may not be Spanish.

File: `assets/js/tapvocab.js:15-32`

### localStorage Quota Exceeded
**Severity: Low — Edge case**

`savePracticeList` and `saveEnabledSentences` catch localStorage errors with `console.warn`. If quota is exceeded, changes silently don't persist. No user feedback.

Files: `assets/js/tapvocab.js`, `assets/js/sentences.js`

### No Graceful Offline Handling
**Severity: Low**

TSV files are fetched at runtime with `cache: "no-store"`. If the user is offline or GitHub Pages is down, all game pages show an error. No service worker or offline fallback.

### Coin Economy — No Upper Bound
**Severity: Low**

`CoinTracker.addCoin()` increments without cap. A user could accumulate thousands of coins. Not currently exploitable but could be unexpected UX.

File: `assets/js/coins.js`

## Security

### No Input Sanitization
**Severity: Low — Acceptable for static site**

TSV content is inserted into DOM via `.textContent` (not `.innerHTML`) in most places. Exception: some game pages use `innerHTML` for styled feedback. No user-controlled input is stored or rendered in ways that create XSS risk for other users (this is a client-only app).

### No Authentication
By design — this is a public vocabulary learning app with no user accounts.

## Performance

### TSV Files Fetched on Every Page Load
**Severity: Low**

`cache: "no-store"` prevents browser caching of data files. Intentional design choice for freshness, but adds ~50-200ms on every page load. Could become an issue if TSV files grow significantly.

### AudioContext Created Lazily
Lazy initialization of `AudioContext` is correct (browsers require user gesture before creating audio). The singleton pattern (`_audioCtx`) prevents multiple contexts accumulating.

## Maintainability

### No Build Process or Linting
No ESLint, no Prettier, no minification. Code style is maintained manually. This is acceptable given the project size but means inconsistencies can creep in.

### Nested Repository Structure
**Severity: Low — Known gotcha**

The actual codebase lives in `tap-to-vocab/tap-to-vocab/` (nested). This affects:
- Git commands must be run from `tap-to-vocab/tap-to-vocab/`
- Some tools may work from the outer `tap-to-vocab/` directory by accident

### CLAUDE.md Outdated
The `CLAUDE.md` in `tap-to-vocab/tap-to-vocab/` references the old architecture (pre-`shared-utils.js` refactor, mentions "both JS files contain their own copy" of utilities). This is now outdated — `SharedUtils` exists.

File: `tap-to-vocab/tap-to-vocab/CLAUDE.md`

## Scope Creep Risk

The coin/games system adds complexity (gating games behind coins) that could conflict with the primary learning goal. The `sessionStorage.game_lives` pattern for passing lives to games is fragile — if a user navigates directly to a game URL, lives won't be set.
