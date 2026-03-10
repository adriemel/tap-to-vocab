# External Integrations

**Analysis Date:** 2026-03-10

## APIs & External Services

**None.** The application makes no calls to external APIs or third-party services. All data is local.

The only network requests at runtime are:
- Fetch calls to same-origin TSV files (`/data/words.tsv`, `/data/verbs.tsv`, `/data/fill-in-blank.tsv`)
- These always use `{ cache: "no-store" }` to bypass the browser cache

## Data Storage

**Databases:**
- None. No backend database.

**Local browser storage (all same-origin, no server):**

| Key | Storage | Set by | Purpose |
|-----|---------|--------|---------|
| `tapvocab_coins` | `localStorage` | `assets/js/coins.js` | Persistent coin balance (integer) |
| `practiceList` | `localStorage` | `assets/js/tapvocab.js` | JSON array of starred word objects |
| `tv_sentences_enabled` (approx) | `localStorage` | `assets/js/sentences.js` | Map of enabled/disabled sentences |
| `tv_verbs_enabled` (approx) | `localStorage` | `assets/js/conjugation.js` | Map of enabled/disabled verbs |
| `game_lives` | `sessionStorage` | `index.html` inline script | Lives granted before navigating to games (value: `"3"`) |

**File Storage:**
- Local filesystem only. TSV data files served as static assets from `data/` directory.

**Caching:**
- Intentionally disabled for TSV fetches (`cache: "no-store"`). No service worker, no Cache API.

## Authentication & Identity

**Auth Provider:**
- None. No authentication, no user accounts, no login.

## Monitoring & Observability

**Error Tracking:**
- None. No Sentry, Datadog, or similar.

**Logs:**
- `console.warn` for non-fatal errors (speech synthesis failures, audio failures). No structured logging.

## CI/CD & Deployment

**Hosting:**
- GitHub Pages. Custom domain `tapvocab.fun` configured via `CNAME` file.
- Repository: `https://github.com/adriemel/tap-to-vocab.git` (branch: `main`)
- Deployment: pushing to `main` triggers GitHub Pages rebuild (no build step needed — static files only)

**CI Pipeline:**
- None detected. No `.github/workflows/` directory, no CI config files.

## Browser APIs Used (Not External Services)

These are native browser capabilities, not external integrations, but listed here for completeness:

**Web Speech API (`SpeechSynthesis`):**
- Used in `assets/js/tapvocab.js` for Spanish pronunciation
- Prefers "Monica" (es-ES) voice; falls back to any `es-*` voice
- No API key required; device/browser dependent
- Debug utility at `voices.html`

**Web Audio API (`AudioContext`):**
- Used in `assets/js/shared-utils.js` for sound effects
- Programmatically generated tones (no audio files loaded)
- Falls back silently if unavailable

**Canvas 2D API:**
- Used in `games/jungle-run.html`, `games/coin-dash.html`, `games/tower-stack.html`
- All game rendering is canvas-based with `requestAnimationFrame`

## Environment Configuration

**Required env vars:**
- None.

**Secrets location:**
- None. No secrets or credentials exist in this project.

## Webhooks & Callbacks

**Incoming:**
- None.

**Outgoing:**
- None.

---

*Integration audit: 2026-03-10*
