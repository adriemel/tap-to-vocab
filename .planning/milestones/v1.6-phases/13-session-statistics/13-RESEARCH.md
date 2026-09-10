# Phase 13: Session Statistics - Research

**Researched:** 2026-04-12
**Domain:** Vanilla JS IIFE module pattern — per-session stat tracking, modal overlay, answer-hook instrumentation
**Confidence:** HIGH

## Summary

Phase 13 adds a live stats board (correct / incorrect / accuracy %) to four game modes: Build Sentences (`sentences.js`), Verb Conjugation (`conjugation.js`), Fill-in-Blank (`fill-blank.js`), and Locations (`locations.js`). Stats are per-session only — no localStorage persistence — and must appear both on demand (Stats button) and automatically at session end.

All four files are self-contained IIFEs that export a single namespace to `window`. Answer validation already exists at clearly identifiable branch points in each file. The codebase already has a reusable full-screen modal pattern (`sentence-manager-modal` / `quiz-modal`) and a set of CSS classes (`quiz-result`, `result-item`, `result-label`, `result-value`, `.quiz-modal`, `.quiz-modal-content`) that can be repurposed for the stats overlay with zero new CSS infrastructure.

The correct implementation strategy is a new `assets/js/stats.js` IIFE module (`window.SessionStats`) loaded before each game's JS. Each game calls `SessionStats.record(correct|incorrect)` at its existing answer-validation branch point, and `SessionStats.showPanel()` / `SessionStats.reset()` at session start / stats-button press / session end.

**Primary recommendation:** Create a standalone `stats.js` IIFE module following the `coins.js` pattern. Wire it into the four game JS files at their answer hooks. Add a "Stats" button to each game's HTML controls bar. Reuse existing `quiz-modal` CSS classes for the stats overlay; add one small `<div id="stats-modal">` block to each HTML page.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STATS-01 | Correct/incorrect counts and accuracy % tracked live in Build Sentences, Verbs, Fill-in-Blank, and Locations | `SessionStats.record()` called at answer-validation branches already identified in all 4 files |
| STATS-02 | "Statistics" button visible during session, opens stats board without losing state | Button added to `.controls` bar; opens overlay via `SessionStats.showPanel()` — no game state touched |
| STATS-03 | Stats board auto-displays at session end (all exercises done) showing final counts | Called from completion branch in each game (identified below) |
| STATS-04 | Session stats reset at start of each new round — no persistence | `SessionStats.reset()` called at game init / replay; module uses only in-memory counters |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- Zero-dependency static site — NO npm, NO build step, NO frameworks, NO CDN
- IIFE pattern for all JS modules, export to `window`
- Script load order: `coins.js` → `shared-utils.js` → `[game js]`; `stats.js` must follow this pattern
- Dark theme with CSS custom properties in `:root` of `styles.css`; use `var(--ok)`, `var(--warn)`, `var(--error)`, `var(--muted)`, `var(--ink)`, `var(--card)`
- Mobile-first responsive design using `clamp()` for font sizes
- `cache: "no-store"` on all TSV fetches (not applicable here)
- All asset paths absolute from root (`/assets/js/stats.js`)
- No external CDN or library dependencies

---

## Standard Stack

### Core
| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Vanilla JS IIFE | ES5/ES6 | Module encapsulation | Established project pattern — all 9 existing JS files use it |
| CSS custom properties | N/A | Theming | All game pages import `styles.css`; `var(--ok)` etc. already defined |
| HTML modal overlay | N/A | Stats panel UI | `sentence-manager-modal` and `quiz-modal` patterns already in project |

### No New Dependencies
This phase requires no new libraries. [VERIFIED: codebase inspection]

**Installation:** None required.

---

## Architecture Patterns

### Recommended Module Structure

```
assets/js/stats.js        ← new: window.SessionStats IIFE
assets/css/styles.css     ← add ~15 lines: stats-modal CSS (reusing quiz-modal classes)
sentences.html            ← add: stats button + stats modal div + script tag
conjugation.html          ← add: stats button + stats modal div + script tag
fill-blank.html           ← add: stats button + stats modal div + script tag
locations.html            ← add: stats button + stats modal div + script tag
assets/js/sentences.js    ← wire: SessionStats.record() + reset() + showPanel()
assets/js/conjugation.js  ← wire: SessionStats.record() + reset() + showPanel()
assets/js/fill-blank.js   ← wire: SessionStats.record() + reset() + showPanel()
assets/js/locations.js    ← wire: SessionStats.record() + reset() + showPanel()
```

### Pattern 1: stats.js IIFE Module (window.SessionStats)

**What:** A standalone IIFE that owns all counter state and renders the overlay. Game JS files call into it.
**When to use:** Always — this is the only correct architecture for this project's module pattern.

```javascript
// Source: modeled on coins.js pattern [VERIFIED: codebase inspection]
(function () {
  var correct = 0;
  var incorrect = 0;

  function reset() {
    correct = 0;
    incorrect = 0;
    _updateLiveDisplay();
  }

  function record(isCorrect) {
    if (isCorrect) correct++; else incorrect++;
    _updateLiveDisplay();
  }

  function _updateLiveDisplay() {
    // Optional: update a live badge if one exists on the page
    // (kept minimal — full display only in panel)
  }

  function getAccuracy() {
    var total = correct + incorrect;
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  }

  function showPanel(opts) {
    // opts: { onClose: fn, onReplay: fn } — both optional
    var modal = document.getElementById('stats-modal');
    if (!modal) return;
    // populate values
    modal.querySelector('#stats-correct').textContent = correct;
    modal.querySelector('#stats-incorrect').textContent = incorrect;
    modal.querySelector('#stats-accuracy').textContent = getAccuracy() + '%';
    modal.style.display = 'flex';
  }

  function hidePanel() {
    var modal = document.getElementById('stats-modal');
    if (modal) modal.style.display = 'none';
  }

  window.SessionStats = { reset: reset, record: record, showPanel: showPanel, hidePanel: hidePanel, getAccuracy: getAccuracy };
})();
```

### Pattern 2: Answer Hook Locations Per Game

**What:** The exact lines in each game file where `SessionStats.record()` must be inserted.
**When to use:** All four game files.

#### sentences.js — `initSentenceBuilder()`

- **Correct answer hook** (line 228-238): Inside `if (builtSentence === sentence.es)` block, after `showSuccessAnimation()`. Add: `if (window.SessionStats) SessionStats.record(true);`
- **Wrong answer hook** (line 178-190): Inside `if (word !== correctNextWord)` block, after `playErrorSound()`. Add: `if (window.SessionStats) SessionStats.record(false);`
- **Session end** (line 145-151): Inside `if (currentIndex >= sentences.length)` block. Add: `if (window.SessionStats) SessionStats.showPanel();`
- **Reset on init** (line 121, top of `initSentenceBuilder`): Add `if (window.SessionStats) SessionStats.reset();`

Note: Wrong-answer in sentences.js fires on every wrong tap — this is correct behavior for accurate tracking. Each misplaced word = one incorrect attempt.

#### conjugation.js — `initConjugationGame()`

- **Correct answer hook** (line 183, `filledCount++` after correct form): After `slots[filledCount].classList.add("filled")`. Add: `if (window.SessionStats) SessionStats.record(true);`
- **Wrong answer hook** (line 177-180, `SharedUtils.playErrorSound()` block): Add: `if (window.SessionStats) SessionStats.record(false);`
- **Session end** (line 121-128): Inside `if (currentIndex >= verbs.length)` block. Add: `if (window.SessionStats) SessionStats.showPanel();`
- **Reset on init** (top of `initConjugationGame`): Add `if (window.SessionStats) SessionStats.reset();`

Note: Conjugation tracks each individual pronoun form as a correct/incorrect, not the whole verb at once.

#### fill-blank.js — `initGame()`

- **Correct answer hook** (line 70-89): Inside `if (choice === sentence.correct_answer)` block. Add: `if (window.SessionStats) SessionStats.record(true);`
- **Wrong answer hook** (line 90-94): Inside `else` block (wrong choice). Add: `if (window.SessionStats) SessionStats.record(false);`
- **Session end** (line 29-36): Inside `if (currentIndex >= sentences.length)` block. Add: `if (window.SessionStats) SessionStats.showPanel();`
- **Reset on init** (top of `initGame`): Add `if (window.SessionStats) SessionStats.reset();`

Note: fill-blank.js wrong choices disable the button but allow re-try with remaining choices. Each wrong tap = one incorrect record. This matches standard quiz semantics.

#### locations.js — `checkDrop()` and `startGame()`

- **Correct answer hook** (line 160-164, `zoneName === ex.zone` branch): After `SharedUtils.playSuccessSound()`. Add: `if (window.SessionStats) SessionStats.record(true);`
- **Wrong answer hook** (line 168-172, `else` branch): After `SharedUtils.playErrorSound()`. Add: `if (window.SessionStats) SessionStats.record(false);`
- **Session end** (line 189-200, `showCompletion()` function): At top of `showCompletion()`. Add: `if (window.SessionStats) SessionStats.showPanel();`
- **Reset on start** (line 128-145, `startGame()`): After `currentIndex = 0`. Add: `if (window.SessionStats) SessionStats.reset();`

### Pattern 3: Stats Modal HTML Block (identical structure across all 4 pages)

**What:** The stats overlay DOM; added once per HTML page before closing `</body>`.
**Reuses:** `quiz-modal` / `quiz-modal-content` CSS classes already in `styles.css`.

```html
<!-- Stats Modal — shared structure across all game pages -->
<div class="quiz-modal" id="stats-modal" style="display:none;">
  <div class="quiz-modal-content">
    <div class="quiz-modal-header">
      <h2>Session Stats</h2>
    </div>
    <div class="quiz-modal-body">
      <div class="quiz-result">
        <div class="result-item">
          <span class="result-label">Correct</span>
          <span class="result-value correct-color" id="stats-correct">0</span>
        </div>
        <div class="result-item">
          <span class="result-label">Incorrect</span>
          <span class="result-value warn-color" id="stats-incorrect">0</span>
        </div>
        <div class="result-item">
          <span class="result-label">Accuracy</span>
          <span class="result-value" id="stats-accuracy">0%</span>
        </div>
      </div>
    </div>
    <div class="quiz-modal-actions">
      <button class="btn secondary" id="btn-stats-close">Close</button>
    </div>
  </div>
</div>
```

Note: The close button wires to `SessionStats.hidePanel()` in the game JS (not in stats.js itself), consistent with how sentence-manager modal's close button is wired in sentences.js.

### Pattern 4: Stats Button in Controls Bar

**What:** A "Stats" button added to each page's `.controls` div.
**When to use:** All four game HTML files.

```html
<button class="btn secondary" id="btn-stats">Stats</button>
```

Wired in each game JS:
```javascript
var btnStats = document.getElementById('btn-stats');
if (btnStats) btnStats.onclick = function () {
  if (window.SessionStats) SessionStats.showPanel();
};
var btnStatsClose = document.getElementById('btn-stats-close');
if (btnStatsClose) btnStatsClose.onclick = function () {
  if (window.SessionStats) SessionStats.hidePanel();
};
```

### Pattern 5: Script Load Order

```html
<script src="/assets/js/coins.js"></script>
<script src="/assets/js/shared-utils.js"></script>
<script src="/assets/js/stats.js"></script>      <!-- NEW: after shared-utils, before game js -->
<script src="/assets/js/[game].js"></script>
<script>[Game].init();</script>
```

### Anti-Patterns to Avoid

- **Adding stats logic inline per game file without a shared module:** Creates 4x code duplication and diverging behaviour. Use `stats.js`.
- **Using localStorage for session stats:** STATS-04 explicitly forbids persistence. Use in-memory module variables only.
- **Creating new CSS for the stats overlay from scratch:** `quiz-modal`, `quiz-modal-content`, `quiz-result`, `result-item`, `result-label`, `result-value`, `correct-color`, `warn-color` are all defined and styled in `styles.css` already. Use them verbatim.
- **Tracking stats at the "verb complete" level in conjugation:** The conjugation game validates each of 6 pronoun forms individually. Track each form separately so accuracy reflects actual attempt rate.
- **Blocking the session-end completion state behind the stats panel close:** The games render their completion message inline (e.g., "All sentences completed!") before stats auto-show. Stats should overlay on top, not replace the completion state, so closing stats reveals the already-rendered completion message.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Full-screen overlay | Custom CSS from scratch | `quiz-modal` + `quiz-modal-content` classes already in styles.css | Already handles z-index 1000, backdrop-filter, animation, centering |
| Stat number display tiles | Custom div layout | `quiz-result` + `result-item` + `result-label` + `result-value` + `correct-color` + `warn-color` classes | Already styled consistently with the rest of the app |
| Module encapsulation | Singleton object or global vars | IIFE pattern (same as all other JS files) | Project convention; prevents global namespace pollution |

---

## Common Pitfalls

### Pitfall 1: stats-modal close button wired in stats.js instead of game JS

**What goes wrong:** If `stats.js` tries to wire `#btn-stats-close` in its own code, it runs before the DOM is ready (IIFE runs synchronously at script evaluation time). Or it only works for the first game that loads stats.js.
**Why it happens:** Centralisation instinct — putting close logic in the module that owns the panel.
**How to avoid:** Wire `#btn-stats-close` click handler inside each game's init function (after DOM ready), same pattern as sentence-manager's close button in `sentences.js`.
**Warning signs:** `Cannot read properties of null` on `btn-stats-close` at script load time.

### Pitfall 2: SessionStats.reset() not called when verb manager saves new selection

**What goes wrong:** User opens verb manager, changes selection, saves — game re-inits with new verbs but stats still show counts from the previous round.
**Why it happens:** `initConjugationGame()` is called again with new verbs but reset() is at the top of that function — actually this is fine IF reset() is at the top of initConjugationGame. The pitfall is forgetting this.
**How to avoid:** Place `SessionStats.reset()` as the very first line inside `initConjugationGame()`, `initSentenceBuilder()`, `initGame()`, and `startGame()` — not in the outer `init()` wrapper. This ensures re-init via manager save also resets stats.
**Warning signs:** Stats carry over after changing sentence/verb selection.

### Pitfall 3: Double-firing stats at session end in conjugation

**What goes wrong:** `loadVerb()` calls `showCompletion()` equivalent at `currentIndex >= verbs.length`, but `initConjugationGame()` is called fresh when switching between Practice/Show tabs. Stats panel auto-fires on every re-init.
**Why it happens:** The completion check is at the top of `loadVerb()`, which is called immediately on init.
**How to avoid:** The completion block fires only when `currentIndex >= verbs.length`. Since `reset()` sets counts back to 0 and `currentIndex` restarts at 0, this cannot fire spuriously on first load. No special guard needed. But verify: `loadVerb()` is called once at the end of `initConjugationGame()` and `currentIndex` starts at 0, so `0 >= verbs.length` is only true if verbs is empty — handled by the empty-verbs guard above it.

### Pitfall 4: Stats button present but nonfunctional when stats.js not loaded

**What goes wrong:** If a page has `#btn-stats` in HTML but `stats.js` is not in the script tag list, the button does nothing silently.
**Why it happens:** Missing script tag.
**How to avoid:** All four HTML pages must add the stats.js `<script>` tag. Use `if (window.SessionStats)` guards in game JS as a safety net, but don't rely on them — the script tag is mandatory.
**Warning signs:** Button click does nothing; `window.SessionStats` is undefined in console.

### Pitfall 5: Locations session-end stats auto-show replaces prompt-card innerHTML

**What goes wrong:** `showCompletion()` in `locations.js` overwrites `#prompt-card` innerHTML. If stats panel is shown before or after this, the timing matters.
**Why it happens:** locations.js `showCompletion()` is the only game that uses innerHTML replacement for its completion state (sentences/fill-blank/conjugation all have dedicated display elements).
**How to avoid:** Call `SessionStats.showPanel()` at the TOP of `showCompletion()`, before the innerHTML replacement. The stats overlay sits above the page, so the completion message renders behind it — closing stats reveals the completion state.

---

## Code Examples

### Verified: modal show/hide pattern from sentences.js

```javascript
// Source: sentences.js openSentenceManager() [VERIFIED: codebase inspection]
modal.style.display = "flex";   // show
modal.style.display = "none";   // hide
```

### Verified: CoinTracker guard pattern (safe optional call)

```javascript
// Source: sentences.js line 231 [VERIFIED: codebase inspection]
if (window.CoinTracker) CoinTracker.addCoin();
// Use same pattern for SessionStats:
if (window.SessionStats) SessionStats.record(true);
```

### Verified: existing CSS classes available for stats display

```javascript
// Source: styles.css lines 156-245 [VERIFIED: codebase inspection]
// quiz-modal        — full-screen overlay with backdrop-filter, z-index 1000
// quiz-modal-content — centered card 440px max-width, dark bg, shadow
// quiz-result        — flex row, gap 16px, wrapping
// result-item        — individual stat tile, dark bg, rounded, padding
// result-label       — small muted uppercase label
// result-value       — large bold value (2rem, 800 weight)
// correct-color      — applies var(--ok) green
// warn-color         — applies var(--warn) orange
```

### Verified: IIFE + window export pattern (coins.js model)

```javascript
// Source: coins.js [VERIFIED: codebase inspection]
(function () {
  // private state
  var correct = 0;
  // public API
  window.SessionStats = { reset: reset, record: record, showPanel: showPanel, hidePanel: hidePanel };
})();
```

---

## Validation Architecture

nyquist_validation is enabled (config.json key present and true).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — zero-dependency static site, no test runner |
| Config file | none |
| Quick run command | Manual browser smoke test (open page, answer questions, check overlay) |
| Full suite command | Manual smoke across all 4 pages |

This project has no automated test infrastructure and CLAUDE.md confirms "There is no build, lint, or test command." [VERIFIED: CLAUDE.md]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Notes |
|--------|----------|-----------|-------------------|-------|
| STATS-01 | Counts update on correct/wrong answer | manual smoke | n/a | Open each game, answer right and wrong, verify counter values in panel |
| STATS-02 | Stats button opens panel during play | manual smoke | n/a | Click Stats button mid-session, verify panel opens, close, verify game continues |
| STATS-03 | Panel auto-opens at session end | manual smoke | n/a | Complete all exercises, verify panel auto-shows with final counts |
| STATS-04 | Counts reset on new round | manual smoke | n/a | Complete session, note counts, reload/restart, verify panel shows 0/0/0% |

### Wave 0 Gaps

None — no test framework infrastructure needed. Verification is manual smoke testing per the project's established convention.

---

## Environment Availability

Step 2.6: SKIPPED (no external tool dependencies — pure HTML/CSS/JS file edits)

---

## Security Domain

This phase makes no network requests, handles no user authentication, stores nothing in localStorage or sessionStorage, and processes no external input. The stats counters are incremented by game logic only. No ASVS categories apply.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `quiz-modal` CSS classes are available on all 4 target pages because all 4 load `/assets/css/styles.css` | Standard Stack / Code Examples | If a page uses a different stylesheet, stats overlay will be unstyled — verify each HTML `<link>` tag |
| A2 | Stats reset on `initSentenceBuilder()` entry covers the "Save & Close" manager flow because manager's `onSave` callback calls `initSentenceBuilder(activeSentences)` | Architecture Patterns Pitfall 2 | Verify manager callback path in sentences.js — confirmed at line 321: `initSentenceBuilder(activeSentences)` |

A2 is marked ASSUMED only for caution — it was confirmed by direct code inspection (sentences.js line 318-322). Risk is LOW.

---

## Open Questions (RESOLVED)

1. **Should incorrect taps in sentences.js each count as a separate incorrect, or should only the first wrong tap per slot count?**
   - What we know: Current code fires `playErrorSound()` on every wrong tap. STATS-01 says "incorrect counts" without specifying granularity.
   - What's unclear: Whether a user tapping 3 wrong words before getting it right should show 3 incorrect or 1 incorrect for that position.
   - Recommendation: Count each wrong tap as one incorrect (simplest, most consistent with fill-blank behaviour). Accuracy below 100% meaningfully signals difficulty.
   - RESOLVED: Count each wrong tap separately. Each `playErrorSound()` call maps to one `SessionStats.record(false)` call. This is consistent with fill-blank.js behaviour and gives more meaningful accuracy feedback.

2. **Does the Locations game need a "Stats" button in its controls bar given its layout?**
   - What we know: locations.html controls bar has 3 buttons (Back, Skip, Home). STATS-02 says each mode needs a Stats button.
   - What's unclear: Whether the cramped controls row (small scene card) can accommodate a 4th button.
   - Recommendation: Add the Stats button to the controls row. The row uses `flex-wrap:wrap` so it will overflow to a second line on very small screens, which is acceptable.
   - RESOLVED: Add 4th Stats button to locations.html controls row. `flex-wrap: wrap` on the `.controls` CSS handles narrow screens gracefully — second row is acceptable.

---

## Sources

### Primary (HIGH confidence)
- `sentences.js` [VERIFIED: direct codebase inspection] — answer hooks at lines 178, 228; session end at 145; modal at 49-118
- `conjugation.js` [VERIFIED: direct codebase inspection] — answer hooks at lines 176, 183; session end at 122
- `fill-blank.js` [VERIFIED: direct codebase inspection] — answer hooks at lines 70, 91; session end at 30
- `locations.js` [VERIFIED: direct codebase inspection] — answer hooks at lines 160, 168; session end `showCompletion()` at 189
- `assets/css/styles.css` [VERIFIED: direct codebase inspection] — `quiz-modal*` classes at lines 156-245; `sentence-manager-modal` at 849-926
- `assets/js/coins.js` [VERIFIED: direct codebase inspection] — IIFE + `window.CoinTracker` export pattern
- `CLAUDE.md` [VERIFIED: direct read] — zero-dependency constraint, IIFE pattern, script load order, path conventions
- `.planning/REQUIREMENTS.md` [VERIFIED: direct read] — STATS-01 through STATS-04 definitions
- `.planning/config.json` [VERIFIED: direct read] — `nyquist_validation: true`

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — fully verified by codebase inspection; no external libraries needed
- Architecture: HIGH — all patterns verified against existing code; no assumptions about unknown APIs
- Pitfalls: HIGH — all identified from direct code reading of edge cases in each game's flow
- Answer hook locations: HIGH — exact line numbers confirmed by reading source

**Research date:** 2026-04-12
**Valid until:** Stable — this is a static codebase; no framework upgrades will invalidate findings
