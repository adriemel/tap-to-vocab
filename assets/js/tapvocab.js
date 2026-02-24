/**
 * Tap‑to‑Vocab (with ⭐ Practice list + Quiz Mode)
 * - Loads /data/words.tsv
 * - Adds "Mark / Unmark" star button
 * - New category "practice" showing saved words
 * - Quiz mode with flip cards for self-assessment
 */

(function () {

  /* ---------- Speech ---------- */
  function getSpanishVoice() {
    const voices = window.speechSynthesis.getVoices();
    const normalize = s => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const monica = voices.find(v => normalize(v.name).includes("monica") && v.lang.toLowerCase().startsWith("es"));
    if (monica) return monica;
    const preferred = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith("es"));
    return preferred[0] || voices[0] || null;
  }
  
  function speakSpanish(text) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "es-ES";
      const v = getSpanishVoice();
      if (v) u.voice = v;
      u.rate = 0.95; u.pitch = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) { console.warn("Speech synthesis failed:", e); }
  }

  /* ---------- TSV loader (from shared-utils) ---------- */
  var loadWords = SharedUtils.loadWords;

  function inferCategoryFromPath() {
    const segs = location.pathname.split("/").filter(Boolean);
    const last = segs[segs.length - 1] || "";
    // Strip .html extension so we don't return "topic.html" as a category
    return last.replace(/\.html?$/i, "");
  }

  var shuffleArray = SharedUtils.shuffleArray;

  /* ---------- Practice List storage ---------- */
  const STORAGE_KEY = "practiceList";
  
  function getPracticeList() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  }
  
  function savePracticeList(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch (e) { console.warn("Could not save practice list:", e); }
  }
  
  function isMarked(word) {
    const list = getPracticeList();
    return list.some(w => w.es === word.es && w.de === word.de);
  }
  
  function toggleMark(word) {
    let list = getPracticeList();
    if (isMarked(word)) {
      list = list.filter(w => !(w.es === word.es && w.de === word.de));
    } else {
      list.push(word);
    }
    savePracticeList(list);
  }

  /* ---------- Quiz Mode ---------- */
  function setupQuizMode(words, category, direction) {
    // direction: "es-de" (default) or "de-es"
    direction = direction || "es-de";
    const quizMode = document.getElementById("quiz-mode");
    const flipCard = document.getElementById("flip-card");
    const cardFront = document.getElementById("card-front-clickable");
    const quizFrontWord = document.getElementById("quiz-es");
    const quizBackWord = document.getElementById("quiz-de");
    const frontLabel = document.getElementById("quiz-front-label");
    const backLabel = document.getElementById("quiz-back-label");
    const btnCorrect = document.getElementById("btn-correct");
    const btnWrong = document.getElementById("btn-wrong");
    const btnRestart = document.getElementById("btn-restart-quiz");
    const btnQuizBack = document.getElementById("btn-quiz-back");
    const btnQuizNext = document.getElementById("btn-quiz-next");
    const btnHomeQuiz = document.getElementById("btn-home-quiz");
    const quizProgress = document.getElementById("quiz-progress");
    const quizCorrectStat = document.getElementById("quiz-correct");
    const quizWrongStat = document.getElementById("quiz-wrong");
    const quizSkippedStat = document.getElementById("quiz-skipped");
    
    // Main counter at top of page
    const mainCounter = document.getElementById("counter");
    
    // Modal elements
    const quizModal = document.getElementById("quiz-modal");
    const modalCorrect = document.getElementById("modal-correct");
    const modalWrong = document.getElementById("modal-wrong");
    const modalSkipped = document.getElementById("modal-skipped");
    const modalScore = document.getElementById("modal-score");
    const modalRestart = document.getElementById("modal-restart");
    const modalPractice = document.getElementById("modal-practice");
    const modalHome = document.getElementById("modal-home");

    if (!quizMode || !flipCard) return;

    let quizWords = shuffleArray(words); // Shuffle on init
    let currentQuizIndex = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    const isPracticeCategory = category && category.toLowerCase() === "practice";
    
    // History tracking for back button
    let answerHistory = []; // Array of {index, wasCorrect, word}
    let canReveal = false; // 2-second delay before allowing reveal
    let revealTimer = null;

    function showQuizCompleteModal() {
      const total = correctCount + wrongCount + skippedCount;
      const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

      modalCorrect.textContent = correctCount;
      modalWrong.textContent = wrongCount;
      modalSkipped.textContent = skippedCount;
      modalScore.textContent = percentage + "%";

      quizModal.style.display = "flex";
    }

    function hideQuizCompleteModal() {
      quizModal.style.display = "none";
    }

    function showQuizCard() {
      if (currentQuizIndex >= quizWords.length) {
        // Quiz complete - show modal
        showQuizCompleteModal();
        return;
      }

      const word = quizWords[currentQuizIndex];
      const inner = flipCard.querySelector(".flip-card-inner");

      // Instantly reset to front (no animation) then update content
      inner.style.transition = "none";
      flipCard.classList.remove("flipped");
      // Force reflow so the instant reset takes effect
      void inner.offsetHeight;
      // Restore transition for user-triggered flips
      inner.style.transition = "";

      if (direction === "de-es") {
        if (frontLabel) frontLabel.textContent = "German";
        if (backLabel) backLabel.textContent = "Spanish";
        quizFrontWord.textContent = word.de;
        quizBackWord.textContent = word.es;
      } else {
        if (frontLabel) frontLabel.textContent = "Spanish";
        if (backLabel) backLabel.textContent = "German";
        quizFrontWord.textContent = word.es;
        quizBackWord.textContent = word.de;
      }

      quizProgress.textContent = `${currentQuizIndex + 1} / ${quizWords.length}`;
      quizCorrectStat.textContent = correctCount;
      quizWrongStat.textContent = wrongCount;
      quizSkippedStat.textContent = skippedCount;

      // Update main counter at top of page
      if (mainCounter) {
        mainCounter.textContent = `${currentQuizIndex + 1} / ${quizWords.length}`;
      }

      // 2-second delay before allowing reveal
      canReveal = false;
      if (revealTimer) clearTimeout(revealTimer);
      const tapHint = flipCard.querySelector(".tap-hint");
      if (tapHint) {
        tapHint.textContent = "Wait...";
        tapHint.style.opacity = "0.4";
      }
      revealTimer = setTimeout(() => {
        canReveal = true;
        if (tapHint) {
          tapHint.textContent = "Tap anywhere to reveal";
          tapHint.style.opacity = "0.7";
        }
      }, 2000);

      // Speak Spanish: on show for es-de, on reveal for de-es
      if (direction === "es-de") {
        setTimeout(() => speakSpanish(word.es), 100);
      }
    }

    function restartQuiz() {
      hideQuizCompleteModal();
      quizWords = shuffleArray(words); // Re-shuffle on restart
      currentQuizIndex = 0;
      correctCount = 0;
      wrongCount = 0;
      skippedCount = 0;
      answerHistory = []; // Clear history
      showQuizCard();
    }

    // Make entire front card clickable (with 2-second delay)
    // Use onclick to avoid stacking listeners on mode switch
    cardFront.onclick = () => {
      if (!canReveal) return;
      if (!flipCard.classList.contains("flipped")) {
        flipCard.classList.add("flipped");
        // For de-es mode, speak Spanish on reveal
        if (direction === "de-es" && currentQuizIndex < quizWords.length) {
          const esText = quizWords[currentQuizIndex].es;
          setTimeout(() => speakSpanish(esText), 300);
        }
      }
    };

    btnCorrect.onclick = () => {
      if (currentQuizIndex >= quizWords.length) return;
      const word = quizWords[currentQuizIndex];

      // Track this answer in history
      answerHistory.push({
        index: currentQuizIndex,
        wasCorrect: true,
        word: {...word}
      });

      correctCount++;
      if (window.CoinTracker) CoinTracker.addCoin();
      
      // If in practice category, remove from practice list
      if (isPracticeCategory && isMarked(word)) {
        toggleMark(word); // This removes it
        // Remove from current quiz words array too
        quizWords = quizWords.filter((w, idx) => idx !== currentQuizIndex);
        // Don't increment currentQuizIndex since we removed the current item
        // If we've removed all words, quiz is complete
        if (quizWords.length === 0) {
          showQuizCompleteModal();
          return;
        }
      } else {
        currentQuizIndex++;
      }
      
      showQuizCard();
    };

    btnWrong.onclick = () => {
      if (currentQuizIndex >= quizWords.length) return;
      const word = quizWords[currentQuizIndex];

      // Track this answer in history
      answerHistory.push({
        index: currentQuizIndex,
        wasCorrect: false,
        word: {...word}
      });

      wrongCount++;
      
      // Auto-mark for practice if not already marked
      if (!isMarked(word)) {
        toggleMark(word);
      }
      currentQuizIndex++;
      showQuizCard();
    };

    btnRestart.onclick = restartQuiz;

    btnQuizNext.onclick = () => {
      if (currentQuizIndex >= quizWords.length) return;
      answerHistory.push({
        index: currentQuizIndex,
        wasSkipped: true,
        word: {...quizWords[currentQuizIndex]}
      });
      skippedCount++;
      currentQuizIndex++;
      showQuizCard();
    };

    btnQuizBack.onclick = () => {
      if (answerHistory.length === 0) return;

      hideQuizCompleteModal();
      const lastAnswer = answerHistory.pop();

      if (lastAnswer.wasSkipped) {
        skippedCount--;
        currentQuizIndex--;
      } else if (lastAnswer.wasCorrect) {
        correctCount--;
        if (isPracticeCategory) {
          quizWords.splice(currentQuizIndex, 0, lastAnswer.word);
          if (!isMarked(lastAnswer.word)) {
            toggleMark(lastAnswer.word);
          }
        } else {
          currentQuizIndex--;
        }
      } else {
        wrongCount--;
        currentQuizIndex--;
      }

      showQuizCard();
    };
    
    btnHomeQuiz.onclick = () => {
      location.href = "/";
    };

    // Modal button handlers
    modalRestart.onclick = restartQuiz;
    
    modalPractice.onclick = () => {
      location.href = "/topic.html?cat=practice";
    };
    
    modalHome.onclick = () => {
      location.href = "/";
    };

    showQuizCard();
  }

  /* ---------- Browse Mode UI logic ---------- */
  function initBrowseMode(words, category) {
    let i = 0;
    const elEs = document.getElementById("word-es");
    const elDe = document.getElementById("word-de");
    const btnShow = document.getElementById("btn-show");
    const hearBtn = document.getElementById("btn-hear");
    const nextBtn = document.getElementById("btn-next");
    const prevBtn = document.getElementById("btn-prev");
    const autoSpeakEl = document.getElementById("auto-speak");
    const counterEl = document.getElementById("counter");
    const homeBtn = document.getElementById("btn-home");
    const markBtn = document.getElementById("btn-mark");

    function updateMarkButton(w) {
      markBtn.textContent = isMarked(w) ? "⭐" : "✩";
      markBtn.setAttribute("aria-label", isMarked(w) ? "Unmark" : "Mark for practice");
    }
    
    function render() {
      const w = words[i];
      elEs.textContent = w.es;
      elDe.textContent = w.de;
      counterEl.textContent = `${i + 1} / ${words.length}`;
      elDe.classList.remove("shown");
      btnShow.textContent = "Show";
      updateMarkButton(w);
      if (autoSpeakEl.checked) setTimeout(() => speakSpanish(w.es), 100);
    }

    function next() { i = (i + 1) % words.length; render(); }
    function prev() { i = (i - 1 + words.length) % words.length; render(); }

    hearBtn.onclick = () => speakSpanish(words[i].es);
    nextBtn.onclick = next;
    prevBtn.onclick = prev;
    btnShow.onclick = () => {
      if (elDe.classList.contains("shown")) {
        elDe.classList.remove("shown");
        btnShow.textContent = "Show";
      } else {
        elDe.classList.add("shown");
        btnShow.textContent = "Hide";
      }
    };
    markBtn.onclick = () => {
      toggleMark(words[i]);
      updateMarkButton(words[i]);
    };
    homeBtn.onclick = () => {
      location.href = "/";
    };

    render();
  }

  /* ---------- Mode Switching ---------- */
  function setupModeSwitching(words, category) {
    const modeTabs = document.querySelectorAll(".mode-tab");
    const browseMode = document.getElementById("browse-mode");
    const quizMode = document.getElementById("quiz-mode");
    let lastQuizDirection = null;

    modeTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const mode = tab.getAttribute("data-mode");

        // Update active tab
        modeTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        // Switch mode
        if (mode === "browse") {
          browseMode.style.display = "block";
          quizMode.style.display = "none";
          lastQuizDirection = null;
        } else if (mode === "quiz" || mode === "quiz-de") {
          const direction = mode === "quiz-de" ? "de-es" : "es-de";
          browseMode.style.display = "none";
          quizMode.style.display = "block";
          if (lastQuizDirection !== direction) {
            setupQuizMode(words, category, direction);
            lastQuizDirection = direction;
          }
        }
      });
    });
  }

  /* ---------- Main init ---------- */
  async function initFromTSV(opts) {
    const category = (opts && opts.category) || inferCategoryFromPath();
    const tsvPath = (opts && opts.tsvPath) || "/data/words.tsv";
    const titleEl = document.getElementById("title");
    const errorEl = document.getElementById("error");

    try {
      let rows = await loadWords(tsvPath);
      let words = [];

      if (category.toLowerCase() === "practice") {
        words = getPracticeList();
      } else {
        words = rows.filter(r => r.category.toLowerCase() === category.toLowerCase());
      }

      if (!words.length) {
        titleEl.textContent = category === "practice" ? "⭐ Practice" : category;
        errorEl.textContent = category.toLowerCase() === "practice"
          ? "Your practice list is empty. Mark words with ⭐ to add them."
          : "No words found for category: " + category;
        errorEl.style.display = "block";

        // Hide non-functional UI
        document.getElementById("browse-mode").style.display = "none";
        const mt = document.querySelector(".mode-tabs");
        if (mt) mt.style.display = "none";

        // Create a visible Home button below the error
        const homeDiv = document.createElement("div");
        homeDiv.className = "controls";
        homeDiv.style.marginTop = "16px";
        const hb = document.createElement("button");
        hb.className = "btn secondary";
        hb.textContent = "🏠 Home";
        hb.onclick = function () { location.href = "/"; };
        homeDiv.appendChild(hb);
        errorEl.after(homeDiv);
        return;
      }

      titleEl.textContent = category === "practice" ? "⭐ Practice" : category;
      
      // Initialize browse mode
      initBrowseMode(words, category);
      
      // Setup mode switching
      setupModeSwitching(words, category);
      
    } catch (e) {
      errorEl.textContent = "Could not load words.tsv: " + e.message;
      errorEl.style.display = "block";
      const homeBtn = document.getElementById("btn-home");
      if (homeBtn) homeBtn.onclick = function () { location.href = "/"; };
    }
  }

  window.TapVocabTSV = { initFromTSV };

})();
