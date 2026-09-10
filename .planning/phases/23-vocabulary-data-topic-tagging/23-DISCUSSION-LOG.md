# Phase 23: Vocabulary Data & Topic Tagging - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-10
**Phase:** 23-Vocabulary Data & Topic Tagging
**Areas discussed:** Topic value format, Fate of the 5 old categories, Sentences vs headwords, Unidad 5B + tagging review

---

## Topic value format

**Q1 — What string goes in the topics cell for a multi-word topic?**

| Option | Description | Selected |
|--------|-------------|----------|
| Slug: `Casa_Familia` | Matches today's TSV convention, URL-safe; display label lives in HTML | ✓ |
| Display text: `Comida y Bebida` | Cell reads like the button label; costs URL encoding | |
| Short slug: `Comida` / `Casa` | One word per topic; value no longer matches the label | |

**Q2 — Can one row carry more than one topic?**

| Option | Description | Selected |
|--------|-------------|----------|
| Exactly one topic per row | Plain equality filter in Phase 24; simplest data and code | ✓ |
| Comma-separated, allow multiple | Faithful for dual-nature words; complicates partition rule | |
| One topic, parser tolerates commas | Future-proofs the loader at some code cost now | |

**Q3 — What happens if a row has a blank topics cell?**

| Option | Description | Selected |
|--------|-------------|----------|
| Loads fine, untagged — shows in no topic | Still visible under its category/unidad; no silent misfiling | ✓ |
| Falls back to Palabras | Nothing unreachable, but forgotten tags pile up unnoticed | |
| Loads, plus a console warning | Same as untagged with a debugging aid | |

**Notes:** This blank-is-valid rule is what DATA-05 tolerance means in practice, and it later became the representation for untagged sentences.

---

## Fate of the 5 old categories

**Q1 — What happens to the `category` value of the 133 rows in Colores/Animales/Numeros/Saludar/Casa_Familia?**

| Option | Description | Selected |
|--------|-------------|----------|
| Leave category untouched | Zero risk; old `?cat=Colores` links keep working; category gains a third meaning | ✓ |
| Migrate category → Palabras | Cleanest model; breaks old links; 133 rows change two columns | |
| Migrate + `cat=` falls back to topics | Clean data, no broken links, but adds Phase 24 logic into Phase 23 | |

**Q2 — What topics value do the 7 `x`-prefixed hidden rows get?**

| Option | Description | Selected |
|--------|-------------|----------|
| Leave topics blank — stay hidden | Preserves the "parked" status exactly | |
| Tag them with their real topic | Surfaces them on Topics only; category keeps the `x` prefix | ✓ |
| Unhide fully — drop the `x` prefix | Most consistent, but a content change beyond this phase | |

**Notes:** The 7 rows were listed during discussion (el serpiente, el burro, la abeja, la tarantula, el mono, el primo, la prima) — ordinary vocabulary, nothing broken, so surfacing them via Topics was an easy call.

---

## Sentences vs headwords

**Q1 — Do example sentences get a topic tag?**

| Option | Description | Selected |
|--------|-------------|----------|
| No — headwords only, sentences blank | Topic screens stay clean word lists; sentences stay in unidad + Build Sentences | ✓ |
| Yes — tag sentences too | Revise a topic in full context; mixes long sentences into topic quizzes | |
| Tag them, decide display later | Keeps the option open; ~50 rows tagged for no visible effect | |

**Q2 — Success criterion 3 forbids untagged Palabras rows, but 7 are sentences. Which wins?**

| Option | Description | Selected |
|--------|-------------|----------|
| Sentences are an explicit exception | Criterion 3 reads as "every Palabras headword"; one consistent rule | ✓ |
| Palabras sentences keep `topics: Palabras` | Criterion holds literally; a few sentences land in the Palabras topic | |
| Show me the 7 first | Decide after seeing them | |

**Q3 (raised by Claude after counting) — The rule strips 13 of Saludar's 40 rows out of the Saludar topic. Adjust?**

| Option | Description | Selected |
|--------|-------------|----------|
| Tag short set phrases (≤~5 words), skip long ones | Keeps ¿Qué tal? / ¿Cómo te llamas? as vocabulary; keeps Saludar whole | ✓ |
| Tag by source, not by shape | The 5 legacy categories always get their topic regardless of punctuation | |
| Keep the rule as-is | Accept Saludar showing 27 of 40 rows | |

**Notes:** Counted impact before asking — Saludar −13, Casa_Familia −4, Colores −2 under the unadjusted rule. The word-count threshold is a guide for judgement, not a hard spec.

---

## Unidad 5B + tagging review

Claude read both source images before asking, and counted ~27 bold headwords and ~17 example sentences.

**Q1 — What topic do 5B's ~8 leisure/sport words get, given Deportes y Ocio was declined?**

| Option | Description | Selected |
|--------|-------------|----------|
| `topics: Palabras` — the catch-all | Palabras becomes the general leftover bucket for any row; one edit to move later | ✓ |
| Leave them untagged (blank) | Only reachable under Unidad 5B until TAG-07 lands | |
| Add Deportes y Ocio after all | Reverses the milestone decision; widens Phase 24's button list | |

**Q2 — How do the textbook's grammar hints enter words.tsv?**

| Option | Description | Selected |
|--------|-------------|----------|
| Keep hints verbatim — `jugar (-ue-) a algo` | Reads like the book; 6 existing rows already carry parentheses | |
| Strip stem-change hint, keep `algo` — `jugar a algo` | Correct TTS and clean cards; irregularity lives in verbs.tsv | ✓ |
| Strip to bare infinitive — `jugar` | Shortest cards; drops the algo/hacer algo pattern the book teaches | |

**Q3 — Approve the tagging mapping before it's written?**

| Option | Description | Selected |
|--------|-------------|----------|
| Review the 125 Palabras words before writing | One checkpoint on the decisions that change what disappears from a screen | |
| Review everything (~650 rows) before writing | Maximum control, long list | |
| No gate — just do it, check the result | Applied straight to words.tsv; corrections as follow-up edits | ✓ |

**Notes:** No approval checkpoint should be built into the plans. Review happens via git diff and the running app.

---

## Claude's Discretion

- The full per-word topic assignment for ~650 rows, including which of the 125 Palabras words move and which stay (expected sizes: Calendario ~33, Comida y Bebida ~17, Escuela ~16).
- How `loadWords` exposes the new column (field name, default), so long as no existing caller breaks.
- Hand edit vs throwaway script for the tagging pass — no repo dependency either way.
- German-side wording for 5B rows, following the book's `;` alternatives convention.
- Borderline calls on the ≤5-word set-phrase threshold.

## Deferred Ideas

- **Deportes y Ocio topic (TAG-07)** — raised again by 5B's leisure vocabulary, declined again; those words park in Palabras.
- **Ropa topic (TAG-08)** — still ~4 words, too thin.
- **Multi-topic selection / multi-valued topics (TAG-09)** — rejected by the one-topic-per-row decision.
- **Practice-list migration to stable IDs** — pre-existing debt, unaffected because `category` is never edited.
- **Retiring the `x`-prefix convention** — offered as the "unhide fully" option and not chosen.
