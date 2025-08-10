# Tap‑to‑Vocab (Deutsch ↔ Español)

`vocab.html` zeigt ein Wort, spricht es (Spanisch oder Deutsch) und prüft die Schreibweise. Inhalte kommen über URL‑Parameter.

## Dateien
- `index.html` — Startseite mit Demos
- `vocab.html` — Lernseite (Audio + Schreibweise)
- `builder.html` — Generator für NFC‑Links

## Schnellstart
1. Dateien in ein GitHub‑Repository laden.
2. GitHub Pages aktivieren (Settings → Pages → Deploy from a branch → `main` / root).
3. Öffentliche URL: `https://USERNAME.github.io/REPO/`
4. Lernseite: `https://USERNAME.github.io/REPO/vocab.html`

## URL‑Parameter
- `w`  — spanisches Wort (optional, wenn Deutsch‑Prompt genutzt wird)
- `de` — deutsches Wort/Übersetzung (optional, wenn Spanisch‑Prompt genutzt wird)
- `lang` — spanische Stimme für TTS (Standard `es-ES`)
- `sent` — Beispielsatz (optional)
- `mode` — `prompt-de`, `prompt-es`, `listen-spell-es`, `listen-spell-de`

**Ziel der Schreibübung**
- `prompt-de` / `listen-spell-es`: Lösung ist **Spanisch** (`w`).
- `prompt-es` / `listen-spell-de`: Lösung ist **Deutsch** (`de`).

## NFC
Schreibe die vollständige URL auf einen NFC‑Tag (Record: URL). Drucke einen QR‑Code der gleichen URL als Fallback.
