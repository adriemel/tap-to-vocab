# Phase 2: Bug Fixes — Research

**Researched:** 2026-03-10
**Domain:** Vanilla JS bug repair — Web Speech API, localStorage, sessionStorage, coin state, favicon
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BUG-01 | Quiz back button refunds coins when undoing a previously-marked correct answer | tapvocab.js:305-330 read in full — exact fix location identified |
| BUG-02 | Web Speech API voice loading works on iOS/Safari — falls back gracefully to any available Spanish voice without silent failure | voiceschanged timing, iOS getVoices() behaviour documented with fix pattern |
| BUG-03 | Game lives are properly initialized when a user navigates directly to a game URL | sessionStorage guard code read in full across games.html, coin-dash.html, jungle-run.html, tower-stack.html |
| BUG-04 | Favicon present on all pages — no 404 on every page load | All 9 page heads confirmed missing favicon link; asset directory confirmed empty |
| BUG-05 | localStorage quota exceeded shows visible user feedback instead of silently failing | All three silent-catch sites identified by file and line |
| BUG-06 | All additional broken behaviors discovered during audit are resolved | CONCERNS.md fully read; all High/Medium items catalogued; scope decision required |

</phase_requirements>

---

## Summary

Phase 1 produced a fully-audited CONCERNS.md with 86 severity-rated entries across all 9 app pages. Phase 2 must address exactly 6 requirement IDs (BUG-01 through BUG-06). Five of them map to specific, small code changes with exact file and line references already confirmed by the audit. BUG-06 is a catch-all for additional broken behaviors — the audit surfaced one High-severity item (sessionStorage silent redirect, already covered by BUG-03) and several Medium items; the planner must decide which Medium items to include in BUG-06 scope.

The fixes are self-contained vanilla JS edits — no new libraries, no architectural changes, no build tooling. The largest single change is BUG-03 (sessionStorage guard), which requires editing four HTML files and adding a small amount of initialization logic. Every other fix is a 1-5 line change to an existing function. There are no external service dependencies, no async coordination challenges, and no risk of regressions outside the files being edited.

**Primary recommendation:** Fix in dependency order — BUG-04 first (pure file creation, zero risk), then BUG-05 (pure catch clause additions), then BUG-01 (single addCoin call site), then BUG-02 (voice loading wrapper), then BUG-03 (sessionStorage guard redesign across 4 files), then BUG-06 (scope decision + remaining medium items).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JS (IIFE pattern) | ES2018+ | All fixes live inside existing IIFE closures | Project convention — no ESM, no bundler, IIFE exports to `window` |
| Web Speech API | Browser built-in | Voice loading fix for BUG-02 | Already in use — no alternative |
| localStorage | Browser built-in | BUG-05 quota error feedback | Already in use |
| sessionStorage | Browser built-in | BUG-03 game lives initialization | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `window.CoinTracker` | project | `spendCoins(1)` for BUG-01 refund | Already loaded on topic.html via coins.js |
| SVG or emoji favicon | browser | BUG-04 favicon asset | Inline SVG data-URI in `<link>` is the simplest approach — no file creation needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Data-URI SVG favicon in `<link>` | favicon.ico file | A single `<link rel="icon">` with an inline SVG requires no asset file and works on all modern browsers; a favicon.ico file requires creating a binary and adding it to root — more complex for no benefit at this project scale |
| Replacing sessionStorage guard entirely | Add graceful fallback lives | Replacing the hard redirect with an in-page message + "Start with 3 lives" button is lower-risk than fully removing the guard — users who navigate directly still get a clear message instead of a silent redirect |

**Installation:** No new packages. All fixes are edits to existing HTML/JS files.

---

## Architecture Patterns

### Recommended Project Structure
No structural changes in this phase. All edits are within existing files:

```
tap-to-vocab/
├── assets/js/
│   ├── tapvocab.js       — BUG-01, BUG-02
│   ├── sentences.js      — BUG-05 (saveEnabledSentences)
│   └── conjugation.js    — BUG-05 (saveEnabledVerbs)
├── games.html            — BUG-03
├── games/
│   ├── coin-dash.html    — BUG-03
│   ├── jungle-run.html   — BUG-03
│   └── tower-stack.html  — BUG-03
├── index.html            — BUG-04 (add favicon link)
├── topic.html            — BUG-04
├── sentences.html        — BUG-04
├── conjugation.html      — BUG-04
├── fill-blank.html       — BUG-04
├── games.html            — BUG-04
├── vocab.html            — BUG-04
└── voices.html           — BUG-04
```

### Pattern 1: BUG-01 — Coin Refund on Quiz Back

**What:** When `btnQuizBack.onclick` fires and `lastAnswer.wasCorrect` is true, call `CoinTracker.spendCoins(1)` before decrementing `correctCount`.

**Where:** `tapvocab.js` lines 314–323 (the `else if (lastAnswer.wasCorrect)` branch).

**Current code (lines 314–323):**
```javascript
} else if (lastAnswer.wasCorrect) {
  correctCount--;
  if (isPracticeCategory) {
    quizWords.splice(currentQuizIndex, 0, lastAnswer.word);
    if (!isMarked(lastAnswer.word)) {
      toggleMark(lastAnswer.word);
    }
  } else {
    currentQuizIndex--;
  }
}
```

**Fixed code — add one line after `correctCount--`:**
```javascript
} else if (lastAnswer.wasCorrect) {
  correctCount--;
  if (window.CoinTracker) CoinTracker.spendCoins(1); // BUG-01: refund coin
  if (isPracticeCategory) {
    // ... rest unchanged
```

**Guard pattern:** Use `if (window.CoinTracker)` (same guard style as `btnCorrect.onclick` line 250).

**Edge case:** `spendCoins(1)` already guards against going below 0 (`Math.max(0, n)` in `setCoins`), so no underflow risk.

### Pattern 2: BUG-02 — iOS/Safari Voice Loading

**What:** On iOS, `speechSynthesis.onvoiceschanged` fires before the page JS runs, or not at all. `getVoices()` returns an empty array synchronously at load time. The fix is to always check synchronously first, then fall back to the event.

**Current code (tapvocab.js lines 27–32):**
```javascript
if (typeof speechSynthesis !== "undefined" && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.addEventListener("voiceschanged", function () {
    _voicesLoaded = true;
    getSpanishVoice(); // cache the voice
  });
}
```

**Fixed pattern — check synchronously first:**
```javascript
// Try to cache voice immediately (works on Chrome/Firefox)
if (typeof speechSynthesis !== "undefined") {
  var _initialVoices = speechSynthesis.getVoices();
  if (_initialVoices.length) {
    _voicesLoaded = true;
    getSpanishVoice();
  }
  // Also listen for async load (required on iOS/Safari)
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.addEventListener("voiceschanged", function () {
      _voicesLoaded = true;
      getSpanishVoice();
    });
  }
}
```

**Fallback in `speakSpanish`:** `getSpanishVoice()` is called each time `speakSpanish` runs. If no Spanish voice is found (`preferred.length === 0`), the fallback `voices[0] || null` uses any available voice. The utterance's `u.lang = "es-ES"` is still set, which tells the browser to use Spanish pronunciation even on a generic voice. This is the correct graceful degradation — never silent failure, always speaks something.

**What NOT to do:** Do not remove the `u.lang = "es-ES"` fallback. Some iOS devices list voices only after first user gesture — setting `lang` without an explicit `voice` object still requests Spanish phonetics from the TTS engine.

### Pattern 3: BUG-03 — Game Lives Initialization

**What:** The guard at the top of each game script does `location.replace("/")` with zero user feedback. The fix has two parts:

1. **games.html (line 28–29):** Replace the hard redirect with a user-visible message and a "Go Back" button. The user who navigates directly should see "No games remaining — earn coins to play" rather than a blank-screen redirect.

2. **coin-dash.html, jungle-run.html, tower-stack.html (line 127, 133, 125 respectively):** Same fix — show an in-page error with a link back to home rather than silent `location.replace("/")`.

**Alternative approach — default lives on direct navigation:**
Instead of an error message, initialize `game_lives` to a default (e.g., 3) when the key is absent. This allows users who bookmark a game to always start with lives. However, this bypasses the coin gate entirely, which conflicts with the intended game economy. The error-message approach is the correct fix for BUG-03.

**Pattern for games.html:**
```javascript
var lives = parseInt(sessionStorage.getItem("game_lives") || "0", 10);
if (lives <= 0) {
  // Show error in-page instead of silent redirect
  document.querySelector(".card").innerHTML =
    '<p style="color:var(--error);text-align:center;margin:24px 0;">No games remaining.<br>Earn coins on the learning pages to unlock more!</p>' +
    '<div class="controls" style="margin-top:16px;"><a class="btn secondary" href="/">← Home</a></div>';
  // Script continues so page renders, but no game grid is built
  // Return early from the rest of the inline script by using the structure below
}
```

Note: `games.html` uses a flat inline `<script>` (not inside a function), so early exit must use a flag variable or restructure into an IIFE. The simplest approach: wrap the existing script body in `if (lives > 0) { ... }`.

**Pattern for coin-dash/jungle-run/tower-stack:** Each game script is already wrapped in an IIFE. At line 127/133/125, replace the `location.replace("/")` with an in-page message and `return`:
```javascript
if (parseInt(sessionStorage.getItem("game_lives") || "0", 10) <= 0) {
  document.querySelector(".card h1").insertAdjacentHTML("afterend",
    '<p style="color:var(--error);text-align:center;padding:16px 0;">No games remaining. <a href="/" style="color:var(--accent);">Earn more coins →</a></p>'
  );
  return;
}
```

### Pattern 4: BUG-04 — Favicon

**What:** Add `<link rel="icon">` to every HTML page's `<head>`. No asset file is needed — use an SVG data-URI or emoji favicon.

**Simplest implementation — SVG data-URI in every `<head>`:**
```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>">
```

This works on all modern browsers (Chrome, Firefox, Safari 12+, iOS Safari 12+). No new asset file required. The emoji matches the app's vocabulary learning theme.

**Files to edit (add one `<link>` line to `<head>` in each):**
- index.html, topic.html, sentences.html, conjugation.html, fill-blank.html, games.html, vocab.html, voices.html, games/coin-dash.html, games/jungle-run.html, games/tower-stack.html

That is 11 files total (the 3 game files are in `games/` subdirectory). The link is identical in all cases.

### Pattern 5: BUG-05 — localStorage Quota Feedback

**What:** Three `catch` blocks currently only do `console.warn`. Each must also show a visible in-page error to the user.

**Files and locations:**
- `tapvocab.js:67-69` — `savePracticeList` catch block
- `sentences.js:25-27` — `saveEnabledSentences` catch block
- `conjugation.js:21-23` — `saveEnabledVerbs` catch block

**Pattern for each catch block:**
```javascript
catch (e) {
  console.warn("Could not save practice list:", e);
  // BUG-05: show visible error
  var errEl = document.getElementById("error") || document.body;
  var msg = document.createElement("p");
  msg.style.cssText = "color:var(--error);font-size:.9rem;text-align:center;margin:8px 0;";
  msg.textContent = "Could not save — storage is full. Clear browser data to continue.";
  if (errEl.id === "error") { errEl.textContent = msg.textContent; errEl.style.display = "block"; }
  else { errEl.prepend(msg); }
}
```

**Simpler alternative:** Since all 3 files already have an `#error` element on their respective pages, reuse it:
```javascript
catch (e) {
  console.warn("Could not save:", e);
  var el = document.getElementById("error");
  if (el) { el.textContent = "Storage full — changes could not be saved."; el.style.display = "block"; }
}
```

This is cleaner and matches the existing error display pattern.

### Pattern 6: BUG-06 — Additional Broken Behaviors

**What:** BUG-06 scope must be decided at plan time. From the audit, unresolved items by severity:

**High severity (should include in BUG-06):**
- Already covered by BUG-03 (sessionStorage redirect). No additional High items.

**Medium severity (recommend including in BUG-06):**
- `voices.html` — `listVoices()` / `render()` crash if `window.speechSynthesis` is undefined at load (CONCERNS.md line 490-495). Fix: add `if (!('speechSynthesis' in window)) return;` guard before `render()` call. One line.
- `scheduleMusic() Called Every Animation Frame` — CONCERNS.md pre-existing entry is **inaccurate** per the Phase 1 audit. The entry should be removed or corrected, not the code changed. This is a documentation fix (CONCERNS.md edit), not a code fix.

**Low severity (may include in BUG-06 if time permits):**
- The audit found no Low-severity items that constitute "broken functionality" — most are UX polish or code quality issues assigned to Phases 3 and 4.

**Recommendation for BUG-06:** Include the voices.html crash fix (1-line guard) and the CONCERNS.md correction for the scheduleMusic entry. Both are low-risk, quick changes.

### Anti-Patterns to Avoid

- **Adding `return false` instead of a guard around the script body in games.html:** The inline `<script>` cannot use early `return` at the top level in all browsers. Use a wrapping `if (lives > 0) { ... }` block or restructure into an IIFE with a `return` statement.
- **Using `.innerHTML` to display user-visible localStorage errors:** Stick to `.textContent` to avoid any accidental HTML injection from the error message string.
- **Removing `u.lang = "es-ES"` when no voice is found:** The lang attribute is the fallback for BUG-02 — keep it even when `u.voice` is null.
- **Overcomplicating the favicon:** Do not create a `favicon.ico` binary file. An inline SVG data-URI `<link>` is correct, eliminates new assets, and works everywhere the app is deployed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Favicon asset | A custom PNG/ICO pipeline | SVG data-URI `<link>` | Zero new files, works in all modern browsers |
| Voice loading retry | A polling loop with setInterval | `getVoices()` sync check + `voiceschanged` event | The API provides both mechanisms; polling wastes cycles and can conflict with speech state |
| Coin underflow guard | Custom min-0 logic in `btnQuizBack` | `CoinTracker.spendCoins(1)` — already guards min 0 | `setCoins` in coins.js: `Math.max(0, n)` makes underflow impossible |
| localStorage error detection | Checking quota bytes | Catching the DOMException thrown by `setItem` | The browser throws when quota is exceeded — catching it is the standard pattern |

---

## Common Pitfalls

### Pitfall 1: games.html top-level `return` fails
**What goes wrong:** `games.html` has a flat inline `<script>` block (not inside a function). Writing `return;` at the top level throws a SyntaxError in strict mode and is undefined behavior in non-strict mode.
**Why it happens:** Top-level `return` is only valid inside a function.
**How to avoid:** Either wrap the script body in an IIFE (matching the pattern used in the three game files), or gate the entire script body with `if (lives > 0) { ... }`.
**Warning signs:** If the game grid still renders despite lives being 0.

### Pitfall 2: `speechSynthesis.getVoices()` returns empty array on first call
**What goes wrong:** Calling `getSpanishVoice()` during `DOMContentLoaded` before `voiceschanged` fires returns an empty array, so `_cachedSpanishVoice` is set to `null`. The `voiceschanged` listener will eventually populate it, but if the user taps a word before that event fires, speech uses no voice object.
**Why it happens:** Browsers load voices asynchronously. iOS/Safari fires `voiceschanged` before the page script runs in some cases.
**How to avoid:** In `speakSpanish`, call `getSpanishVoice()` every time (current code already does this at line 38). The synchronous check at script init populates the cache if voices are already available. The event listener updates the cache later. `speakSpanish` never uses the stale `null` value because it always calls `getSpanishVoice()` fresh.
**Warning signs:** First word tap produces no audio or uses a non-Spanish voice.

### Pitfall 3: localStorage catch block hides the original error type
**What goes wrong:** Quota exceeded throws `DOMException` with `code === 22` (or `name === "QuotaExceededError"`). A generic `catch (e)` catches this but also catches other `localStorage` errors (SecurityError in private browsing, etc.).
**Why it happens:** Different error conditions all throw exceptions from `setItem`.
**How to avoid:** The catch clause for BUG-05 should catch all and show a generic "storage full" message — don't try to differentiate error types. The user doesn't need to know the specific code.
**Warning signs:** Error message appears in private browsing mode (Safari) even when storage is not actually full.

### Pitfall 4: Favicon path issue in game files (subdirectory)
**What goes wrong:** `games/coin-dash.html`, `games/jungle-run.html`, and `games/tower-stack.html` are one level deeper than root. A relative `href="favicon.ico"` would resolve to `/games/favicon.ico` (404).
**Why it happens:** Relative paths in `<head>` are relative to the document location.
**How to avoid:** Use a data-URI `<link>` (no path needed) or an absolute path `/favicon.ico`. The data-URI approach eliminates this problem entirely.
**Warning signs:** Game pages still show a 404 for favicon in console after fix.

### Pitfall 5: `CoinTracker.spendCoins` returns `false` if balance is 0
**What goes wrong:** If the user earned a coin, navigated away, and the coin was already spent on a game, `CoinTracker.spendCoins(1)` at the back-button handler would return `false` (no coins to spend).
**Why it happens:** `spendCoins` checks the current balance, not a "credits owed" ledger.
**How to avoid:** Treat the return value of `spendCoins` as informational only — do not abort the `correctCount--` or `currentQuizIndex--` logic if it returns `false`. The user's view of quiz state should always be consistent even if the coin refund cannot be fully honored.
**Warning signs:** Back button stops working if coin balance is 0.

---

## Code Examples

Verified patterns from actual source files:

### CoinTracker.spendCoins (coins.js:24-29)
```javascript
// Source: tap-to-vocab/assets/js/coins.js:24-29
function spendCoins(amount) {
  var current = getCoins();
  if (current < amount) return false;
  setCoins(current - amount);
  return true;
}
```
Already handles min-0 via `setCoins → Math.max(0, n)`. Safe to call without pre-checking balance.

### Existing correct guard pattern (tapvocab.js:250)
```javascript
// Source: tap-to-vocab/assets/js/tapvocab.js:250
if (window.CoinTracker) CoinTracker.addCoin();
```
BUG-01 fix must use the same guard style: `if (window.CoinTracker) CoinTracker.spendCoins(1);`

### Existing localStorage error handler (tapvocab.js:67-69)
```javascript
// Source: tap-to-vocab/assets/js/tapvocab.js:67-69
function savePracticeList(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  catch (e) { console.warn("Could not save practice list:", e); }
}
```
BUG-05 adds a user-visible line inside the catch block.

### Existing sessionStorage guard (coin-dash.html:127)
```javascript
// Source: tap-to-vocab/games/coin-dash.html:127
if (parseInt(sessionStorage.getItem("game_lives") || "0", 10) <= 0) { location.replace("/"); return; }
```
BUG-03 replaces `location.replace("/")` with an in-page message.

### `#error` element usage pattern (tapvocab.js:464-466)
```javascript
// Source: tap-to-vocab/assets/js/tapvocab.js:464-466
errorEl.textContent = "Could not load words.tsv: " + e.message;
errorEl.style.display = "block";
```
All game pages have `#error` — BUG-05 should reuse this for localStorage messages.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `speechSynthesis.onvoiceschanged` only | Sync check + async event listener | This phase | Fixes iOS/Safari voice silence |
| `location.replace("/")` on bad sessionStorage | In-page error message with home link | This phase | Fixes broken bookmarks |
| `console.warn` only on localStorage failure | Visible `#error` message | This phase | Satisfies BUG-05 |
| No favicon | SVG data-URI `<link rel="icon">` | This phase | Eliminates 404 on every page load |

**Deprecated/outdated entries in CONCERNS.md:**
- `scheduleMusic() Called Every Animation Frame` — Phase 1 audit proved this entry is inaccurate. The actual implementation is a correct Web Audio lookahead scheduler. This CONCERNS.md entry should be removed in BUG-06 (documentation fix, no code change).

---

## Open Questions

1. **BUG-06 scope: should game CoinTracker integration be included?**
   - What we know: All 3 game files (coin-dash, jungle-run, tower-stack) do not call `CoinTracker.addCoin()`. The audit classified this as Medium severity.
   - What's unclear: BUG-06 says "any additional broken functionality" — is "games don't award coins" broken functionality or a missing feature?
   - Recommendation: Treat as out-of-scope for Phase 2. The games were never designed to award persistent coins, and adding `CoinTracker.addCoin()` to canvas game loops is a functional addition, not a bug fix. Document as CONCERNS.md item for a future feature phase.

2. **BUG-06 scope: should vocab.html orphan be fixed?**
   - What we know: vocab.html is unreachable from any page, has no navigation, no CoinTracker, and uses outdated styles.
   - What's unclear: Fixing the orphan state (adding links from topic.html) is a UI change — more Phase 4 than Phase 2.
   - Recommendation: Out of scope for Phase 2. The page is not "broken" — it simply is not linked. No user can encounter it in a broken state because no user reaches it through the app.

---

## Validation Architecture

nyquist_validation is enabled (config.json key is true).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — automated testing is explicitly out of scope for this project (REQUIREMENTS.md) |
| Config file | None |
| Quick run command | Manual browser verification (see below) |
| Full suite command | Manual browser verification across 3 pages |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUG-01 | Back button in quiz mode refunds 1 coin | manual | n/a — open topic.html, enter quiz, correct answer, back | n/a |
| BUG-02 | First word tap on iOS speaks Spanish | manual | n/a — test on iOS Safari or simulator | n/a |
| BUG-03 | Direct URL to /games/coin-dash.html shows error message, not blank redirect | manual | n/a — open URL in browser without sessionStorage set | n/a |
| BUG-04 | No favicon 404 in browser console on any page | manual | n/a — open DevTools Network tab, check for 404s | n/a |
| BUG-05 | localStorage quota exceeded shows visible message | manual | n/a — fill localStorage to quota, trigger save | n/a |
| BUG-06 | voices.html loads without crash in non-speechSynthesis browser | manual | n/a — test in unsupported browser or with speechSynthesis stubbed out | n/a |

**Note:** Automated testing is explicitly out of scope per REQUIREMENTS.md ("Automated testing suite — Out of scope for quality pass"). Verification is manual browser testing.

### Sampling Rate
- **Per task commit:** Manual spot-check the specific fix in browser
- **Per wave merge:** Full manual check of all 6 bug fixes
- **Phase gate:** All 6 requirements verified manually before `/gsd:verify-work`

### Wave 0 Gaps
None — no test infrastructure needed for this phase (testing is explicitly out of scope).

---

## Sources

### Primary (HIGH confidence)
- Direct read of `tap-to-vocab/assets/js/tapvocab.js` — full file, all bug locations confirmed by line number
- Direct read of `tap-to-vocab/assets/js/coins.js` — spendCoins implementation confirmed
- Direct read of `tap-to-vocab/assets/js/shared-utils.js` — SharedUtils exports confirmed
- Direct read of `tap-to-vocab/assets/js/sentences.js` — localStorage catch block confirmed
- Direct read of `tap-to-vocab/games.html`, `games/coin-dash.html` — sessionStorage guard confirmed
- Direct read of `.planning/codebase/CONCERNS.md` (705 lines) — all audit findings cross-referenced
- Direct read of `.planning/phases/01-audit/01-01-SUMMARY.md`, `01-02-SUMMARY.md`, `01-03-SUMMARY.md` — phase 1 decisions and key findings
- Direct read of `.planning/phases/01-audit/01-VERIFICATION.md` — 4/4 must-haves verified

### Secondary (MEDIUM confidence)
- MDN Web Docs knowledge (training data): `speechSynthesis.getVoices()` synchronous-first + `voiceschanged` pattern is the documented cross-browser approach; iOS timing behavior is a known ecosystem issue
- SVG data-URI favicon: documented browser support in MDN; confirmed works on Safari 12+

### Tertiary (LOW confidence)
- `speechSynthesis.onvoiceschanged` iOS timing: confirmed as a known issue via training data; would benefit from live device testing to confirm exact fix behavior

---

## Metadata

**Confidence breakdown:**
- BUG-01 fix: HIGH — exact code read, fix is a one-line addition to a confirmed code path
- BUG-02 fix: MEDIUM — pattern is correct per MDN spec but iOS-specific timing requires device validation
- BUG-03 fix: HIGH — sessionStorage guard code read, in-page message pattern is straightforward
- BUG-04 fix: HIGH — SVG data-URI favicon is well-established; all 11 head blocks confirmed missing the link
- BUG-05 fix: HIGH — catch blocks read, `#error` element pattern confirmed from existing code
- BUG-06 scope: MEDIUM — voices.html crash guard is a clear 1-line fix; scope boundary for other items needs planner decision

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable vanilla JS domain — 30-day window appropriate)
