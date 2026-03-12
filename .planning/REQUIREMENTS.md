# Requirements: Tap-to-Vocab

**Defined:** 2026-03-11
**Core Value:** Every interaction must work correctly and feel polished so nothing interrupts the learning flow.

## v1.3 Requirements

Requirements for Jungle Run Parrot Stomp milestone.

### Stomp Mechanic

- [ ] **STOMP-01**: When monkey is falling (velY > 0) and lands on top of a parrot, the parrot is destroyed and monkey bounces upward — no game over
- [ ] **STOMP-02**: When monkey collides with a parrot from the side or head-on (not from above while falling), game over triggers as before
- [ ] **STOMP-03**: After stomping a parrot, monkey receives an upward velocity boost (bounce) allowing continued running
- [ ] **STOMP-04**: Stomping a parrot plays distinct audio feedback and shows particle explosion at parrot location

## v1.2 Requirements

Requirements for milestone v1.2 — Browse Mode Layout Fix.

### UI — Browse Mode

- [x] **BRWS-01**: User sees all browse mode controls in two rows on topic.html at 375px — row 1 has Prev/Next/Show/Star, row 2 has Home/Hear — with no overflow or clipping

## v1.1 Requirements

Requirements for milestone v1.1 — Mobile Polish & Bug Fix.

### UI — Mobile Layout

- [x] **UI-01**: User sees adequate visual separation between header and game panel on sentences.html at 375px
- [x] **UI-02**: User sees Prev/Reset/Next/Home in a single nav row on sentences.html (Home displays 🏠 icon only)
- [x] **UI-03**: User sees Verb Conjugation header (gear + title + coin badge + count) in one row at 375px with no wrapping
- [x] **UI-04**: User sees Prev/Reset/Next/Home in a single nav row on conjugation.html (Home displays 🏠 icon only)

### Bug — Verb Conjugation

- [x] **BUG-01**: User can switch Practice → Show → Practice → Show and see verb conjugations displayed correctly each time

## v2 Requirements

Deferred from v1.0 for future milestones.

### Performance

- **PERF-01**: TSV caching with revalidation strategy instead of cache: "no-store"
- **PERF-02**: Service worker for offline fallback

### Coin Economy

- **COIN-01**: Coin economy upper cap — prevent unrealistic accumulation
- **COIN-02**: User state using stable IDs (not text strings) — survives vocabulary edits

## Out of Scope

| Feature | Reason |
|---------|--------|
| New game modes | Quality-first — fix existing before expanding |
| ESM modules / build pipeline | Migration cost not justified for project size |
| Authentication / user accounts | By design, single-user public app |
| In-game score connection to CoinTracker | Deferred — not in this milestone scope |
| Coin reward for stomping | Coin economy not connected to in-game score yet |
| Stomp combo multiplier | Not requested — defer to future |
| New enemy types | Out of scope — focus on parrot stomp only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| STOMP-01 | Phase 7 | Pending |
| STOMP-02 | Phase 7 | Pending |
| STOMP-03 | Phase 7 | Pending |
| STOMP-04 | Phase 7 | Pending |
| BRWS-01 | Phase 6 | Complete |
| UI-01 | Phase 5 | Complete |
| UI-02 | Phase 5 | Complete |
| UI-03 | Phase 5 | Complete |
| UI-04 | Phase 5 | Complete |
| BUG-01 | Phase 5 | Complete |

**Coverage:**
- v1.3 requirements: 4 total
- Mapped to phases: 4
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-12 after v1.3 milestone started*
