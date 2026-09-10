# Tap-to-Vocab — Plain-English Walkthrough

---

## What This App Does

Tap-to-Vocab is an interactive Spanish vocabulary learning app that runs entirely in a web browser. Students browse vocabulary cards, take quizzes in both directions (Spanish → German and German → Spanish), practice verb conjugations, build sentences word-by-word, and play arcade games — all on a single site with no accounts or servers required. Every correct answer earns a virtual coin, and coins are spent to unlock the games.

The app is deployed at **tapvocab.fun** and hosted on GitHub Pages, meaning it costs nothing to run and works on any device with a modern browser, including phones.

---

## The Big Picture

Think of the app as a language classroom with several rooms. The home page is the hallway. Each door leads to a different activity. Everything you learn in the practice rooms earns you coins. Collect enough coins and you can go to the game room.

```
                          ┌──────────────────┐
                          │   index.html     │
                          │   (Home / Hub)   │
                          └────────┬─────────┘
           ┌──────────────────┬────┴────┬───────────────────┐
    ┌──────▼──────┐   ┌───────▼──────┐  │         ┌─────────▼──────────┐
    │  topic.html │   │conjugation   │  │         │    games.html      │
    │  (Browse &  │   │   .html      │  │         │  (Arcade Zone)     │
    │   Quiz)     │   │  (Verbs)     │  │         │                    │
    └─────────────┘   └──────────────┘  │         │ tower-stack.html   │
                                  ┌─────▼──────┐  │ coin-dash.html     │
                                  │ sentences  │  │ jungle-run.html    │
                                  │ fill-blank │  └────────────────────┘
                                  └────────────┘
```

The whole app runs without a server — all computation happens in the browser. There is no database, no login, and no internet connection needed after the first load. Vocabulary, verbs, and exercises are stored in simple text files (`.tsv` format, like spreadsheets) that are easy to edit.

---

## File & Folder Map

```
tap-to-vocab/
│
├── index.html            ← Home page with navigation + coin display
├── topic.html            ← Browse vocabulary / take quizzes
├── conjugation.html      ← Verb conjugation practice
├── sentences.html        ← Build sentences from scrambled words
├── fill-blank.html       ← Fill-in-the-blank grammar drills
├── voices.html           ← Tool for testing audio voices
├── games.html            ← Game zone menu
│
├── games/
│   ├── tower-stack.html  ← 3D block stacking game
│   ├── coin-dash.html    ← Side-scrolling dodge & collect game
│   └── jungle-run.html   ← Platformer with a monkey
│
├── assets/
│   ├── css/styles.css    ← All visual styling for the app
│   └── js/
│       ├── shared-utils.js   ← Reusable tools (shuffle, sounds, animations)
│       ├── coins.js          ← Coin counter system
│       ├── tapvocab.js       ← Browse & quiz logic
│       ├── conjugation.js    ← Verb practice logic
│       ├── sentences.js      ← Sentence builder logic
│       └── fill-blank.js     ← Fill-in-the-blank logic
│
└── data/
    ├── words.tsv             ← Vocabulary: category, Spanish, German
    ├── verbs.tsv             ← Verb conjugations (6 forms per verb)
    └── fill-in-blank.tsv     ← Grammar drill sentences
```

---

## Section-by-Section Walkthrough

---

### The Data Files (`data/`)

These are the heart of the content. They're plain text files in **TSV format** — like a spreadsheet saved as text, where each column is separated by a tab character. Open them in any text editor or Excel.

#### `words.tsv` — The Vocabulary List
**What it does:** Contains every Spanish/German word pair in the app. Each row is one word or phrase, tagged with a category (e.g., "Colores" for colors, "Animales" for animals). Categories match the buttons on the home page.
**Why it exists:** Every quiz, sentence-building exercise, and browse mode draws from this file. Change this file and the whole app updates.
**To change it:** Add a new row with `[category][TAB][Spanish word][TAB][German word]`. To create a new category, just use a new category name — it will appear automatically on the home page. Rows that end with a `.`, `?`, or `!` are treated as sentences for the sentence-builder.

#### `verbs.tsv` — The Verb Table
**What it does:** One row per verb. Each row has the infinitive (base form), the German meaning, and all six Spanish conjugations: yo, tú, él/ella, nosotros, vosotros, ellos.
**Why it exists:** The conjugation practice page reads directly from this file. Add a verb here and it appears in the practice rotation immediately.
**To change it:** Add a new row with all eight columns filled in. All six conjugated forms are required.

#### `fill-in-blank.tsv` — Grammar Drill Questions
**What it does:** Each row is one fill-in-the-blank question. It has a German sentence (for context), the Spanish sentence with a `___` placeholder, the correct answer, and wrong answers separated by commas.
**Why it exists:** Provides structured grammar practice, currently focused on the *hay* vs. *estar* distinction (ways of saying "there is" vs. "to be located").
**To change it:** Add a new row following the same column layout. Up to three wrong answers are shown alongside the correct one.

---

### `assets/css/styles.css` — The Visual Design

**What it does:** Controls everything you see — colors, fonts, card shapes, button styles, spacing, and animations. The whole app uses a dark navy theme with a blue accent, green for success, and pink/red for errors.
**Why it exists:** Keeping all styling in one file means you change a color once and it updates everywhere.
**To change it:** The color palette is defined at the top using CSS variables (named colors like `--accent` and `--ok`). Change a value there and it updates across the whole app. The key variables are:
- `--bg`: Page background (dark navy)
- `--accent`: Interactive elements (blue)
- `--ok`: Correct answers (green)
- `--error`: Wrong answers (pink)
- `--warn`: Warnings and reminders (gold)

---

### `assets/js/shared-utils.js` — Shared Tools

**What it does:** A collection of helper functions used by every page. Any page that needs to shuffle words, play a sound, or show a confetti animation calls code from here.
**Why it exists:** Prevents every page from having its own copy of the same logic.

#### Shuffle
**What it does:** Randomizes the order of any list (vocabulary cards, word buttons, answer choices).
**Why it exists:** Without this, quizzes would always present words in the same order.

#### TSV Loader
**What it does:** Fetches a `.tsv` data file from the server, reads the first line as column headers, and turns every subsequent line into an object. So a row `Colores | negro | schwarz` becomes `{category: "Colores", es: "negro", de: "schwarz"}`.
**Why it exists:** Every learning page needs to load its data file, and they all use the same technique.

#### Success Sound
**What it does:** Plays a quick upward three-note chime (C–E–G) using the browser's built-in audio engine. No audio files are downloaded.
**Why it exists:** Gives instant positive feedback when an answer is correct.

#### Error Sound
**What it does:** Plays a low buzzing tone to signal a wrong answer.
**Why it exists:** Clear audio feedback for mistakes without being harsh.

#### Success Animation
**What it does:** Causes a random emoji (🎉, ⭐, ✨, etc.) to appear and float down the screen briefly.
**Why it exists:** A lightweight visual reward without distracting too much.

#### Confetti Burst
**What it does:** Launches dozens of colored circles from the center of the screen that drift and fade out over about a second.
**Why it exists:** Used for bigger victories — completing a full set of exercises, finishing a round of conjugations, etc.

---

### `assets/js/coins.js` — The Coin System

**What it does:** Manages the coin counter that appears on every page. Coins are stored in the browser's local storage (they persist between sessions even after closing the browser). Any page can call "add a coin" or "spend coins", and any visible coin counter on the page updates automatically.
**Why it exists:** The coin economy motivates practice — you must earn coins through learning before you can play games.
**To change it:** The starting cost of the games is set in `index.html` (currently 10 coins). The coin storage key is `tapvocab_coins` in localStorage — you can see (and manually edit) this in your browser's developer tools.

---

### `index.html` — The Home Page

**What it does:** The starting point of the app. Shows a grid of vocabulary category buttons, four learning-mode buttons (Practice, Build Sentences, Verbs, Fill in the Blank), the Games button, and your current coin count in the top-right corner.
**Why it exists:** Central navigation hub — from here you get to every other section.

#### Category grid
**What it does:** Each button links to `topic.html?cat=CategoryName`, loading that specific vocabulary set. Categories come directly from the category names used in `words.tsv`.
**To change it:** Add or rename categories in `words.tsv`. The home page buttons are defined in the HTML itself and must be updated manually to match.

#### Practice button
**What it does:** Shows how many words you've starred for focused review. Links to `topic.html?cat=practice`.
**Why it exists:** Quick access to your personal review list — words you marked as needing more practice.

#### Games button (coin-gated)
**What it does:** Clicking it checks your coin count. If you have 10 or more, it deducts 10 coins, sets 3 "lives" in session storage, and takes you to the game zone. If you have fewer than 10, it shows a message explaining how to earn more.
**Why it exists:** The coin requirement ensures students practice vocabulary before playing games.

#### Reset button
**What it does:** A small fixed button in the bottom-right corner. After confirmation, sets coins back to 0.
**Why it exists:** A convenience reset for teachers or for starting fresh.

---

### `topic.html` — Browse & Quiz

**What it does:** The main vocabulary learning page. It has three modes selectable by tabs at the top: Browse, Quiz (Spanish → German), and Quiz (German → Spanish). It loads vocabulary for whichever category is in the URL.

#### Browse mode
**What it does:** Shows one card at a time with the Spanish word large on screen. The German translation starts hidden. You can hear the word spoken aloud (via the browser's text-to-speech), reveal the German, star the word to your practice list, and move forward or backward.
**To change it:** The "auto-speak" checkbox auto-pronounces each word when you navigate to it. This is remembered per browser session.

#### Quiz mode (Spanish → German and German → Spanish)
**What it does:** Shows one side of a flashcard. You think of the answer, then tap the card to flip it and reveal the other side. Two buttons appear: "Got it!" (earns 1 coin, marks the word as known, removes it from practice list if it was there) and "Need Practice" (adds the word to your practice list for later review).
**Why there are two directions:** Reading "hola → Hallo" is different from reading "Hallo → ?" and recalling the Spanish. Both skills matter.
**Why it exists:** Spaced repetition is the most effective vocabulary learning technique — this implements a basic version of it.

#### Practice list
**What it does:** A special category (`?cat=practice`) that shows only the words you've starred. Correctly answering a practice word removes it from the list.
**Why it exists:** Lets students focus only on the words they find hard, rather than wading through things they already know.

---

### `conjugation.html` — Verb Practice

**What it does:** Presents Spanish verbs one at a time. In Practice mode, all six conjugated forms appear as buttons in a scrambled word bank below the verb. You tap them in the correct order (yo → tú → él → nosotros → vosotros → ellos) to fill in the conjugation table. A wrong tap triggers an error sound and the button shakes. Completing a verb earns 1 coin. In Show mode, you just browse all conjugations without interacting.

#### Verb Manager
**What it does:** A settings panel (⚙️ button) that lets you choose which verbs to include in your rotation. Your selection is remembered across sessions.
**Why it exists:** Lets a teacher assign specific verbs for a lesson, or lets a student focus on verbs they find difficult.

---

### `sentences.html` — Sentence Builder

**What it does:** Shows a German sentence as the target, then presents the Spanish words of that sentence as scrambled buttons. You tap the words in the correct order. Tapping the wrong word triggers an error sound. Tapping a correctly placed word undoes it (and all words after it) so you can correct yourself. Completing a sentence earns 1 coin.

**How sentences are chosen:** Only entries in `words.tsv` that end with a period, question mark, or exclamation mark (and have three or more words) are used as sentence exercises. This means adding sentences to the vocabulary list automatically makes them available here.

#### Sentence Manager
**What it does:** A settings panel (⚙️ button) where you can select which sentences to practice. Remembered across sessions.

---

### `fill-blank.html` — Fill in the Blank

**What it does:** Shows a German sentence at the top for context, then a Spanish sentence with a highlighted blank (`___`). Four buttons appear below with answer choices. Tapping the correct one fills the blank (button turns green), plays a success sound, and auto-advances after 1.5 seconds. Tapping wrong turns the button red and disables it — you can still try another option.

**Current content focus:** The exercises currently practice the *hay vs. estar* grammar rule (when to use each word for "there is / is located"). New exercises can be added to `fill-in-blank.tsv`.

---

### `games.html` — Game Zone

**What it does:** A simple menu showing the three available games with short descriptions. It reads session storage to know how many game plays ("lives") remain from the 10-coin entry fee. When lives run out, the page shows that no more plays are available without earning more coins.

---

### `games/tower-stack.html` — Tower Stack

**What it does:** A 3D-looking block stacking game. A block slides across the screen from the side. You tap (or press Space) to drop it. If it lands on the previous block, only the overhanging part falls away — the remaining piece becomes the new platform. If you miss entirely, the game ends. The stack gets taller and the blocks get smaller as you play. Speed increases every 5 blocks.

**How the 3D effect works:** It's actually a 2D canvas that uses a mathematical trick called isometric projection — coordinates are transformed to give the illusion of depth without a real 3D engine.
**Music:** A synthesized chiptune melody plays in the background (built entirely from math, no audio files).
**Best score:** Saved in localStorage so your record persists across sessions.

---

### `games/coin-dash.html` — Coin Dash

**What it does:** A side-scrolling game where your character runs through three lanes. Swipe or tap to change lanes. Collect spinning gold coins for points; TNT blocks end the game on contact. Speed and obstacle frequency increase over time.

**Controls:**
- Touch: swipe left/right, or tap the left/center/right third of the screen
- Keyboard: arrow keys or A/D

---

### `games/jungle-run.html` — Jungle Run

**What it does:** A platform runner where a monkey jumps across platforms, collects bananas, and dodges parrots. Tap, click, or press Space/Up to jump. A double-jump is available. Parrot collisions end the game. Platforms are generated procedurally (created on the fly) with increasing gaps and speed as you go further.

**Controls:** Tap/click/Space/Up to jump.

---

### `voices.html` — Voice Inspector

**What it does:** A technical utility page that lists all speech voices your browser and operating system have installed, along with their language codes. You can filter by name or language, and test each voice with a sample phrase.
**Why it exists:** The pronunciation feature uses your device's built-in text-to-speech. Different devices have different voices available. This page helps a teacher or developer see exactly which Spanish voices are available and which sounds best.
**Who needs it:** Mostly a diagnostic tool — normal students don't need to visit this page.

---

## Things to Know

- **No internet needed after first load.** Once the pages and data files are cached by the browser, the app works completely offline.
- **Adding vocabulary is easy — no coding required.** Edit `data/words.tsv` in any text editor (or export from Excel as tab-separated). New words appear automatically in all relevant modes.
- **Coins persist across browser sessions.** They are stored in the browser's localStorage, tied to that specific browser on that device. Clearing browser data or switching devices resets coins.
- **Audio depends on the device.** The speak/pronounce feature uses the browser's text-to-speech. On some devices (especially older Android), Spanish voices may not be installed. Use `voices.html` to check. Game sounds and music use a different system (Web Audio API) and work everywhere.
- **The coin gate can be bypassed** by anyone who opens browser developer tools and edits localStorage — this is intentional; the coins are motivational, not a security lock.
- **Games use 3 lives per 10-coin entry.** The 3 lives are stored in session storage (not localStorage), meaning they reset if you close and reopen the browser tab.
- **The sentence-builder and conjugation practice remember your selections.** If you pick specific sentences or verbs to practice, that selection is saved. A student who clears their browser data will lose their selections.
- **`vocab.html` is a legacy page.** It is an older version of the topic/quiz functionality that has been superseded by `topic.html`. It may still work but is not linked from the home page.
- **The app is deployed via GitHub Pages.** The `CNAME` file tells GitHub to serve the site at `tapvocab.fun` rather than the default github.io address.

---

## Glossary

- **TSV (Tab-Separated Values):** A plain text file format like a spreadsheet, where each value in a row is separated by a tab character. Can be opened and edited in Excel, Google Sheets, or any text editor.
- **localStorage:** A place in your browser where websites can save small amounts of data that persists even after you close the tab. Used here for coins, practice lists, and preferences.
- **sessionStorage:** Similar to localStorage, but erased when the browser tab is closed. Used here for game lives.
- **Web Speech API:** A built-in browser feature that converts text to spoken audio using voices installed on your device. Used here to pronounce Spanish words.
- **Web Audio API:** A built-in browser feature for generating and playing sounds entirely through code, without audio files. Used here for game music and sound effects.
- **Canvas:** An HTML element that lets JavaScript draw graphics pixel-by-pixel. Used for all three games.
- **Isometric projection:** A visual trick that makes 2D graphics look 3D by drawing them at a fixed 30° angle, giving the illusion of depth.
- **Chiptune:** Simple, synthesized music that sounds like classic video games. The game music is generated entirely in code (no audio files) using the Web Audio API.
- **Confetti:** The animated colored dots that burst across the screen on correct answers — a CSS animation triggered by JavaScript.
- **Coyote timer:** A game design technique in Jungle Run that gives the player a brief window (5 frames) to jump even after walking off the edge of a platform. Makes the game feel fair.
- **Fisher-Yates shuffle:** The algorithm used to randomize word order in quizzes — it guarantees every item appears exactly once in a random order, like shuffling a deck of cards.
