# Tap-to-Vocab

## What This Is

Tap-to-Vocab is a Spanish vocabulary learning web app deployed as a static site on GitHub Pages at tapvocab.fun. It offers multiple practice modes — vocab browse/quiz, sentence building, verb conjugation, fill-in-blank exercises, a drag-and-drop locations game, a numbers flip-card quiz, a WhatsApp-style self-introduction chat simulator, and a drag-dial time-telling practice tool — plus a coin-reward system with mini-games. Vocabulary is reached through two home-screen entry points, 📚 Topics (9 themes aggregated across unidades via a `topics` column) and 📖 Unidades (5 school units). No backend, no framework, no build step. As of v1.0, the app is fully audited, all known bugs are fixed, and every page uses a consistent dark theme and mobile layout.

## Core Value

Every interaction must work correctly and feel polished so nothing interrupts the learning flow. Bugs and inconsistency erode trust in a learning tool.

## Requirements

### Validated

- ✓ Vocabulary browsing by category with Spanish TTS pronunciation — existing
- ✓ Quiz mode with flip cards and coin rewards — existing
- ✓ Sentence building game — existing
- ✓ Verb conjugation practice — existing
- ✓ Fill-in-blank grammar exercises — existing
- ✓ Coin economy (earn, spend, track via localStorage) — existing
- ✓ Games hub with 3 mini-games (Coin Dash, Jungle Run, Tower Stack) — existing
- ✓ Shared utilities (SharedUtils, CoinTracker) — existing
- ✓ Multi-page static site, zero external dependencies — existing
- ✓ All pages audited for broken functionality and mobile layout issues — v1.0
- ✓ All medium/high severity bugs fixed (coin refund, iOS voice, game lives, favicon, localStorage) — v1.0
- ✓ Duplicated TSV parsing consolidated (SharedUtils.loadTSV) — v1.0
- ✓ Consistent visual style across all pages using CSS variables — v1.0
- ✓ Navigation clarity — every page has back or home control — v1.0
- ✓ Mobile/responsive layout verified correct on all pages at 375px — v1.0
- ✓ 44px minimum tap targets on all learning interaction buttons — v1.0
- ✓ CLAUDE.md updated to accurately reflect current architecture — v1.0
- ✓ Mobile layout fixed on sentences.html and conjugation.html at 375px — v1.1
- ✓ Show mode regression in verb conjugation repaired — v1.1
- ✓ Browse mode button layout restored to two-row layout at 375px — v1.2
- ✓ Parrot stomp mechanic added to Jungle Run (fall-from-above kills parrot, bounces monkey) — v1.3
- ✓ Stomp collision discrimination: side/head-on still triggers game over — v1.3
- ✓ Distinct stomp audio and particle explosion feedback — v1.3
- ✓ Locations drag-and-drop game (locations.html + locations.js) with Pointer Events API — v1.4
- ✓ 9 spatial drop zones around reference box with detrás-de depth cue and distance band — v1.4
- ✓ Game loop: 10-exercise sequence, success/error feedback, coin awards, progress badge, completion screen — v1.4
- ✓ Locations button on home screen — v1.4
- ✓ Locations prompt shows Spanish-only — German translation hidden (LOC-01) — v1.5
- ✓ delante-de drop zone correctly positioned without overlapping debajo-de (LOC-02) — v1.5
- ✓ debajo-de blob given isometric perspective tilt (skewX -34deg) for visual depth — v1.5

- ✓ Statistics board (correct/incorrect + accuracy %) in all four learning modes — v1.6
- ✓ Statistics button in each mode, auto-shown at session end — v1.6
- ✓ Homepage: "Tiempo" and "Idiomas" moved under "Palabras" section — v1.6
- ✓ Shuffle verified in all learning modes — v1.6
- ✓ Build Sentences stats: correct taps count per word click, not per completed sentence (STAT-FIX-01) — v1.7

### Active

<!-- v2.2 shipped — next milestone requirements are defined by /gsd:new-milestone -->

(none — see Next Milestone Goals below for candidates)

### Validated (v2.2)

- ✓ Unidad 5B vocabulary browsable and quizzable — 27 headwords (DATA-03) — v2.2
- ✓ Unidad 5B example sentences in Build Sentences as a `Unidad5B` checkbox — 17 sentences (DATA-04) — v2.2
- ✓ `words.tsv` `topics` column read by header name; missing column/cell loads cleanly (DATA-05) — v2.2
- ✓ Palabras partitioned into topics, leftovers keep `topics: Palabras` (TAG-01) — v2.2
- ✓ Unidad words keep their unidad and gain a topic tag (TAG-02) — v2.2
- ✓ Colores, Animales, Numeros, Saludar, Casa y Familia self-tagged (TAG-03) — v2.2
- ✓ Calendario, Comida y Bebida and Escuela topics populated (TAG-04/05/06) — v2.2
- ✓ Home screen reduced to 📚 Topics / 📖 Unidades plus the unchanged tool row (NAV-01, NAV-02) — v2.2
- ✓ Topics (9) and Unidades (5) sub-screens with Home + coin counter, navigating into `topic.html` (NAV-03/04/05) — v2.2
- ✓ A topic shows every word tagged with it, once, whichever unidad it came from (NAV-06) — v2.2
- ✓ Practice-list entries survive the re-tagging — all 708 pre-phase pairs proven (NAV-07) — v2.2

### Validated (v2.1)

- ✓ User can access "Qué hora es?" from home screen below "Quién soy yo" (HORA-01) — v2.1
- ✓ Clock UI has two vertical dials: hour (00–23) and minute (5-minute steps) (HORA-02) — v2.1
- ✓ Dragging a dial up/down changes its value like a smartwatch alarm picker (HORA-03) — v2.1
- ✓ "Qué hora es?" button displays the Spanish phrase for the set time (HORA-04) — v2.1
- ✓ "Qué hora es?" button speaks the Spanish phrase aloud via TTS (HORA-05) — v2.1
- ✓ Spanish phrasing follows traditional time-telling conventions (y cuarto, y media, menos cuarto/veinte, Es la una / Son las...) (HORA-06) — v2.1
- ✓ Spoken/displayed phrase includes de la mañana/tarde/noche based on the 24h hour (HORA-07) — v2.1
- ✓ "Repeat" button re-speaks the last phrase without changing the time (HORA-08) — v2.1
- ✓ Changing dials and pressing "Qué hora es?" again produces a new phrase for the new time (HORA-09) — v2.1

### Validated (v2.0)

- ✓ User can access "Quién soy yo" from home screen below "Qué número es?" (QSY-01) — v2.0
- ✓ Chat screen shows WhatsApp-style left (grey) bubbles for questions (QSY-02) — v2.0
- ✓ Each question presents 2 answer-choice buttons at the bottom (QSY-03) — v2.0
- ✓ Tapping a choice makes the answer appear as a right (colored) bubble (QSY-04) — v2.0
- ✓ TTS reads the question aloud when it appears on the left (QSY-05) — v2.0
- ✓ TTS reads the chosen answer aloud after it appears on the right (QSY-06) — v2.0
- ✓ End screen displays the full introduction as one flowing paragraph (QSY-07) — v2.0
- ✓ TTS reads the complete introduction on end screen automatically (QSY-08) — v2.0
- ✓ End screen has Replay, Start Again, and Home buttons (QSY-09) — v2.0
- ✓ Question/choice/answer data loaded from quien-soy-sentences.txt (QSY-10) — v2.0

### Validated (v1.9)

- ✓ User can access "Qué número es?" from home screen (NUM-01) — v1.9
- ✓ Numbers hub page with 5 range buttons 1-20…81-100 (NUM-02) — v1.9
- ✓ Learning page per range showing number/Spanish pairs (NUM-03) — v1.9
- ✓ "Take a Test" button on learning page leads to quiz (NUM-04) — v1.9
- ✓ Quiz page shows tap-to-flip number card grid (NUM-05) — v1.9
- ✓ Flipping a card reveals the Spanish word (NUM-06) — v1.9
- ✓ TTS speaks the Spanish word when card flips (NUM-07) — v1.9
- ✓ Every numbers page has Home + Back to Numbers navigation (NUM-08) — v1.9

### Validated (v1.8)

- ✓ Add 6 new verbs to verbs.tsv with full conjugations: saber, hacer, beber, vivir, entender, comer (DATA-02) — v1.8
- ✓ Build Sentences settings: replace per-sentence toggle list with per-category checkboxes (SENT-01) — v1.8

### Out of Scope

- ESM modules / build pipeline — not worth the migration cost for this project size
- Authentication / user accounts — by design, single-user public app
- Backend or server — static-only, GitHub Pages
- Automated testing suite — not justified for project size
- Deportes y Ocio topic — proposed and declined by the user for v2.2 (kept as future candidate TAG-07)
- Build step or dependency to generate tags — tagging is a one-off data edit; project stays zero-dependency

## Context

- Stack: Vanilla HTML/CSS/JS, no framework, no build step
- Pattern: IIFE modules exporting to `window`, manual `<script>` load ordering
- Data: TSV files fetched at runtime (`cache: "no-store"`)
- State: localStorage for coins/practice list/settings; sessionStorage for game lives
- JS modules: coins.js → game-init.js (games only) → shared-utils.js → [page js]
- Known debt: in-game scores (mini-games) not connected to CoinTracker; user state keyed by text strings
- v1.0 codebase: ~6,350 LOC across 11 HTML pages + 8 JS modules + 1 CSS file
- v1.4 codebase: ~6,820 LOC — added locations.html (265 LOC) + locations.js (201 LOC)
- v2.1 codebase: ~8,600 LOC across 17 HTML pages + 12 JS modules + 1 CSS file (1,699 lines) — added hora.html + hora-phrase.js since v1.4
- All known bugs fixed; CONCERNS.md accurately reflects remaining lower-priority issues
- Game/practice-tool count: 4 mini-games (Coin Dash, Jungle Run, Tower Stack) + 6 learning tools (Sentences, Conjugation, Fill-in-Blank, Locations, Numbers Quiz, Qué Hora Es?) + 1 chat simulator (Quién Soy Yo)
- v2.2 codebase: ~8,800 LOC across 19 HTML pages + 12 JS modules + 1 CSS file (1,717 lines) — added topics.html + unidades.html; `data/words.tsv` now 752 rows with a 4th `topics` column
- Vocabulary navigation: home → 📚 Topics (`topics.html`, `?topic=`) or 📖 Unidades (`unidades.html`, `?cat=`) → `topic.html`
- v2.1 added the project's first automated test (`hora-phrase.test.js`, zero-dependency Node assert script) — scoped narrowly to the grammar engine, not a general test suite

## Constraints

- **Tech stack**: Vanilla HTML/CSS/JS only — no framework, no bundler, no Node in production
- **Deployment**: GitHub Pages static hosting — no server-side logic possible

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Audit before fixing | Don't assume scope — find all issues systematically | ✓ Good — revealed 8+ issues not previously documented |
| Keep IIFE pattern | Migration to ESM not worth cost for project size | ✓ Good — refactoring stayed clean, no friction |
| Consolidate TSV loaders into SharedUtils | Reduces duplication, single place to fix future TSV changes | ✓ Good — SharedUtils.loadTSV now generic for fill-blank + conjugation |
| scheduleMusic in loop() is correct iOS keepalive | Code review confirmed it's not a per-frame scheduling bug | ✓ Good — CONCERNS.md corrected |
| :root CSS variables inline in jungle-run.html | Linking styles.css would break full-screen canvas layout | ✓ Good — established pattern for canvas game pages |
| min-height:44px on specific button classes, not .btn globally | .btn used for compact quiz-nav-row buttons too | ✓ Good — quiz compact buttons preserved |
| home.js IIFE wraps both original script blocks | reset-coins was outside DOMContentLoaded, consolidating is safe | ✓ Good — cleaner, single listener |
| CLAUDE.md rewritten from scratch | Too many stale structural claims to safely patch in-place | ✓ Good — accurate docs for all future sessions |
| Stomp zone tolerance `pp.y + 4` (not full half-height `pp.y + 8`) | Requires deliberate jump-on-top, not accidental graze | ✓ Good — skill-based without being punishing |
| `break` after stomp collision block | Prevents multi-parrot processing in one frame | ✓ Good — no double-effects or cascade kills |
| `score++` on stomp | Simple reward for skill, consistent with banana scoring | ✓ Good — no separate bonus mechanic needed |
| Dual oscillator stomp sound (sine pop + triangle thud) | Single oscillator wasn't distinct enough from squawk | ✓ Good — audibly differentiated from death sound |
| Pointer Events API (not HTML5 DnD) for drag | HTML5 DnD API doesn't fire on iOS Safari touch | ✓ Good — single code path for mouse + touch |
| CSS-positioned divs (not canvas) for drop zones | Native touch targets, CSS transitions, no frame loop needed | ✓ Good — 44px targets easy to verify and adjust |
| Inline EXERCISES constant (not TSV) | 10 prepositions are a fixed closed set; no fetch latency | ✓ Good — zero async complexity |
| entre excluded from prepositions set | Requires two reference objects; single-box layout constraint | ✓ Good — clean MVP boundary, noted in REQUIREMENTS |
| cerca-de merged into al-lado-de zone (final) | Added separately, labeled, then merged in fix commit — labels cluttered scene and two zones confused users | ✓ Good — 9 zones cleaner than 10 in practice |
| gameHistory (not history) variable name | window.history built-in shadowing would silently break Back navigation | ✓ Good — naming discipline prevents subtle bug |
| display:none on #prompt-de (not DOM removal) | Minimal targeted change; removes German text without restructuring prompt card HTML | ✓ Good — LOC-01 fixed in one attribute change |
| Zone geometry via math comment in CSS (not magic numbers) | Self-documenting: box geometry comment shows x-center=140 calculation for delante-de left:111 | ✓ Good — future zone adjustments are reasoned not guessed |
| buildTimePhrase isolated as pure, dual-exported module with its own Node test | Traditional Spanish time grammar was the highest-correctness-risk surface (two documented pitfalls); proving it before UI was built on top de-risked everything downstream | ✓ Good — 288-state invariant sweep caught nothing, both pitfall cases passed first try |
| Reel drag as value-model (integer index + closure pixel remainder), never scroll-position-derived | Matches existing locations.js Pointer Events pattern; avoids scrollTop/overflow:auto fighting touch-action:none | ✓ Good — human-confirmed smooth on desktop mouse and phone touch |
| Repeat button sentinel-isolated in source (`// --- repeat-handler-start/end ---`) | Guarantees it can never accidentally call buildTimePhrase/getReelValue and silently drift from what's displayed (HORA-08) | ✓ Good — code review + human UAT both confirmed no recompute |
| TTS block copied from tapvocab.js's simple synchronous variant, not quien-soy.html's chained-callback variant | This page speaks exactly one static string per tap — no sequencing needed | ✓ Good — first-tap audio confirmed working on iOS via UAT |
| `topics` added as a 4th `words.tsv` column parsed by header name, blanks allowed | A file without the column or a hand-edited short row must still load; 171 example sentences legitimately carry no topic | ✓ Good — short-row crash caught in review and guarded (Phase 23) |
| Palabras partitioned into topics, Unidad words tagged additively | Palabras is a catch-all where duplicates are noise; unidades must stay complete for school test revision | ✓ Good — both behaviours verified, user-approved (Phase 23) |
| Unidad 5B transcribed by hand from textbook photos, stem-change hints stripped | Book annotations like "(ue)" would corrupt TTS and spelling practice | ✓ Good — human-approved with zero corrections (Phase 23) |
| `?topic=` kept as a separate URL param from `?cat=` (not OR-matched) | Five names exist in both columns with different row counts; merging would change what existing `?cat=` bookmarks show | ✓ Good — both params verified distinct in UAT (Phase 24) |
| Topic lists deduplicated on `es`+`de`, the practice list's word identity | `words.tsv` keeps the same word under several unidades, so topic aggregation surfaced up to 20 duplicate cards per topic (and double coins) | ✓ Good — code-review CR-01 fix, confirmed in browser (Phase 24) |
| Topics/Unidades hub pages are static hardcoded link lists, no fetch/JS module | 9 topics and 5 unidades are a closed set; adding one is a one-line HTML edit | ✓ Good — zero JS beyond coins.js on both pages (Phase 24) |
| Topics/Unidades home buttons enlarged and bolded after UAT (reversing D-02 "taller but not more prominent") | User asked for them to be more prominent once live | ✓ Good — user-approved on tapvocab.fun (Phase 24) |

### Deferred

- TSV caching with revalidation strategy instead of cache: "no-store"
- Service worker for offline fallback
- Coin economy upper cap — prevent unrealistic accumulation
- User state using stable IDs (not text strings) — survives vocabulary edits
- hora.html: shared settleTimer between the two reel-drag closures (latent bug if user drags one reel then immediately the other) — v2.1 code review
- hora.html: no keydown handler despite role="spinbutton"/aria-value* on both reels — keyboard/AT users are told arrow keys work but they don't — v2.1 code review
- hora.html: missing aria-live="polite" on #hora-phrase — v2.1 code review
- words.tsv: 5 punctuation-only near-duplicates (`,` vs `;` in `de`) still show twice in their topic — hablar, el alemán, el inglés, el español (Escuela), en (Palabras); `la casa` needs a decision — v2.2 Phase 24 review
- topic.html: headings show raw slugs (`Casa_Familia`, `Comida_Bebida`) — user accepted as-is in UAT; optional polish (24-REVIEW IN-02) — v2.2
- 24-REVIEW info items IN-01 (bogus `category` value "topic" on topic pages), IN-03 (duplicated inline styles on the two hub pages), IN-04 (Unidad 5A/5B share an emoji) — v2.2

---
## Current State

**Shipped milestone:** v2.2 Topics & Unidades — completed 2026-09-11 (Phases 23-24, 8 plans). All 16 requirements validated. The home screen now reaches vocabulary through 📚 Topics (9 themes aggregated across unidades via the new `topics` column) and 📖 Unidades (5 school units, now including Unidad 5B). Full details: `.planning/milestones/v2.2-ROADMAP.md` and `.planning/MILESTONES.md`.

**Previous:** v2.1 Qué Hora Es? — shipped 2026-08-02 (Phase 22).

## Next Milestone Goals

Not yet defined — start with `/gsd:new-milestone`. Candidates carried forward from v2.2:

- TAG-07 Deportes y Ocio topic (declined for v2.2, still a candidate)
- TAG-08 Ropa topic — needs more clothing vocabulary first
- TAG-09 Multi-topic selection
- NAV-08 Group the 9 tool/game buttons behind a third home-screen button
- New unidad content as the school course continues (add rows + one button in `unidades.html`)
- Data cleanup: the 5 `words.tsv` near-duplicates and the `la casa` decision

---
## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-11 after v2.2 milestone*
