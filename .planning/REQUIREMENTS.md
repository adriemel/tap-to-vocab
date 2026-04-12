# Requirements: Tap-to-Vocab

**Defined:** 2026-04-12
**Core Value:** Every interaction must work correctly and feel polished so nothing interrupts the learning flow.

## v1.6 Requirements

### Statistics

- [ ] **STATS-01**: User sees correct/incorrect counts and accuracy % tracked live in Build Sentences, Verbs, Fill-in-Blank, and Locations modes
- [ ] **STATS-02**: Each of those four modes has a "Statistics" button visible during the session that opens the stats board
- [ ] **STATS-03**: Stats board auto-displays at the end of a session (all exercises completed) showing final correct/incorrect and accuracy %
- [ ] **STATS-04**: Session stats reset at the start of each new round (no localStorage persistence)

### Homepage

- [ ] **HOME-01**: "Tiempo" and "Idiomas" vocabulary categories displayed under the "Palabras" section on the homepage, freeing up layout space

### Visual

- [ ] **VIS-01**: Overall page background color slightly lighter than current dark blue (applied globally via CSS variable)

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
| Animated stats charts | Simple numeric display sufficient for v1.6; charts are visual polish for future |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HOME-01 | Phase 12 | Pending |
| VIS-01 | Phase 12 | Pending |
| STATS-01 | Phase 13 | Pending |
| STATS-02 | Phase 13 | Pending |
| STATS-03 | Phase 13 | Pending |
| STATS-04 | Phase 13 | Pending |

**Coverage:**
- v1.6 requirements: 6 total
- Mapped to phases: 6
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-12 after initial definition*
