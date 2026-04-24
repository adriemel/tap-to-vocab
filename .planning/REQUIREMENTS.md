# Requirements: Tap-to-Vocab

**Defined:** 2026-04-12
**Core Value:** Every interaction must work correctly and feel polished so nothing interrupts the learning flow.

## v1.8 Requirements

### Vocabulary Data

- [x] **DATA-01**: words.tsv contains the latest vocabulary entries added by the user — pulled from remote in v1.8 kickoff (59 new entries, commit 1a4af40)
- [ ] **DATA-02**: verbs.tsv contains 6 new verbs with full conjugation tables: saber, hacer, beber, vivir, entender, comer

### Sentence Builder Settings

- [ ] **SENT-01**: Build Sentences settings panel lets the user filter by category (e.g. Unidad3, Unidad4, Palabras) rather than toggling individual sentences — all sentences in a checked category are included; unchecked categories are excluded

## v1.7 Requirements (Complete)

### Stats Fix

- [x] **STAT-FIX-01**: In Build Sentences, each correct word click increments the correct count individually (not once per completed sentence), matching the per-interaction counting behavior of Fill-in-Blank, Conjugation, and Locations — Phase 14

## v1.6 Requirements (Complete)

### Statistics

- [x] **STATS-01**: User sees correct/incorrect counts and accuracy % tracked live in Build Sentences, Verbs, Fill-in-Blank, and Locations modes — Phase 13
- [x] **STATS-02**: Each of those four modes has a "Statistics" button visible during the session that opens the stats board — Phase 13
- [x] **STATS-03**: Stats board auto-displays at the end of a session (all exercises completed) showing final correct/incorrect and accuracy % — Phase 13
- [x] **STATS-04**: Session stats reset at the start of each new round (no localStorage persistence) — Phase 13

### Homepage

- [x] **HOME-01**: "Tiempo" and "Idiomas" vocabulary categories displayed under the "Palabras" section on the homepage — Phase 12

### Visual

- [x] **VIS-01**: Overall page background color slightly lighter than current dark blue (applied globally via CSS variable) — Phase 12

## Future Requirements

### Statistics (deferred)

- **STATS-F01**: Cumulative all-time stats persisted in localStorage (total correct, total incorrect across all sessions)
- **STATS-F02**: Per-item breakdown showing which specific words/verbs/sentences were answered incorrectly
- **STATS-F03**: Streak tracking (consecutive correct answers without a mistake)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Shuffle audit/fix | Already implemented across all modes in prior commits |
| Stats across modes (global leaderboard) | Each mode is independent; cross-mode aggregation adds complexity without clear learning value |
| Animated stats charts | Simple numeric display sufficient; charts are visual polish for future |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | — | Complete (pulled from remote) |
| DATA-02 | Phase 15 | Pending |
| SENT-01 | Phase 16 | Pending |
| STAT-FIX-01 | Phase 14 | Complete |
| HOME-01 | Phase 12 | Complete |
| VIS-01 | Phase 12 | Complete |
| STATS-01 | Phase 13 | Complete |
| STATS-02 | Phase 13 | Complete |
| STATS-03 | Phase 13 | Complete |
| STATS-04 | Phase 13 | Complete |

**Coverage:**
- v1.8 requirements: 3 total (1 already complete)
- Mapped to phases: 2 pending (Phase 15, Phase 16)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-24 after v1.8 roadmap created (phases 15-16 assigned)*
