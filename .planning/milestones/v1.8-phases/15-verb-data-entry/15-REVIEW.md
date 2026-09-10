---
phase: 15-verb-data-entry
reviewed: 2026-04-24T00:00:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - tap-to-vocab/data/verbs.tsv
findings:
  critical: 0
  warning: 1
  info: 1
  total: 2
status: issues_found
---

# Phase 15: Code Review Report

**Reviewed:** 2026-04-24
**Depth:** standard
**Files Reviewed:** 1
**Status:** issues_found

## Summary

The file `tap-to-vocab/data/verbs.tsv` was reviewed for structural correctness, encoding health, and linguistic accuracy of the 6 newly added verb entries (saber, hacer, beber, vivir, entender, comer).

**Structural checks passed:**
- All 20 data rows (+ header) have exactly 8 tab-separated columns
- UTF-8 encoding is valid throughout; no BOM present
- No embedded newlines or stray control characters detected
- No trailing whitespace in any cell
- The `él` header column is NFC-encoded (U+00E9 + U+006C), consistent with the existing codebase note that `conjugation.js` uses dynamic header parsing — this is fine

**Conjugation accuracy verified:** All 6 new verbs have correct present-indicative forms, including the irregular first-person `sé` (saber) and the stem-changing diphthong in `entender` (entiendo/entiendes/entiende/entienden).

**Parser compatibility confirmed:** `shared-utils.js` `loadTSV()` splits on `/\r?\n/` and calls `.filter(Boolean)`, which correctly handles both the CRLF line endings and the trailing empty line at EOF. The consumer in `conjugation.js` additionally filters with `.filter(v => v.infinitive && v.de)`, providing a second safety net. No runtime impact from either finding below.

---

## Warnings

### WR-01: CRLF line endings inconsistent with typical LF convention for source files

**File:** `tap-to-vocab/data/verbs.tsv:1-20`
**Issue:** The entire file uses Windows-style CRLF (`\r\n`) line endings. This is functionally harmless because `shared-utils.js` splits on `/\r?\n/`, but CRLF in a Git repository on Linux can cause noisy diffs, confuse editors, and may conflict with a `.gitattributes` rule if one is added later. The existing pre-existing rows (lines 2–14) already had CRLF, so the 6 new rows are consistent with the file's own convention — but the file-level convention differs from the Unix norm expected for text assets in a static web project.
**Fix:** Convert the file to LF endings once (not urgently, as the parser handles both):
```bash
sed -i 's/\r//' tap-to-vocab/data/verbs.tsv
```
Or add a `.gitattributes` rule to normalise on checkout:
```
data/*.tsv text eol=lf
```

---

## Info

### IN-01: Trailing blank line at end of file

**File:** `tap-to-vocab/data/verbs.tsv:21`
**Issue:** The file ends with a trailing empty line (line 21 is blank after the final CRLF). This is harmless — the `loadTSV` parser's `.filter(Boolean)` call discards empty lines — but it is mildly inconsistent with conventional TSV formatting which typically ends immediately after the last data row.
**Fix:** Remove the trailing newline if uniformity is desired. No functional change required.

---

_Reviewed: 2026-04-24_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
