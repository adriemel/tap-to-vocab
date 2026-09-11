---
phase: 24-topics-unidades-navigation
verified: 2026-09-11T00:00:00Z
status: gaps_found
score: 9/10 must-haves verified
overrides_applied: 0
gaps:
  - truth: "Topics screen shows the correct word list for each topic (SC3/NAV-06: 'showing every word tagged with that topic, regardless of which unidad ... it came from')"
    status: partial
    reason: >
      The `?topic=` filter correctly aggregates rows across unidades (verified against
      data/words.tsv row counts, all 9 slugs match exactly), but data/words.tsv keeps
      the same word duplicated across multiple category rows and Phase 23 tagged every
      duplicate copy with the same topic. This produces duplicate flashcards in 4 of the
      9 topic lists. Confirmed directly against the shipped data/words.tsv:
        - Casa_Familia: 83 rows shown, 68 distinct (es,de) pairs, 15 duplicate cards
        - Palabras: 243 rows shown, 228 distinct, 15 duplicate cards
        - Calendario: 63 rows shown, 50 distinct, 13 duplicate cards
        - Escuela: 49 rows shown, 45 distinct, 4 duplicate cards
      (Independently corroborated by 24-REVIEW.md CR-01, filed as Critical, status
      issues_found, with slightly different but consistent distinct-word counts —
      likely due to a handful of punctuation-only near-duplicates the reviewer flagged
      separately as uncatchable by code-level dedup.)
      User-visible impact, confirmed against the actual filter code
      (assets/js/tapvocab.js:473-474, no dedup logic present): the Browse counter reads
      an inflated denominator (e.g. "1 / 83" for 68 real words), the same flashcard can
      appear twice in one Quiz run, and each repeat calls CoinTracker.addCoin() again on
      a correct answer, letting a user earn extra coins per pass through a topic list.
      This directly undermines the phase's own goal wording — "open topic.html with the
      correct word list" — for 4 of 9 topics. It is a data-flow correctness defect, not
      a wiring failure: the button, the URL parameter, and the filter all work exactly
      as specified in 24-01-PLAN.md's must_haves (which specify raw row counts, not
      deduplicated counts) — the defect is that "row count" and "correct word list" are
      not the same thing once Phase 23's category-partitioned data model is aggregated
      across categories by topic.
    artifacts:
      - path: "assets/js/tapvocab.js"
        issue: "Topic filter branch (~line 473) has no de-duplication on (es, de) identity, unlike the practice-list's isMarked() which already uses that identity"
      - path: "data/words.tsv"
        issue: "Same word intentionally duplicated across multiple category rows (Phase 23 data model); topic tagging on every duplicate row means a topic-scoped filter surfaces every duplicate"
    missing:
      - "De-duplicate the topic filter branch in initFromTSV on (r.es + \"\\t\" + r.de) identity, mirroring the practice list's existing word-identity convention (24-REVIEW.md CR-01 provides a ready fix)"
      - "Separately clean up 11 punctuation-only near-duplicate (es,de) pairs in data/words.tsv that code-level dedup cannot catch (e.g. 'hablar': 'sprechen, reden' vs 'sprechen; reden')"
human_verification:
  - test: "Open /topics.html and /unidades.html on a real phone-width viewport (or DevTools device emulation at ~390px) and compare against the ASCII mockup in 24-CONTEXT.md"
    expected: "Single-column button stack reads comfortably, no label wraps awkwardly, header row (title + coin badge + Home) does not overflow"
    why_human: "No browser automation was available to any executor in this phase; this is a purely visual/layout judgment call that grep cannot make"
  - test: "On the home screen at desktop and 390px width, compare the visual height of 📚 Topics / 📖 Unidades against ⭐ Practice using DevTools computed styles"
    expected: "Computed padding of 📚 Topics is 20px 16px at desktop and 16px 8px at 390px (confirmed present in CSS by this verification); ⭐ Practice remains 12px 16px; the two new buttons look taller but visibly less prominent (no gradient/accent) than the coloured tool buttons below, per D-02"
    why_human: "Subjective 'visibly taller ... without looking oversized' and 'reads as less prominent' judgments; CSS values are confirmed present and correctly ordered by static analysis, but rendered appearance was never screenshotted"
  - test: "Click through all 9 Topics buttons and all 5 Unidades buttons in a live browser; confirm the h1 renders the topic/unidad slug (not blank, not the literal string 'topic') and the #counter denominator matches the verified TSV counts"
    expected: "h1 shows e.g. 'Escuela', 'Casa_Familia'; counters show 1/15, 1/21, 1/32, 1/55, 1/243, 1/83, 1/63, 1/20, 1/49 for topics and 1/77, 1/143, 1/108, 1/115, 1/44 for unidades"
    why_human: "Executors verified this via a standalone Node script reproducing the filter logic against the live TSV (numbers match, and this verification independently reproduced the same numbers), but no browser was launched to confirm the DOM actually renders these values — the JS logic itself was statically confirmed correct via `node --check` and direct code reading"
  - test: "Earn a coin, navigate Topics → a topic → Quiz → earn more coins → press browser Back to return to /topics.html"
    expected: "Developer awareness item, not a required fix: the coin badge may show a stale (pre-quiz) balance on bfcache restore, per 24-REVIEW.md WR-01. This is pre-existing app-wide behavior (index.html has the same limitation) extended to two more pages by this phase, not a new regression, so it satisfies the literal must-have wording ('matching every other page') but is worth deciding whether to fix now that the Topics→topic→Back path is more common"
    why_human: "Requires live browser back/forward-cache behavior, which cannot be reproduced by static analysis; disposition (fix vs accept) is a product decision"
---

# Phase 24: Topics & Unidades Navigation Verification Report

**Phase Goal:** The home screen replaces its 10 category buttons with two grouped entry points — 📚 Topics and 📖 Unidades — each opening a sub-screen with real buttons that open `topic.html` with the correct word list.
**Verified:** 2026-09-11
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | (NAV-01/SC1) Home screen shows exactly two vocabulary buttons (📚 Topics, 📖 Unidades) in place of the 10 category buttons | ✓ VERIFIED | `index.html` lines 28-29: `<a class="btn btn-topics" href="/topics.html">📚 Topics</a>` / `<a class="btn btn-unidades" href="/unidades.html">📖 Unidades</a>`. `grep -c 'topic.html?cat=Colores\|...\|topic.html?cat=Casa_Familia' index.html` = 0; `grep -c 'topic.html?cat=Unidad' index.html` = 0; sole surviving `?cat=` occurrence is `?cat=practice`. |
| 2 | (NAV-02/SC2) The 9 tool/game buttons remain unchanged in order, position and appearance | ✓ VERIFIED | `git show 61e801d -- index.html` shows a diff of exactly 3 insertions / 11 deletions confined to the 10-button block; the ⭐ Practice line and all 9 tool/game `<a>` lines below it are byte-identical (no `-` lines matching `btn-practice\|btn-sentences\|btn-verbs\|btn-fill-blank\|btn-locations\|btn-numbers\|btn-quien-soy\|btn-hora\|btn-games` in the diff). |
| 3 | (NAV-03/NAV-06/SC3) Topics screen lists all 9 topics and tapping one opens `topic.html` showing every word tagged with that topic, correctly, regardless of unidad | ✗ **FAILED (partial)** | `topics.html` lists exactly the 9 canonical slugs and each does open a cross-unidad-aggregated list (row counts verified below match exactly). **But** the resulting list contains duplicate flashcards for 4 of 9 topics — see Gaps. |
| 4 | (NAV-04/SC4) Unidades screen lists 5 unidades and each opens the same complete word list the old home button produced | ✓ VERIFIED | `unidades.html` has exactly the 5 hrefs (`?cat=Unidad2/3/4/5A/5B`); row counts independently reproduced against live `data/words.tsv`: 77, 143, 108, 115, 44 — exact match to plan's ground truth. Category-column duplication is negligible (review found 1 duplicate across ALL categories combined). The 4 pre-existing hrefs (Unidad2/3/4/5A) are confirmed byte-identical to what `index.html` had before Plan 03 deleted them. |
| 5 | (NAV-05/SC5) Both sub-screens show a 🏠 Home control and a live coin counter matching every other page | ✓ VERIFIED (with caveat) | Both `topics.html` and `unidades.html` contain `id="coin-counter"` (×1 each) and `<script src="/assets/js/coins.js"></script>` (×1 each), and `<a class="btn secondary" href="/">🏠 Home</a>` (×1 each). `coins.js` auto-wires on `DOMContentLoaded` + `coinschanged`, same mechanism as every other page. Caveat: bfcache staleness (WR-01) applies here exactly as it already does on `index.html` — not a new regression, but worth a decision; see human_verification. |
| 6 | (24-01 truth) `?topic=Colores` lists the 15 rows whose `topics` column equals Colores, regardless of category | ✓ VERIFIED | Reproduced against live `data/words.tsv`: topic=Colores → 15 rows (category=Colores → 13). All 9 topic slugs reproduced exactly: Animales 21, Calendario 63, Casa_Familia 83, Colores 15, Comida_Bebida 20, Escuela 49, Numeros 32, Palabras 243, Saludar 55. |
| 7 | (24-01 truth) `?cat=` and `?cat=practice` behave byte-for-byte as before | ✓ VERIFIED | `initFromTSV` branch order in `assets/js/tapvocab.js` is exactly practice → topic → category (line 471 `category.toLowerCase() === "practice"`, line 473 `else if (topic)`, line 476 `else` category filter with the original untouched expression `r.category.toLowerCase() === category.toLowerCase()`). `Unidad3` → 143 rows reproduced exactly. |
| 8 | (24-01 truth) `h1` on a `?topic=` page is never blank/never literal `"topic"` | ✓ VERIFIED | `const displayName = topic || category;` present at line 462; both title-setting sites (empty-result branch and success path) use `... : displayName` per `grep -n` inspection of `assets/js/tapvocab.js`. |
| 9 | (24-01 truth) A `?topic=` slug matching no rows falls into the existing empty-result branch instead of throwing | ✓ VERIFIED | `node --check assets/js/tapvocab.js` exits 0; filter uses `(r.topics || "")` guard (mandatory for the 171 untagged rows and localStorage-rehydrated practice entries with no `topics` key); empty-result branch renders topic-specific error text and a Home button via `createElement`/`textContent` (no `innerHTML` anywhere in the file). |
| 10 | Project docs (CLAUDE.md, tap-to-vocab-walkthrough.md) describe the new navigation instead of the deleted category grid | ✓ VERIFIED | `CLAUDE.md` documents `topics.html`, `unidades.html`, and both `?cat=`/`?topic=` params, and the stale "add a button to index.html's grid-two-col" instruction is gone (`grep -c "add a button in \`index.html\`" CLAUDE.md` = 0). `tap-to-vocab-walkthrough.md` has a new "topics.html and unidades.html — The Two Vocabulary Doors" section and the Home Page section no longer describes a per-category button grid; `grep -c 'Each button links to'` = 0. |

**Score:** 9/10 truths verified (1 partial failure — see Gaps)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `assets/js/tapvocab.js` | `opts.topic` filter branch + non-blank title | ✓ VERIFIED | `node --check` passes; `opts.topic`, `(r.topics \|\| "")`, `displayName`, and the untouched category-filter expression all present exactly once as specified; `innerHTML` count = 0. |
| `topic.html` | reads `?topic=` and passes through | ✓ VERIFIED | `params.get("topic")`, `initFromTSV({ category: cat, topic: topic })`, `params.get("cat")` all present; `:has()` fallback shim (`quiz-active`) undisturbed. |
| `topics.html` | 9 hardcoded `?topic=` buttons, Home, coin counter | ✓ VERIFIED | All 9 slugs present exactly once each with correct spelling; `id="coin-counter"` ×1; `coins.js` ×1; Home ×1; no fetch/words.tsv/shared-utils/home.js/game-init.js/tapvocab.js references. |
| `unidades.html` | 5 hardcoded `?cat=` buttons, Home, coin counter | ✓ VERIFIED | All 5 `Unidad2/3/4/5A/5B` hrefs present exactly once each; same coin-counter/Home/script wiring as topics.html; zero `?topic=` references. |
| `index.html` | two-button vocabulary row replacing 10 category links | ✓ VERIFIED | `btn-topics`/`btn-unidades` anchors present; 10 old anchors gone; Practice and all 9 tool/game buttons byte-identical per `git diff`. |
| `assets/css/styles.css` | `.btn-topics`/`.btn-unidades` height + gap + narrow-viewport override | ✓ VERIFIED | Base rule (padding 20px 16px + margin-bottom 16px) present once, positioned after `.grid-two-col .btn-games` (source-order tie-break); narrow-viewport override (padding 16px 8px) present once, correctly inside the `@media (max-width: 420px)` block, after the generic `.grid-two-col .btn` rule it must beat. No `grid-column`/gradient/border/font-weight/`var(--...)` added to the base rule (confirmed by direct read of lines 96-101). `git diff` purity: base rule is purely additive. |
| `tap-to-vocab-walkthrough.md` | plain-English description of new navigation | ✓ VERIFIED | New "topics.html and unidades.html" section present; folder map updated; stale category-grid/auto-appear language removed from the `words.tsv` and Home Page sections. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `topic.html` | `assets/js/tapvocab.js` | `TapVocabTSV.initFromTSV({ category: cat, topic: topic })` | ✓ WIRED | Confirmed by direct read of `topic.html`'s inline script. |
| `assets/js/tapvocab.js` | `data/words.tsv` `topics` column | `rows.filter(r => (r.topics \|\| "").toLowerCase() === topic.toLowerCase())` | ✓ WIRED (but see data-flow gap below) | Filter executes and returns correct row counts for all 9 topics; no dedup on returned rows. |
| `topics.html` | `topic.html?topic=` | 9 static anchor hrefs | ✓ WIRED | All 9 present, spelled exactly as in `data/words.tsv`. |
| `unidades.html` | `topic.html?cat=` | 5 static anchor hrefs | ✓ WIRED | All 5 present, byte-identical to the pre-existing 4 plus the new Unidad5B. |
| `topics.html`/`unidades.html` | `assets/js/coins.js` | `<script src>` + `#coin-counter` auto-wire | ✓ WIRED | Confirmed present on both pages; mechanism identical to every other page in the app. |
| `index.html` | `topics.html`/`unidades.html` | two anchor hrefs | ✓ WIRED | Both root-relative same-origin hrefs present exactly once each; both target files exist on disk. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| `topic.html` (via `initFromTSV`) | `words` (topic branch) | `rows.filter` on live `data/words.tsv` `topics` column | Yes, but with duplicates | ⚠️ **PARTIAL** — the filter genuinely reads live TSV data and correctly aggregates across unidades (not hardcoded/empty), but for Casa_Familia, Palabras, Calendario and Escuela the returned array contains duplicate `(es, de)` entries because Phase 23's data model duplicates the same word across multiple category rows and tags every copy with the same topic. Confirmed directly: Casa_Familia 83 rows/68 distinct, Palabras 243/228, Calendario 63/50, Escuela 49/45. No de-duplication logic exists in the filter (unlike the practice list's `isMarked`, which already keys on `(es, de)`). |
| `topic.html` (via `initFromTSV`) | `words` (category branch) | `rows.filter` on live `data/words.tsv` `category` column | Yes | ✓ FLOWING — negligible duplication (1 across all categories combined per code review), unaffected by this phase. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` markers found in any of the 8 files modified by this phase | — | Debt-marker gate: clean |
| `assets/js/tapvocab.js:473-474` | topic filter branch | Missing de-duplication (see CR-01) | 🛑 unresolved Critical (per 24-REVIEW.md, status `issues_found`) | Duplicate flashcards, inflated Browse/Quiz counters, extra coin income on 4 of 9 topics |
| `assets/js/tapvocab.js:471/480/506` | inconsistent `"practice"` case-sensitivity | ⚠️ Warning (WR-02, per 24-REVIEW.md) | Edge case only: requires a hand-crafted URL combining `cat=Practice` (capitalized) with `topic=`; not reachable through any button built in this phase (topics.html sends only `?topic=`, unidades.html sends only `?cat=`) |
| `topics.html`/`unidades.html` | whole file | Near-identical inline-styled copies (IN-03, per 24-REVIEW.md) | ℹ️ Info | Maintainability note, not a functional defect |
| `unidades.html:27-28` | Unidad 5A/5B share `5️⃣` emoji | ℹ️ Info (IN-04) | Cosmetic |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| NAV-01 | 24-03 | Home screen shows two large buttons in place of 10 category buttons | ✓ SATISFIED | `index.html` verified above |
| NAV-02 | 24-03 | 9 tool/game buttons unchanged in position/appearance | ✓ SATISFIED | `git diff` byte-identity confirmed |
| NAV-03 | 24-02 | Topics screen lists 9 topic buttons, opens word list for each | ✓ SATISFIED (screen/wiring) | 9 buttons present, all open non-empty, correctly-filtered lists — see NAV-06 for the list-quality caveat |
| NAV-04 | 24-02 | Unidades screen lists 5 buttons, opens word list for each | ✓ SATISFIED | Row counts and byte-identical hrefs confirmed |
| NAV-05 | 24-02 | Both sub-screens have Home control + coin counter | ✓ SATISFIED | Confirmed on both pages, same mechanism as rest of app |
| NAV-06 | 24-01 | Opening a topic shows every word tagged with it, whichever unidad it came from | ⚠️ **PARTIAL** | Cross-unidad aggregation works correctly; but for 4/9 topics the "every word" set contains duplicate rows for the same word, which is a defect against the ordinary reading of "every word" (see gap) |

No orphaned requirements: all 6 IDs mapped to this phase in `.planning/REQUIREMENTS.md`'s traceability table (lines 100-105) appear in a plan's `requirements:` frontmatter, and every ID in the plans' frontmatter (NAV-01 through NAV-06) is accounted for above.

### Human Verification Required

See YAML frontmatter `human_verification` section for full detail. Summary:

1. Phone-viewport visual pass on `topics.html`/`unidades.html` (no browser automation was available to any executor).
2. Desktop + 390px computed-padding/visual-height comparison between the new buttons and ⭐ Practice.
3. Live click-through of all 14 sub-screen buttons to confirm rendered `h1`/`#counter` text (logic statically verified; DOM rendering never observed in a browser).
4. Decide whether the pre-existing bfcache coin-counter staleness (WR-01) needs a fix now that Topics→topic→Back is a more common navigation path.

### Gaps Summary

Four of Phase 24's must-haves are fully and cleanly implemented: the home-screen collapse (NAV-01/NAV-02), the two hub screens with all correct links (NAV-03/NAV-04), and the Home/coin-counter wiring (NAV-05). The `?topic=` filter itself is correctly wired end-to-end and was independently re-verified against the live `data/words.tsv` for every one of the 9 topic slugs and 5 unidad slugs, matching the plan's ground-truth row counts exactly.

The one confirmed gap is a data-flow correctness defect, not a wiring defect: because Phase 23's data model intentionally duplicates the same word across multiple `category` rows and tags every duplicate with the same `topics` value, a topic-scoped filter (which aggregates across categories by design, per NAV-06) surfaces the same word multiple times for 4 of the 9 topics (Casa_Familia, Palabras, Calendario, Escuela). This was already identified and quantified as a Critical finding in 24-REVIEW.md (CR-01) with a concrete, small fix (deduplicate on `(es, de)` identity, mirroring the practice list's existing convention) and remains unresolved — 24-REVIEW.md's own status is `issues_found`. Because the phase's own goal statement is "open topic.html with the correct word list," and duplicate flashcards materially change what a user sees (inflated counters, repeated quiz cards, extra coin income), this verification classifies it as a genuine gap rather than an advisory note, consistent with the adversarial mandate to falsify optimistic narratives rather than accept "the button opens *a* list" as equivalent to "the button opens *the correct* list."

This looks like an unresolved code-review finding rather than an intentional deviation, so no override is suggested — the recommended path is to route CR-01's fix through `/gsd:plan-phase --gaps` using the gap structured above.

---

*Verified: 2026-09-11*
*Verifier: Claude (gsd-verifier)*
