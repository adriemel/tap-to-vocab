---
plan: 21-01
phase: 21-quien-soy-yo-ios-tts-fix
status: complete
completed: 2026-05-16
---

# Plan 21-01: iOS TTS First-Sentence Fix — Summary

## What Was Built

Modified `quien-soy.html` to fix the iOS Safari bug where the first question was never spoken aloud on iPhone when arriving from the home screen.

## Approach

Added an explicit **¡Empezar!** start screen that replaces the auto-start flow. The button's click handler calls `showQuestion(0)` directly — a synchronous user gesture iOS Safari always permits for speech synthesis. No priming utterances, heartbeats, or polling required.

**Root cause:** iOS Safari's `speechSynthesis.speak()` restriction requires a direct user gesture handler in the synchronous call chain. Page navigation (even via tap) breaks this chain as soon as any async operation runs (fetch, setTimeout, Promise resolution). The TSV data load (~100-400ms) always pushed `speak()` outside the gesture window.

**Why earlier attempts failed:**
- Single priming utterance: completed in ~5ms, leaving a ~400ms empty-queue gap before the first `speak()`
- Self-requeuing heartbeat: iOS closes the audio session after `cancel()` + 100ms gap regardless of prior queue activity

## Changes Made

- `quien-soy.html` — three areas changed:
  1. **HTML**: Added `#qs-start` screen with `¡Empezar!` button; chat and answer strip start `hidden`; progress pill starts `display:none`
  2. **CSS**: Added `.qs-start-screen`, `.qs-start-hint`, `.qs-start-btn` styles in inline `<style>` block
  3. **JS**: Removed all iOS workaround code; added `startBtn` click handler that unhides chat/strip and calls `showQuestion(0)`; TSV init now enables the button instead of auto-starting

## Verification

- Human UAT on iPhone Safari: "¿Cómo te llamas?" spoken aloud on first tap — **approved**
- Subsequent questions and end-screen paragraph still voiced (click handlers, no restriction)
- Restart button still triggers TTS on question 1 (also a click handler)

## Self-Check: PASSED

key-files:
  modified:
    - quien-soy.html
