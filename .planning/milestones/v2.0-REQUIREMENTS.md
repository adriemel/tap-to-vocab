# Requirements: Tap-to-Vocab

**Defined:** 2026-04-12
**Core Value:** Every interaction must work correctly and feel polished so nothing interrupts the learning flow.

## v2.0 Requirements

### Chat Interface

- [ ] **CHAT-01**: User can access "Quién soy yo" from the home screen (button below "Qué número es?")
- [ ] **CHAT-02**: Chat screen opens showing the first question in a left-aligned grey bubble
- [ ] **CHAT-03**: Two answer-choice buttons appear at the bottom of the screen for each question
- [ ] **CHAT-04**: Tapping a choice appends the chosen answer as a right-aligned colored bubble
- [ ] **CHAT-05**: After a short delay, the next question appears as a new left bubble
- [ ] **CHAT-06**: Chat scroll follows the latest bubble so content stays visible

### Audio (TTS)

- [ ] **AUDIO-01**: TTS reads the question aloud when it appears on the left
- [ ] **AUDIO-02**: TTS reads the chosen answer aloud after it appears on the right

### End Screen

- [ ] **END-01**: After all questions are answered, an end screen appears with "¡Muy bien!" header
- [ ] **END-02**: End screen displays the full introduction as one flowing paragraph (all chosen answers in order, ending with "¡Muchas gracias por escuchar!")
- [ ] **END-03**: TTS reads the complete paragraph automatically when the end screen loads
- [ ] **END-04**: "Replay" button re-reads the paragraph aloud
- [ ] **END-05**: "Start again" button resets the conversation to the first question
- [ ] **END-06**: "Home" button navigates to index.html

### Data

- [ ] **DATA-01**: Questions, 2 choice labels, and full answer texts are loaded from quien-soy-sentences.txt at runtime

## Out of Scope for v2.0

| Feature | Reason |
|---------|--------|
| Coin rewards | No scoring mechanic — pure practice mode |
| Score / accuracy tracking | No right/wrong answers — both choices are valid self-introductions |
| Timers | Explicitly excluded per spec |
| Editing answers after selection | Adds complexity; re-run "Start again" is sufficient |

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
| CHAT-01 | Phase 19 | Pending |
| CHAT-02 | Phase 19 | Pending |
| CHAT-03 | Phase 19 | Pending |
| CHAT-04 | Phase 19 | Pending |
| CHAT-05 | Phase 19 | Pending |
| CHAT-06 | Phase 19 | Pending |
| AUDIO-01 | Phase 19 | Pending |
| AUDIO-02 | Phase 19 | Pending |
| END-01 | Phase 19 | Pending |
| END-02 | Phase 19 | Pending |
| END-03 | Phase 19 | Pending |
| END-04 | Phase 19 | Pending |
| END-05 | Phase 19 | Pending |
| END-06 | Phase 19 | Pending |
| DATA-01 | Phase 19 | Pending |
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
- v2.0 requirements: 15 total
- Mapped to phases: 15 (Phase 19: all)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-05-08 — v2.0 requirements defined, Phase 19 assigned*
