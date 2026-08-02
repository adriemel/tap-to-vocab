# Requirements: Tap-to-Vocab

**Defined:** 2026-04-12
**Core Value:** Every interaction must work correctly and feel polished so nothing interrupts the learning flow.

## v2.1 Requirements

### Clock UI

- [ ] **HORA-01**: User can access "Qué hora es?" from the home screen (button below "Quién soy yo")
- [ ] **HORA-02**: Clock page shows two vertical dials — hour (00–23) and minute (5-minute steps: 00, 05, 10 ... 55)
- [ ] **HORA-03**: Dragging a dial up or down changes its value, like setting an alarm on a smartwatch

### Spanish Phrase & Audio

- [ ] **HORA-04**: "Qué hora es?" button displays the Spanish phrase for the currently set time
- [ ] **HORA-05**: "Qué hora es?" button speaks the Spanish phrase aloud via TTS
- [ ] **HORA-06**: Phrasing follows traditional Spanish time-telling conventions (Es la una / Son las..., y cuarto, y media, menos cuarto, menos veinte, etc. — not literal digit reading)
- [ ] **HORA-07**: Phrase includes de la mañana / de la tarde / de la noche, derived from the 24h hour
- [ ] **HORA-08**: "Repeat" button re-speaks the last phrase without changing the dial values
- [ ] **HORA-09**: Changing either dial and pressing "Qué hora es?" again produces and speaks the phrase for the new time

## Out of Scope for v2.1

| Feature | Reason |
|---------|--------|
| Coin rewards | No scoring mechanic — pure practice mode |
| Score / accuracy / stats tracking | No right/wrong answers — this is a reference/practice tool, not a quiz |
| Quiz mode (app shows target time, user must set it) | Deferred — v1 is set-and-hear only |
| 1-minute granularity | 5-minute steps match how Spanish time is taught and keep phrasing natural |
| Literal digital phrasing ("las tres treinta") | Traditional phrasing chosen as more authentic to how Spanish speakers talk |

## v2.0 Requirements (Complete)

### Chat Interface

- [x] **CHAT-01**: User can access "Quién soy yo" from the home screen (button below "Qué número es?") — Phase 19
- [x] **CHAT-02**: Chat screen opens showing the first question in a left-aligned grey bubble — Phase 19
- [x] **CHAT-03**: Two answer-choice buttons appear at the bottom of the screen for each question — Phase 19
- [x] **CHAT-04**: Tapping a choice appends the chosen answer as a right-aligned colored bubble — Phase 19
- [x] **CHAT-05**: After a short delay, the next question appears as a new left bubble — Phase 19
- [x] **CHAT-06**: Chat scroll follows the latest bubble so content stays visible — Phase 19

### Audio (TTS)

- [x] **AUDIO-01**: TTS reads the question aloud when it appears on the left — Phase 19
- [x] **AUDIO-02**: TTS reads the chosen answer aloud after it appears on the right — Phase 19

### End Screen

- [x] **END-01**: After all questions are answered, an end screen appears with "¡Muy bien!" header — Phase 19
- [x] **END-02**: End screen displays the full introduction as one flowing paragraph (all chosen answers in order, ending with "¡Muchas gracias por escuchar!") — Phase 19
- [x] **END-03**: TTS reads the complete paragraph automatically when the end screen loads — Phase 19
- [x] **END-04**: "Replay" button re-reads the paragraph aloud — Phase 19
- [x] **END-05**: "Start again" button resets the conversation to the first question — Phase 19
- [x] **END-06**: "Home" button navigates to index.html — Phase 19

### Data

- [x] **DATA-01**: Questions, 2 choice labels, and full answer texts are loaded from quien-soy-sentences.txt at runtime — Phase 19

### Bug Fixes (Phases 20-21)

- [x] **FIX-TTS**: Fix TTS race condition on first question — Phase 20
- [x] **FIX-SKIP**: Add missing skip button — Phase 20
- [x] **FIX-SCROLL**: Fix mobile scroll/bubble overlap — Phase 20
- [x] **FIX-ENDSCREEN**: Fix end-screen button layout on small screens — Phase 20
- [x] **FIX-TYPO**: Fix data file typo (tambien → también) — Phase 20
- [x] **FIX-IOS-TTS**: Fix iOS-specific first-question TTS silence — Phase 21

Full details: `.planning/milestones/v2.0-REQUIREMENTS.md`

## v1.9 Requirements (Complete)

### Numbers Feature

- [x] **NUM-01**: User can tap "Qué número es?" button on the home screen — Phase 17
- [x] **NUM-02**: Numbers hub page shows 5 range selector buttons: 1-20, 21-40, 41-60, 61-80, 81-100 — Phase 17
- [x] **NUM-03**: Tapping a range opens a learning page showing number/Spanish pairs — Phase 17
- [x] **NUM-04**: Learning page has "Take a Test" button linking to the quiz page — Phase 17
- [x] **NUM-05**: Quiz page displays all numbers in range as a tap-to-flip card grid — Phase 18
- [x] **NUM-06**: Tapping a card flips it to reveal the Spanish word — Phase 18
- [x] **NUM-07**: When a card flips, TTS speaks the Spanish word aloud — Phase 18
- [x] **NUM-08**: Every numbers page has Home + "Back to Numbers" navigation — Phase 17

## v1.8 Requirements (Complete)

### Vocabulary Data

- [x] **DATA-02**: verbs.tsv has 6 new verbs with full conjugations: saber, hacer, beber, vivir, entender, comer — Phase 15

### Sentence Builder Settings

- [x] **SENT-01**: Build Sentences settings panel lets the user filter by category — Phase 16

## v1.7 Requirements (Complete)

### Stats Fix

- [x] **STAT-FIX-01**: In Build Sentences, each correct word click increments correct count individually — Phase 14

## v1.6 Requirements (Complete)

### Statistics

- [x] **STATS-01**: User sees correct/incorrect counts and accuracy % in all four learning modes — Phase 13
- [x] **STATS-02**: Each mode has a "Statistics" button visible during the session — Phase 13
- [x] **STATS-03**: Stats board auto-displays at session end — Phase 13
- [x] **STATS-04**: Session stats reset at the start of each new round — Phase 13

### Homepage

- [x] **HOME-01**: "Tiempo" and "Idiomas" categories displayed under the "Palabras" section — Phase 12

## Future Requirements

### Statistics (deferred)

- **STATS-F01**: Cumulative all-time stats persisted in localStorage
- **STATS-F02**: Per-item breakdown showing which words were answered incorrectly
- **STATS-F03**: Streak tracking

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HORA-01 | Phase 22 | Pending |
| HORA-02 | Phase 22 | Pending |
| HORA-03 | Phase 22 | Pending |
| HORA-04 | Phase 22 | Pending |
| HORA-05 | Phase 22 | Pending |
| HORA-06 | Phase 22 | Pending |
| HORA-07 | Phase 22 | Pending |
| HORA-08 | Phase 22 | Pending |
| HORA-09 | Phase 22 | Pending |
| CHAT-01 | Phase 19 | Complete |
| CHAT-02 | Phase 19 | Complete |
| CHAT-03 | Phase 19 | Complete |
| CHAT-04 | Phase 19 | Complete |
| CHAT-05 | Phase 19 | Complete |
| CHAT-06 | Phase 19 | Complete |
| AUDIO-01 | Phase 19 | Complete |
| AUDIO-02 | Phase 19 | Complete |
| END-01 | Phase 19 | Complete |
| END-02 | Phase 19 | Complete |
| END-03 | Phase 19 | Complete |
| END-04 | Phase 19 | Complete |
| END-05 | Phase 19 | Complete |
| END-06 | Phase 19 | Complete |
| DATA-01 | Phase 19 | Complete |
| FIX-TTS | Phase 20 | Complete |
| FIX-SKIP | Phase 20 | Complete |
| FIX-SCROLL | Phase 20 | Complete |
| FIX-ENDSCREEN | Phase 20 | Complete |
| FIX-TYPO | Phase 20 | Complete |
| FIX-IOS-TTS | Phase 21 | Complete |
| NUM-01 | Phase 17 | Complete |
| NUM-02 | Phase 17 | Complete |
| NUM-03 | Phase 17 | Complete |
| NUM-04 | Phase 17 | Complete |
| NUM-05 | Phase 18 | Complete |
| NUM-06 | Phase 18 | Complete |
| NUM-07 | Phase 18 | Complete |
| NUM-08 | Phase 17 | Complete |
| DATA-02 | Phase 15 | Complete |
| SENT-01 | Phase 16 | Complete |
| STAT-FIX-01 | Phase 14 | Complete |
| HOME-01 | Phase 12 | Complete |
| STATS-01 | Phase 13 | Complete |
| STATS-02 | Phase 13 | Complete |
| STATS-03 | Phase 13 | Complete |
| STATS-04 | Phase 13 | Complete |

**Coverage:**
- v2.1 requirements: 9 total
- Mapped to phases: 9 (Phase 22: all)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-08-02 — v2.1 requirements defined, Phase 22 assigned*
