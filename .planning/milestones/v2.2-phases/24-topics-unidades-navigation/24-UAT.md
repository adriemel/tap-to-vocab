---
status: complete
phase: 24-topics-unidades-navigation
source: [24-01-SUMMARY.md, 24-02-SUMMARY.md, 24-03-SUMMARY.md]
started: 2026-09-11T05:30:00Z
updated: 2026-09-11T05:38:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Home screen shows the two big Topics / Unidades buttons
expected: The home screen shows 📚 Topics and 📖 Unidades side by side as large, bold buttons in place of the old 10 category buttons. Practice and all 9 tool/game buttons below are unchanged.
result: pass
verified_by: playwright (390px) — only 2 vocabulary links on home, same row, 92px tall vs 40px Practice; tool/game buttons in original order; only ?cat=practice remains; no horizontal overflow. User also approved the enlarged buttons live on tapvocab.fun this session.

### 2. Topics screen lists all 9 topics
expected: Tapping 📚 Topics opens a screen titled "📚 Topics" with 9 buttons (Colores, Animales, Numeros, Saludar, Palabras, Casa y Familia, Calendario, Comida y Bebida, Escuela), a coin badge and a 🏠 Home button.
result: pass
verified_by: playwright — all 9 buttons present with correct ?topic= links, #coin-counter present, Home links to /.

### 3. Each topic opens its word list with every word exactly once
expected: Tapping a topic opens the word list titled with that topic, and the counter shows distinct words only (no duplicate cards): Colores 15, Animales 21, Numeros 32, Saludar 54, Palabras 227, Casa_Familia 63, Calendario 49, Comida_Bebida 20, Escuela 45.
result: pass
verified_by: playwright — all 9 topic pages rendered the expected title and counter "1 / N" with the deduplicated counts above (CR-01 fix confirmed in the DOM); zero page errors.

### 4. Unidades screen lists 5 unidades, each opening its full list
expected: Tapping 📖 Unidades shows 5 buttons (Unidad 2, 3, 4, 5A, 5B). Each opens its word list: Unidad2 77, Unidad3 143, Unidad4 108, Unidad5A 115, Unidad5B 44.
result: pass
verified_by: playwright — all 5 pages rendered the expected title and counter; Unidad5B reachable for the first time.

### 5. Home control on both sub-screens
expected: Both Topics and Unidades show a 🏠 Home button that returns to the home screen.
result: pass
verified_by: playwright — exactly one "🏠 Home" link to / on each sub-screen.

### 6. Coin counter is up to date after browser Back
expected: Topics → a topic → earn coins in the Quiz → browser Back. The coin badge on the Topics screen shows the new balance.
result: pass
verified_by: user — confirmed in this session after the WR-01 fix ("Cool works").

### 7. Practice list keeps its own heading
expected: The ⭐ Practice button still opens the practice list titled "⭐ Practice"; even a hand-made URL like ?cat=Practice&topic=Colores shows the practice list under "⭐ Practice".
result: pass
verified_by: playwright — both URLs showed "⭐ Practice" with the practice-list empty message (WR-02 fix confirmed); user also confirmed ("Cool works").

### 8. Topics and Unidades screens look right on your phone
expected: On a real phone, each sub-screen shows the title, coin badge and 🏠 Home at the top, then a single column of full-width, easy-to-tap buttons, with no label wrapping awkwardly and nothing cut off.
result: pass
note: user accepted the Unidades header wrapping onto two lines at ~390px.

### 9. Topic page headings
expected: Opening a topic shows its name as the heading. Topics whose names contain an underscore show it as-is — "Casa_Familia" and "Comida_Bebida" — even though the button said "Casa y Familia" / "Comida y Bebida". Acceptable as-is?
result: pass
note: user accepted raw topic slugs as headings (24-REVIEW.md IN-02 stays optional polish).

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
