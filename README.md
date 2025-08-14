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
- Make a folder matching the category (e.g., `/food/`) and copy `index.html` from any category into it (or just create the folder; the provided `index.html` is generic).

## Adding a new category

1. Add rows to `data/words.tsv`, e.g.:
```
food	manzana	Apfel
food	pan	Brot
```
2. Create a folder `/food/` and put an `index.html` (you can copy one from `/colors/`).
3. Push to GitHub Pages. Then your NFC URL is `https://YOUR-DOMAIN/food/`.

## Notes

- The app always **voices Spanish (es-ES)** using the Web Speech API.
- Works on modern mobile browsers. iOS may require a tap before speech is allowed.
- If a category has **no rows**, the page shows a helpful error message.