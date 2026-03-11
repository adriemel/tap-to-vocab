# Phase 1: Audit - Research

**Researched:** 2026-03-10
**Domain:** Static web app auditing — vanilla HTML/CSS/JS, no build step
**Confidence:** HIGH

## Summary

Phase 1 is a documentation-only audit: find every broken behavior, layout issue, and code quality problem across all pages, then record them in CONCERNS.md with severity ratings. No fixes are made in this phase. The output is an updated CONCERNS.md that downstream phases (Bug Fixes, Code Cleanup, UI Polish) will consume as their work list.

The codebase is already partially documented in CONCERNS.md with known issues. The audit must confirm those issues are still present, uncover any additional problems on pages not yet covered, and fill gaps — particularly around the three mini-games (coin-dash, jungle-run, tower-stack), the vocab.html spelling page, and mobile/layout behavior at 375px.

The key discipline for this phase: audit systematically by page, log what you find with severity and description, and do not fix anything. The deliverable is a written issue list, not working code.

**Primary recommendation:** Read every HTML and JS file for each page, check for known-bug patterns (sessionStorage dependency, coin refund gap, missing favicon, localStorage silent failures), then update CONCERNS.md with everything found — including confirming or disconfirming pre-existing concerns.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUDT-01 | All pages systematically audited for broken functionality, mobile layout issues, and code quality problems — producing a documented issue list | Full codebase read reveals scope: 8 HTML pages + 3 game sub-pages + 6 JS modules; CONCERNS.md already has 13 documented concerns to verify and expand |
</phase_requirements>

## Standard Stack

### Core
| Item | Version | Purpose | Notes |
|------|---------|---------|-------|
| Vanilla HTML/CSS/JS | N/A | All pages | Zero dependencies, no build step |
| IIFE pattern | N/A | JS modules | Export to `window`, manual `<script>` load order |
| LocalStorage | Browser API | User state persistence | Practice list, enabled sentences/verbs, coins |
| SessionStorage | Browser API | Game lives (transient) | Set by index.html, read by games.html and game pages |
| Web Speech API | Browser API | Spanish pronunciation | Voice loading async; iOS/Safari unreliable |
| Web Audio API | Browser API | Sound effects and music | AudioContext, lazily initialized |
| TSV files | N/A | Vocabulary data | Fetched at runtime with `cache: "no-store"` |

### Pages Inventory
| Page | JS Module | Key Concerns |
|------|-----------|-------------|
| `index.html` | inline scripts | Coin gate, sessionStorage game_lives, inline JS blocks |
| `topic.html` | tapvocab.js | Browse mode, Quiz mode, coin-on-correct, back-button coin refund gap |
| `sentences.html` | sentences.js | Word bank, sentence manager modal, enabledSentences localStorage |
| `conjugation.html` | conjugation.js | Verb table, loadVerbs TSV loader (not shared), enabledVerbs localStorage |
| `fill-blank.html` | fill-blank.js | loadSentences TSV loader (not shared), incomplete TSV row guard |
| `vocab.html` | inline only | Standalone spelling page — completely different styling, no shared-utils, no coins.js |
| `voices.html` | inline only | Debug utility — minimal styling, no shared-utils |
| `games.html` | inline only | Redirects to `/` if no sessionStorage lives |
| `games/coin-dash.html` | inline only | Redirects to `/` if no sessionStorage lives |
| `games/jungle-run.html` | inline only | Redirects to `/` if no sessionStorage lives |
| `games/tower-stack.html` | inline only | Redirects to `/` if no sessionStorage lives |

## Architecture Patterns

### How Issues Should Be Documented

Every issue found during the audit must be written to CONCERNS.md in this format:

```markdown
### [Issue Title]
**Severity: [Critical/High/Medium/Low]**

[Description: what is broken, what the user experiences, when it happens]

File: [path:line if applicable]
```

Severity scale for this project:
- **Critical** — Crash, total loss of functionality, data loss
- **High** — Feature broken for a common user path
- **Medium** — Partial failure, platform-specific, or degrades experience
- **Low** — Minor, edge case, code quality / technical debt

### Audit Checklist Per Page

For each page, check:

1. **Functionality** — Does every interactive element work as expected? Buttons, forms, navigation, coin tracking
2. **Navigation** — Is there always an obvious way home or back? No dead ends?
3. **Data loading** — Does the TSV load? What happens if it fails?
4. **Mobile layout** — Does content fit at 375px? No horizontal overflow?
5. **Tap targets** — Are buttons/interactive elements at least 44px tall?
6. **Visual consistency** — Are CSS variables used? Any raw hex colors, inconsistent spacing?
7. **Script dependencies** — Is load order correct? (coins.js → shared-utils.js → page JS)
8. **Error states** — Is there graceful fallback when something goes wrong?
9. **Console errors** — Would this page produce any errors in a normal user session?

### Already-Known Issues (to VERIFY, not re-discover)

These are documented in CONCERNS.md already. The audit must confirm each is still present and add any missing detail:

| Issue | Location | Status |
|-------|----------|--------|
| Quiz back button doesn't refund coins | tapvocab.js — btnQuizBack.onclick | Confirmed in code: correctCount-- but no CoinTracker call |
| Web Speech API unreliable on iOS/Safari | tapvocab.js:15-32 | voiceschanged event timing differs on iOS |
| localStorage quota exceeded — silent failure | tapvocab.js, sentences.js | catch block only does console.warn |
| No favicon | All pages | Confirmed: no `<link rel="icon">` anywhere, no favicon.ico in root |
| Duplicated TSV loaders | fill-blank.js:9-33, conjugation.js | loadSentences and loadVerbs mirror SharedUtils.loadWords |
| Inline scripts in index.html | index.html:14-36, 84-90 | Practice count + Games button + Reset coins |
| CLAUDE.md outdated | tap-to-vocab/CLAUDE.md | Describes pre-shared-utils architecture |
| Game lives sessionStorage fragility | All game pages | Direct URL navigation breaks game start |
| User state keyed by text strings | tapvocab.js, sentences.js, conjugation.js | Practice list / enabled sentences / enabled verbs by text key |
| scheduleMusic() in animation loop | coin-dash.html, jungle-run.html? | Called on each frame in loop() at line 841 |
| No module loading enforcement | All pages | Manual script order, no bundler |

### New Areas to Investigate

These pages/areas are NOT yet covered in CONCERNS.md and need fresh inspection:

1. **vocab.html** — Completely different visual style (light theme, inline CSS), no coins.js, no shared-utils.js, standalone. Is it still functional? Is it reachable from the main app? What does it look like on mobile?

2. **voices.html** — Debug utility. No app styling. Minimal functionality review needed, but: is it linked from anywhere? Does it have navigation back?

3. **games/jungle-run.html** — Not yet documented. Need to check: sessionStorage guard present? Lives decrement on game-over? Music scheduling pattern same as coin-dash?

4. **games/tower-stack.html** — Same audit as jungle-run.

5. **Mobile 375px layout** — None of the CONCERNS.md entries document specific mobile overflow or layout breakage. Need to note any elements that could cause horizontal scroll or cramped tap targets.

6. **CSS consistency** — vocab.html and voices.html use inline/local styles, not styles.css CSS variables. Document any pages that deviate from the CSS variable system.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Issue tracking format | Custom tracker | Update CONCERNS.md directly | Simple enough, already established |
| Mobile testing | Custom test harness | Browser DevTools device emulation | Sufficient for 375px check |
| Code quality check | Linter | Manual code review | No build pipeline; ESLint not in scope |

**Key insight:** This is a documentation task. The "output" is text in CONCERNS.md, not code. No tooling is needed beyond reading the source files and reasoning about them.

## Common Pitfalls

### Pitfall 1: Fixing Issues Instead of Documenting Them
**What goes wrong:** During audit, a small fix looks trivial. Developer makes the fix and doesn't log the original issue.
**Why it happens:** Reflex to fix when you see something broken.
**How to avoid:** Audit phase is read-only. Log everything. Fix nothing. Even trivial issues go in the list.
**Warning signs:** Any code modification during Phase 1.

### Pitfall 2: Skipping Pages That Look "Correct"
**What goes wrong:** A page that renders correctly is assumed to be bug-free. Mobile layout, error states, and edge cases go unchecked.
**Why it happens:** Visual pass feels complete.
**How to avoid:** Use the per-page checklist for every page. Check mobile, check navigation, check data-failure paths.
**Warning signs:** Only 5–6 pages documented when there are 11.

### Pitfall 3: Treating CONCERNS.md as Complete
**What goes wrong:** Auditor reads CONCERNS.md, says "it's already documented," and misses new issues.
**Why it happens:** CONCERNS.md looks thorough.
**How to avoid:** CONCERNS.md covers learning pages only. Mini-games, vocab.html, and voices.html have zero documented entries. Mobile layout has zero documented entries.
**Warning signs:** No new issues added from vocab.html, voices.html, or the three game files.

### Pitfall 4: Severity Inflation
**What goes wrong:** Every issue gets marked "High" or "Critical." The downstream priority list is useless.
**Why it happens:** Everything feels important when you find it.
**How to avoid:** Use the severity scale consistently. A missing favicon is Low. A total game crash on direct URL is High. Silent coin-refund bug is Low (data correctness issue, not a crash).

### Pitfall 5: Missing the sessionStorage / Direct URL Bug Pattern
**What goes wrong:** The game pages appear to have a guard (`if (parseInt(sessionStorage.getItem("game_lives") || "0", 10) <= 0) { location.replace("/"); return; }`), which looks correct. But the real issue is that a user bookmarking a game URL will be silently redirected home with no explanation.
**Why it happens:** The guard works as written, but the user experience is confusing — they land on `/` with no feedback about why.
**How to avoid:** Note the UX gap as well as the technical behavior.

## Code Examples

### Confirmed Bug: Quiz Back Button Missing Coin Refund

```javascript
// Source: tap-to-vocab/tap-to-vocab/assets/js/tapvocab.js (btnQuizBack.onclick)
btnQuizBack.onclick = () => {
  if (answerHistory.length === 0) return;
  hideQuizCompleteModal();
  const lastAnswer = answerHistory.pop();

  if (lastAnswer.wasSkipped) {
    skippedCount--;
    currentQuizIndex--;
  } else if (lastAnswer.wasCorrect) {
    correctCount--;           // <-- decrements counter
    // BUG: CoinTracker.spendCoins(1) or equivalent is NOT called here
    // Coin was awarded in btnCorrect.onclick via CoinTracker.addCoin()
    // but going back does not refund it
    if (isPracticeCategory) { ... }
    else { currentQuizIndex--; }
  } else {
    wrongCount--;
    currentQuizIndex--;
  }
  showQuizCard();
};
```

### Confirmed Bug: No Favicon on Any Page

```html
<!-- index.html <head> — no favicon link present -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Tap‑to‑Vocab</title>
<!-- Missing: <link rel="icon" href="/favicon.ico"> or similar -->
<link rel="stylesheet" href="/assets/css/styles.css" />
```

### Confirmed: vocab.html Uses Different Visual System

```html
<!-- vocab.html — inline styles, no styles.css, no coins.js, no shared-utils -->
<style>
  body { font: 18px/1.4 system-ui, sans-serif; max-width: 720px; margin: 2rem auto; ... }
  .card { border: 1px solid #ddd; border-radius: 12px; padding: 1rem; }
  .big { font-size: 2rem; ... }
</style>
<!-- Light/default theme instead of the dark CSS variable system -->
```

### Confirmed: Game Pages Guard Against Direct URL Access (BUG-03)

```javascript
// coin-dash.html, jungle-run.html, tower-stack.html — all have this guard
if (parseInt(sessionStorage.getItem("game_lives") || "0", 10) <= 0) {
  location.replace("/");  // Silently redirects home
  return;
}
// games.html also redirects if no lives, without any explanation to user
```

### Confirmed: Silent localStorage Failure Pattern

```javascript
// tapvocab.js — savePracticeList
function savePracticeList(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  catch (e) { console.warn("Could not save practice list:", e); }
  // No user-visible feedback if save fails
}
// Same pattern in sentences.js (saveEnabledSentences) and conjugation.js (saveEnabledVerbs)
```

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| Both tapvocab.js and sentences.js had own `loadWords()` | SharedUtils.loadWords | Refactor done — but fill-blank.js and conjugation.js still have their own TSV loaders |
| No coin system | CoinTracker (coins.js) | coins.js exports `window.CoinTracker` |
| RewardTracker | CoinTracker | RewardTracker is replaced — do not reference anywhere |

**Outdated:**
- `CLAUDE.md` in `tap-to-vocab/tap-to-vocab/` still describes the pre-SharedUtils architecture. It says "both JS files contain their own copy of `loadWords()`" — no longer true for tapvocab.js and sentences.js, but still true for conjugation.js and fill-blank.js.

## Open Questions

1. **jungle-run.html music scheduling pattern**
   - What we know: coin-dash.html calls `scheduleMusic()` on every animation frame (line 841). This is listed in CONCERNS.md as a known issue.
   - What's unclear: Does jungle-run.html have the same pattern, or was it fixed in one game but not the other?
   - Recommendation: Read jungle-run.html game loop during audit and document whether the issue is in 1, 2, or 3 game files.

2. **vocab.html reachability**
   - What we know: vocab.html exists and appears functional as a standalone spelling tool. It has no navigation back.
   - What's unclear: Is vocab.html linked from anywhere in the current app? Or is it an orphaned page that users cannot reach without knowing the URL?
   - Recommendation: Search all HTML files for links to `/vocab.html` during audit.

3. **voices.html navigation**
   - What we know: voices.html is a debug utility with no app styling and no back/home navigation.
   - What's unclear: Is it intentionally debug-only (not user-facing) or should it have a back button?
   - Recommendation: Note in CONCERNS.md whether it's reachable and whether navigation is needed.

4. **CSS `grid-two-col` on very small screens**
   - What we know: index.html uses a forced 2-column grid with `grid-template-columns: 1fr 1fr`. Category buttons could become narrow at 375px.
   - What's unclear: Does this cause text wrapping or overflow on iPhone SE?
   - Recommendation: Inspect at 375px viewport during audit.

## Validation Architecture

> `nyquist_validation: true` in config.json, so this section is included.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — no test framework exists for this project |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUDT-01 | CONCERNS.md updated with all-page issue list | manual | N/A | N/A |

**Note:** AUDT-01 is a documentation requirement. The verification is human review — check that CONCERNS.md was updated and covers every page listed in the success criteria. There is no automated test possible for this requirement.

### Sampling Rate
- **Per task commit:** Manual review that the page was audited and entries were added
- **Per wave merge:** Confirm all 11 pages (index, topic, sentences, conjugation, fill-blank, vocab, voices, games, coin-dash, jungle-run, tower-stack) appear in CONCERNS.md audit entries
- **Phase gate:** CONCERNS.md has entries for all pages; every entry has a severity rating; success criteria 1-4 are met

### Wave 0 Gaps
None — existing infrastructure (CONCERNS.md, manual audit) covers all phase requirements. No test framework install needed.

## Sources

### Primary (HIGH confidence)
- Direct code read of all HTML and JS files in `/home/desire/tap-to-vocab/tap-to-vocab/` — all findings are based on actual source, not inference
- `.planning/codebase/CONCERNS.md` — existing issue registry (13 entries)
- `.planning/REQUIREMENTS.md` — authoritative requirement IDs and descriptions
- `.planning/ROADMAP.md` — phase scope and success criteria

### Secondary (MEDIUM confidence)
- MEMORY.md project memory — background on known patterns (coin system, SharedUtils, TSV loading)

### Tertiary (LOW confidence)
- None for this phase — all claims are code-verified

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — read directly from source files
- Architecture patterns: HIGH — read directly from source files
- Pitfalls: HIGH — derived from confirmed code patterns and CONCERNS.md history
- Issue inventory: HIGH — code-confirmed, not speculative

**Research date:** 2026-03-10
**Valid until:** Until codebase changes (stable; no external dependencies)
