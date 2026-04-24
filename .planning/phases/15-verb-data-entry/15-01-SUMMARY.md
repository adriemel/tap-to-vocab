---
plan: 15-01
phase: 15-verb-data-entry
status: complete
self_check: PASSED
key-files:
  created: []
  modified:
    - tap-to-vocab/data/verbs.tsv
---

## What Was Built

Appended 6 new verb rows to `tap-to-vocab/data/verbs.tsv`, expanding the conjugation practice pool from 13 to 19 verbs.

## Rows Added (verbatim)

```
saber	wissen (Sachverhalt), kennen (Fakten)	sé	sabes	sabe	sabemos	sabéis	saben
hacer	machen, tun	hago	haces	hace	hacemos	hacéis	hacen
beber	trinken	bebo	bebes	bebe	bebemos	bebéis	beben
vivir	leben, wohnen	vivo	vives	vive	vivimos	vivís	viven
entender	verstehen	entiendo	entiendes	entiende	entendemos	entendéis	entienden
comer	essen	como	comes	come	comemos	coméis	comen
```

## File Integrity

- CRLF line endings preserved (confirmed via Python `rb` mode + `file` command)
- UTF-8 NFC accents throughout (á, é, í, ó, ú, ü)
- All 13 pre-existing verb rows unchanged (estar, ser, tener, hablar, escuchar, buscar, trabajar, tocar, estudiar, grabar, practicar, mirar, quedar)
- Final line count: 20 (1 header + 19 verb rows)

## Automated Verification Output

```
OK: verbs.tsv validated — 20 lines, CRLF, 6 new verbs appended correctly
```

All acceptance criteria greps returned expected match counts (1 per new verb, 1 per anchor existing verb).

## Checkpoint Observation

Human smoke test passed: all 6 new verbs appeared in the Verb Manager alongside the 13 existing verbs. Show mode and Practice mode rendered conjugations correctly. No console errors reported.

## Deviations

None. No JS, HTML, or CSS changes were required — `conjugation.js` already loads all rows from `verbs.tsv` via `SharedUtils.loadTSV` dynamically.
