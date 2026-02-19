/**
 * Fill-in-the-Blank for Tap-to-Vocab
 * Choose the correct word to complete Spanish sentences
 */

(function () {

  /* ---------- Utilities ---------- */
  function shuffleArray(arr) {
    const copy = [...arr];
    for (let j = copy.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [copy[j], copy[k]] = [copy[k], copy[j]];
    }
    return copy;
  }

  /* ---------- TSV Loader ---------- */
  async function loadSentences(tsvPath) {
    const res = await fetch(tsvPath, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + tsvPath);
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const header = lines[0].split("\t").map(h => h.trim());
    const idx = {
      category: header.indexOf("category"),
      de: header.indexOf("de"),
      es_with_blank: header.indexOf("es_with_blank"),
      correct_answer: header.indexOf("correct_answer"),
      wrong_answers: header.indexOf("wrong_answers")
    };
    return lines.slice(1).map(line => {
      const cols = line.split("\t");
      const col = i => (i >= 0 ? (cols[i] || "") : "").trim();
      return {
        category: col(idx.category),
        de: col(idx.de),
        es_with_blank: col(idx.es_with_blank),
        correct_answer: col(idx.correct_answer),
        wrong_answers: col(idx.wrong_answers)
      };
    }).filter(r => r.de && r.es_with_blank && r.correct_answer);
  }

  /* ---------- Success Sound ---------- */
  function playSuccessSound() {
    try {
      if (!_audioCtx) {
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = _audioCtx;
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = now + i * 0.1;
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch (e) {
      console.warn("Could not play success sound:", e);
    }
  }

  /* ---------- Success Animation ---------- */
  function showSuccessAnimation() {
    const emojis = ["🎉", "✨", "🎊", "💃", "🕺", "🎈", "🌟", "⭐", "🥳", "👏", "💪"];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const el = document.createElement("div");
    el.className = "success-animation";
    el.textContent = emoji;
    document.body.appendChild(el);
    playSuccessSound();
    setTimeout(() => el.remove(), 600);
  }

  /* ---------- Confetti ---------- */
  function confettiBurst(count = 30) {
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.style.cssText = `
        position:fixed;
        width:10px;height:10px;opacity:.9;border-radius:50%;
        left:${50 + (Math.random() * 20 - 10)}%;top:30%;
        background:hsl(${Math.random() * 360} 80% 60%);
        transform:translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) rotate(${Math.random() * 360}deg);
        animation:fall ${800 + Math.random() * 400}ms ease-out forwards;
        pointer-events:none;z-index:9999;
      `;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 1500);
    }
  }

  /* ---------- Error Sound ---------- */
  let _audioCtx = null;
  function playErrorSound() {
    try {
      if (!_audioCtx) {
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = _audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 150;
      osc.type = "sawtooth";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Could not play error sound:", e);
    }
  }

  /* ---------- Play Games Button ---------- */
  function showPlayGamesButton() {
    if (!window.RewardTracker || !RewardTracker.isUnlocked()) return;
    if (document.getElementById("btn-play-games-float")) return;
    var btn = document.createElement("a");
    btn.id = "btn-play-games-float";
    btn.href = "/games.html";
    btn.className = "btn-play-games";
    btn.textContent = "\uD83C\uDFAE Play Games!";
    btn.style.marginTop = "12px";
    var controls = document.querySelector(".controls");
    if (controls) controls.parentNode.insertBefore(btn, controls.nextSibling);
  }

  /* ---------- Fill-in-Blank Game ---------- */
  function initGame(sentences) {
    const germanEl = document.getElementById("german-sentence");
    const spanishEl = document.getElementById("spanish-sentence");
    const choicesEl = document.getElementById("choices");
    const progressEl = document.getElementById("progress-badge");
    const btnSkip = document.getElementById("btn-skip");
    const btnBack = document.getElementById("btn-back");
    const btnHome = document.getElementById("btn-home");
    const errorEl = document.getElementById("error");

    if (sentences.length === 0) {
      errorEl.textContent = "No sentences available.";
      errorEl.style.display = "block";
      return;
    }

    let currentIndex = 0;
    let history = [];

    function loadSentence() {
      if (currentIndex >= sentences.length) {
        germanEl.textContent = "🎉 All sentences completed!";
        spanishEl.innerHTML = '<span style="color: var(--ok); font-weight: 700;">Great job!</span>';
        choicesEl.innerHTML = "";
        confettiBurst(50);
        return;
      }

      const sentence = sentences[currentIndex];
      progressEl.textContent = `${currentIndex + 1} / ${sentences.length}`;

      // Show German sentence
      germanEl.textContent = sentence.de;

      // Show Spanish sentence with blank highlighted
      const parts = sentence.es_with_blank.split("___");
      spanishEl.innerHTML = "";
      parts.forEach((part, i) => {
        spanishEl.appendChild(document.createTextNode(part));
        if (i < parts.length - 1) {
          const blank = document.createElement("span");
          blank.className = "blank-slot";
          blank.id = "blank-slot";
          blank.textContent = "___";
          spanishEl.appendChild(blank);
        }
      });

      // Build choice buttons
      choicesEl.innerHTML = "";
      const wrongList = sentence.wrong_answers.split(",").map(w => w.trim()).filter(Boolean);
      const allChoices = shuffleArray([sentence.correct_answer, ...wrongList]);

      allChoices.forEach(choice => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = choice;
        btn.onclick = () => {
          if (btn.classList.contains("disabled")) return;

          if (choice === sentence.correct_answer) {
            // Correct!
            btn.classList.add("choice-correct");
            const blankEl = document.getElementById("blank-slot");
            if (blankEl) {
              blankEl.textContent = choice;
              blankEl.classList.add("blank-filled");
            }
            // Disable all buttons
            choicesEl.querySelectorAll(".choice-btn").forEach(b => b.classList.add("disabled"));
            showSuccessAnimation();
            confettiBurst(30);
            if (window.RewardTracker) {
              RewardTracker.addCorrect("fill-blank");
              showPlayGamesButton();
            }
            setTimeout(() => {
              history.push(currentIndex);
              currentIndex++;
              updateBackButton();
              loadSentence();
            }, 1500);
          } else {
            // Wrong
            btn.classList.add("choice-wrong");
            playErrorSound();
            btn.classList.add("disabled");
            if (window.RewardTracker) RewardTracker.addWrong("fill-blank");
          }
        };
        choicesEl.appendChild(btn);
      });
    }

    function updateBackButton() {
      if (btnBack) btnBack.disabled = history.length === 0;
    }

    btnSkip.onclick = () => {
      history.push(currentIndex);
      currentIndex++;
      updateBackButton();
      loadSentence();
    };

    if (btnBack) {
      btnBack.onclick = () => {
        if (history.length === 0) return;
        currentIndex = history.pop();
        updateBackButton();
        loadSentence();
      };
    }

    btnHome.onclick = () => { location.href = "/"; };

    updateBackButton();
    loadSentence();
  }

  /* ---------- Main Init ---------- */
  async function init() {
    const errorEl = document.getElementById("error");
    try {
      const sentences = await loadSentences("/data/fill-in-blank.tsv");
      if (sentences.length === 0) {
        errorEl.textContent = "No sentences found in data file.";
        errorEl.style.display = "block";
        return;
      }
      const shuffled = shuffleArray(sentences);
      initGame(shuffled);
    } catch (e) {
      errorEl.textContent = "Could not load sentences: " + e.message;
      errorEl.style.display = "block";
    }
  }

  window.FillBlank = { init };

})();
