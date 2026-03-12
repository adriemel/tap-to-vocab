# Milestones

## v1.3 — Jungle Run Parrot Stomp

**Shipped:** 2026-03-12
**Phase:** 7
**Plans:** 1
**Requirements:** 4/4 complete

### Delivered

Stomp mechanic added to Jungle Run — monkey can now kill parrots by landing on them from above, with collision discrimination, upward bounce physics, dual-oscillator sound, and particle explosion feedback.

### Key Accomplishments

1. Stomp detection: `velY > 0 && monkeyY <= pp.y + 4` discriminates top-landing from side-hit in circular hitbox
2. Bounce: `STOMP_BOUNCE_VEL = -10` gives visible upward bounce; `onGround = false` ensures air physics apply immediately
3. Death regression preserved: side/head-on collisions still call `gameOver()` + squawk sound
4. `playStompSound()`: 800→200Hz sine pop + 120→50Hz triangle thud — audibly distinct from sawtooth squawk
5. Double particle burst at stomp point in parrot body + wing colors for richer explosion

### Stats

- Timeline: 1 day (2026-03-12)
- Files modified: 1 (`tap-to-vocab/games/jungle-run.html`)
- Git tag: v1.3

### Archive

- `.planning/milestones/v1.3-ROADMAP.md` — full phase details
- `.planning/milestones/v1.3-REQUIREMENTS.md` — requirements with outcomes

---

## v1.0 — Quality MVP

**Shipped:** 2026-03-11
**Phases:** 1-4
**Plans:** 12
**Requirements:** 17/17 complete

### Delivered

Comprehensive quality pass across all 11 pages — every bug fixed, code deduplicated, visual design unified, and mobile layout verified at 375px. The app now works correctly on iOS/Safari, has zero silent failures, and every page is part of the same consistent design system.

### Key Accomplishments

1. Audited all 11 app pages with 30+ severity-rated findings in CONCERNS.md
2. Fixed 6 bugs: quiz coin refund, iOS voice loading, game lives guard, favicon (11 pages), localStorage error feedback, voices.html crash
3. Extracted SharedUtils.loadTSV() — eliminated duplicate TSV parsers from fill-blank.js and conjugation.js
4. Created home.js and game-init.js — zero inline scripts remain in index.html or game HTML
5. Integrated vocab.html into dark theme design system with coins and home navigation
6. Enforced 44px tap targets on all learning interaction buttons; verified no horizontal scroll at 375px on any page

### Stats

- Timeline: 2 days (2026-03-10 → 2026-03-11)
- Files modified: 26+
- Lines of code: ~6,350 (HTML/CSS/JS)
- Git tag: v1.0

### Archive

- `.planning/milestones/v1.0-ROADMAP.md` — full phase details
- `.planning/milestones/v1.0-REQUIREMENTS.md` — requirements with outcomes
