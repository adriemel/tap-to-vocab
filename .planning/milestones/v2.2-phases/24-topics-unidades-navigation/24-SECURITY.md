---
phase: 24
slug: topics-unidades-navigation
status: verified
threats_open: 0
asvs_level: 1
created: 2026-09-11
---

# Phase 24 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| URL query string → page DOM | `?topic=` (new this phase) and `?cat=` are attacker-controllable via a crafted link and flow into `TapVocabTSV.initFromTSV` | Untrusted short string, non-sensitive |
| Same-origin `fetch` of `/data/words.tsv` | Static asset from GitHub Pages; `tsvPath` is not settable from the URL | Public vocabulary data |
| `localStorage` → `#coin-counter` / `#practice-btn` | User's own coin balance and practice list in their own browser (pre-existing; `coins.js` gained `pageshow`/`storage` listeners in the WR-01 fix) | User-owned, non-sensitive |

No server, database, session, authentication or cross-origin request exists in this codebase.

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-24-01 | Tampering (DOM XSS via reflected URL param) | `?topic=` → `titleEl` / `errorEl` in `assets/js/tapvocab.js` | mitigate | Both sinks use `textContent` (`tapvocab.js:495-496, 521, 530`); zero `innerHTML` / `insertAdjacentHTML` / `outerHTML` / `document.write` in the file (grep = 0, re-checked after the CR-01/WR-02 fixes); empty-state Home button built with `createElement` | closed |
| T-24-02 | Denial of Service (client-side) | `rows.filter` on an unmatched `?topic=` slug | accept | Linear scan of ~750 in-memory rows, falls into the existing empty-result branch; self-inflicted only — see AR-24-01 | closed |
| T-24-03 | Tampering (crash via untyped data) | `r.topics` blank / `undefined` on untagged and rehydrated rows | mitigate | `(r.topics \|\| "")` guard before `.toLowerCase()` still present after the CR-01 dedupe rewrite (`tapvocab.js:483`); UAT test 3 loaded all 9 topics with zero page errors | closed |
| T-24-04 | Tampering (DOM XSS) | 14 hardcoded anchor `href`s on `topics.html` / `unidades.html` | accept | Literal authored URLs, no interpolation, no sink — see AR-24-02 | closed |
| T-24-05 | Tampering | `coins.js` writing the `localStorage` balance into `#coin-counter` | accept | User's own value in their own browser. The `innerHTML` write (`coins.js:34`) only ever receives a static span plus `getCoins()`, which is `parseInt(...) \|\| 0` — always an integer. The new `storage` listener (`coins.js:42`) re-reads through `getCoins()` and never uses `e.newValue`; `storage` events are same-origin only — see AR-24-03 | closed |
| T-24-06 | Spoofing (off-origin script/link injection) | `<script src>` / `<link href>` on the two hub pages | mitigate | Only same-origin `/assets/js/coins.js`, same-origin `/assets/css/styles.css`, and an inline `data:` SVG favicon on each page (`topics.html:6,8,36`, `unidades.html:6,8,32`); no off-origin host | closed |
| T-24-07 | Tampering (hijackable link) | `index.html` Topics / Unidades hrefs | mitigate | Root-relative literals `/topics.html`, `/unidades.html` (`index.html:29-30`); both targets exist; UAT test 1-2 navigated them | closed |
| T-24-08 | Denial of Service (self-inflicted UI breakage) | Deleting 10 anchors from `.grid-two-col` | mitigate | `git diff 61e801d^ HEAD -- index.html` removes exactly the 10 category anchors (+ one blank line) and no tool/game button; UAT test 1 confirmed button order | closed |
| T-24-09 | Information disclosure | `CLAUDE.md` / `tap-to-vocab-walkthrough.md` edits | accept | Public architecture docs; diff scan found no secrets, keys, e-mail addresses or local paths — see AR-24-04 | closed |
| T-24-SC | Tampering (supply chain) | Dependency installs | N/A | Zero-dependency static site: no package manager, lockfile, CDN or build step; nothing installed this phase | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-24-01 | T-24-02 | Worst case is a bounded in-memory scan in the attacker's own tab; no server cost, no amplification | Plan 24-01 threat model; confirmed in /gsd:secure-phase | 2026-09-11 |
| AR-24-02 | T-24-04 | No user-supplied value reaches markup on either hub page; nothing to exploit | Plan 24-02 threat model; confirmed in /gsd:secure-phase | 2026-09-11 |
| AR-24-03 | T-24-05 | Forging one's own coin balance only self-grants game plays, which the app already allows via the Reset/coin design; display value is integer-coerced | Plan 24-02 threat model; re-confirmed after WR-01 change | 2026-09-11 |
| AR-24-04 | T-24-09 | Docs are already public in a public repo and describe architecture only | Plan 24-03 threat model; confirmed in /gsd:secure-phase | 2026-09-11 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-09-11 | 10 | 10 | 0 | /gsd:secure-phase orchestrator (plan-time register; auditor agent skipped per short-circuit rule — threats_open 0, register authored at plan time). Evidence re-checked against HEAD including review fixes 3431019, ca6d9b2, ccd1143. |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-09-11
