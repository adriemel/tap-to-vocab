# Requirements: Tap-to-Vocab

**Defined:** 2026-03-11
**Core Value:** Every interaction must work correctly and feel polished so nothing interrupts the learning flow.

## v1.2 Requirements

Requirements for milestone v1.2 — Browse Mode Layout Fix.

### UI — Browse Mode

- [ ] **BRWS-01**: User sees all browse mode controls in two rows on topic.html at 375px — row 1 has Prev/Next/Show/Star, row 2 has Home/Hear — with no overflow or clipping

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

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BRWS-01 | Phase 6 | Pending |
| UI-01 | Phase 5 | Complete |
| UI-02 | Phase 5 | Complete |
| UI-03 | Phase 5 | Complete |
| UI-04 | Phase 5 | Complete |
| BUG-01 | Phase 5 | Complete |

**Coverage:**
- v1.2 requirements: 1 total
- Mapped to phases: 1
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-11 after v1.2 milestone started*
