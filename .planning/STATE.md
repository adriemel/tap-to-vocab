---
gsd_state_version: 1.0
milestone: v2.2
milestone_name: Topics & Unidades
status: milestone_complete
stopped_at: Milestone complete (Phase 24 was final phase)
last_updated: 2026-09-11T05:52:44.817Z
last_activity: 2026-09-11
progress:
  total_phases: 2
  completed_phases: 2
  total_plans: 8
  completed_plans: 8
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-09-11 after Phase 24 — all v2.2 phases complete)

**Core value:** Every interaction must work correctly and feel polished so nothing interrupts the learning flow.
**Current focus:** v2.2 milestone complete — ready for /gsd:complete-milestone

## Current Position

Phase: 24 (topics-unidades-navigation) — COMPLETE (last phase of v2.2)
Plan: 3 of 3
Status: Milestone complete — verification 10/10, UAT 9/9, security 10/10 closed
Last activity: 2026-09-11

Progress: [██████████] 100%

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
- [Phase 24]: Deleted the 10 category anchors outright (D-05) rather than commenting them out; index.html has zero cat=category/cat=UnidadN links, only cat=practice survives
- [Phase 24]: Applied margin-bottom to both .btn-topics and .btn-unidades so grid-stretching can't make one look shorter, keeping the gap logic off .btn-practice and below (D-04/NAV-02)
- [Phase 24]: Documented ?topic= vs ?cat= as deliberately separate parameters in CLAUDE.md, matching Plan 01 and Phase 23's overlapping-name rationale
- [Phase 24]: Topic lists deduplicated on es+de (code-review CR-01) — words.tsv duplicates words across unidades, so aggregation by topic repeated cards and paid double coins
- [Phase 24]: coins.js refreshes the badge on bfcache restore (pageshow) and cross-tab changes (storage) — WR-01
- [Phase 24]: Topics/Unidades home buttons enlarged and bolded after UAT on user request, superseding D-02's 'taller but not more prominent'

### Roadmap Evolution

- v2.2 roadmap created 2026-09-10: 2 phases (Phase 23 Vocabulary Data & Topic Tagging, Phase 24 Topics & Unidades Navigation), continuing numbering from Phase 22
- Phase 20 added: quien-soy-yo bugfixes and polish (TTS on first question, skip button, scroll/bubble overlap on mobile, end-screen button layout, sentence data push)
- Phase 21 added: Quién Soy Yo — iOS TTS First-Sentence Bug Fix (first question not voiced on iPhone, likely timing/voice-readiness issue)

### Pending Todos

None.

### Blockers/Concerns

- [Phase 24] words.tsv: 5 punctuation-only near-duplicates (`,` vs `;` in `de`) still show twice in their topic (hablar, el alemán, el inglés, el español, en); `la casa` needs a decision — data cleanup, logged in PROJECT.md Deferred

## Session Continuity

Last session: 2026-09-11T05:55:00Z
Stopped at: Phase 24 complete — v2.2 milestone complete, ready for /gsd:complete-milestone
Resume file: None

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

- Close v2.2 with `/gsd:complete-milestone v2.2` (archives the roadmap and requirements), then start the next milestone with `/gsd:new-milestone`
- Optional cleanup: run `/gsd:audit-uat` to work through the 10 deferred items above from prior milestones
