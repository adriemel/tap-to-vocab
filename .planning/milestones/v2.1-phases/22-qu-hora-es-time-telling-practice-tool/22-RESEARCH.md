# Phase 22: Qué Hora Es? — Time-Telling Practice Tool - Research

**Researched:** 2026-08-02
**Domain:** Spanish time-telling grammar (domain logic) + vanilla-JS drag/reel picker UI
**Confidence:** HIGH (grammar rules, existing code patterns) / MEDIUM (mañana/tarde/noche hour boundaries — regionally variable, flagged as ASSUMED)

## Summary

This phase is two independent problems glued together: (1) a **pure, stateless function** that converts a 24h `{hour, minute}` pair into a traditional Spanish time phrase, and (2) a **drag-to-scroll reel picker** UI control, built with vanilla Pointer Events, that sets `hour` and `minute` values. Neither problem requires a new dependency — this is a zero-dependency static site (per CLAUDE.md) and both problems are well-covered by patterns already in this codebase.

The phrase-conversion logic is the highest-risk part of this phase: it is domain grammar that must be *correct*, not just plausible. The rules themselves (es la una / son las, y cuarto / y media, menos cuarto / menos veinte, the "next hour" shift past :30) are well-documented and consistent across sources — HIGH confidence. The one genuinely ambiguous rule is **where mañana/tarde/noche boundaries fall on the 24h clock** — sources disagree (ranges cited from "tarde ends at 6pm" to "tarde ends at 8-9pm"), so this is flagged MEDIUM/ASSUMED and a specific recommendation is given below for the planner to lock in (or send back to discuss-phase for a user decision).

The UI-SPEC.md already fully specifies the reel picker's visual/interaction contract (row pitch, drag ratio, snap easing, highlight state) — this research does not re-derive those numbers, it documents the **JS mechanics** needed to implement them (transform math, step-quantization, wraparound handling for the hour dial, `touch-action: none` requirement) and confirms which existing files to copy patterns from.

**Primary recommendation:** Build the phrase converter as a pure, dependency-free function (e.g. `assets/js/hora-utils.js` or inline in `hora.html`, following the `numbers-quiz.html` inline-IIFE precedent) that takes `(hour, minute)` and returns a string — this makes it trivially unit-testable outside the DOM (see Validation Architecture). Build the reel picker as a small reusable IIFE module modeled on `locations.js`'s Pointer Events wiring, adapted from single-drag-and-drop to continuous value scrolling via `translateY` transforms.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Time phrase construction (grammar) | Browser / Client (pure JS function) | — | No backend exists in this project; all logic is client-side static JS |
| Dial drag/reel interaction | Browser / Client (Pointer Events + CSS transform) | — | Touch/mouse input handling must happen in-browser; no server round-trip |
| TTS playback | Browser / Client (Web Speech API) | — | `speechSynthesis` is a browser API; existing pattern in `tapvocab.js` |
| Home screen entry point | Browser / Client (static HTML) | — | `index.html` grid button, no dynamic routing |
| State persistence | None | — | Explicitly out of scope — dial values reset on page load, nothing written to localStorage (per REQUIREMENTS.md "Out of Scope") |

This is a 100% client-only, single-tier phase — no API, no database, no build step. The map is trivial but included for completeness per the standard template.

## Standard Stack

### Core
No new libraries. This phase uses only what's already loaded:

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Web Speech API (`speechSynthesis`) | Browser built-in | TTS for the Spanish phrase | Already used identically in `tapvocab.js`, `numbers-quiz.html`, `quien-soy.html` — zero new code pattern |
| Pointer Events API | Browser built-in | Unified mouse+touch drag handling | Already used in `locations.js` — works on iOS Safari, unlike HTML5 Drag-and-Drop |

### Supporting
None — no TSV data file is needed (unlike every other game page). The phrase logic is pure computation, not data-driven.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled Pointer Events reel | `<input type="range">` sliders | Rejected by CONTEXT.md D-01 — user explicitly wants a scrolling-reel picker, not a slider; also a `range` input doesn't give the "faded neighbor values" visual affordance required by UI-SPEC |
| Hand-rolled reel | CSS `scroll-snap` + native scroll container | Viable alternative worth flagging (see Open Questions) — could reduce custom drag-math code by letting the browser handle momentum/snap natively via `overflow-y: scroll; scroll-snap-type: y mandatory`. Tradeoff: less control over the exact drag-to-pixel ratio and active-drag highlight timing specified in UI-SPEC; Pointer Events approach matches existing `locations.js` precedent more closely. Recommend sticking with Pointer Events per precedent, but flag as a legitimate simpler alternative if drag math proves fiddly during implementation. |

**Installation:** None required — zero-dependency static site, nothing to `npm install`.

## Package Legitimacy Audit

**Not applicable.** This phase installs no external packages (no npm, no CDN, no new files beyond project-native HTML/CSS/JS). Per CLAUDE.md: "No external CDN or library dependencies — everything is self-contained." Skipping the Package Legitimacy Gate protocol entirely — there is nothing to audit.

## Architecture Patterns

### System Architecture Diagram

```
[index.html]
     |  user taps "🕐 Qué hora es?" button
     v
[hora.html loads]
     |
     |-- init: hour dial = 12, minute dial = 00 (default state)
     |-- render reel DOM (values 00-23 for hour, 00,05..55 for minute)
     v
[User drags hour or minute reel] --pointerdown/move/up--> [reel value updates, settles to nearest step]
     |
     v
[User taps "Qué hora es?" CTA]
     |
     v
[buildTimePhrase(hour, minute)]  <-- pure function, no I/O
     |     1. resolve spoken hour number (handle "es la una" singular,
     |        handle >:30 "next hour" shift for menos-phrasing)
     |     2. resolve minute suffix (en punto / y cinco.../ y media /
     |        menos veinticinco... menos cinco)
     |     3. resolve mañana/tarde/noche from ORIGINAL 24h hour
     |        (never from the shifted spoken hour)
     v
[Phrase string] --> displayed in phrase-output card
                 --> passed to speakSpanish(phrase)  [Web Speech API]
     |
     v
[User taps "Repeat"] --> speakSpanish(lastPhrase) again, no recompute
```

### Recommended Project Structure
```
hora.html                    # new page — inline IIFE, follows numbers-quiz.html/quien-soy.html precedent
assets/css/styles.css        # add .btn-hora, .hora-page, .hora-clock-card, .hora-reel* classes (per UI-SPEC)
index.html                   # add .btn-hora button below .btn-quien-soy (line 59)
```
No new JS file is strictly required — UI-SPEC's Canonical References explicitly note that single-page features this size don't need a separate `.js` file (see `numbers-quiz.html` / `quien-soy.html` precedent). However, the phrase-conversion function should be written as a **standalone, side-effect-free function** even if it lives inline in `<script>`, specifically so it can be lifted into a Node-runnable test script for the Validation Architecture below without any refactoring.

### Pattern 1: Time Phrase Construction (pure function)
**What:** A pure function `buildTimePhrase(hour24, minute)` → string, with zero DOM/global dependencies.
**When to use:** Called once per "Qué hora es?" tap; never touches state beyond its two inputs.

**Full grammar mapping** [CITED: preply.com/en/blog/telling-time-in-spanish, lawlessspanish.com/grammar/telling-time, migaku.com/blog/spanish/spanish-time-expressions]:

Minute-suffix table (dial only supports 5-minute steps, so this table is exhaustive — no interpolation/rounding logic is ever needed):

| Minute | Suffix pattern | Notes |
|--------|-----------------|-------|
| :00 | *(none, or "en punto")* | "Son las tres" or "Son las tres en punto" — both correct; recommend including "en punto" for clarity/traditional flavor |
| :05 | "y cinco" | |
| :10 | "y diez" | |
| :15 | "y cuarto" | NOT "y quince" — quarter-past uses the word cuarto |
| :20 | "y veinte" | |
| :25 | "y veinticinco" | |
| :30 | "y media" | NOT "y treinta" |
| :35 | "menos veinticinco" | hour shifts to **next** hour |
| :40 | "menos veinte" | hour shifts to next hour |
| :45 | "menos cuarto" | hour shifts to next hour; NOT "menos quince", NOT "cuarto para" |
| :50 | "menos diez" | hour shifts to next hour |
| :55 | "menos cinco" | hour shifts to next hour |

**Hour-shift rule:** For minute >= 35, the phrase counts down to the *next* hour (`displayHour = (hour24 % 12 or 12) + 1`, wrapping 12→1). This is the single most error-prone part of the logic — a naive implementation will use the current hour's number for both the "y"-branch and the "menos"-branch, which is wrong.

**Es/Son and la/las agreement:**
- Convert `hour24` to 12-hour form first: `h12 = hour24 % 12; if (h12 === 0) h12 = 12;` (so 0 and 12 both map to 12, 13 maps to 1, etc.)
- For the "menos" branch (minute >= 35), the spoken hour is `h12 + 1`, wrapping 12 → 1 (not 13).
- If spoken hour === 1: use **"Es la una"** (singular verb, singular article).
- Otherwise (2-12): use **"Son las {number}"** (plural verb, plural article).
- Number words needed: una(1) dos(2) tres(3) cuatro(4) cinco(5) seis(6) siete(7) ocho(8) nueve(9) diez(10) once(11) doce(12). Note "una" (not "uno") — hour 1 is feminine because it agrees with implicit "la hora".

**Mañana/tarde/noche suffix — derive from the ORIGINAL 24h hour, never from the shifted spoken hour** [CITED: multiple sources cross-referenced]. This is the second most error-prone part: e.g. 18:45 is spoken "Son las siete menos cuarto" but must still say "de la tarde" (or "de la noche" depending on chosen boundary — see below), because the actual clock time (6:45pm) is what determines the period, not the spoken number "seven."

**Special forms (mediodía/medianoche) — recommend NOT using them.** Standard Spanish has "Es mediodía" (noon) and "Es medianoche" (midnight) as alternatives to "Son las doce de la tarde/noche" [CITED: multiple sources], but these special words **replace the entire phrase and cannot take a mañana/tarde/noche suffix** — "you can't use mediodía/medianoche when minutes are implied... they completely replace the hour phrase." Since HORA-07 requires every phrase to include a mañana/tarde/noche suffix, and the dial's default state is 12:00 (which would hit this exact edge case on first natural use), **recommend the regular pattern "Son las doce de la mañana/tarde/noche"** for 00:00 and 12:00 rather than branching into special-case words. This keeps the phrase generator uniform (no special-casing for exactly two dial positions out of 288 possible states) and satisfies HORA-07's explicit requirement literally. `[ASSUMED — flagged for planner/user confirmation, see Assumptions Log]`.

**Mañana/tarde/noche boundary recommendation** `[ASSUMED]`: Sources disagree on exact cutoffs (tarde ending anywhere from 6pm-9pm depending on source/region). Recommend the cleanest 3-way split with no fourth "madrugada" bucket (since HORA-07 only names three periods), commonly cited by beginner-course sources:
- **de la mañana:** hour 0–11 (00:00–11:59)
- **de la tarde:** hour 12–17 (12:00–17:59)
- **de la noche:** hour 18–23 (18:00–23:59)

This means 00:00–05:59 (the "madrugada" hours in stricter usage) fall under "mañana" — this mirrors the equally-simplified English convention of calling 1am-5am "morning" in a 12-hour AM/PM system. This is a reasonable, defensible default but genuinely a judgment call; flagged in Assumptions Log for explicit sign-off since it's user-facing grammar content, not an implementation detail.

**Example implementation (JS, no dependencies):**
```javascript
// Source: derived from grammar rules cited above — not from any single
// code example, since none of the cited sources publish working code.
function buildTimePhrase(hour24, minute) {
  var MINUTE_WORDS = {
    0: '', 5: 'cinco', 10: 'diez', 15: 'cuarto',
    20: 'veinte', 25: 'veinticinco', 30: 'media',
    35: 'veinticinco', 40: 'veinte', 45: 'cuarto',
    50: 'diez', 55: 'cinco'
  };
  var HOUR_WORDS = ['doce','una','dos','tres','cuatro','cinco','seis',
    'siete','ocho','nueve','diez','once','doce'];
  // index 0 unused; 1-12 map to spoken hour words. "doce" repeated at 0/12
  // intentionally — never indexed at 0 in practice (h12 is always 1-12).

  var isPast = minute <= 30; // 0..30 uses "y", 35..55 uses "menos"
  var h12 = hour24 % 12; if (h12 === 0) h12 = 12;
  var spokenHour = isPast ? h12 : (h12 % 12) + 1; // menos branch counts to next hour, 12 wraps to 1

  var verb = (spokenHour === 1) ? 'Es la' : 'Son las';
  var hourWord = HOUR_WORDS[spokenHour];

  var minuteSuffix;
  if (minute === 0) {
    minuteSuffix = ' en punto';
  } else if (isPast) {
    minuteSuffix = ' y ' + MINUTE_WORDS[minute];
  } else {
    minuteSuffix = ' menos ' + MINUTE_WORDS[minute];
  }

  // Period suffix from the ORIGINAL 24h hour, not spokenHour
  var period;
  if (hour24 >= 0 && hour24 < 12) period = 'de la mañana';
  else if (hour24 >= 12 && hour24 < 18) period = 'de la tarde';
  else period = 'de la noche';

  return verb + ' ' + hourWord + minuteSuffix + ' ' + period;
}
```

**Verification worked examples** (hand-traced against the cited grammar rules):
| Input (24h) | Expected phrase | Check |
|---|---|---|
| 01:00 | "Es la una en punto de la mañana" | singular verb, mañana bucket |
| 13:00 | "Es la una en punto de la tarde" | h12=1, tarde bucket |
| 14:15 | "Son las dos y cuarto de la tarde" | |
| 00:00 | "Son las doce en punto de la mañana" | midnight, no special word per recommendation above |
| 12:00 | "Son las doce en punto de la tarde" | noon, no special word per recommendation above |
| 18:45 | "Son las siete menos cuarto de la noche" | **critical case**: spoken hour shifts to 7, but period stays "noche" (from original hour 18), not derived from "siete" |
| 23:40 | "Son las doce menos veinte de la noche" | hour wraps 23→0→"doce", still noche (from original hour 23) |
| 00:40 | "Es la una menos veinte de la mañana" | h12=12→spokenHour wraps to 1→"Es la", mañana (from original hour 0) |
| 11:35 | "Son las doce menos veinticinco de la mañana" | h12=11→spokenHour=12, still mañana (from original hour 11) |

### Pattern 2: Reel Picker Drag Mechanics
**What:** Continuous-value vertical scroll picker using Pointer Events + CSS `translateY`, adapted from `locations.js`'s drag-and-drop pattern (single-code-path mouse+touch via Pointer Events, not two separate touch/mouse handlers).
**When to use:** Both the hour dial and minute dial — build as one reusable function/module parameterized by `{min, max, step, values[]}` rather than two copy-pasted implementations.

**Key mechanics not covered by UI-SPEC's visual numbers** (UI-SPEC already specifies: 40px row pitch, 64px center row, 40px drag = 1 step, 250ms cubic-bezier(0.4,0.2,0.2,1) settle, `border:2px solid var(--accent)` + `scale(1.05)` active-drag highlight):

1. **`touch-action: none` is required on the reel container** — confirmed existing convention at `locations.html:175` (`#draggable { touch-action: none; }`). Without this, touch-drag on the reel will fight with the page's native vertical scroll on mobile, causing janky/broken dragging. This is not mentioned in UI-SPEC and must be added to the new `.hora-reel*` CSS.
2. **Value model, not pixel model:** track a `currentValue` (integer index into the reel's array of steps) plus a `dragOffsetPx` (accumulated sub-step pixel delta during an active drag). On `pointermove`, accumulate `dy = e.clientY - lastY`; convert to steps via `dragOffsetPx += dy`, then `stepsDelta = Math.round(dragOffsetPx / 40)` (40px = 1 step per UI-SPEC); update `currentValue` by `-stepsDelta` (dragging up increases the value, matching the "scroll reel up to increase" smartwatch-picker convention — confirm direction against CONTEXT.md's "like setting an alarm on a smartwatch" framing during implementation, this is a UX-feel detail worth eyeballing rather than assuming); reset `dragOffsetPx -= stepsDelta * 40` (carry remainder so drag feels continuous, not stepped).
3. **Hour dial wraps (0↔23), minute dial wraps (0↔55)** — both are circular pickers (23→0 going up, 0→23 going down), matching a real clock's continuous nature. Use modulo arithmetic: `currentValue = ((currentValue + delta) % 24 + 24) % 24` for hours, `% 12` steps of 5 for minutes (working in step-index space 0-11, multiply by 5 for display).
4. **Rendering the reel:** render the current value plus ±2 neighbors (5 rows total: 2 faded-above, 1 center, 2 faded-below per UI-SPEC's opacity spec), re-render on every `pointermove` step change (cheap — 5 short text nodes), rather than trying to CSS-transform a long pre-rendered list. This avoids infinite-list/recycling complexity entirely, at the cost of slightly more DOM writes during drag — acceptable given only 5-40 possible distinct values per dial.
5. **Release/settle:** on `pointerup`/`pointercancel`, snap `dragOffsetPx` back to 0 with the 250ms transition UI-SPEC specifies (apply `transition` only on release, remove it during active drag so the reel tracks the finger 1:1 with no lag — same "disable transition during interaction, restore after" idiom already used in this codebase for the flip-card reset, see MEMORY.md "Quiz Mode Details").
6. **`setPointerCapture`** on `pointerdown` (per `locations.js:8-32` pattern) so drag continues to track correctly even if the pointer moves outside the reel's bounding box mid-drag.

### Anti-Patterns to Avoid
- **Deriving mañana/tarde/noche from the spoken (post-menos-shift) hour instead of the original 24h dial value** — produces grammatically fluent but factually wrong output (e.g. would say "de la noche" for 18:45 if naively checking `spokenHour >= 18`, which is nonsensical since spokenHour is always 1-12).
- **Using "y quince"/"y treinta"/"y cuarenta y cinco" (literal digit reading) instead of cuarto/media/menos-cuarto** — explicitly called out as wrong by HORA-06 ("not literal digit reading").
- **Two-finger/multi-touch drag not guarded** — `locations.js` guards with `if (!e.isPrimary) return;` on every pointer handler; the reel picker must do the same to avoid multi-touch chaos on mobile.
- **Building the reel as a real scrollable `overflow:auto` list and reading `scrollTop`** — works, but fights with `touch-action`/momentum scrolling and makes the exact 40px-per-step drag ratio UI-SPEC demands harder to control precisely than direct `translateY` + Pointer Events. Stick with the transform-based approach for parity with `locations.js`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TTS voice selection (Monica/es-ES fallback) | New voice-picking logic | Copy `getSpanishVoice()` + `speakSpanish()` verbatim from `tapvocab.js:13-53` (already copied identically into `numbers-quiz.html` and `quien-soy.html`) | Handles iOS async `voiceschanged` timing race — a known, already-fixed bug (FIX-IOS-TTS, Phase 21). Re-deriving this from scratch risks reintroducing that exact bug. |
| Pointer drag event wiring | New touch/mouse event split (`touchstart`+`mousedown` separately) | Pointer Events (`pointerdown`/`pointermove`/`pointerup`/`pointercancel`) per `locations.js:8-33` | Single code path for mouse+touch, already proven to work on iOS Safari in this codebase; touch/mouse-split is the classic "two codepaths, two sets of bugs" trap |
| Spanish number-to-word conversion | A generic i18n number library | The 12-entry `HOUR_WORDS` lookup array above | Only 12 words are ever needed (hours 1-12); a general-purpose number-to-Spanish-words library would be wild overkill for a fixed, tiny domain and would violate the zero-dependency constraint |

**Key insight:** Every piece of "infrastructure" this phase needs (TTS, drag events) already exists correctly in this codebase — the only genuinely new code is the phrase-grammar function and the reel-rendering/value-model glue around the existing drag pattern.

## Common Pitfalls

### Pitfall 1: Period suffix computed from the wrong hour
**What goes wrong:** Phrase says "de la noche" for a time that's actually afternoon (or vice versa) whenever minute >= 35 shifts the spoken hour into the next 12-hour cycle.
**Why it happens:** It's natural to compute the period suffix using the same `spokenHour` variable used for the hour word, since it's already in scope and "feels" like the hour being announced.
**How to avoid:** Compute the period suffix from `hour24` (the raw dial value) before any 12-hour conversion or menos-shift happens. Keep these as two clearly separate computations in code, ideally as two separate small functions, not interleaved.
**Warning signs:** Any phrase where the minute is 35-55 near a mañana/tarde/noche boundary hour (11:xx, 17:xx, 23:xx) is worth spot-checking manually.

### Pitfall 2: "Es la una" vs "Son las" gets the wrong hour
**What goes wrong:** Using `h12` (pre-shift) instead of `spokenHour` (post-shift) to decide singular vs plural, producing "Son las una" (wrong) instead of "Es la una" for times like 00:45 → should be "Es la una menos cuarto."
**Why it happens:** The singular/plural check needs to happen on the *final spoken hour number*, after the menos-branch's next-hour shift, not on the raw 12-hour-converted dial value.
**How to avoid:** Always resolve `spokenHour` fully (including the shift) before checking `spokenHour === 1`.
**Warning signs:** Any :35-:55 time where `h12` is 12 (i.e., original hour 0 or 12) will exercise this — test 00:40 and 12:40 explicitly.

### Pitfall 3: Touch drag fights page scroll
**What goes wrong:** On mobile, dragging a reel also scrolls the whole page (or the drag feels laggy/jumpy) because the browser's native touch-scroll gesture is competing with the custom Pointer Events handler.
**Why it happens:** Missing `touch-action: none` on the reel container — this is the exact fix already applied to `#draggable` in `locations.html:175` for the exact same class of problem.
**How to avoid:** Add `touch-action: none;` to the reel container CSS from the start, don't wait for a bug report.
**Warning signs:** Works fine with mouse in desktop dev tools, breaks/feels wrong only on a real touch device — classic sign of a missing `touch-action` declaration, since desktop pointer events don't have a competing native scroll gesture.

### Pitfall 4: Repeat button re-speaks a stale or recomputed phrase
**What goes wrong:** HORA-08 requires "Repeat" to re-speak the *last spoken phrase* without changing dial values — a naive implementation might accidentally call `buildTimePhrase(currentHourDial, currentMinuteDial)` again inside the Repeat handler, which would produce a *different* phrase if the user has since dragged a dial without tapping "Qué hora es?" again.
**Why it happens:** It's tempting to make Repeat "just call the same function as the main button" for code reuse.
**How to avoid:** Store the last-spoken phrase string in a closure variable (e.g. `var lastPhrase = null;`) set only inside the "Qué hora es?" handler; Repeat's handler must only call `speakSpanish(lastPhrase)` and must not touch the dial-reading/phrase-building logic at all. Repeat button should be disabled/hidden until `lastPhrase` is non-null (per UI-SPEC's "hidden until first use" spec).
**Warning signs:** Drag a dial after the first "Qué hora es?" tap, then tap Repeat without tapping the main CTA again — if the spoken/displayed phrase changes, this bug is present.

## Code Examples

### TTS pattern to copy verbatim
```javascript
// Source: assets/js/tapvocab.js:13-53 (also duplicated in numbers-quiz.html, quien-soy.html)
let _cachedSpanishVoice = null;
let _voicesLoaded = false;

function getSpanishVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const normalize = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const monica = voices.find(v => normalize(v.name).includes("monica") && v.lang.toLowerCase().startsWith("es"));
  if (monica) { _cachedSpanishVoice = monica; return monica; }
  const preferred = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith("es"));
  _cachedSpanishVoice = preferred[0] || voices[0] || null;
  return _cachedSpanishVoice;
}

if (typeof speechSynthesis !== "undefined") {
  var _initialVoices = speechSynthesis.getVoices();
  if (_initialVoices.length) { _voicesLoaded = true; getSpanishVoice(); }
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.addEventListener("voiceschanged", function () {
      _voicesLoaded = true; getSpanishVoice();
    });
  }
}

function speakSpanish(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    const v = getSpanishVoice();
    if (v) u.voice = v;
    u.rate = 0.95; u.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (e) { console.warn("Speech synthesis failed:", e); }
}
```
Note: `quien-soy.html`'s variant wraps `speak()` in a `setTimeout(..., 100)` plus `onend`/`onerror` callback support, needed there because it chains multiple utterances (question → answer → next question). This phase has no chaining requirement (HORA-04/05 speak once per tap, HORA-08 repeats a static string) — the simpler `tapvocab.js` version without the callback/setTimeout wrapper is sufficient and should be preferred for simplicity, unless the FIX-IOS-TTS bugfix history (Phase 21) revealed a reason the delay is needed even for single-utterance calls. Recommend checking Phase 21's plan/verification notes before deciding; default to the simpler `tapvocab.js` version.

### Pointer Events drag skeleton to adapt
```javascript
// Source: assets/js/locations.js:6-33 — adapt from drag-to-drop-zone to
// continuous value scrolling (replace absolute positioning with translateY
// step accumulation as described in Pattern 2 above)
function onPointerDown(e) {
  if (!e.isPrimary) return; // ignore secondary touches (multi-touch)
  var el = e.currentTarget;
  el.setPointerCapture(e.pointerId);
  // ... record start Y, disable transition, add active-drag highlight class
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointercancel', onPointerUp); // iOS diagonal drag safety
}
```

## State of the Art

No "old vs current approach" axis applies here — this is small, stable domain logic (Spanish grammar hasn't changed) and a browser API pattern already proven current in this exact codebase (Phase 17-21). Nothing deprecated, nothing to migrate from.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | mañana/tarde/noche boundaries: 00-11 mañana, 12-17 tarde, 18-23 noche | Architecture Patterns > Pattern 1 | Low-medium — phrase would use a "wrong" but still comprehensible period word for hours near the boundary (e.g. 6pm labeled tarde instead of noche if a stricter cutoff is preferred). Purely a content/pedagogical judgment call, not a functional bug. Easy to change later (single lookup range in one function). |
| A2 | 00:00 and 12:00 use "Son las doce ... de la mañana/tarde" rather than the special words "Es medianoche"/"Es mediodía" | Architecture Patterns > Pattern 1 | Low — both are grammatically valid Spanish; choosing the special-word form would require branching logic and would technically violate HORA-07's "phrase includes de la mañana/tarde/noche" requirement (since mediodía/medianoche replace the whole phrase and take no suffix). Recommend confirming this reading of HORA-07 with the user if there's any doubt, since it affects exactly the two dial positions most likely to be hit early (12:00 is the stated default). |
| A3 | Reel drag direction: dragging up increases the value (matches "smartwatch alarm picker" framing from CONTEXT.md) | Architecture Patterns > Pattern 2 | Low — purely a feel/UX detail, trivially flippable by negating one sign in the delta calculation; worth a quick manual check during implementation against actual smartwatch/iOS picker behavior rather than assuming. |
| A4 | "en punto" is appended for exact-hour (:00) times rather than leaving it bare ("Son las tres" with no suffix) | Architecture Patterns > Pattern 1 | Very low — both forms are standard Spanish; "en punto" was chosen for clarity/explicitness given this is an educational tool, easy to drop if the user prefers the bare form. |

**If this table is empty:** N/A — see above, 4 assumptions logged, all low-to-medium risk and all easily reversible (single-line changes), none blocking implementation.

## Open Questions

1. **Should the reel picker use CSS `scroll-snap` + native scroll instead of hand-rolled Pointer Events + transform math?**
   - What we know: `locations.js` already has a working Pointer Events pattern in this codebase for a *different* kind of drag (drag-and-drop, not continuous-value scroll). UI-SPEC's exact pixel/timing numbers (40px=1 step, 250ms cubic-bezier settle) are specified as if hand-rolled.
   - What's unclear: Whether native `scroll-snap` could hit those same numbers with less custom code, or whether UI-SPEC's numbers were chosen specifically because they're easy to hit with manual transform math.
   - Recommendation: Default to hand-rolled Pointer Events + transform (matches precedent, gives exact control UI-SPEC demands). Only reconsider if the planner/executor finds the drag math significantly more complex than expected.

2. **Does the existing `speakSpanish()` need the `setTimeout`/`onend`-callback wrapper used in `quien-soy.html`, or is the simpler `tapvocab.js` version sufficient for this phase's single-utterance-per-tap usage?**
   - What we know: `quien-soy.html`'s wrapper exists to solve TTS chaining/sequencing across multiple bubbles (Phase 21's iOS bugfix). This phase never chains TTS calls.
   - What's unclear: Whether the Phase 21 iOS fix was actually about chaining specifically, or about a more general first-call timing issue that could also affect this phase's single calls.
   - Recommendation: Planner/executor should skim `.planning/phases/21-*/` PLAN.md or commit history for the FIX-IOS-TTS root cause before deciding; if it's chaining-specific, use the simpler `tapvocab.js` pattern.

## Environment Availability

Skipped — this phase has no external dependencies beyond the browser itself (no CLI tools, no package managers, no services). Web Speech API and Pointer Events are both already relied upon elsewhere in this codebase and are standard in all modern browsers (including iOS Safari, per FIX-IOS-TTS history confirming it's been made to work there).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — this is a zero-dependency static site with no test runner, no `package.json`, no CI config found in the repo |
| Config file | none |
| Quick run command | Manual browser check (see below) |
| Full suite command | Manual browser check (see below) |

No automated test framework exists anywhere in this codebase (confirmed: no `*.test.js`/`*.spec.js` files, no `package.json` at repo root). This is consistent with every prior phase (17-21) in this project, which have all been verified manually in-browser. This phase does not need to introduce one to be internally consistent — but it *can* cheaply gain automated coverage for the highest-risk piece (the phrase grammar function) without any new tooling, since that function is designed to be pure/dependency-free (see Pattern 1).

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HORA-01 | Home button navigates to clock page | manual-only | — (visual/navigation check) | N/A |
| HORA-02 | Two dials render, hour 00-23, minute 00/05/.../55 | manual-only | — (visual check) | N/A |
| HORA-03 | Drag changes dial value like smartwatch picker | manual-only | — (requires real pointer/touch interaction, not scriptable without a browser automation tool this project doesn't have) | N/A |
| HORA-04 | CTA displays the phrase | manual-only + node-runnable unit check (see below) | `node hora-phrase.test.js` (if Wave 0 gap filled) | ❌ Wave 0 |
| HORA-05 | CTA speaks the phrase via TTS | manual-only | — (audio output not scriptable in this stack) | N/A |
| HORA-06 | Traditional phrasing (cuarto/media/menos) | node-runnable unit check | `node hora-phrase.test.js` | ❌ Wave 0 |
| HORA-07 | mañana/tarde/noche suffix derived from 24h hour | node-runnable unit check | `node hora-phrase.test.js` | ❌ Wave 0 |
| HORA-08 | Repeat re-speaks without recompute | manual-only | — (requires observing that dial-drag-after-tap doesn't change Repeat's output) | N/A |
| HORA-09 | Changing dial + re-tapping produces new phrase | manual-only + implied by unit coverage of HORA-06/07 | `node hora-phrase.test.js` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Manually exercise the phrase function against the worked-example table above (9 cases) in a Node REPL or the small test script (Wave 0 gap below) — takes seconds, no framework needed.
- **Per wave merge:** Full manual click-through in a real browser (desktop + one mobile device/emulator) covering all 9 requirements, since 7 of 9 are manual-only by nature (UI drag gesture, audio output, navigation).
- **Phase gate:** All 9 requirements manually verified once before `/gsd:verify-work`; the phrase-function unit script (if created) should show all worked examples passing.

### Wave 0 Gaps
- [ ] A small Node-runnable script (e.g. `hora-phrase.test.js`, plain `assert`-based, zero dependencies — do NOT introduce a test framework like Jest/Vitest for a 9-case check, that would violate the project's zero-dependency ethos for a one-off validation script) that `require()`s or copy-pastes the extracted `buildTimePhrase` function and asserts it against the 9 worked examples in this document's Pattern 1 section. This is optional but cheap (no new tooling, ~40 lines) and directly de-risks the highest-stakes correctness surface in this phase.
- [ ] No fixtures/conftest needed — the function is pure and the test cases are the literal worked-example table above.

*If the planner decides the manual worked-example check during implementation is sufficient without a persisted test script, that's a reasonable call given this project's established all-manual-QA precedent — the script is a nice-to-have, not a hard requirement.*

## Security Domain

Not applicable — no `security_enforcement` config found in `.planning/config.json`, and this phase has no authentication, no user input beyond dial dragging (no free-text fields, no injection surface), no network calls, and no data persistence. Skipping per "omit only if explicitly false" guidance interpreted against a phase with genuinely zero security-relevant surface (this mirrors every prior phase in this static-site project, none of which have included a Security Domain section).

## Project Constraints (from CLAUDE.md)

- **Zero dependencies:** No build step, no package manager, no frameworks. Everything self-contained vanilla HTML/CSS/JS — confirmed compatible, this phase needs nothing external.
- **Absolute asset paths:** All paths from root (`/assets/...`, `/data/...`) — not applicable here since this phase needs no data file, but any CSS/JS script tags added to `hora.html` must use absolute paths per convention.
- **IIFE module pattern:** All JS modules use IIFE, export to `window` if shared — `hora.html`'s inline script should follow the same IIFE wrapper even though nothing needs to be exported (matches `numbers-quiz.html`/`quien-soy.html` precedent).
- **`cache: "no-store"` on TSV fetches:** Not applicable — this phase has no TSV/data file to fetch.
- **Dark theme via CSS custom properties in `:root`:** Confirmed — UI-SPEC already maps every color to existing `--bg`/`--card`/`--ink`/`--muted`/`--accent` variables, no new colors needed.
- **Mobile-first, `clamp()` for font sizes:** UI-SPEC already specifies `clamp()` values for the Heading/Display typography roles.

## Sources

### Primary (HIGH confidence)
- `assets/js/tapvocab.js:13-53` (codebase) — verified TTS pattern via direct file read
- `assets/js/locations.js:1-33` (codebase) — verified Pointer Events drag pattern via direct file read
- `locations.html:175` (codebase) — verified `touch-action: none` convention via grep
- `assets/css/styles.css:1350-1355` (codebase) — verified `.btn-quien-soy` pattern to replicate for `.btn-hora`
- `.planning/phases/22-.../22-UI-SPEC.md` — verified/approved design contract, used verbatim for all visual/spacing/color/timing decisions

### Secondary (MEDIUM confidence)
- [Telling the time in Spanish – complete beginner's guide (Preply)](https://preply.com/en/blog/telling-time-in-spanish/) — es la una/son las, y cuarto/y media/menos cuarto rules, cross-verified against 2 other sources
- [Telling Time in Spanish - Lawless Spanish](https://www.lawlessspanish.com/grammar/telling-time/) — mañana/tarde/noche general boundaries
- [Spanish Time Expressions - Migaku](https://migaku.com/blog/spanish/spanish-time-expressions) — full y/menos minute-word table, cross-verified against worked examples in other sources
- Rosetta Stone, HiNative, SpanishDict — mediodía/medianoche special-form behavior, cross-verified across 3 independent sources agreeing on "cannot take a suffix" rule

### Tertiary (LOW confidence)
- Exact hour cutoffs for tarde→noche transition — sources ranged from 6pm to 9pm depending on source/region; flagged as ASSUMED (A1) rather than stated as fact, since no single authoritative cutoff exists

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies, 100% reuse of proven in-codebase patterns
- Architecture (phrase grammar core rules): HIGH — es/son, y/menos, cuarto/media rules consistent across every source checked
- Architecture (mañana/tarde/noche boundaries): MEDIUM — genuinely regionally/source variable, explicit recommendation given with rationale
- Architecture (reel drag mechanics): HIGH — directly extends an existing, working in-codebase pattern (`locations.js`)
- Pitfalls: HIGH — all four are either directly derived from the grammar rules' known trap points or from a documented existing codebase convention (`touch-action`)

**Research date:** 2026-08-02
**Valid until:** Indefinite for the grammar rules (stable domain, not time-sensitive); 90 days for the codebase-pattern references (re-verify file line numbers if this phase is deferred and other phases touch `tapvocab.js`/`locations.js`/`styles.css` in the meantime)
