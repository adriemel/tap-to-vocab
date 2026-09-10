---
phase: 22-qu-hora-es-time-telling-practice-tool
plan: 03
subsystem: hora.html reel interaction + TTS
tags: [pointer-events, drag, speech-synthesis, hora]
dependency-graph:
  requires: [22-01, 22-02]
  provides: [hora-reel-drag, hora-tts-wiring]
  affects: [hora.html]
tech-stack:
  added: []
  patterns:
    - "Pointer Events value-model drag (locations.js pattern adapted from drag-to-drop-zone to continuous reel scrolling)"
    - "closure-scoped lastPhrase state to make Repeat replay-only, never recompute"
key-files:
  created: []
  modified:
    - hora.html
decisions:
  - "Reel drag state (dragging/lastY/offsetPx/pointerId) kept as closure-scoped locals inside attachReelDrag, not reel-object properties — keeps the value-model math readable as bare `offsetPx` and matches the plan's literal verification grep for `Math.round(offsetPx / 40)`"
  - "TTS block copied verbatim from tapvocab.js lines 11-53 (the simple synchronous variant), not the quien-soy.html chained-callback variant — this page speaks exactly one static string per tap, no sequencing needed"
  - "speechSynthesis.resume() added immediately before speak(), carried over from the Phase 21 iOS TTS fix as a cheap idempotent hardening even though this page's click-handler call chain doesn't have Phase 21's async-gap bug"
metrics:
  duration: "~25 minutes"
  completed: 2026-08-02
---

# Phase 22 Plan 03: Reel Drag Interaction + Spanish TTS Wiring Summary

Made `hora.html`'s clock page interactive: Pointer Events drag on both dials with wraparound and settle animation, plus the project-standard Spanish TTS block wired to the "Qué hora es?" CTA and a replay-only "Repeat" button.

## What Was Built

**Task 1 — Reel drag (`attachReelDrag`):** A single reusable function attached to both `hourReel` and `minuteReel`. Implements the value-model approach (integer `reel.index` + closure-scoped pixel remainder `offsetPx`, never derived from scroll position): `pointerdown` captures the pointer and disables the track's CSS transition so it tracks the finger 1:1; `pointermove` accumulates `offsetPx`, converts to whole steps at a 40px-per-step ratio, updates `reel.index` via the existing `mod()` helper (giving wraparound at both ends — 23→00 and 00→23 for hours, 55→00 and 00→55 for minutes), and re-renders the 5-row reel; `pointerup`/`pointercancel` clear the `dragging` highlight class, animate `translateY` back to 0 over 250ms with the UI-SPEC's `cubic-bezier(0.4, 0.2, 0.2, 1)` easing, and clear the inline transition after 260ms so the next drag starts clean. Matches the `locations.js` Pointer Events skeleton: `isPrimary` multi-touch guard on every handler, `setPointerCapture`/`releasePointerCapture` in try/catch, document-level `pointermove`/`pointerup`/`pointercancel` listeners added on down and removed on up, and `ondragstart = false` to kill desktop Chrome's native drag.

**Task 2 — TTS + button wiring:** Copied the `tapvocab.js` speech block verbatim (`getSpanishVoice` with NFD-normalised "monica" match and es-lang fallback, synchronous-then-`voiceschanged` init, `speakSpanish(text)` at `es-ES`/rate 0.95/pitch 1.0 with `cancel()` + `resume()` + `speak()`). The `#hora-cta` click handler reads both reel values via the existing `getReelValue`, calls `window.HoraPhrase.buildTimePhrase(hour, minute)`, stores the result in a closure-scoped `lastPhrase`, writes it to `#hora-phrase` (removing the `is-placeholder` class), speaks it synchronously in the same click-handler call stack (preserving the iOS user-gesture chain), and reveals the `#hora-repeat` button. The `#hora-repeat` handler is bracketed with `// --- repeat-handler-start/end ---` sentinel comments and does nothing but `speakSpanish(lastPhrase)` when `lastPhrase` is set — it never calls `buildTimePhrase`, `getReelValue`, or touches `#hora-phrase`, so dragging a dial after a CTA tap cannot silently change what Repeat says (HORA-08 / RESEARCH Pitfall 4).

## Verification

- `node --check` on the extracted inline script: pass (both commits)
- `node hora-phrase.test.js`: `ALL PASS (12 exact cases + 288 invariant states)`
- Plan's `DRAG_OK` token check: pass
- Plan's `WIRING_OK` token + Pitfall-4 sentinel-block check: pass
- Anti-pattern greps (`touchstart`/`mousedown`/`scrollTop`/`overflow: auto`): 0 matches
- DOM-injection sink grep (`innerHTML`/`insertAdjacentHTML`/`document.write`/`eval`/`new Function`/inline `on*=`): 0 matches, prints `DOM_SAFE`
- `Math.round(offsetPx / 40)` literal-ratio grep: 1 match (implemented, not improvised)
- `setTimeout` count: 1 total, confined to the drag settle-transition cleanup in `onPointerUp` — none between the CTA handler's opening line and its `speakSpanish` call
- Sample phrase output cross-checked against `hora-phrase.js` directly: `buildTimePhrase(12,0)` → `"Son las doce en punto de la tarde"`, `buildTimePhrase(18,45)` → `"Son las siete menos cuarto de la noche"` — matches plan's acceptance-criteria examples
- Browser/device behavioral checks (drag feel, no page-scroll fight on touch, iOS first-tap audible speech) were not exercised in this headless environment; all static/automated gates from the plan's `<verify>` blocks pass. Recommend a manual pass on a real device before the phase is declared fully shipped, consistent with the plan's own verification step 4 (device-only check).

## Deviations from Plan

**None** — plan executed exactly as written. One structural adaptation for commit atomicity: Task 1 and Task 2 both edit the same inline IIFE in `hora.html`, so the plan's single continuous `<action>` narrative was split into two sequential commits by staging an intermediate task-1-only file state before adding Task 2's TTS/wiring code, rather than via `git add -p` (not available non-interactively). No code content differs from a single-pass implementation — this only affects commit boundaries, not the shipped file.

## Known Stubs

None. Both the CTA and Repeat paths are fully wired to real functions (`HoraPhrase.buildTimePhrase`, `speakSpanish`) with no placeholder data or hardcoded empty values.

## Threat Flags

None — this plan's `<threat_model>` STRIDE register (T-22-10 through T-22-15, T-22-SC) already covers every trust boundary the built code touches (pointer input → reel index, in-page string → speechSynthesis, in-page string → DOM text node). No new endpoint, storage, or auth surface was introduced.

## Self-Check: PASSED

- FOUND: hora.html (modified, contains `pointerdown`, `attachReelDrag`, `speakSpanish`, `HoraPhrase.buildTimePhrase`, `lastPhrase`, repeat-handler sentinels)
- FOUND commit b8991f0: `feat(22-03): attach Pointer Events reel drag to hour and minute dials`
- FOUND commit 65f8d4c: `feat(22-03): add Spanish TTS and wire CTA/Repeat handlers on hora.html`
