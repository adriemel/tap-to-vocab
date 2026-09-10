# Phase 20: Quién Soy Yo — Bugfixes and Polish - Research

**Researched:** 2026-05-09
**Domain:** Vanilla JS chat simulator — Web Speech API timing, CSS fixed-layout overlap, mobile safe-area
**Confidence:** HIGH

---

## Summary

Phase 20 is a targeted bugfix-and-polish pass on the `quien-soy.html` chat simulator built in Phase 19. There are five known problem areas (TTS on first question, missing skip button, scroll/bubble overlap on mobile, end-screen button layout, and sentence data). Code inspection of `quien-soy.html` and `assets/css/styles.css` has identified the exact root cause of each bug, pinpointed the precise lines responsible, and established the minimal effective fix for each one. No architectural changes are needed — every fix is a small, contained edit.

A sixth bug was discovered during this research: a typo in the data file (`tambien` instead of `también`) that the TTS reads without the correct accent, degrading audio quality.

The zero-dependency, inline-IIFE, vanilla HTML/CSS/JS constraints from CLAUDE.md apply fully. No new libraries, no build step, no external CDN. All fixes stay within the existing `quien-soy.html` IIFE and the `qs-*` CSS block in `styles.css`.

**Primary recommendation:** Apply five isolated code fixes plus one data fix; treat them as independent tasks that can land in separate commits.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| TTS timing / voice loading | Browser/Client | — | Web Speech API is client-only; fix lives in the IIFE |
| Skip button UI + behavior | Browser/Client | — | DOM element in HTML + event handler in IIFE |
| Scroll/overlap layout | CDN/Static | — | CSS `padding-bottom` + `env(safe-area-inset-bottom)` fix |
| End-screen button layout | CDN/Static | — | CSS `flex-direction` / `font-size` adjustment |
| Sentence data content | CDN/Static | — | TSV row additions to `/data/quien-soy-sentences.txt` |

---

## Project Constraints (from CLAUDE.md)

- **Zero-dependency static site** — no npm, no build, no frameworks. Every fix is vanilla HTML/CSS/JS.
- **No external CDN or library dependencies** — all solutions self-contained.
- **Script load order** — `coins.js` first, then `shared-utils.js`, then inline IIFE. Do not change this order.
- **IIFE pattern** — page logic stays inside the existing `(function () { ... })()` block.
- **Dark theme** — use existing CSS custom properties from `:root`; no new color values.
- **CSS class prefix** — new or modified classes stay in the `qs-*` namespace.
- **TSV encoding** — data file is UTF-8; use tab-separated columns matching existing header.

---

## Bug Analysis

### Bug 1: TTS Does Not Fire on First Question (Intermittent)

**File:** `quien-soy.html` lines 66–73 (voice init) and line 256 (first `showQuestion(0)` call)

**Root cause — two independent issues:**

**Issue 1a: Race condition between `voiceschanged` and fetch resolution.**
On page load, `speechSynthesis.getVoices()` returns `[]` synchronously on Chrome/Android (voices load asynchronously via the `voiceschanged` event). The `SharedUtils.loadTSV()` fetch starts immediately. If the fetch resolves (especially from a service-worker cache or fast local server) *before* `voiceschanged` fires, `showQuestion(0)` calls `speakSpanish(q.question)` at a moment when `_cachedSpanishVoice` is still `null`. Inside `speakSpanish`, there is a 100ms `setTimeout` before `speak()` — this defers voice lookup but 100ms may still not be enough on slow/cold voice loads.

Result: `u.voice = null` but `u.lang = "es-ES"` is set. On most desktop browsers, TTS fires in a default (possibly non-Spanish) voice. On some Android browsers with no Spanish voice at all, TTS may be silent.

**Issue 1b: iOS Safari requires a user gesture before any audio.**
iOS Safari blocks all programmatic audio (including Web Speech API) until the user has interacted with the page. `showQuestion(0)` fires after `loadTSV` resolves — before any tap — so the first question's TTS is blocked entirely. Subsequent questions work because the user tap provides the required gesture.

**Exact code path:**
```
.then(function(rows) {         // fetch resolves
  ...
  showQuestion(0);             // line 256
})
  -> speakSpanish(q.question)  // line 146 — no user gesture yet on iOS
    -> speechSynthesis.cancel()
    -> setTimeout(100ms) -> speak(utterance)   // voices may not be loaded yet
```

**Minimal fix — address Issue 1a:**
Add a 200ms defer before the first `showQuestion(0)` call. This gives `voiceschanged` time to fire on Chrome/Android before TTS is attempted. It does not fix iOS (which requires a gesture), but iOS users will simply not hear question 1's audio — an acceptable degradation that matches browser policy.

```javascript
// In .then() callback, replace:
showQuestion(0);
// With:
setTimeout(function() { showQuestion(0); }, 200);
```

**Alternative (more robust):** Gate `showQuestion(0)` on voices being loaded:

```javascript
function startWhenReady() {
  if (_voicesLoaded || typeof speechSynthesis === 'undefined') {
    showQuestion(0);
  } else {
    setTimeout(startWhenReady, 50);
  }
}
startWhenReady();
```

[VERIFIED: quien-soy.html lines 52–73, 256; cross-referenced with numbers-quiz.html lines 27–51 which avoids this race because TTS there is user-gesture-triggered]

---

### Bug 2: No Skip Button

**File:** `quien-soy.html` — feature is entirely absent (confirmed via `grep -n "skip\|Skip"`).

**Root cause:** Not implemented in Phase 19. The Phase 19 plan and requirements (CHAT-01 through AUDIO-02) did not include a skip mechanic.

**Design decision required:** What does "skip" do to the final paragraph?

| Option | Behavior | Impact on Paragraph |
|--------|----------|---------------------|
| A — Silent skip | Advance without adding to `chosenAnswers[]` | Paragraph has fewer sentences; flow may read oddly |
| B — Placeholder | Push a static placeholder like `"..."` | Paragraph always has 14 parts; reads awkwardly |
| C — Cancel TTS, jump immediately | Cancel current TTS, call `advance()` directly | Cleanest UX; no answer bubble; no push to paragraph |

**Recommended implementation (Option C):** A small "⟫ Skip" button in the answer strip area, hidden when `isAnswering = true` (same guard as the choice buttons). Tapping it:
1. Calls `window.speechSynthesis.cancel()`
2. Sets `isAnswering = true`
3. Disables choice buttons
4. Does NOT call `appendBubble` and does NOT push to `chosenAnswers`
5. Calls `advance()` directly (or inlines its logic)

**HTML addition — inside `#qs-strip`:**
```html
<button type="button" class="qs-skip" id="qs-skip">⟫ Saltar</button>
```

**CSS addition — after `.qs-choice:disabled` rule:**
```css
.qs-skip {
  background: transparent;
  border: none;
  color: var(--muted);
  font-size: 0.75rem;
  padding: 4px 8px;
  cursor: pointer;
  align-self: center;
  flex-shrink: 0;
}
.qs-skip:hover { color: var(--ink); }
.qs-skip:disabled { opacity: 0.3; pointer-events: none; }
```

**JS addition — in IIFE, after `btn2.addEventListener`:**
```javascript
var skipBtn = document.getElementById('qs-skip');
skipBtn.addEventListener('click', function () {
  if (isAnswering) return;
  isAnswering = true;
  btn1.disabled = true;
  btn2.disabled = true;
  skipBtn.disabled = true;
  window.speechSynthesis.cancel();
  // Advance to next question (no bubble, no answer push)
  var advanced = false;
  function doAdvance() {
    if (advanced) return;
    advanced = true;
    setTimeout(function () {
      currentIndex++;
      if (currentIndex >= questions.length) {
        showEndScreen();
      } else {
        showQuestion(currentIndex);
      }
      isAnswering = false;
    }, 200); // shorter delay than full answer flow (no TTS to wait for)
  }
  doAdvance();
});
```

**Skip button must also be disabled/enabled** in `showQuestion()` alongside `btn1`/`btn2`:
```javascript
skipBtn.disabled = false;
```

And disabled in `onChoiceTap()` alongside `btn1`/`btn2`:
```javascript
skipBtn.disabled = true;
```

[VERIFIED: quien-soy.html — `grep -n "skip\|Skip"` returned no matches; absence confirmed]

---

### Bug 3: Scroll/Bubble Overlap on Mobile

**File:** `assets/css/styles.css` — `.qs-chat` (line 1389) and `.qs-answer-strip` (line 1397)

**Root cause — two compounding issues:**

**Issue 3a: Long button labels cause the strip to grow taller than the 88px chat padding-bottom.**
Data inspection of `quien-soy-sentences.txt` reveals that question 14 has choice labels `"divertido y 12 años"` and `"simpático y come demasiado"`. At 0.875rem (≈14px) font size on a 375px phone:
- Each `.qs-choice` button width ≈ (375 − 32px strip padding − 8px gap) / 2 = 167px
- Button inner width = 167 − 24px button padding = 143px
- `"simpático y come demasiado"` (26 chars × ≈7.5px/char = 195px) WRAPS to 2 lines

When button text wraps, strip height grows from ~70px to ~92px. The `.qs-chat` `padding-bottom: 88px` is now smaller than the strip, causing the last bubble to be hidden behind it.

**Issue 3b: No `env(safe-area-inset-bottom)` support.**
On iPhones with a home indicator (iPhone X and later), the bottom ≈34px of the screen is reserved. The `.qs-answer-strip` uses `padding-bottom: 12px` with no safe-area awareness. Without `viewport-fit=cover` in the viewport meta tag AND `env(safe-area-inset-bottom)` in the CSS, the buttons sit on top of the home indicator area on physical devices.

**Current state:**
- `quien-soy.html` viewport meta: `content="width=device-width,initial-scale=1"` — no `viewport-fit=cover`
- `assets/css/styles.css` `.qs-answer-strip`: `padding: 8px 16px 12px` — no safe-area env()

**Minimal fix:**
1. In `quien-soy.html`, update viewport meta to add `viewport-fit=cover`
2. In `styles.css`, update `.qs-answer-strip` padding-bottom and `.qs-chat` padding-bottom:

```html
<!-- quien-soy.html line 5 -->
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
```

```css
/* styles.css — .qs-answer-strip */
.qs-answer-strip {
  padding: 8px 16px calc(12px + env(safe-area-inset-bottom, 0px));
}

/* styles.css — .qs-chat */
.qs-chat {
  padding: 16px 16px calc(120px + env(safe-area-inset-bottom, 0px));
  /* 120px = generous buffer: 69px strip + 17px wrapping allowance + 34px safe-area headroom */
}
```

[VERIFIED: quien-soy.html lines 5, 1392, 1397–1408; data file inspection confirmed "simpático y come demasiado" wraps at 375px; no `env(safe-area-inset-bottom)` found in any CSS file]

---

### Bug 4: End-Screen Button Layout on Small Screens

**File:** `assets/css/styles.css` — `.qs-end-actions` (line 1517) and `.qs-end-actions .btn` (line 1524)

**Root cause:** Three buttons with `flex: 1; min-width: 120px; flex-wrap: wrap` — but the available inner width of the end card on a 375px phone is approximately 295px (375 − 32 from `.qs-end` padding − 48 from `.qs-end-card` padding). Three buttons × 120px minimum = 360px > 295px, so flex wraps, producing an asymmetric `2 + 1` layout (Replay + Empezar de nuevo on line 1, Inicio alone on line 2 expanded to full width).

On 320px screens the available width is ~240px, and even two 120px buttons don't fit, producing a full 3-row stack which looks fine but may feel too tall.

The three button labels:
- `↺ Replay` — short, fits in ~90px
- `Empezar de nuevo` — 15 chars, needs ~130px minimum
- `Inicio` — short, fits in ~80px

**Minimal fix — force column stack on small screens:**

```css
/* Add to styles.css after .qs-end-actions .btn rule */
@media (max-width: 480px) {
  .qs-end-actions {
    flex-direction: column;
  }
  .qs-end-actions .btn {
    flex: none;
    width: 100%;
  }
}
```

This makes all three buttons full-width at ≤480px, which is clean and consistent. On wider screens (tablets, desktop) the existing flex-row layout works fine.

**Alternative minimal fix — shorten button label:** Change `Empezar de nuevo` to `↺ De nuevo` to allow all three buttons to fit on one row even at 375px. However, the column-stack approach requires no HTML change and is more resilient to future label changes.

[VERIFIED: assets/css/styles.css lines 1517–1527; arithmetic verified against 375px and 320px viewport widths]

---

### Bug 5 (Discovered): Data Typo — `tambien` Missing Accent

**File:** `data/quien-soy-sentences.txt` line 14 (last data row)

**Issue:** `"Es muy divertido y tambien tiene doce años."` — `tambien` should be `también`. TTS reads it without the correct accent (`tam-BIEN` instead of `tam-BIÉN`), producing noticeably unnatural pronunciation.

**Fix:** One-character correction in the data file.

```
Before: Es muy divertido y tambien tiene doce años.
After:  Es muy divertido y también tiene doce años.
```

[VERIFIED: `grep "tambien" /home/desire/tap-to-vocab/data/quien-soy-sentences.txt` confirmed]

---

### Bug 6 (Known from STATE.md): Sentence Data Push

**File:** `data/quien-soy-sentences.txt`

**Current state:** 14 Q&A pairs covering: name, age, school, languages, hometown, neighborhood, household members, room description, parents' ages, siblings/cousins, pet, hobbies, best friend name, best friend description.

**What "data push" means:** Adding new Q&A rows to expand the self-introduction. The current 14 questions are sufficient for Phase 19's feature, but more content makes repeated play more varied and educationally richer.

**Potential additions** (content to be decided by user):
- `¿Cuál es tu comida favorita?` — favorite food
- `¿Cuál es tu asignatura favorita?` — favorite school subject
- `¿Cómo te describes físicamente?` — physical description
- `¿Qué te gusta hacer los fines de semana?` — weekend activities

**Data format constraint:** Every new row must have exactly 4 tab-separated fields with the same header column names. The choice label in field 2 (`Choices (1,2)`) must use `, ` (comma-space) as the separator between the two labels, and neither label should itself contain `, `.

**Warning — existing wrapping issue:** Adding choice labels longer than ~20 characters will trigger the wrapping bug identified in Bug 3. Fix Bug 3 (increase chat padding-bottom) before or alongside adding long-label rows.

[VERIFIED: data file inspected, column headers confirmed]

---

## Standard Stack

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JS (IIFE) | ES5/ES6 | Page logic | Project's established pattern — zero dependencies |
| Web Speech API | Browser built-in | TTS | Already used in `tapvocab.js`, `numbers-quiz.html` |
| CSS Custom Properties | Browser built-in | Theming | All colors from `--bg`, `--card`, `--accent`, etc. |
| `env(safe-area-inset-bottom)` | CSS browser built-in | Safe area padding | Standard iOS safe-area handling — no library needed |

[VERIFIED: codebase inspection]

---

## Architecture Patterns

### Fix Delivery Pattern

All six fixes are independent — each can land in its own commit. Recommended order based on blast radius:

```
Fix 5 (data typo)       → 1-line data edit, zero risk
Fix 1 (TTS delay)       → 1-line JS change in .then() block
Fix 2 (skip button)     → HTML + CSS + JS additions
Fix 3 (scroll overlap)  → viewport meta + CSS edits
Fix 4 (end-screen btns) → CSS media query addition
Fix 6 (data push)       → TSV row additions
```

### Pattern: Modifying the Inline IIFE

All JS changes happen inside the existing `(function () { ... })()` block in `quien-soy.html`. There is no external JS file for this page. Additions can be made:
- Before existing code (for new variable declarations or helpers)
- Inside existing functions (for behavior changes)
- After existing event listeners (for new event listeners)

Never restructure the IIFE or add a separate `<script>` block.

### Pattern: CSS Additions in `styles.css`

New CSS for Phase 20 belongs at the bottom of the `qs-*` block (after the `#qs-error` rule, currently ending at line 1537). If adding a media query, it follows the existing pattern of media queries for mobile overrides.

### Anti-Patterns to Avoid

- **Moving logic out of the IIFE** — phase fixes must stay inline.
- **Adding a quien-soy.js file** — the page was intentionally designed as a single file (Phase 19 decision).
- **Adding new color values** — use `var(--muted)`, `var(--ink)`, `var(--accent)` etc.
- **Using `viewport-fit=cover` globally** — only add it to `quien-soy.html` (it should not affect other pages that don't use `env(safe-area-inset-bottom)`).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Safe area insets | Custom JS to detect notch height | `env(safe-area-inset-bottom)` CSS function | Browser-native, zero JS, works across all notch/island iPhones |
| Voice loading detection | Manual `setTimeout` poll | Existing `_voicesLoaded` flag + `voiceschanged` listener | Already in the codebase; just gate `showQuestion(0)` on it |
| Button sizing heuristics | JS to measure text width | `flex-direction: column` at ≤480px | Pure CSS, no JS needed |

---

## Common Pitfalls

### Pitfall 1: `viewport-fit=cover` Affects All Pages That Share the Meta Tag

**What goes wrong:** The `viewport-fit=cover` meta tag is per-page — adding it to `quien-soy.html` only affects `quien-soy.html`. But if someone copies this change globally (e.g., into a shared `<head>` template), other pages that don't use `env(safe-area-inset-bottom)` may display content that bleeds under the home indicator.

**How to avoid:** Scope the viewport meta change only to `quien-soy.html`. Do not touch `index.html` or other page meta tags.

### Pitfall 2: Skip Button Must Respect `isAnswering` Guard

**What goes wrong:** If the skip button doesn't check `isAnswering`, a user can tap it during the 400ms+ TTS-to-next-question transition, causing a double-advance.

**How to avoid:** The skip button handler must start with `if (isAnswering) return;` — same guard as `onChoiceTap()`. It must also set `isAnswering = true` immediately and disable the choice buttons before doing anything else.

### Pitfall 3: Skip Without Pushing to `chosenAnswers` Changes Paragraph Length

**What goes wrong:** The end-screen paragraph is `chosenAnswers.join(' ') + ' ¡Muchas gracias...'`. If the user skips questions, `chosenAnswers.length` < 14 and the paragraph will be a shorter, potentially awkward sentence fragment.

**How to avoid:** This is an acceptable UX trade-off — the paragraph will be shorter but not broken. Alternatively, add a note to the end screen if questions were skipped. The simpler approach (no push, shorter paragraph) is recommended for this polish phase.

### Pitfall 4: `env(safe-area-inset-bottom)` Requires `viewport-fit=cover`

**What goes wrong:** Adding `env(safe-area-inset-bottom)` to CSS without also adding `viewport-fit=cover` to the viewport meta tag means the CSS variable always evaluates to `0` — the fix has no effect.

**How to avoid:** Both changes must land together: viewport meta AND CSS update. Put them in the same commit.

### Pitfall 5: Increasing `padding-bottom` Breaks Scroll Behavior Without `overflow-y: auto`

**What goes wrong:** If `.qs-chat` loses its `overflow-y: auto` style, the `padding-bottom` on `.qs-chat` won't create scrollable space — content will overflow the page.

**How to avoid:** `.qs-chat`'s `overflow-y: auto` must remain. Do not change the `flex: 1` either (needed to fill the column between header and fixed strip).

---

## Code Examples

### Fix 1: Defer First Question Start (Minimal 200ms Fix)

```javascript
// quien-soy.html — inside .then(function(rows) { ... }) callback
// Change line 256 from:
showQuestion(0);
// To:
setTimeout(function () { showQuestion(0); }, 200);
```

### Fix 1 Alternative: Gate on Voice Loading

```javascript
// quien-soy.html — replaces `showQuestion(0)` in the .then() callback
function startWhenReady() {
  if (_voicesLoaded || typeof speechSynthesis === 'undefined') {
    showQuestion(0);
  } else {
    setTimeout(startWhenReady, 50);
  }
}
startWhenReady();
```

### Fix 2: Skip Button JS Handler

```javascript
// quien-soy.html — add after btn2.addEventListener block
var skipBtn = document.getElementById('qs-skip');
skipBtn.addEventListener('click', function () {
  if (isAnswering) return;
  isAnswering = true;
  btn1.disabled = true;
  btn2.disabled = true;
  skipBtn.disabled = true;
  window.speechSynthesis.cancel();
  var done = false;
  function go() {
    if (done) return;
    done = true;
    setTimeout(function () {
      currentIndex++;
      if (currentIndex >= questions.length) {
        showEndScreen();
      } else {
        showQuestion(currentIndex);
      }
      isAnswering = false;
    }, 200);
  }
  go();
});
```

### Fix 3: Safe-Area CSS

```css
/* styles.css — update .qs-answer-strip padding */
.qs-answer-strip {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg);
  border-top: 1px solid #1e2d6b;
  padding: 8px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  display: flex;
  gap: 8px;
  z-index: 10;
}

/* styles.css — update .qs-chat padding-bottom */
.qs-chat {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px calc(120px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
}
```

### Fix 4: End-Screen Button Stack on Small Screens

```css
/* styles.css — add after .qs-end-actions .btn rule */
@media (max-width: 480px) {
  .qs-end-actions {
    flex-direction: column;
  }
  .qs-end-actions .btn {
    flex: none;
    width: 100%;
  }
}
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual browser verification (no automated test framework) |
| Config file | none |
| Quick run command | `python3 -m http.server 8000` then open `http://localhost:8000/quien-soy.html` |
| Full suite command | Same — full manual flow on desktop + mobile emulator |

### Phase Requirements → Test Map

| Fix | Behavior | Test Type | Verification Step |
|-----|----------|-----------|-------------------|
| Fix 1 (TTS) | Question 1 TTS fires on Chrome/Android | manual | Open page on Chrome Android (or DevTools mobile emulation) — hear Spanish audio on Q1 |
| Fix 1 (TTS) | Question 1 TTS gracefully absent on iOS | manual | Open page on iOS Safari — no error, buttons still appear |
| Fix 2 (skip) | Skip button appears in answer strip | manual | Verify "⟫ Saltar" button visible between choice buttons |
| Fix 2 (skip) | Tapping skip advances without bubble | manual | Tap skip — no answer bubble, next question appears |
| Fix 2 (skip) | Skip disabled during transition | manual | Tap choice then immediately skip — only one advance occurs |
| Fix 3 (scroll) | Last bubble visible above strip | manual | On 375px mobile (Q14 with long labels) — bubble fully visible |
| Fix 3 (scroll) | Safe area padding on iPhone | manual | On iPhone (or emulate via DevTools safe area) — buttons not behind home indicator |
| Fix 4 (end) | End buttons stack on 375px | manual | Open end screen at 375px DevTools — 3 full-width buttons stacked |
| Fix 5 (typo) | TTS says "también" correctly | manual | Reach Q14 and tap "divertido y 12 años" answer — hear accent on "también" |
| Fix 6 (data) | New questions load and display | manual | New rows appear in chat; accented chars render correctly |

### Sampling Rate

- **Per commit:** Open `http://localhost:8000/quien-soy.html`, verify the specific fixed behavior
- **Final integration:** Full 14-question run (plus new questions if added) — all text, TTS, scroll, and end screen
- **Phase gate:** Complete flow verified before marking phase done

---

## Environment Availability

Step 2.6: SKIPPED — this phase is purely code/data/CSS changes. No external CLI tools, databases, or services required beyond a local static file server (already available via `python3 -m http.server`).

---

## Runtime State Inventory

Step 2.5: NOT APPLICABLE — this phase fixes an existing page. No renames, no stored data keys, no localStorage/sessionStorage keys to update. The data file path `/data/quien-soy-sentences.txt` is unchanged.

---

## Open Questions

1. **Skip button design — what happens to skipped questions in the end-screen paragraph?**
   - What we know: `chosenAnswers.join(' ')` builds the paragraph; skipped questions leave gaps
   - What's unclear: Whether the user/project wants a placeholder text for skipped questions
   - Recommendation: No placeholder — shorter paragraph is acceptable; simpler code; mark this as user decision

2. **Data push scope — how many new Q&A pairs to add?**
   - What we know: 14 pairs exist covering basic self-intro topics
   - What's unclear: Whether more rows are needed for this release or deferred
   - Recommendation: Add 3-5 new rows covering common topics (food, subjects, physical description); user approves content

3. **TTS fix depth — 200ms delay vs. voice-gate approach?**
   - What we know: Both fixes work; voice-gate is more robust but adds 3 extra lines
   - Recommendation: Voice-gate approach — adds minimal code, eliminates the race entirely

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `env(safe-area-inset-bottom)` evaluates to `0` when `viewport-fit=cover` is absent | Bug 3 | If wrong, the CSS env() would still have some effect — fix would still work but might have unexpected values |
| A2 | iPhone home indicator safe area is ≤34px | Bug 3 | If larger (newer iPhone models), 120px padding-bottom may still be sufficient (34px + 70px strip = 104px < 120px) |
| A3 | `"simpático y come demasiado"` wraps at 375px with 0.875rem font | Bug 3 | Measured at avg 7.5px/char; actual glyph metrics vary by OS font rendering — could fit in one line on some OS fonts |

**If all assumptions hold:** Bug 3 fix is correct as specified.

---

## Security Domain

No new trust boundaries. All six fixes are CSS, HTML, or data edits. No new network requests, no user data storage, no auth changes. V5 (input validation) remains satisfied: user input is still limited to two pre-defined button taps. ASVS V2, V3, V4, V6 do not apply to this phase.

---

## Sources

### Primary (HIGH confidence)

- `quien-soy.html` (codebase, read in full) — all bug root causes verified by code inspection
- `assets/css/styles.css` lines 1345–1537 (codebase, read in full) — CSS root causes verified
- `data/quien-soy-sentences.txt` (codebase, read in full) — typo and wrapping-label issues confirmed
- `.planning/phases/19-quien-soy-yo/19-02-SUMMARY.md` (codebase) — Phase 19 decisions and known stubs
- `CLAUDE.md` — zero-dependency, IIFE, dark-theme constraints

### Secondary (MEDIUM confidence)

- `.planning/STATE.md` — accumulated context listing the 5 known bugs by name
- `.planning/ROADMAP.md` — Phase 20 goal description

### Tertiary (LOW confidence)

- None

---

## Metadata

**Confidence breakdown:**

- Bug root causes: HIGH — all verified by direct code inspection with line numbers
- Proposed fixes: HIGH — each fix is a standard pattern used in the codebase or browser spec
- Data content additions (Bug 6 scope): LOW — content decisions belong to user, not research
- iOS TTS behavior: MEDIUM — based on known iOS Safari Web Speech API constraints; not device-tested in this session

**Research date:** 2026-05-09
**Valid until:** 2026-06-09 (stable vanilla stack; no external dependencies)
