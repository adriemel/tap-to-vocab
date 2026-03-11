# Testing

## Current State

**No automated test suite exists.**

There is no testing framework, no test files, no test runner, and no CI checks. The CLAUDE.md explicitly states: "There is no build, lint, or test command."

## Manual Testing Approach

Testing is done manually by running a local static server and using the app in a browser:

```bash
cd tap-to-vocab/tap-to-vocab
python3 -m http.server 8000
# Open http://localhost:8000
```

All asset paths are absolute (`/assets/...`, `/data/...`) so `file://` URLs don't work — a local server is required.

## What Gets Tested

All verification is manual and browser-based:
- Navigate each game page and verify it loads without console errors
- Test game flows (correct/wrong answers, coin earning, back/skip/complete)
- Check localStorage persistence (coins, practice list) across page refreshes
- Test edge cases (empty practice list, incomplete TSV rows, first visit)
- Verify Web Speech API voice selection (Spanish voice preference)
- Test mobile layout (Chrome DevTools responsive mode)

## Known Testing Gaps

- No unit tests for utility functions (`shuffleArray`, `loadWords`, TSV parsing)
- No integration tests for game flows
- No regression tests for previously fixed bugs
- No cross-browser automated testing
- No accessibility testing beyond manual checks
- No performance testing

## Playwright MCP Available

The project has Playwright MCP configured (`.playwright-mcp/` directory exists), which can be used for browser-based integration testing via Claude Code. This is used for manual verification sessions rather than automated test runs.

## Bug Tracking

Known/tracked issues are documented in:
- `tap-to-vocab/.claude/low-severity-issues.md` — tracked low-priority bugs

## Regression Notes

Key behaviors to verify when making changes:

**TSV parsing:**
- Incomplete rows must not crash (use `(cols[i] || "").trim()`)
- Filter rows with all required fields present
- `verbs.tsv` header uses `él` with accent (U+00E9) — must use dynamic header parsing

**Quiz mode:**
- Card must reset without visible unflip animation between questions
- 2-second reveal delay must work correctly on mode switch

**Empty state:**
- Empty practice list: hide browse-mode and mode-tabs, show error + standalone Home button
- Error button must be outside any hidden parent div

**Coin system:**
- `coins.js` must load before `shared-utils.js` on all pages
- `#coin-counter` element auto-updated via `coinschanged` CustomEvent
- Games button costs 10 coins exactly

**Navigation:**
- Back buttons use local history array (not browser `history.back()`)
- Absolute paths (`/`) work in GitHub Pages subdomain deployment
