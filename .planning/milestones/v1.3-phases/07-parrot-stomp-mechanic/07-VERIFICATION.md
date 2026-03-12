---
phase: 07-parrot-stomp-mechanic
verified: 2026-03-12T00:00:00Z
status: human_needed
score: 5/5 must-haves verified
re_verification: false
human_verification:
  - test: "Stomp a parrot while falling — start local server, play Jungle Run, jump and land on top of a parrot while descending"
    expected: "Parrot disappears, monkey bounces visibly upward, score increments by 1, a short pop/thud sound plays (not a squawk), two-color particle burst appears at parrot location"
    why_human: "Canvas game — collision geometry, bounce arc, audio distinction, and particle visuals cannot be verified programmatically"
  - test: "Collide with parrot head-on at same height (no jump) — let parrot fly into monkey"
    expected: "Game over screen appears, squawk sound plays (harsh sawtooth, not stomp pop)"
    why_human: "Audio distinction between sounds and game-over transition require in-browser observation"
  - test: "Jump INTO a parrot while rising (velY negative) — jump toward an approaching parrot so collision happens on the way up"
    expected: "Game over triggers, not a stomp — monkey is not bounced and parrot is not removed"
    why_human: "Edge-case collision timing; velY direction at moment of contact cannot be asserted without running the game"
---

# Phase 7: Parrot Stomp Mechanic Verification Report

**Phase Goal:** Implement the parrot stomp mechanic so the monkey can defeat parrots by landing on them from above.
**Verified:** 2026-03-12
**Status:** human_needed — all automated structural checks pass; 3 in-browser behavioral checks remain
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | When monkey is falling (velY > 0) and feet touch parrot top, parrot is removed and game continues | VERIFIED | `isStomping = velY > 0 && monkeyY <= pp.y + 4` at line 941; `parrots.splice(i, 1)` at line 946 |
| 2 | When monkey collides with parrot from side or while rising, gameOver() is called | VERIFIED | `else` branch at line 953 calls `playSquawkSound()` + `gameOver()` + `return` |
| 3 | After stomp, monkey immediately gains upward velocity (-10) producing a visible bounce | VERIFIED | `velY = STOMP_BOUNCE_VEL` at line 948; constant declared as `-10` at line 163 |
| 4 | A particle explosion in the parrot's colors fires at parrot's position on stomp | VERIFIED | Lines 944-945: `spawnParticles(pp.x, pp.y, pp.colors.body)` + `spawnParticles(pp.x, pp.y, pp.colors.wing)` — dual burst in both body and wing colors |
| 5 | A distinct stomp sound plays on stomp, audibly different from death squawk and fall sounds | VERIFIED (structure) | `playStompSound()` at lines 278-301: dual oscillator — sine 800→200Hz + triangle 120→50Hz. Death uses sawtooth 600→300Hz (`playSquawkSound`), fall uses sine 400→80Hz (`playFallSound`). Audible distinction requires human check |

**Score:** 5/5 truths structurally verified (3 require human in-browser confirmation)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `tap-to-vocab/games/jungle-run.html` | All stomp mechanic logic | VERIFIED | File exists, contains `playStompSound`, `isStomping`, `STOMP_BOUNCE_VEL`, `parrots.splice` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| Parrot collision loop | Stomp detection branch | `velY > 0` check at line 941 | WIRED | `var isStomping = velY > 0 && monkeyY <= pp.y + 4` inside `dx*dx + dy*dy < 24*24` block |
| Stomp branch | `parrots.splice(i, 1)` | Remove stomped parrot | WIRED | Line 946 inside `if (isStomping)` block |
| Stomp branch | `velY = STOMP_BOUNCE_VEL` | Impart upward velocity | WIRED | Line 948; constant `-10` at line 163 |
| Stomp branch | `playStompSound()` | Distinct audio on stomp | WIRED | Line 952 inside stomp branch; function defined at lines 278-301 |
| Death branch | `gameOver()` | Preserve existing death behavior | WIRED | Line 957 in `else` branch with `playSquawkSound()` + `spawnParticles` |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| STOMP-01 | 07-01-PLAN.md | Falling monkey on parrot top → parrot destroyed, no game over | SATISFIED | `isStomping = velY > 0 && monkeyY <= pp.y + 4`; `parrots.splice(i, 1)` (line 941, 946) |
| STOMP-02 | 07-01-PLAN.md | Side/head-on collision → game over as before | SATISFIED | `else` branch: `playSquawkSound()`, `gameOver()`, `return` (lines 954-958) |
| STOMP-03 | 07-01-PLAN.md | After stomp, monkey gets upward velocity bounce | SATISFIED | `velY = STOMP_BOUNCE_VEL` (-10) + `onGround = false` (lines 948-949) |
| STOMP-04 | 07-01-PLAN.md | Distinct audio + particle explosion on stomp | SATISFIED (structure) | `playStompSound()` (dual oscillator, lines 278-301); dual `spawnParticles` calls (lines 944-945). Audio distinction needs human check |

No orphaned requirements — all 4 STOMP IDs declared in plan are present in REQUIREMENTS.md and mapped to Phase 7.

### Anti-Patterns Found

None. No TODOs, FIXMEs, placeholders, or stub implementations found in the modified file.

### Human Verification Required

#### 1. Stomp detection — parrot removed with bounce

**Test:** Start a local server (`cd tap-to-vocab && python3 -m http.server 8000`), navigate to `http://localhost:8000/games.html`, enter Jungle Run, wait for a parrot, then jump and land directly on top of it while descending.
**Expected:** Parrot disappears, monkey bounces visibly upward, score increments by 1, a short pop/thud sound plays (not a harsh squawk), and a two-color particle burst appears at the parrot's former location.
**Why human:** Canvas game — collision geometry feel, visible bounce arc, audio character, and particle visual all require in-browser observation.

#### 2. Death regression — side/head-on collision still triggers game over

**Test:** Let a parrot fly into the monkey without jumping (parrot arrives at same height as monkey).
**Expected:** Game over screen appears and the squawk sound plays (not the stomp pop/thud).
**Why human:** Audio distinction between stomp pop and death squawk, and the game-over transition, cannot be asserted programmatically on a canvas game.

#### 3. Edge case — rising monkey colliding with parrot triggers death, not stomp

**Test:** Jump toward an approaching parrot so the collision happens while the monkey is still rising (velY is negative).
**Expected:** Game over triggers. The monkey is not bounced and the parrot is not removed.
**Why human:** velY direction at the exact moment of contact depends on timing and cannot be verified without running the game.

### Gaps Summary

No structural gaps found. All five observable truths are satisfied by substantive, wired code in `tap-to-vocab/games/jungle-run.html`. Commit `da1b26c` is confirmed present in the git log. The three human verification items above are behavioral/audiovisual checks that cannot be asserted via static analysis.

---

_Verified: 2026-03-12_
_Verifier: Claude (gsd-verifier)_
