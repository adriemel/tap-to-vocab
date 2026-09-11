---
gsd_state_version: 1.0
milestone: v2.2
milestone_name: Topics & Unidades
status: executing
stopped_at: Completed 24-02-PLAN.md
last_updated: "2026-09-11T04:32:09.564Z"
last_activity: 2026-09-11
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 8
  completed_plans: 7
  percent: 25
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-09-10 after v2.2 milestone started)

**Core value:** Every interaction must work correctly and feel polished so nothing interrupts the learning flow.
**Current focus:** Phase 24 — topics-unidades-navigation

## Current Position

Phase: 24 (topics-unidades-navigation) — EXECUTING
Plan: 3 of 3
Status: Ready to execute
Last activity: 2026-09-11

Progress: [█████████░] 88%

## Accumulated Context

### Decisions

- v2.2 tagging model: `words.tsv` gains a 4th `topics` column, parsed by header name so rows without it stay valid
- v2.2 Palabras is *partitioned* — a Palabras word that fits a topic moves into it; leftovers keep `topics: Palabras`
- v2.2 Unidad words are *additively* tagged — Unidades stay complete for school revision, so a word can appear in both a Unidad and a topic
- v2.2 new topics: Calendario (~33), Comida y Bebida (~17), Escuela (~16). "Deportes y Ocio" was proposed and explicitly declined by the user
- v2.2 home screen: only the 10 vocabulary category buttons collapse into 📚 Topics / 📖 Unidades; the 9 tool/game buttons stay exactly as they are
- Unidad 5B source images stored at `new-vocab/unidad5b-1.jpeg` and `new-vocab/unidad5b-2.jpeg`
- [Phase 24]: Kept ?topic= as a separate URL param from ?cat= rather than OR-matching, so overlapping category/topic names (Colores, Animales, Numeros, Saludar, Casa_Familia) keep distinct counts
- [Phase 24]: Added displayName = topic || category fallback in initFromTSV to fix the blank/wrong h1 title regression that ?topic= pages would otherwise hit
- [Phase 24]: Single-column button stack on topics.html/unidades.html (not 2-column grid) per numbers.html precedent and mobile tap-target sizing

### Roadmap Evolution

- v2.2 roadmap created 2026-09-10: 2 phases (Phase 23 Vocabulary Data & Topic Tagging, Phase 24 Topics & Unidades Navigation), continuing numbering from Phase 22
- Phase 20 added: quien-soy-yo bugfixes and polish (TTS on first question, skip button, scroll/bubble overlap on mobile, end-screen button layout, sentence data push)
- Phase 21 added: Quién Soy Yo — iOS TTS First-Sentence Bug Fix (first question not voiced on iPhone, likely timing/voice-readiness issue)

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-09-11T04:32:09.548Z
Stopped at: Completed 24-02-PLAN.md

**Planned Phase:** 21 (Quién Soy Yo — iOS TTS First-Sentence Bug Fix) — 1 plan — 2026-05-16T00:00:00.000Z

## Deferred Items

Items acknowledged and deferred at v2.1 milestone close on 2026-08-02. All belong to already-shipped milestones (v1.6–v2.0); none affect v2.1/Phase 22, which has no open items of its own.

| Category | Item | Status |
|----------|------|--------|
| uat_gap | Phase 12 — 12-HUMAN-UAT.md | partial (2 pending scenarios) |
| uat_gap | Phase 14 — 14-HUMAN-UAT.md | partial (4 pending scenarios) |
| uat_gap | Phase 16 — 16-HUMAN-UAT.md | partial (4 pending scenarios) |
| uat_gap | Phase 18 — 18-HUMAN-UAT.md | partial (5 pending scenarios) |
| uat_gap | Phase 20 — 20-HUMAN-UAT.md | passed (0 pending scenarios, artifact just not closed out) |
| verification_gap | Phase 14 — 14-VERIFICATION.md | human_needed |
| verification_gap | Phase 15 — 15-VERIFICATION.md | human_needed |
| verification_gap | Phase 16 — 16-VERIFICATION.md | human_needed |
| verification_gap | Phase 18 — 18-VERIFICATION.md | human_needed |
| verification_gap | Phase 20 — 20-VERIFICATION.md | human_needed |

## Operator Next Steps

- Start the next milestone with /gsd-new-milestone
- Optional cleanup: run `/gsd:audit-uat` to work through the 10 deferred items above from prior milestones
