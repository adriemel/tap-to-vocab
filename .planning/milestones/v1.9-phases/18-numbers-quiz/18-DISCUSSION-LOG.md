# Phase 18: Numbers Quiz with Flip Cards & TTS - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-29
**Phase:** 18-numbers-quiz
**Areas discussed:** Card visual style

---

## Card Visual Style

| Option | Description | Selected |
|--------|-------------|----------|
| Match the reference image | Yellow/gold number text on dark navy — matches WhichNumberQuizz.png. New compact card CSS added to styles.css. | ✓ |
| Use existing dark theme | Reuse existing flip-card-front gradient (dark blue-purple, --ink text). Consistent with vocab quiz but doesn't match reference. | |

**User's choice:** Match the reference image

---

### Back Face Style

| Option | Description | Selected |
|--------|-------------|----------|
| Green accent back | Back face uses --ok green as border to signal 'revealed' — visually distinct from front, satisfying to flip. | ✓ |
| Same dark navy back | Back face keeps the same dark style, just shows the Spanish word in --ink text. Simpler, consistent look. | |

**User's choice:** Green accent back (--ok border, --ink text for Spanish word)

---

## Claude's Discretion

- Back face content: Spanish word only (not number + word) — requirements say "reveals the Spanish word"
- Re-tap behavior: re-speaks TTS on already-flipped card tap (card stays flipped)
- JS architecture: inline IIFE in numbers-quiz.html (matches numbers-learn.html pattern)
- Card dimensions, gap, font sizes calibrated for mobile 4-column fit

## Deferred Ideas

None.
