---
phase: 22-qu-hora-es-time-telling-practice-tool
reviewed: 2026-08-02T15:45:47Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - assets/js/hora-phrase.js
  - hora-phrase.test.js
  - index.html
  - assets/css/styles.css
  - hora.html
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 22: Code Review Report

**Reviewed:** 2026-08-02T15:45:47Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Reviewed the "Qué hora es?" time-telling tool: the grammar engine (`assets/js/hora-phrase.js`), its Node test (`hora-phrase.test.js`), the new standalone page (`hora.html`), and the additive changes to `index.html` / `assets/css/styles.css`.

`buildTimePhrase()` was traced by hand against all 12 exact-output cases plus the boundary logic (`isPast`, the `menos` hour-wrap, `Es la` vs `Son las`, and the mañana/tarde/noche cutoffs) and is correct — `node hora-phrase.test.js` passes (12 exact cases + 288 invariant states). No injection, XSS, or secret-handling issues were found; `phraseEl.textContent` is used (not `innerHTML`), and TTS input is a value derived from a closed value table, not user text. `index.html` / `styles.css` changes are purely additive and match the phase's UI-SPEC.

Issues found are concentrated in `hora.html`'s inline reel-drag script: a shared timer variable leaking state between the two independent reel instances, an ARIA `role="spinbutton"` widget that ships with no keyboard handling, and a pure-function (`buildTimePhrase`) that silently emits `"undefined"` fragments if ever called with an off-grid minute value instead of failing loudly. None of these rise to data-loss/security/crash severity, so no Critical findings.

## Warnings

### WR-01: Shared `settleTimer` variable leaks transition state between the two independent reels

**File:** `hora.html:91, 104, 141-144`
**Issue:** `settleTimer` is declared once in the outer IIFE scope (line 91) and is referenced by the closures created inside `attachReelDrag()` for *both* `hourReel` and `minuteReel` (line 150-151 call it twice). If the user releases a drag on one reel and then starts dragging the other reel within the 260ms settle window, `onPointerDown` (line 104) clears the *other* reel's pending `setTimeout`, so that reel's `trackEl.style.transition` is left permanently set to `'transform 250ms cubic-bezier(0.4, 0.2, 0.2, 1)'` instead of being reset to `''`. This is a real reachable interleaving (dragging hour then minute in quick succession is normal usage for this widget) and is a genuine bug in the state-cleanup logic, even though today's code happens to always overwrite `transition` with `'none'` on the next drag of that same reel, so it isn't currently visible to users. It will bite the next person who adds any transform change outside of a drag session (e.g. a "randomize" or "reset to now" button).
**Fix:** Give each reel its own settle timer instead of sharing one module-level variable:
```js
function attachReelDrag(reel) {
  var settleTimer = null; // per-reel, not shared
  ...
  function onPointerDown(e) {
    ...
    if (settleTimer) { clearTimeout(settleTimer); settleTimer = null; }
    ...
  }
  function onPointerUp(e) {
    ...
    settleTimer = setTimeout(function () {
      reel.trackEl.style.transition = '';
      settleTimer = null;
    }, 260);
  }
  ...
}
```

### WR-02: `role="spinbutton"` widgets have no keyboard support

**File:** `hora.html:19, 23`
**Issue:** Both reel elements declare `role="spinbutton"`, `tabindex="0"`, and `aria-valuemin`/`aria-valuemax`/`aria-valuenow`. Per the WAI-ARIA Authoring Practices, a `spinbutton` is expected to respond to `ArrowUp`/`ArrowDown` (and typically `PageUp`/`PageDown`, `Home`/`End`) to change its value. No `keydown` listener is attached anywhere in the script — the only way to change a reel's value is pointer drag. A keyboard or switch-device user who tabs to the element will be told (via the ARIA role) that arrow keys work, and nothing will happen. This is worse than omitting the role entirely, since it actively mismatches assistive-tech expectations. (Contrast with `quien-soy.html`, which uses `aria-live` regions for its dynamic content — this is a new pattern in the codebase and ships incomplete.)
**Fix:** Add a keydown handler per reel that mirrors the drag step logic, e.g.:
```js
reel.el.addEventListener('keydown', function (e) {
  var delta = 0;
  if (e.key === 'ArrowUp') delta = 1;
  else if (e.key === 'ArrowDown') delta = -1;
  else return;
  e.preventDefault();
  reel.index = mod(reel.index - delta, reel.values.length);
  renderReel(reel);
});
```
At minimum, drop `role="spinbutton"`/`tabindex`/`aria-value*` until keyboard support exists, so assistive tech doesn't advertise a broken affordance.

### WR-03: `buildTimePhrase` has no input validation and silently emits `"undefined"` for off-grid minutes

**File:** `assets/js/hora-phrase.js:55-82`
**Issue:** `MINUTE_WORDS` is keyed only by the 12 canonical 5-minute-step values. `buildTimePhrase(hour24, minute)` is documented as a pure function taking "integer, one of 0,5,10,...,55" but never validates that constraint. If `minute` is anything else (e.g. a future caller passes a raw slider value, or a drag-math bug elsewhere produces an off-grid index), `MINUTE_WORDS[minute]` returns `undefined`, and the function returns a string containing the literal substring `"undefined"` (e.g. `"Son las tres y undefined de la tarde"`) instead of throwing or returning an error indicator. This would also get spoken aloud via TTS. Today's UI only ever supplies grid-aligned values, so this isn't currently triggered, but it's a silent-failure mode in a function explicitly designed to be reused/tested independently of the UI.
**Fix:** Fail loudly on invalid input:
```js
function buildTimePhrase(hour24, minute) {
  if (!(hour24 in HOUR24_RANGE) /* or Number.isInteger + 0<=hour24<=23 */) {
    throw new RangeError('hour24 must be an integer 0-23');
  }
  if (!(minute in MINUTE_WORDS)) {
    throw new RangeError('minute must be one of 0,5,...,55');
  }
  ...
}
```

## Info

### IN-01: `MINUTE_WORDS[0]` entry is unreachable dead data

**File:** `assets/js/hora-phrase.js:15`
**Issue:** The `0: ''` entry in `MINUTE_WORDS` is never read — `minute === 0` is special-cased on line 69 (`minuteSuffix = ' en punto'`) before `MINUTE_WORDS` is ever indexed for that value. Unlike `HOUR_WORDS[0]`, which has an explicit comment explaining it's an intentional unused filler, this entry has no such comment and reads as though it's meant to be used.
**Fix:** Either remove the `0: ''` entry, or add a one-line comment noting it's unused/kept for table completeness, matching the `HOUR_WORDS` convention above it.

### IN-02: No `aria-live` region for the dynamically-updated phrase output

**File:** `hora.html:31, 210-214`
**Issue:** `#hora-phrase`'s text is replaced on every CTA click (`phraseEl.textContent = lastPhrase`), but the element has no `aria-live` attribute, so screen-reader users won't be notified when the phrase updates unless they happen to have focus on/near it. The sibling `quien-soy.html` page in this same codebase uses `aria-live="polite"` for its analogous dynamic chat content, so this is a regression relative to the app's own established pattern for this kind of update.
**Fix:**
```html
<p class="hora-phrase is-placeholder" id="hora-phrase" aria-live="polite">Ajusta la hora y pulsa "Qué hora es?"</p>
```

---

_Reviewed: 2026-08-02T15:45:47Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
