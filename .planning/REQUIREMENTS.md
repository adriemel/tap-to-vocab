# Requirements: Tap-to-Vocab Quality Milestone

**Defined:** 2026-03-10
**Core Value:** Every interaction must work correctly and feel polished so nothing interrupts the learning flow.

## v1 Requirements

### Audit

- [ ] **AUDT-01**: All pages systematically audited for broken functionality, mobile layout issues, and code quality problems — producing a documented issue list

### Bugs

- [ ] **BUG-01**: Quiz back button refunds coins when undoing a previously-marked correct answer
- [ ] **BUG-02**: Web Speech API voice loading works on iOS/Safari — falls back gracefully to any available Spanish voice without silent failure
- [ ] **BUG-03**: Game lives are properly initialized when a user navigates directly to a game URL (not just via sessionStorage from index.html)
- [ ] **BUG-04**: Favicon present on all pages — no 404 on every page load
- [ ] **BUG-05**: localStorage quota exceeded shows visible user feedback instead of silently failing
- [ ] **BUG-06**: Any additional broken functionality discovered during audit is fixed

### Structure

- [ ] **STRCT-01**: Duplicated TSV loaders in fill-blank.js (loadSentences) and conjugation.js (loadVerbs) consolidated — no copy-paste TSV parsing outside SharedUtils
- [ ] **STRCT-02**: Inline `<script>` blocks in index.html extracted to a dedicated JS module
- [ ] **STRCT-03**: Game lives logic deduplicated across coin-dash.html, jungle-run.html, tower-stack.html
- [ ] **STRCT-04**: CLAUDE.md files updated to accurately reflect current architecture (SharedUtils, CoinTracker, current script load order)

### UI Consistency

- [ ] **UI-01**: All pages use consistent button styles, spacing, and typography from established CSS variables — no one-off overrides
- [ ] **UI-02**: Navigation is clear and consistent — every page has an obvious way to go back or return home
- [ ] **UI-03**: Visual polish pass — no visually unfinished elements (misaligned items, inconsistent padding, mismatched font sizes)

### Mobile

- [ ] **MOB-01**: All pages are usable and visually correct at 375px viewport width (iPhone SE)
- [ ] **MOB-02**: Tap targets are minimum 44px height/width on all interactive elements
- [ ] **MOB-03**: No horizontal overflow or scroll on any page at 375px width

## v2 Requirements

### Performance

- **PERF-01**: TSV files cached with a revalidation strategy instead of `cache: "no-store"` — reduces load time after first visit
- **PERF-02**: Service worker for offline fallback — app usable without network after initial load

### Coin Economy

- **COIN-01**: Coin balance has a reasonable upper cap — prevents unrealistic accumulation
- **COIN-02**: User state (practice list, enabled sentences) uses stable IDs instead of text strings — survives vocabulary edits in TSV files

## Out of Scope

| Feature | Reason |
|---------|--------|
| New game modes or features | This milestone is quality-only, not growth |
| ESM modules / build pipeline | Migration cost not justified for project size |
| Authentication / user accounts | By design — single-user public app |
| Backend or server-side logic | Static-only, GitHub Pages |
| Automated testing suite | Out of scope for quality pass |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUDT-01 | Phase 1 — Audit | Pending |
| BUG-01 | Phase 2 — Bug Fixes | Pending |
| BUG-02 | Phase 2 — Bug Fixes | Pending |
| BUG-03 | Phase 2 — Bug Fixes | Pending |
| BUG-04 | Phase 2 — Bug Fixes | Pending |
| BUG-05 | Phase 2 — Bug Fixes | Pending |
| BUG-06 | Phase 2 — Bug Fixes | Pending |
| STRCT-01 | Phase 3 — Code Cleanup | Pending |
| STRCT-02 | Phase 3 — Code Cleanup | Pending |
| STRCT-03 | Phase 3 — Code Cleanup | Pending |
| STRCT-04 | Phase 3 — Code Cleanup | Pending |
| UI-01 | Phase 4 — UI & Mobile Polish | Pending |
| UI-02 | Phase 4 — UI & Mobile Polish | Pending |
| UI-03 | Phase 4 — UI & Mobile Polish | Pending |
| MOB-01 | Phase 4 — UI & Mobile Polish | Pending |
| MOB-02 | Phase 4 — UI & Mobile Polish | Pending |
| MOB-03 | Phase 4 — UI & Mobile Polish | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-10*
*Last updated: 2026-03-10 after roadmap creation*
