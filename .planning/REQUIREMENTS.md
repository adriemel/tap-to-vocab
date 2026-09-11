# Requirements: Tap-to-Vocab — v2.2 Topics & Unidades

**Defined:** 2026-09-10
**Core Value:** Every interaction must work correctly and feel polished so nothing interrupts the learning flow.

## v2.2 Requirements

Requirements for this milestone. Each maps to exactly one roadmap phase.

### Vocabulary Data

- [x] **DATA-03**: User can browse and quiz Unidad 5B vocabulary (~24 headwords from the two source images)
- [x] **DATA-04**: Unidad 5B example sentences (~15) appear in Build Sentences as a `Unidad5B` category checkbox
- [x] **DATA-05**: `words.tsv` carries a `topics` column read by header name — rows without it still load correctly

### Topic Tagging

- [x] **TAG-01**: Every Palabras word either moves into a topic or keeps `topics: Palabras`
- [x] **TAG-02**: Unidad words keep their unidad and gain topic tags — the same word appears in both places
- [x] **TAG-03**: The five existing coherent topics (Colores, Animales, Numeros, Saludar, Casa y Familia) are tagged with their own name
- [x] **TAG-04**: Calendario topic contains the days, months, seasons and period words
- [x] **TAG-05**: Comida y Bebida topic contains the food and drink words
- [x] **TAG-06**: Escuela topic contains the school, teaching and study words

### Navigation

- [ ] **NAV-01**: Home screen shows two large buttons — 📚 Topics and 📖 Unidades — in place of the 10 category buttons
- [ ] **NAV-02**: The 9 tool/game buttons below are unchanged in position and appearance
- [ ] **NAV-03**: Topics screen lists 9 topic buttons and opens the word list for each
- [ ] **NAV-04**: Unidades screen lists 5 buttons (Unidad 2, 3, 4, 5A, 5B) and opens the word list for each
- [ ] **NAV-05**: Both sub-screens have a Home control and show the coin counter, like every other page
- [x] **NAV-06**: Opening a topic shows every word tagged with it, whichever unidad it came from
- [x] **NAV-07**: The ⭐ Practice list keeps working — words already saved for practice survive the re-tagging

## Data Model

The `topics` column is the source of truth for the Topics screens. `category` remains the
source of truth for the Unidades screens and for every existing consumer of `words.tsv`.

```
category   es              de              topics
Unidad4    el zumo         der Saft        Comida
Unidad5A   sábado          Samstag         Calendario
Unidad5B   el baloncesto   das Basketball
Palabras   negro           schwarz         Colores
Palabras   fuerte          stark           Palabras
```

Two deliberately asymmetric rules:

| Source | Rule | Why |
|--------|------|-----|
| `Palabras` (125 words) | **Partitioned** — a word that fits a topic moves into it and no longer appears under Palabras. Leftovers keep `topics: Palabras`. | Palabras is a catch-all, not a school unit. A word showing under two topic buttons would be duplication. |
| `Unidad2/3/4/5A/5B` | **Additive** — the word keeps its `category` and gains a topic tag, appearing in both. | The unidades must stay complete so a whole school unit can be revised before a test. |

Topics after this milestone (9): Colores, Animales, Numeros, Saludar, Casa y Familia,
Palabras, Calendario, Comida y Bebida, Escuela.
Unidades after this milestone (5): Unidad 2, Unidad 3, Unidad 4, Unidad 5A, Unidad 5B.

## Future Requirements

Acknowledged but deferred — not in this roadmap.

### Topic Tagging

- **TAG-07**: Deportes y Ocio topic (bailar, escalar, esquiar, hacer surf, el baloncesto, el deporte, el hobby, el tiempo libre)
- **TAG-08**: Ropa topic — needs more vocabulary first (~4 words today)
- **TAG-09**: Multi-topic selection — browse two or more topics at once

### Navigation

- **NAV-08**: Group the 9 tool/game buttons behind a third home-screen button

## Out of Scope

| Feature | Reason |
|---------|--------|
| Deportes y Ocio topic | Proposed during questioning and explicitly declined by the user for this milestone |
| Ropa topic | Only ~4 clothing words exist in words.tsv — too thin to justify a button |
| Grouping tool/game buttons | User chose to leave the 9 tool buttons untouched; only the vocabulary categories collapse |
| Selecting two topics at once | Single-topic browsing matches every existing mode; adds filter UI complexity for no current need |
| Practice-list migration to stable IDs | Pre-existing debt from earlier milestones — NAV-07 only requires that re-tagging does not break it |
| Build step / dependency to generate tags | Tagging is a one-off data edit; the project stays zero-dependency and build-free |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-03 | Phase 23 | Mapped |
| DATA-04 | Phase 23 | Mapped |
| DATA-05 | Phase 23 | Mapped |
| TAG-01 | Phase 23 | Mapped |
| TAG-02 | Phase 23 | Mapped |
| TAG-03 | Phase 23 | Mapped |
| TAG-04 | Phase 23 | Mapped |
| TAG-05 | Phase 23 | Mapped |
| TAG-06 | Phase 23 | Mapped |
| NAV-01 | Phase 24 | Mapped |
| NAV-02 | Phase 24 | Mapped |
| NAV-03 | Phase 24 | Mapped |
| NAV-04 | Phase 24 | Mapped |
| NAV-05 | Phase 24 | Mapped |
| NAV-06 | Phase 24 | Mapped |
| NAV-07 | Phase 23 | Mapped |

**Coverage:**
- v2.2 requirements: 16 total
- Mapped to phases: 16 (Phase 23: 10, Phase 24: 6)
- Unmapped: 0

## Source Material

- `new-vocab/unidad5b-1.jpeg` — Bloque B, page 1 (el fin de semana → ¡Qué pena!)
- `new-vocab/unidad5b-2.jpeg` — Bloque B, page 2 (poder hacer algo → la silla de ruedas)

---
*Requirements defined: 2026-09-10*
*Last updated: 2026-09-10 after v2.2 milestone definition*
