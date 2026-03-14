# Feature Research

**Domain:** Spatial prepositions drag-and-drop vocabulary game (ESL/EFL pattern, Spanish-German app)
**Researched:** 2026-03-14
**Confidence:** HIGH (domain logic from established pedagogical patterns; codebase from direct inspection)

---

## Context: The 11 Prepositions and Their Layout Problem

The 11 target prepositions are:

| Preposition | Meaning | Spatial Challenge |
|-------------|---------|-------------------|
| encima de | on top of | unambiguous — above reference box |
| debajo de | under | unambiguous — below reference box |
| delante de | in front of | ambiguous vs. cerca de at small sizes |
| detrás de | behind | HARD — not visible in 2D top-down layout |
| al lado de | next to / beside | overlaps visually with cerca de |
| a la derecha de | to the right of | unambiguous with labeling |
| a la izquierda de | to the left of | unambiguous with labeling |
| entre | between | requires TWO reference objects |
| cerca de | near | overlaps visually with al lado de |
| lejos de | far from | requires large canvas / scroll area |
| en | in / on / at | must go INSIDE the reference box |

The core design challenge is that a naive 2D flat layout cannot visually discriminate all 11. Solutions exist — see Architecture section — but feature scope must acknowledge this.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features a learner assumes are present. Missing any of these makes the game feel broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Draggable object with distinct visual affordance | Users must immediately understand "grab this and move it" — no instruction reading | LOW | Cursor change on hover (desktop), obvious grab handle or emoji object; on mobile pointer-down must initiate drag |
| Fixed reference box clearly labeled | Without an anchor object the spatial meaning is undefined | LOW | A centered labeled box ("la caja" / "die Box") in the scene, visually distinct from drop zones |
| Drop zones that snap/lock object on correct drop | Users expect confirmation that the drop registered; floating mid-air = broken | LOW | Use CSS `position: absolute` snap-to-zone on correct drop |
| One preposition prompted per round | Learning mode is one question at a time — matching games or "all 11 at once" overwhelm beginners | LOW | Show target preposition (Spanish + German) at top; user drops object in correct zone |
| Correct/wrong feedback with sound | Every other game in this app does this; users expect it; consistent with SharedUtils | LOW | `SharedUtils.playSuccessSound()` + `SharedUtils.playErrorSound()` — zero implementation cost, already exists |
| Confetti on correct answer | Established in all other game modes via `SharedUtils.confettiBurst()` | LOW | Reuse existing |
| Coin reward on correct answer | Every learning game awards `CoinTracker.addCoin()` on correct; absence would be conspicuous | LOW | Reuse existing `window.CoinTracker` |
| Wrong-drop visual indication | Object should return to start or shake; staying in the wrong zone misleads the learner | LOW | CSS shake animation + snap back to origin |
| Back/Home navigation | Every page in the app has this; its absence would feel broken | LOW | Follows established pattern from fill-blank.html — history array + back button |
| Progress indicator | Learner needs to know how many prepositions remain | LOW | "3 / 11" badge, same pattern as fill-blank progress badge |
| All 11 prepositions in a session | The game should cycle through all prepositions, shuffled | LOW | `SharedUtils.shuffleArray()` of the 11-item array — exists |
| Completion celebration | Other games celebrate finishing all items (`confettiBurst(50)`) | LOW | Matches fill-blank end-state pattern |
| Mobile touch support | App is mobile-first; drag-and-drop must work with `touchstart`/`touchmove`/`touchend` | HIGH | This is the biggest implementation complexity — see Pitfalls |
| Minimum 44px tap targets on drop zones | Established app standard from v1.0 audit | MEDIUM | Drop zones must be large enough to land on with a finger |

### Differentiators (Competitive Advantage)

Features that make this game better than a generic preposition exercise, aligned with the app's "every interaction must feel polished" core value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 3D-perspective scene for "detrás de" | The hardest preposition to teach in 2D; showing depth via CSS perspective or an isometric box makes "behind" visually unambiguous — no text explanation needed | MEDIUM | CSS `perspective` + `rotateX` on the reference box, or a pre-drawn SVG box with back face visible |
| Distinct near vs. beside zones with visible distance rings | cerca de vs. al lado de is the biggest confusion point; concentric distance rings around the reference box makes "near" a region, "beside" a precise position | MEDIUM | SVG or CSS ring overlays; snap zones at different radii |
| "entre" handled with two reference boxes | entre requires TWO reference objects by definition; using one box and labeling "between box A and box B" at scene edges teaches the concept correctly | MEDIUM | Add a second smaller reference box or a wall element; drop zone between them |
| Spanish TTS pronunciation of each preposition on prompt | App already uses Web Speech API; saying the preposition aloud when prompted reinforces audio-visual connection at zero infrastructure cost | LOW | Reuse existing speech pattern from tapvocab.js; speak the `es` text on question load |
| Animated object movement to correct position on timeout/reveal | If user is stuck and asks for hint, or after skip, smoothly animate the object flying to the correct zone | MEDIUM | CSS transition on `left`/`top` with `position: absolute`; set computed coords and trigger transition |
| "Try again" on wrong drop (no auto-advance) | Unlike fill-blank which grays out wrong choices, a drag game should let the user re-attempt after wrong drops; learning through movement repetition is more effective for spatial memory | LOW | Reset object to origin on wrong drop; no advance until correct |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Free-placement mode (drop anywhere, system judges distance) | Seems more realistic and "open" | Requires distance threshold math per preposition, subjective near/far thresholds, poor on small mobile screens where zones collapse together | Discrete named drop zones with clear visual boundaries — learner knows exactly what they're aiming for |
| All 11 zones visible simultaneously as drop targets | Feels comprehensive, "see all options" | 11 labeled zones around one box on a 375px screen are illegible; zones overlap; tap targets fail 44px minimum | Show only the correct zone highlighted when active, or use a minimal scene where zones are implied by position, not all labeled at once |
| Drag-and-match (connect preposition label to zone) | Common in generic "matching" games | Reverses the learning direction — learner reads the Spanish and clicks text, not internalizing spatial meaning | Spatial first: show preposition text, drag OBJECT to location — spatial action encodes meaning |
| Timer / countdown pressure | Adds gamification | Spatial learning benefits from no time pressure; rushed drops = guessing not learning; adds implementation complexity for little pedagogical gain | Progress badge (X / 11) provides implicit pacing without anxiety |
| Score multiplier / streak system | Feels rewarding | Coins already handle reward; a parallel score system conflicts with existing coin economy and clutters UI | Single coin per correct answer, consistent with all other games |
| Hint system with progressively revealed clues | Requested for difficult items (detrás, entre) | Significant implementation complexity; adds a new UI state machine; confusing when hint reveals undermine the spatial learning goal | Skip button (matches existing pattern); on skip, animate object to correct zone to teach by demonstration |
| Separate "learn" mode before "practice" mode | Seems pedagogically sound | This is a vocabulary app, not a course; users already know the German translation from words.tsv; the game IS the learning | Show both Spanish + German on the prompt card during play — reinforcement is the goal, not blank-slate discovery |
| Multi-object drag (place cat, ball, car simultaneously) | More complex = more impressive | Multiple draggables on a 375px screen creates chaos; increases touch event complexity and object identity confusion | Single draggable object, cycle through prompts |

---

## Feature Dependencies

```
Discrete drop zones (CSS absolute positioning)
    └──required by──> Correct-drop snap behavior
    └──required by──> Wrong-drop return behavior
    └──required by──> Progress advancement

Touch drag implementation (touchstart/touchmove/touchend)
    └──required by──> Mobile usability (table stakes)

SharedUtils.playSuccessSound / playErrorSound
    └──already exists──> Zero cost

CoinTracker.addCoin()
    └──already exists──> Zero cost

SharedUtils.shuffleArray()
    └──already exists──> Preposition order randomization

Spanish TTS pronunciation (differentiator)
    └──depends on──> Web Speech API (already used in tapvocab.js)
    └──required by──> On-prompt audio

3D scene / near-far rings (differentiators)
    └──required by──> Visually discriminable "detrás de" and "cerca de"
    └──enables──> All 11 zones being meaningfully distinct

"entre" two-box scene
    └──requires──> A second reference element in the DOM scene
```

### Dependency Notes

- **Touch drag requires custom implementation:** The HTML5 Drag and Drop API does NOT fire on mobile touch. This is the single biggest technical dependency. A custom pointer event handler (`pointerdown`/`pointermove`/`pointerup` with `setPointerCapture`) is the correct approach — it unifies mouse and touch without two separate code paths.
- **Drop zone positions depend on scene design:** Scene layout must be decided before drop zone coordinates are hardcoded. Changing the scene later requires updating all zone position constants.
- **"detrás de" and "entre" require scene elements:** These two prepositions cannot be represented by zones alone — they need additional scene objects (back-face visual for detrás, second box for entre). These are scene requirements, not just zone requirements.
- **Progress advancement requires "try again" decision:** If wrong drops do NOT advance (recommended), the state machine is simpler — only correct drops trigger `currentIndex++`. Skip is the escape hatch.

---

## MVP Definition

### Launch With (v1 — this milestone)

- [ ] Single draggable object (ball emoji or simple div) — why essential: without a draggable, no game
- [ ] Reference box centered in scene — why essential: spatial prepositions are meaningless without an anchor
- [ ] 11 discrete drop zones, visually positioned to match each preposition — why essential: core game mechanic
- [ ] Pointer event drag (mouse + touch via `pointerdown`/`pointermove`/`pointerup`) — why essential: mobile is primary platform
- [ ] 3D-perspective box OR visual treatment for "detrás de" — why essential: without it, "behind" cannot be taught and the game is incomplete for that preposition
- [ ] Two reference boxes OR visual treatment for "entre" — why essential: "between" requires two anchors
- [ ] Near/beside visual discrimination (distance rings or zone labels) — why essential: cerca de vs. al lado de is the known ambiguity problem; the game is wrong without solving it
- [ ] Prompt card showing Spanish preposition + German translation — why essential: this is the learning content
- [ ] Correct drop: snap + `playSuccessSound()` + `confettiBurst(30)` + `CoinTracker.addCoin()` — why essential: consistent with all other games
- [ ] Wrong drop: shake animation + `playErrorSound()` + snap back to origin — why essential: feedback required
- [ ] Progress badge (X / 11) — why essential: learner orientation
- [ ] Skip button + completion state — why essential: escape hatch when stuck; end state teaches by demonstration
- [ ] Back/Home navigation — why essential: established app pattern
- [ ] Home screen button ("📍 Locations") in index.html below "Fill in" button — why essential: entry point

### Add After Validation (v1.x)

- [ ] TTS pronunciation of preposition on prompt load — trigger: if learners report they want audio reinforcement; low cost to add
- [ ] Animate object to correct zone on Skip — trigger: if skip-without-feedback is confusing to users
- [ ] Restart / shuffle-again button at completion screen — trigger: if completion screen feels like a dead end

### Future Consideration (v2+)

- [ ] "detrás de" 3D animation showing object moving behind box — defer: requires canvas or SVG animation, significant effort
- [ ] Multiple-round scoring across sessions in localStorage — defer: coin economy already handles reward persistence
- [ ] Free-placement mode for advanced learners — defer: explicitly an anti-feature at MVP; reassess if user demand is clear

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Pointer-based drag (mouse + touch) | HIGH | MEDIUM | P1 |
| 11 drop zones correctly positioned | HIGH | MEDIUM | P1 |
| Correct/wrong feedback (sound, snap) | HIGH | LOW | P1 |
| Prompt card (Spanish + German) | HIGH | LOW | P1 |
| Visual discriminability of cerca vs. al lado | HIGH | MEDIUM | P1 |
| Visual treatment for "detrás de" | HIGH | MEDIUM | P1 |
| Visual treatment for "entre" | HIGH | LOW | P1 |
| Progress badge | MEDIUM | LOW | P1 |
| Coin reward on correct | MEDIUM | LOW | P1 |
| Skip + completion state | MEDIUM | LOW | P1 |
| Back/Home navigation | MEDIUM | LOW | P1 |
| TTS pronunciation on prompt | MEDIUM | LOW | P2 |
| Animate object to zone on Skip | MEDIUM | LOW | P2 |
| Restart button at completion | LOW | LOW | P2 |
| Free-placement judging | LOW | HIGH | P3 (anti-feature) |
| All zones labeled simultaneously | LOW | HIGH | P3 (anti-feature) |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have / anti-feature — defer or avoid

---

## Existing SharedUtils / CoinTracker Dependencies (Integration Points)

These existing module calls require NO new code — just invoking what already exists:

| Game Event | Call | Module |
|------------|------|--------|
| Correct drop — sound | `SharedUtils.playSuccessSound()` | shared-utils.js |
| Correct drop — confetti | `SharedUtils.confettiBurst(30)` | shared-utils.js |
| Correct drop — emoji pop | `SharedUtils.showSuccessAnimation()` | shared-utils.js |
| Correct drop — coin | `CoinTracker.addCoin()` | coins.js |
| Wrong drop — sound | `SharedUtils.playErrorSound()` | shared-utils.js |
| Shuffle preposition order | `SharedUtils.shuffleArray(prepositions)` | shared-utils.js |

Script load order for `locations.html` must follow established convention:
```
coins.js → shared-utils.js → locations.js
```
No `game-init.js` needed (this is a learning game, not a mini-game requiring lives).

---

## Mobile Touch Design Notes

**The HTML5 Drag and Drop API does not fire touch events on iOS or Android.** This is a known, non-negotiable constraint.

Use the Pointer Events API instead:
- `pointerdown` to start drag (captures pointer via `element.setPointerCapture(event.pointerId)`)
- `pointermove` to reposition object
- `pointerup` to release and test drop zone collision

Drop zone detection: use `getBoundingClientRect()` on each zone element and test whether the pointer's final coordinates fall within any zone's rect. This is simpler than HTML5 `dragover`/`drop` events and works identically for mouse and touch.

The draggable object must have `touch-action: none` in CSS to prevent the browser scroll gesture from competing with the drag.

Minimum zone size must be 44x44px per the app's own accessibility standard, but zones should be larger where possible — 60x60px is recommended for the primary positions.

---

## Sources

- Codebase inspection: `/home/desire/tap-to-vocab/tap-to-vocab/assets/js/shared-utils.js`, `fill-blank.js`, `coins.js` (direct read — HIGH confidence)
- Project spec: `/home/desire/tap-to-vocab/.planning/PROJECT.md` (direct read — HIGH confidence)
- Pointer Events API behavior on mobile: established web standard, widely documented (HIGH confidence — no WebSearch needed)
- HTML5 DnD API mobile limitation: well-known browser behavior, documented in MDN (HIGH confidence)
- Spatial preposition pedagogy (one-at-a-time prompting, movement-encodes-meaning): established ESL instructional design principle (MEDIUM confidence — training knowledge, no external verification available)

---

*Feature research for: Tap-to-Vocab v1.4 Locations — spatial prepositions drag-and-drop game*
*Researched: 2026-03-14*
