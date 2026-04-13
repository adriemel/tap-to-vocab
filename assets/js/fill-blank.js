/**
 * Fill-in-the-Blank for Tap-to-Vocab
 * Choose the correct word to complete Spanish sentences
 */

(function () {

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

    const btnStats = document.getElementById("btn-stats");
    const btnStatsClose = document.getElementById("btn-stats-close");
    if (btnStats) btnStats.onclick = () => {
      if (window.SessionStats) SessionStats.showPanel();
    };
    if (btnStatsClose) btnStatsClose.onclick = () => {
      if (window.SessionStats) SessionStats.hidePanel();
    };

    if (sentences.length === 0) {
      errorEl.textContent = "No sentences available.";
      errorEl.style.display = "block";
      return;
    }

    let currentIndex = 0;
    let history = [];
    let advanceTimer = null;

    // Reset session stats at the start of each round (STATS-04)
    if (window.SessionStats) SessionStats.reset();

    function loadSentence() {
      if (currentIndex >= sentences.length) {
        germanEl.textContent = "🎉 All sentences completed!";
        spanishEl.innerHTML = '<span style="color: var(--ok); font-weight: 700;">Great job!</span>';
        choicesEl.innerHTML = "";
        SharedUtils.confettiBurst(50);
        if (window.SessionStats) SessionStats.showPanel();
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
      const allChoices = SharedUtils.shuffleArray([sentence.correct_answer, ...wrongList]);

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
            SharedUtils.showSuccessAnimation();
            SharedUtils.confettiBurst(30);
            if (window.CoinTracker) CoinTracker.addCoin();
            if (window.SessionStats) SessionStats.record(true);
            advanceTimer = setTimeout(() => {
              advanceTimer = null;
              history.push(currentIndex);
              currentIndex++;
              updateBackButton();
              loadSentence();
            }, 1500);
          } else {
            // Wrong
            btn.classList.add("choice-wrong");
            SharedUtils.playErrorSound();
            if (window.SessionStats) SessionStats.record(false);
            btn.classList.add("disabled");
          }
        };
        choicesEl.appendChild(btn);
      });
    }

    function updateBackButton() {
      if (btnBack) btnBack.disabled = history.length === 0;
    }

    btnSkip.onclick = () => {
      if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
      history.push(currentIndex);
      currentIndex++;
      updateBackButton();
      loadSentence();
    };

    if (btnBack) {
      btnBack.onclick = () => {
        if (history.length === 0) return;
        if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
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
      const rawRows = await SharedUtils.loadTSV("/data/fill-in-blank.tsv");
      const sentences = rawRows.filter(r => r.de && r.es_with_blank && r.correct_answer);
      if (sentences.length === 0) {
        errorEl.textContent = "No sentences found in data file.";
        errorEl.style.display = "block";
        return;
      }
      const shuffled = SharedUtils.shuffleArray(sentences);
      initGame(shuffled);
    } catch (e) {
      errorEl.textContent = "Could not load sentences: " + e.message;
      errorEl.style.display = "block";
    }
  }

  window.FillBlank = { init };

})();
