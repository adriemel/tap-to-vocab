# Requirements: Tap-to-Vocab

**Defined:** 2026-04-12
**Core Value:** Every interaction must work correctly and feel polished so nothing interrupts the learning flow.

## v1.9 Requirements

### Numbers Feature

- [ ] **NUM-01**: User can tap "Qué número es?" button on the home screen (positioned between Locations and Play Games) to reach the numbers hub
- [ ] **NUM-02**: Numbers hub page shows 5 range selector buttons stacked vertically: 1-20, 21-40, 41-60, 61-80, 81-100
- [ ] **NUM-03**: Tapping a range button opens a learning page showing every number in that range paired with its Spanish word (e.g. "1 — uno", "2 — dos")
- [ ] **NUM-04**: Learning page has a "Take a Test" button that navigates to the quiz page for the same range
- [ ] **NUM-05**: Quiz page displays all numbers in the selected range as a tap-to-flip card grid (4 columns, matching WhichNumberQuizz.png layout)
- [ ] **NUM-06**: Tapping a number card flips it to reveal the Spanish word for that number
- [ ] **NUM-07**: When a number card flips, the Spanish TTS voice speaks the Spanish word aloud
- [ ] **NUM-08**: Every numbers page (hub, learning, quiz) has a "Home" button linking to index.html and a "Back to Numbers" button linking back to the hub page

## Out of Scope for v1.9

| Feature | Reason |
|---------|--------|
| Coin rewards for correct quiz answers | Numbers is a passive explore/learn feature; coin economy reserved for active game modes |
| Shuffle / random order quiz | Fixed grid order matches learning page — easier orientation for beginners |
| Score tracking for numbers quiz | Simple flip-and-listen; stats board not needed for this format |

## v1.8 Requirements (Complete)

### Vocabulary Data

- [x] **DATA-01**: words.tsv contains the latest vocabulary entries added by the user — pulled from remote in v1.8 kickoff (59 new entries, commit 1a4af40)
- [x] **DATA-02**: verbs.tsv contains 6 new verbs with full conjugation tables: saber, hacer, beber, vivir, entender, comer — Phase 15

### Sentence Builder Settings

- [x] **SENT-01**: Build Sentences settings panel lets the user filter by category rather than toggling individual sentences — Phase 16

## v1.7 Requirements (Complete)

### Stats Fix

- [x] **STAT-FIX-01**: In Build Sentences, each correct word click increments the correct count individually — Phase 14

## v1.6 Requirements (Complete)

### Statistics

- [x] **STATS-01**: User sees correct/incorrect counts and accuracy % tracked live in all four learning modes — Phase 13
- [x] **STATS-02**: Each mode has a "Statistics" button visible during the session — Phase 13
- [x] **STATS-03**: Stats board auto-displays at session end — Phase 13
- [x] **STATS-04**: Session stats reset at the start of each new round — Phase 13

### Homepage

- [x] **HOME-01**: "Tiempo" and "Idiomas" categories displayed under the "Palabras" section — Phase 12

### Visual

- [x] **VIS-01**: Overall background slightly lighter (CSS variable) — Phase 12

## Future Requirements

### Statistics (deferred)

- **STATS-F01**: Cumulative all-time stats persisted in localStorage
- **STATS-F02**: Per-item breakdown showing which words were answered incorrectly
- **STATS-F03**: Streak tracking

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| NUM-01 | Phase 17 | Pending |
| NUM-02 | Phase 17 | Pending |
| NUM-03 | Phase 17 | Pending |
| NUM-04 | Phase 17 | Pending |
| NUM-05 | Phase 18 | Pending |
| NUM-06 | Phase 18 | Pending |
| NUM-07 | Phase 18 | Pending |
| NUM-08 | Phase 17 | Pending |
| DATA-01 | — | Complete |
| DATA-02 | Phase 15 | Complete |
| SENT-01 | Phase 16 | Complete |
| STAT-FIX-01 | Phase 14 | Complete |
| HOME-01 | Phase 12 | Complete |
| VIS-01 | Phase 12 | Complete |
| STATS-01 | Phase 13 | Complete |
| STATS-02 | Phase 13 | Complete |
| STATS-03 | Phase 13 | Complete |
| STATS-04 | Phase 13 | Complete |

**Coverage:**
- v1.9 requirements: 8 total
- Mapped to phases: 8 (Phase 17: NUM-01,02,03,04,08 | Phase 18: NUM-05,06,07)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-28 — v1.9 roadmap created, phases 17-18 assigned*
