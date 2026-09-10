# Phase 23: Vocabulary Data & Topic Tagging - Context

**Gathered:** 2026-09-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Data-layer phase. Three deliverables:

1. `data/words.tsv` gains a 4th column, `topics`, read by header name.
2. Unidad 5B (~27 headwords + ~17 example sentences) is added from the two source images.
3. Every existing headword row is assigned a topic under the partition (Palabras) / additive (Unidades) rules.

Plus one small code change: `SharedUtils.loadWords` must project the new column (`loadTSV` is already tolerant and needs no change).

**Not in this phase:** the home screen, the Topics/Unidades sub-screens, and any change to how `topic.html` filters. Phase 24 owns all navigation and the `topics`-based filtering. Phase 23 must leave every existing screen behaving exactly as it does today.

</domain>

<decisions>
## Implementation Decisions

### Topics column format

- **D-01:** Column name is `topics`, appended as the 4th column after `de`. Values are **slugs in the existing TSV convention** — PascalCase, underscore for spaces: `Colores`, `Animales`, `Numeros`, `Saludar`, `Casa_Familia`, `Palabras`, `Calendario`, `Comida_Bebida`, `Escuela`. Display labels ("🍽️ Comida y Bebida") live in the HTML button in Phase 24, exactly as `Casa_Familia` → "🏠 Casa y Familia" works today.
- **D-02:** **Exactly one topic per row.** No comma-separated multi-values, and the loader does not split. Phase 24's filter is a plain equality match. A word that fits two topics is assigned its best fit and appears once.
- **D-03:** A **blank `topics` cell is valid and means untagged** — the row loads normally, stays visible under its `category`/unidad, and appears on no Topics screen. No fallback to Palabras, no console warning. This is the tolerance behaviour DATA-05 asks for, and it is also how sentences are represented (D-06).

### What gets edited

- **D-04:** The `category` column is **never modified in this phase** — not one row. All tagging happens in the new `topics` column. This is the safety property that makes everything else low-risk: `topic.html?cat=…`, Build Sentences' checkbox list, and the practice list all key off data that does not move.
- **D-05:** The 133 rows in the 5 legacy topic-like categories (`Colores` 13, `Animales` 15, `Numeros` 32, `Saludar` 40, `Casa_Familia` 33) keep those `category` values and gain `topics` equal to their own name. Old bookmarks like `topic.html?cat=Colores` keep working. Accepted cost: after Phase 24 these categories are no longer reachable from the home screen, so `category` carries three meanings (unidad / Palabras / legacy topic name).
- **D-05b:** The 7 `x`-prefixed hidden rows (`xAnimales` ×5 — el serpiente, el burro, la abeja, la tarantula, el mono; `xCasa_Familia` ×2 — el primo, la prima) **do get real topic tags** (`Animales`, `Casa_Familia`). Their `category` keeps the `x` prefix, so they stay out of navigation and the Unidades side, but they surface on the Topics screens. This is a deliberate un-hiding via the new axis.

### Headwords vs sentences

- **D-06:** **Example sentences are never tagged.** Baseline rule: if the Spanish text ends in `.`, `?`, or `!` it is a sentence and `topics` stays blank. Sentences remain fully reachable under their unidad and in Build Sentences, which is where they are actually used. Topic screens stay clean word lists so topic quizzes don't mix single words with long sentences.
- **D-07:** **Exception — short set phrases are tagged.** A row ending in `.?!` that is roughly **≤5 Spanish words** is vocabulary, not an example sentence, and gets its topic. This exists because the baseline rule would otherwise strip 13 of Saludar's 40 rows (`¿Qué tal?`, `¿Cómo te llamas?`, `¿De dónde eres?`, `¿Y tú?` …) out of the 👋 Saludar topic — the very phrases that topic is for. Also recovers Colores ×2 and Casa_Familia ×4. Long example sentences (`En mi tiempo libre voy a correr por el parque.`) stay untagged.
  - The word-count threshold is a guide, not a spec — judgement decides borderline rows. A row like `¿Como se dice 'buenos días' en alemán?` (7 words) is a set phrase and should be tagged; `El sábado por la mañana podemos ir al centro comercial.` is not.
- **D-08:** **Success criterion 3 is refined, deliberately.** ROADMAP criterion 3 says no Palabras row may be left with an empty `topics` value; 7 Palabras rows are long sentences and will be left blank under D-06. Read criterion 3 as *"every Palabras **headword** either moved into one of the 8 non-Palabras topics or still carries `topics: Palabras`."* Verification must not flag the untagged Palabras sentences as a gap.

### Unidad 5B

- **D-09:** Source is `new-vocab/unidad5b-1.jpeg` and `new-vocab/unidad5b-2.jpeg` (Bloque B). Bold entries are headwords (~27), indented entries are example sentences (~17). `category` value is `Unidad5B` — matching the existing `Unidad5A` convention, no space.
- **D-10:** **Strip the textbook's stem-change hints, keep the `algo`/`hacer algo` pattern.** `esquiar (-í-)` → `esquiar`; `jugar (-ue-) a algo` → `jugar a algo`; `poder (-ue-) hacer algo` → `poder hacer algo`; `querer (-ie-) (hacer) algo` → `querer hacer algo`; `probar (-ue-) algo` → `probar algo`. Rationale: correct TTS and clean flip cards, and the irregularity already lives in `verbs.tsv` for conjugation practice. Keeping `algo` matches the existing `usar algo` / `desayunar (algo)` rows.
- **D-11:** 5B is tagged additively like every other unidad — rows keep `category: Unidad5B` **and** get a topic.
- **D-12:** **The ~8 leisure/sport headwords go to `topics: Palabras`** (`bailar`, `ir a correr`, `escalar`, `esquiar`, `hacer surf`, `jugar a algo`, `el baloncesto`, `la escalada`). "Deportes y Ocio" was explicitly declined for this milestone (TAG-07, deferred), so `Palabras` serves as the **general catch-all bucket for any row with no better topic — not only for rows whose `category` is Palabras**. When TAG-07 lands, these move in one edit.
- **D-13:** Rough 5B topic assignment for the planner (final calls at execution): `el fin de semana`, `la semana`, `por la mañana`, `por la tarde`, `temprano` → `Calendario`; `el curso` → `Escuela`; `¡Qué pena!`, `No pasa nada.`, `¡Buena idea!`, `¿Qué tal…?`, `la disculpa`, `tener ganas de hacer algo` → `Saludar` if they read as conversational set phrases, otherwise `Palabras`; everything else → `Palabras`.

### Process

- **D-14 [informational]:** **No review gate.** The tagging mapping is applied straight into `words.tsv` — no pause to approve a proposed Palabras partition. The user reviews the result in the git diff and the running app, and corrections happen as follow-up edits. Plans should not build in an approval checkpoint for the mapping.

### Claude's Discretion

- The exact per-word topic assignment for all ~650 rows, including which of the 125 Palabras words move to `Calendario` / `Comida_Bebida` / `Escuela` / the 5 legacy topics and which stay `Palabras`. Requirements give expected sizes as a sanity check: Calendario ~33, Comida y Bebida ~17, Escuela ~16.
- How `loadWords` exposes the column (field name, default value) — must not break any existing caller.
- Whether the tagging edit is done by hand or with a throwaway script; either is fine as long as no dependency or build step is added to the repo.
- Exact wording of the German side for 5B rows, following the book (`;` separates alternatives, as in existing rows).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements and data model
- `.planning/REQUIREMENTS.md` — v2.2 requirements DATA-03/04/05, TAG-01…TAG-06, NAV-07; the **## Data Model** section holds the partitioned-vs-additive table and the canonical 9-topic / 5-unidad lists. Also lists TAG-07/08/09 and NAV-08 as explicitly deferred.
- `.planning/ROADMAP.md` § Phase 23 — goal and the 5 success criteria (criterion 3 refined by D-08 above).

### Source material for Unidad 5B
- `new-vocab/unidad5b-1.jpeg` — Bloque B page 1: `el fin de semana` → `¡Qué pena!`
- `new-vocab/unidad5b-2.jpeg` — Bloque B page 2: `poder hacer algo` → `la silla de ruedas`

### Codebase conventions
- `.planning/codebase/CONVENTIONS.md` — TSV parsing pattern (dynamic header lookup, always guard `(cols[i] || "").trim()`), naming table (TSV categories are PascalCase), fetch pattern (`cache: "no-store"`).
- `CLAUDE.md` § Adding Vocabulary — the `x`-prefix convention for hidden categories.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `assets/js/shared-utils.js:20-38` — `SharedUtils.loadWords()` already does dynamic header lookup (`header.indexOf("category")` etc.) but projects to a fixed 3-key object. This is the **only** file that needs a code change: add a `topics` key with the same `(cols[idx] || "").trim()` guard, and keep the existing `.filter(r => r.category && r.es && r.de)` untouched so blank topics never drops a row.
- `assets/js/shared-utils.js:41-56` — `SharedUtils.loadTSV()` is already fully header-keyed and tolerant. **No change needed** — it picks up `topics` automatically.

### Established Patterns
- `data/words.tsv` is `category\tes\tde`, 708 data rows. Distribution: Unidad3 143, Palabras 125, Unidad5A 115, Unidad4 108, Unidad2 77, Saludar 40, Casa_Familia 33, Numeros 32, Animales 15, Colores 13, xAnimales 5, xCasa_Familia 2.
- Sentence-shaped rows already exist throughout: Saludar 13, Colores 2, Casa_Familia 4, Palabras 7, Unidad2 22, Unidad3 47, Unidad4 35, Unidad5A 43. The `[.?!]$` test is the same one `sentences.js` uses.
- 6 existing rows already carry parentheses in the Spanish field (`la cosa (la cosita)`, `desayunar (algo)`, `el lápiz; (Pl.) los lápices`) — precedent considered and set aside by D-10.

### Integration Points
- `assets/js/sentences.js:75-95` — Build Sentences derives its category checkboxes from `s.category` at runtime. **DATA-04 needs no code change**: adding `Unidad5B` sentence rows makes a `Unidad5B` checkbox appear automatically, and line 89's "new categories default to true" logic means it starts enabled even for users with a stored filter map.
- `assets/js/tapvocab.js:472` — `topic.html` filters on `r.category.toLowerCase() === category.toLowerCase()`. Untouched in this phase; Phase 24 adds the topics path.
- `assets/js/tapvocab.js:84-96` — practice list (`localStorage` key `practiceList`) matches on `w.es === word.es && w.de === word.de` and stores the whole word object. **NAV-07 is satisfied by construction under D-04**: `es`/`de` never change, so every saved word still resolves. Note the stored objects keep a stale `category` and have no `topics` field — harmless today, and anything reading `topics` off a practice-list entry must tolerate `undefined`.
- Nothing else reads `words.tsv` columns positionally — appending a 4th column is safe for every current consumer.

</code_context>

<specifics>
## Specific Ideas

- Concrete row shapes agreed during discussion:
  ```
  category   es                 de              topics
  Palabras   el queso           der Käse        Comida_Bebida
  Palabras   negro              schwarz         Colores
  Palabras   fuerte             stark           Palabras
  Unidad5A   sábado             Samstag         Calendario
  Unidad5A   El sábado voy al cine.   Am Samstag…   (blank)
  Unidad5B   bailar             tanzen          Palabras
  Unidad5B   el curso           der Kurs        Escuela
  Unidad5B   jugar a algo       etw. spielen    Palabras
  xAnimales  el mono            der Affe        Animales
  Saludar    ¿Qué tal?          Wie geht's?     Saludar
  ```
- Known, accepted side effect: 5B's short exclamation headwords (`¡Qué pena!`, `No pasa nada.`, `¡Buena idea!`) end in punctuation, so `sentences.js` will pick them up as Build Sentences items — 2–3 word scrambles. This already happens today with `¿Qué tal?` and friends in Saludar; it is pre-existing behaviour, not a regression, and no code should be added to suppress it.

</specifics>

<deferred>
## Deferred Ideas

- **Deportes y Ocio topic (TAG-07)** — raised again by 5B's 8 leisure headwords and declined again. Those words park in `Palabras` (D-12) and move in one edit when the topic is created.
- **Ropa topic (TAG-08)** — still too thin (~4 clothing words).
- **Multi-topic selection / multi-valued `topics` (TAG-09)** — rejected for now by D-02; the loader deliberately does not split on commas, so enabling this later is a loader change plus a data change.
- **Practice-list migration to stable IDs** — pre-existing debt. NAV-07 only requires that re-tagging doesn't break it, and D-04 guarantees that.
- **Retiring the `x`-prefix convention** — D-05b surfaces those 7 rows via Topics without touching `category`. Fully unhiding them (moving `xAnimales` → `Animales`) was offered and not chosen.

</deferred>

---

*Phase: 23-Vocabulary Data & Topic Tagging*
*Context gathered: 2026-09-10*
