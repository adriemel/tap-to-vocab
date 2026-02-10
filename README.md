# Tap-to-Vocab Template (TSV-driven)

This version loads words from a single TSV file at `/data/words.tsv`.
Each category page is generic and infers its category from the URL path
(e.g., `/colors/` → `colors`).

## TSV format

File: `/data/words.tsv`

```
category	es	de
colors	rojo	rot
colors	azul	blau
...
```

- Columns must be: `category`, `es`, `de` (tab-separated).
- Add rows for new categories (e.g., `food`, `school`).


## Adding a new category

1. Add rows to `data/words.tsv`, e.g.:
```
food	manzana	Apfel
food	pan	Brot
```


## Notes

- The app always **voices Spanish (es-ES)** using the Web Speech API.
- Works on modern mobile browsers. iOS may require a tap before speech is allowed.
- If a category has **no rows**, the page shows a helpful error message.
