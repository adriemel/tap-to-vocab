# Phase 22: Qué Hora Es? — Time-Telling Practice Tool - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-02
**Phase:** 22-qu-hora-es-time-telling-practice-tool
**Areas discussed:** Clock visual & drag feel

---

## Clock visual & drag feel

### Drag interaction style

| Option | Description | Selected |
|--------|-------------|----------|
| Scrolling reel | Shows current number plus faded neighbors above/below, like an iOS/smartwatch picker; drag scrolls proportionally, settles on nearest value on release | ✓ |
| Snap-per-swipe | Each full swipe increments/decrements by one step, similar to existing Locations drag-and-drop threshold logic | |

**User's choice:** Scrolling reel (Recommended)
**Notes:** Matches the user's original "smartwatch alarm" framing most closely.

### Clock face style

| Option | Description | Selected |
|--------|-------------|----------|
| LCD digital display | Black/dark rectangular panel, large monospace glowing digits, colon between HH/MM — literal digital-clock look | |
| Rounded smartwatch card | Rounded-corner card matching the app's existing dark theme (`--card` background), digits in existing accent color | ✓ |

**User's choice:** Rounded smartwatch card
**Notes:** Should blend with the rest of Tap-to-Vocab's visual system rather than look like a separate widget.

### Dial layout

| Option | Description | Selected |
|--------|-------------|----------|
| Side-by-side, HH : MM | One card, two dial columns separated by a colon — reads like a single clock at a glance | ✓ |
| Stacked vertically | Hour dial on top, minute dial below, each labeled | |

**User's choice:** Side-by-side, HH : MM (Recommended)

### Active-drag feedback

| Option | Description | Selected |
|--------|-------------|----------|
| Highlight + subtle scale | Dial being dragged gets highlighted border/background and scales up slightly | ✓ |
| No extra feedback | Just the reel scrolling, no highlight/scale | |

**User's choice:** Highlight + subtle scale (Recommended)

---

## Claude's Discretion

- Exact drag-distance-to-value-change ratio and release/settle snap animation timing/easing
- Colon styling and spacing between HH and MM dials
- Exact highlight color/scale amount for active-drag state (reuse existing CSS variables)
- Home/back navigation placement (follow numbers.html / quien-soy.html precedent)

## Deferred Ideas

None — discussion stayed within phase scope (no scope-creep suggestions raised).
