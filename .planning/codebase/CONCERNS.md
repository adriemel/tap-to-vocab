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

The coin/games system adds complexity (gating games behind coins) that could conflict with the primary learning goal. The `sessionStorage.game_lives` pattern for passing lives to games is fragile — if a user navigates directly to a game URL, lives won't be set. Game lives decrement logic is duplicated across all 3 game files.

## Additional Issues

### No Favicon
**Severity: Low**

No `favicon.ico` or `<link rel="icon">` in any page — causes a 404 request on every page load.

### Quiz Back Button Doesn't Refund Coins
**Severity: Low**

When undoing a "Correct" answer with the back button in quiz mode, the coin awarded for that answer is not refunded. `CoinTracker.addCoin()` is called in `btnCorrect.onclick` but `btnQuizBack.onclick` only decrements `correctCount`.

File: `assets/js/tapvocab.js`

### User State Keyed by Text Strings
**Severity: Medium — Fragile**

Practice list, enabled sentences, and enabled verbs are all stored in localStorage keyed by Spanish/German text content. If vocabulary entries are edited in the TSV files, stored user state silently orphans — the old key remains in localStorage pointing to a word that no longer exists.

### `scheduleMusic()` Called Every Animation Frame
**Severity: Low — Performance**

In game files, music scheduling may be called on each animation frame tick. Should be called once and use `AudioContext` scheduling for timing accuracy.

### Stale CLAUDE.md
**Severity: Low**

`tap-to-vocab/CLAUDE.md` describes pre-`shared-utils.js` architecture ("both JS files contain their own copy of `loadWords()`"). Now inaccurate since the shared-utils refactor.

File: `tap-to-vocab/CLAUDE.md`

---

## Audit — Learning Pages
*(Phase 1 audit — 2026-03-10)*

### index.html

#### No Favicon Link
**Severity: Low**

(Confirmed present — see pre-existing entry above)

No `<link rel="icon">` in `<head>`. Confirmed: the full `<head>` block contains charset, viewport, title, description, og tags, stylesheet, and one inline `<script>` — no favicon link. Every page load triggers a 404 request for favicon.ico.

File: `tap-to-vocab/index.html:3-13`

#### Inline Script Blocks
**Severity: Low**

(Confirmed present — see pre-existing entry above)

Two inline `<script>` blocks confirmed: (1) DOMContentLoaded block (lines 14–36) that reads practiceList from localStorage and wires up the Games button coin gate + sessionStorage write; (2) Reset Coins button handler (lines 84–90). Both use `CoinTracker` directly without guarding for its availability beyond script load order.

File: `tap-to-vocab/index.html:14-36, 84-90`

#### grid-two-col Forces Narrow Buttons at 375px
**Severity: Low**

The `.grid-two-col` uses `grid-template-columns: 1fr 1fr` with no breakpoint override. At 375px viewport width (iPhone SE), each column is approximately 155px wide (accounting for container padding). Category buttons with long labels like "🏠 Casa y Familia" will wrap text within the button. This is functional but produces cramped, two-line buttons. No horizontal overflow occurs because the grid fills the container correctly, but tap ergonomics are degraded.

File: `tap-to-vocab/assets/css/styles.css:39-43`

#### practice-btn Count Updated Only on DOMContentLoaded
**Severity: Low**

The inline script reads `practiceList` from localStorage and updates the `#practice-btn` text once on DOMContentLoaded. If a user adds words to their practice list in another tab or session, the count on the home page will be stale until reload. This is cosmetic and expected for a client-only app, but worth noting.

File: `tap-to-vocab/index.html:15-22`

#### Script Load Order: coins.js Only, No shared-utils.js
**Severity: Low**

`index.html` loads `coins.js` in `<head>` (correct for inline script reliance on `CoinTracker`), but does NOT load `shared-utils.js` at all — which is correct since no shared-utils functions are used on the home page. Load order is appropriate for this page's actual dependencies.

File: `tap-to-vocab/index.html:13`

---

### topic.html (tapvocab.js)

#### Quiz Back Button Does Not Refund Coin
**Severity: Low**

(Confirmed present — see pre-existing entry above)

Confirmed at `tapvocab.js` lines 305–330: `btnQuizBack.onclick` decrements `correctCount` when `lastAnswer.wasCorrect` is true, but does not call `CoinTracker.spendCoins(1)` or any equivalent. The coin awarded in `btnCorrect.onclick` (line 250: `CoinTracker.addCoin()`) is never reversed. A user can "earn" coins by repeatedly pressing Correct then Back.

File: `tap-to-vocab/assets/js/tapvocab.js:305-330`

#### savePracticeList Silent localStorage Failure
**Severity: Low**

(Confirmed present — see pre-existing entry above)

`savePracticeList` at line 67–69 catches localStorage errors with `console.warn` only. No user-visible feedback if storage is full.

File: `tap-to-vocab/assets/js/tapvocab.js:66-69`

#### Web Speech API iOS/Safari Voice Timing
**Severity: Medium**

(Confirmed present — see pre-existing entry above)

`speechSynthesis.onvoiceschanged` is used to cache the Spanish voice (lines 27–32). On iOS/Safari this event fires differently (often before the script runs, or not at all). The fallback in `speakSpanish` calls `getSpanishVoice()` each time, but `speechSynthesis.getVoices()` may return empty on iOS until after user interaction. Result: first pronunciation attempt may use a non-Spanish voice or fail silently.

File: `tap-to-vocab/assets/js/tapvocab.js:15-44`

#### Quiz Flip Card Animation Reset: Fix Intact
**Severity: N/A — Previously Fixed**

The `inner.style.transition = "none"` / force-reflow / restore-transition pattern is confirmed present and correct at `showQuizCard()` lines 162–167. The previously-fixed quiz flip animation bug is resolved.

File: `tap-to-vocab/assets/js/tapvocab.js:162-167`

#### topic.html Missing Script Tags in Head
**Severity: Low**

`topic.html` loads `coins.js`, `shared-utils.js`, and `tapvocab.js` at the bottom of `<body>` (lines 137–139), which is correct practice for non-deferred scripts. Load order is coins → shared-utils → tapvocab, which is correct. No issue with the order itself, but `<head>` has no script tags — coin counter will show "0" for the brief period before DOMContentLoaded fires (same as other pages).

File: `tap-to-vocab/topic.html:137-139`

#### Browse Mode and Quiz Mode Both Have Home Navigation
**Severity: N/A — Functioning Correctly**

Browse mode has `#btn-home` (line 38 of topic.html). Quiz mode has `#btn-home-quiz` (line 88). The quiz complete modal has `#modal-home`. All three correctly set `location.href = "/"`. Navigation is complete in all UI states.

#### topic.html Has No Favicon
**Severity: Low**

(Confirmed present — see pre-existing entry above)

`<head>` at lines 3–13 has no `<link rel="icon">`. Same issue as index.html.

File: `tap-to-vocab/topic.html:3-13`

#### tapvocab.js: Raw Hex Colors in CSS (Not a JS Issue)
**Severity: Low**

`tapvocab.js` does not inject any raw hex colors. Visual consistency concern is at the CSS level (styles.css has numerous raw hex values for borders and backgrounds beyond the CSS variables). This is a CSS technical debt issue, not a JS issue.

File: `tap-to-vocab/assets/css/styles.css` (multiple lines)

---

### sentences.html (sentences.js)

#### saveEnabledSentences Silent localStorage Failure
**Severity: Low**

(Confirmed present — see pre-existing entry above)

`saveEnabledSentences` at line 25–27 of sentences.js uses the same `console.warn`-only catch pattern. Silent failure with no user feedback.

File: `tap-to-vocab/assets/js/sentences.js:24-27`

#### Back Button History: Re-renders Without Re-fetching TSV
**Severity: N/A — Functioning Correctly**

The back button in sentences.js pops from the `history` array (line 263: `currentIndex = history.pop()`) and calls `loadSentence()` (line 265). `loadSentence()` renders from the in-memory `sentences` array using `currentIndex`. No TSV re-fetch occurs. The full sentence list is loaded once at init and held in memory. Back navigation is correct and does not incur additional network requests.

File: `tap-to-vocab/assets/js/sentences.js:259-267`

#### sentences.html Script Load Order Correct
**Severity: N/A — Functioning Correctly**

Load order: coins.js → shared-utils.js → sentences.js (lines 75–77 of sentences.html). Correct.

#### User State Keyed by German Text (Enabled Sentences)
**Severity: Medium**

(Confirmed present — see pre-existing entry above)

`saveEnabledSentences` stores enabled state keyed by `sentence.de` (the German text, lines 56–59 and 72–73). If a sentence's German translation is edited in words.tsv, the stored localStorage key orphans and the sentence resets to enabled on next load. Same fragility pattern as practice list.

File: `tap-to-vocab/assets/js/sentences.js:56-59, 72-73`

#### sentences.html: No Favicon
**Severity: Low**

(Confirmed present — see pre-existing entry above)

No `<link rel="icon">` in `<head>`.

File: `tap-to-vocab/sentences.html:3-12`

#### sentences.html: innerHTML Usage
**Severity: Low — Acceptable for static site**

`buildAreaEl.innerHTML = ""` and `wordBankEl.innerHTML = ""` are used for clearing (safe). `buildAreaEl.innerHTML = '<span style="...">Tap words below...</span>'` injects a hardcoded string (not user data). No user-controlled content is inserted via innerHTML. Acceptable for this static site.

File: `tap-to-vocab/assets/js/sentences.js:144, 156, 209`

---

### conjugation.html (conjugation.js)

#### conjugation.js Has Its Own loadVerbs TSV Loader
**Severity: Low**

(Confirmed present — see pre-existing entry above)

`loadVerbs` function exists at lines 35–49 of conjugation.js and is NOT delegating to `SharedUtils.loadWords`. It implements its own fetch + TSV parse. This mirrors SharedUtils.loadWords but uses a `header.forEach` pattern to build dynamic column objects (suited to verbs.tsv multi-column format) rather than the fixed `{category, es, de}` structure. Confirmed duplicated logic.

File: `tap-to-vocab/assets/js/conjugation.js:35-49`

#### saveEnabledVerbs Silent localStorage Failure
**Severity: Low**

(Confirmed present — see pre-existing entry above)

`saveEnabledVerbs` at lines 21–23 of conjugation.js uses the same `console.warn`-only catch pattern. Silent failure with no user feedback.

File: `tap-to-vocab/assets/js/conjugation.js:20-23`

#### User State Keyed by Infinitive Text (Enabled Verbs)
**Severity: Medium**

(Confirmed present — see pre-existing entry above)

Enabled verbs stored keyed by `verb.infinitive` text. If a verb's infinitive is corrected in verbs.tsv, stored enabled state orphans.

File: `tap-to-vocab/assets/js/conjugation.js:63-64`

#### max-height: 700px and max-width: 600px Media Query Present
**Severity: N/A — Functioning Correctly**

The extra-small screen media query for iPhone SE fit is confirmed at styles.css line 1068. It reduces `.conj-row` padding, `.conj-table` gap, `.conj-pronoun` min-width and font-size, and `.conj-slot` min-height. This is a correctly implemented responsive override.

File: `tap-to-vocab/assets/css/styles.css:1068-1097`

#### conjugation.html: Script Load Order Correct
**Severity: N/A — Functioning Correctly**

Load order: coins.js → shared-utils.js → conjugation.js (lines 88–90 of conjugation.html). Correct.

#### conjugation.html: No Favicon
**Severity: Low**

(Confirmed present — see pre-existing entry above)

No `<link rel="icon">` in `<head>`.

File: `tap-to-vocab/conjugation.html:3-12`

#### conjugation.js: Word Bank Buttons Below 44px When Many Forms Present
**Severity: Low**

The `.word-btn` class is used for verb form buttons in the word bank. With 6 forms displayed, on a 375px viewport the word bank buttons will be sized by padding only (no explicit min-height). Depending on text length and wrapping, some buttons may fall below the 44px tap-target guideline if the CSS `padding` alone is insufficient.

File: `tap-to-vocab/assets/css/styles.css` (word-btn definition)

---

### fill-blank.html (fill-blank.js)

#### fill-blank.js Has Its Own loadSentences TSV Loader
**Severity: Low**

(Confirmed present — see pre-existing entry above)

`loadSentences` function at lines 9–33 of fill-blank.js implements its own fetch + TSV parse. Confirmed not delegating to SharedUtils.loadWords. The function uses dynamic header index lookup (same approach as SharedUtils) and reads 5 columns: `category`, `de`, `es_with_blank`, `correct_answer`, `wrong_answers`.

File: `tap-to-vocab/assets/js/fill-blank.js:9-33`

#### Incomplete TSV Row Guard Present
**Severity: N/A — Previously Fixed**

The `(cols[i] || "").trim()` guard is confirmed present via the `col` helper at line 24: `const col = i => (i >= 0 ? (cols[i] || "") : "").trim()`. The previously-fixed incomplete-row crash is resolved. The `.filter(r => r.de && r.es_with_blank && r.correct_answer)` at line 32 also correctly discards incomplete rows.

File: `tap-to-vocab/assets/js/fill-blank.js:24, 32`

#### Both TSV Categories Loaded — No UI Category Filter
**Severity: Low**

Both `hay_vs_estar` and `verb_conjugation` categories in fill-in-blank.tsv are loaded together (no category filter in code). All exercises from both categories are shuffled into a single pool. There is no UI to select or filter by category. Users cannot choose to practice only grammar exercises or only conjugation exercises. This is functional but limits the learning experience.

File: `tap-to-vocab/assets/js/fill-blank.js:157-172`

#### fill-blank.html: Back Button Does Not Restore Answer State
**Severity: Low**

The back button pops `history` and decrements `currentIndex`, then calls `loadSentence()`. `loadSentence()` re-renders the question with fresh shuffled choice buttons. The previously-selected correct answer is not remembered — the question is presented as if it has not been answered. This is minor and expected for a simple back navigation, but users may be confused about why a "completed" question reappears.

File: `tap-to-vocab/assets/js/fill-blank.js:140-147`

#### fill-blank.html: Script Load Order Correct
**Severity: N/A — Functioning Correctly**

Load order: coins.js → shared-utils.js → fill-blank.js (lines 48–50 of fill-blank.html). Correct.

#### fill-blank.html: No Favicon
**Severity: Low**

(Confirmed present — see pre-existing entry above)

No `<link rel="icon">` in `<head>`.

File: `tap-to-vocab/fill-blank.html:3-12`

#### fill-blank.html: innerHTML Usage for Spanish Sentence Rendering
**Severity: Low — Acceptable for static site**

`spanishEl.innerHTML = ""` clears the element (safe). The blank slot is built via `document.createElement` and `document.createTextNode` (safe). The completion message uses `innerHTML` with a hardcoded string (not user data). No XSS risk for this static site.

File: `tap-to-vocab/assets/js/fill-blank.js:73-83, 59`

---

## Audit — Standalone Pages
*(Phase 1 audit — 2026-03-10)*

### vocab.html

#### vocab.html Is Orphaned — Not Linked From Any App Page
**Severity: Medium**

No other HTML file in the app links to `vocab.html`. A full search of all `.html` files and all `.js` files under `tap-to-vocab/tap-to-vocab/` returned zero matches for `vocab.html`. The page can only be reached by typing its URL directly (e.g., `tapvocab.fun/vocab.html`). Users navigating the app normally have no way to discover or reach this page. According to `CLAUDE.md`, it is intended to serve as a standalone spelling practice card receiving words via URL query parameters (`?w=...&de=...`), presumably linked from `topic.html` — but no such link exists.

File: All `.html` files checked: `index.html`, `topic.html`, `sentences.html`, `conjugation.html`, `fill-blank.html`, `games.html`

#### vocab.html Has No Navigation — User Is Stranded
**Severity: Medium**

`vocab.html` contains no back button, no home link, and no navigation of any kind. The only interactive elements are: a direction dropdown, a Speak button, a Show/Hide button, a spelling form with Submit + Hint buttons. There is no way to return to the main app other than the browser's own back button or editing the URL. If the page were ever linked from `topic.html`, users completing a word card would have no in-app path forward.

File: `tap-to-vocab/vocab.html` (entire file — no navigation elements present)

#### vocab.html Does Not Use CoinTracker — Correct Answers Give No Coins
**Severity: Low**

`vocab.html` does not load `coins.js` and does not reference `CoinTracker` anywhere. When a user types the correct spelling and submits (line 119–125), feedback is shown and speech is triggered, but no coin is awarded. This is inconsistent with all other game pages (`topic.html`, `sentences.html`, `conjugation.html`, `fill-blank.html`) which all call `CoinTracker.addCoin()` on correct answers.

File: `tap-to-vocab/vocab.html:1-17` (no `<script src>` for coins.js), `tap-to-vocab/vocab.html:119-125` (correct answer handler with no coin call)

#### vocab.html Does Not Use SharedUtils — Duplicates Speech Logic
**Severity: Low**

`vocab.html` does not load `shared-utils.js`. It implements its own `speak()` function (lines 89–103) and its own `findVoiceByName()` helper (lines 84–87). These duplicate functionality already available in `SharedUtils`. The `playSuccessSound`, `playErrorSound`, `showSuccessAnimation`, and `confettiBurst` utilities from SharedUtils are also absent — there is no success animation or audio chime on correct answers.

File: `tap-to-vocab/vocab.html:84-103` (standalone speak/voice implementations)

#### vocab.html Uses Inline Styles — Inconsistent With Main App CSS Variable System
**Severity: Low**

`vocab.html` uses an entirely inline `<style>` block (lines 7–16) with a light theme (white background, `#ddd` borders, `#555` hint text, raw system-ui font). The rest of the app uses `assets/css/styles.css` with CSS custom properties (`--bg`, `--card`, `--ink`, `--muted`, `--accent`, `--ok`, `--warn`, `--error`) and a dark theme. `vocab.html` does not load `styles.css` at all. If the page were ever integrated into the app navigation flow, it would appear visually disconnected.

File: `tap-to-vocab/vocab.html:7-16` (inline style block — no link to styles.css)

#### vocab.html: No TSV Fetch — Word Must Come Via URL Parameters
**Severity: Low — By Design, But Fragile**

`vocab.html` does not fetch any TSV file. All content (Spanish word, German word, example sentence, voice preference) must be passed via URL query parameters (`?w=`, `?de=`, `?lang=`, `?voice=`, `?sent=`). If any parameter is missing or malformed, the page renders with placeholder text ("Hinweis (Deutsch)", "Palabra (Español)") with no error message. A direct navigation to `vocab.html` with no query string shows an entirely empty practice card — no indication of what parameters are expected.

File: `tap-to-vocab/vocab.html:47-55` (URL parameter extraction with fallback to empty strings)

#### vocab.html: Button Tap Targets May Be Below 44px
**Severity: Low**

The inline CSS sets `button { font-size: 1rem; padding: 0.6rem 1rem; }` (line 13). At `font-size: 18px` body, `1rem = 18px`. Vertical height = `18px line-height × 1.4 + 2 × (0.6 × 18px) = 25.2 + 21.6 = 46.8px`. The Submit and Hint buttons likely meet the 44px guideline. However, the "Anhören" and "Anzeigen" buttons share the same styling and appear on the same `<p>` tag with `margin: 0.3rem 0.3rem` — on a narrow viewport the reduced horizontal spacing may compress rendered height if font scaling differs.

File: `tap-to-vocab/vocab.html:13` (button CSS rule)

#### vocab.html: speechSynthesis Used Without Availability Guard in listVoices Call
**Severity: Low**

`findVoiceByName()` calls `speechSynthesis.getVoices()` directly (line 85) with a `|| []` fallback. The outer `speak()` function guards with `if (!("speechSynthesis" in window)) return;` (line 90). However, `speechSynthesis.onvoiceschanged` is set unconditionally at line 149 without checking `typeof speechSynthesis !== "undefined"` first. The guard at line 148 (`if (typeof speechSynthesis !== "undefined")`) does exist, so this is correctly guarded. No crash risk — this is N/A.

File: `tap-to-vocab/vocab.html:148-153` (guard is present and correct)

---

### voices.html

#### voices.html Is Orphaned — Not Linked From Any App Page
**Severity: Low**

No other HTML file in the app links to `voices.html`. A full search of all `.html` and `.js` files under `tap-to-vocab/tap-to-vocab/` returned zero matches for `voices.html`. The page is intentionally a developer-only debug utility (title: "Web Speech Voice Inspector", instructions in German explaining iOS voice loading). It is not intended to be user-facing. Reachable only via direct URL.

File: All `.html` and `.js` files checked — no references found.

#### voices.html Has No Navigation — Intentional for Debug Utility
**Severity: Low**

`voices.html` contains no back button or home link. Given its purpose as a developer-only voice debug tool, this is appropriate. The page does not need in-app navigation since it is not part of the user-facing flow. A developer using it navigates with browser controls. No fix recommended — removing this page or leaving it navigation-free are both acceptable.

File: `tap-to-vocab/voices.html` (entire file — no navigation elements, intentional)

#### voices.html: No Styling From Main App — Intentional for Debug Page
**Severity: Low**

`voices.html` uses its own inline `<style>` block (lines 7–15) with a clean, neutral light theme (white, `#ddd` borders, `#f7f7f7` table header). It does not load `styles.css` or `coins.js` or `shared-utils.js`. This is appropriate for a debug utility — applying the app's dark theme to an internal tool is unnecessary.

File: `tap-to-vocab/voices.html:7-15` (standalone styles — intentional)

#### voices.html: speechSynthesis Access Without Null Check at Top-Level Call
**Severity: Medium**

`listVoices()` at line 37 calls `window.speechSynthesis.getVoices()` directly. If the browser does not support `speechSynthesis` (e.g., certain Android WebViews, some desktop browsers without the API), this will throw `TypeError: Cannot read properties of undefined (reading 'getVoices')`. The `speak()` function at line 70 has a guard (`if (!('speechSynthesis' in window)) return;`), but `listVoices()` and `render()` do not. Calling `render()` at line 78 (top-level, runs on page load) would crash the page in unsupported browsers.

File: `tap-to-vocab/voices.html:37, 78` (unguarded speechSynthesis access)

#### voices.html: Table Overflows on Narrow Viewports (Mobile Layout)
**Severity: Low**

The `<table>` at line 10 is set to `width: 100%` with 6 columns (#, Name, Lang, Local, Test, URL-Parameter). On a 375px viewport, the table will compress or overflow horizontally because the columns (especially the "URL-Parameter" column containing `voice=<url-encoded-name>` values) cannot reasonably fit in ~350px. No `overflow-x: auto` wrapper is present on the containing element. While `voices.html` is a developer tool unlikely to be used on mobile, the table layout will be broken.

File: `tap-to-vocab/voices.html:9-12` (table CSS, no overflow wrapper)

#### voices.html: voiceschanged Listener Registered But render() Also Called Immediately
**Severity: Low — Minor Redundancy**

`render()` is called at line 78 (immediately, before voices may have loaded), and `speechSynthesis.onvoiceschanged = render` is set at line 80 (to re-render after voices load). This is the standard pattern for handling async voice loading and is correct. The initial `render()` call at line 78 will produce an empty table if voices haven't loaded yet, then the `onvoiceschanged` event will re-populate it. This is expected behavior — not a bug, but users may see a brief empty table.

File: `tap-to-vocab/voices.html:78-81` (render timing — expected behavior)
