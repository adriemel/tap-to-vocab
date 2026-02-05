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

  /* ---------- Confetti ---------- */
  function confettiBurst(targetEl, count = 24) {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const container = document.body;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.style.cssText = `
        position:absolute;width:8px;height:12px;opacity:.9;border-radius:2px;
        left:${rect.left + rect.width / 2 + (Math.random() * 40 - 20)}px;
        top:${rect.top + 10}px;
        background:hsl(${Math.random() * 360} 80% 60%);
        transform:translate(${Math.random() * 120 - 60}px,0) rotate(${Math.random() * 180}deg);
        animation: fall ${600 + Math.random() * 500}ms ease-out forwards;
      `;
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 1200);
    }
  }

  /* ---------- TSV loader ---------- */
  async function loadWords(tsvPath) {
    const res = await fetch(tsvPath, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + tsvPath);
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const header = lines[0].split("\t").map(h => h.trim());
    const idx = {
      category: header.indexOf("category"),
      es: header.indexOf("es"),
      de: header.indexOf("de")
    };
    return lines.slice(1).map(line => {
      const cols = line.split("\t");
      return {
        category: (idx.category >= 0 ? cols[idx.category] : "").trim(),
        es: (idx.es >= 0 ? cols[idx.es] : "").trim(),
        de: (idx.de >= 0 ? cols[idx.de] : "").trim()
      };
    }).filter(r => r.category && r.es && r.de);
  }

  function inferCategoryFromPath() {
    const segs = location.pathname.split("/").filter(Boolean);
    return segs[segs.length - 1] || "";
  }

  function shuffleArray(arr) {
    for (let j = arr.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [arr[j], arr[k]] = [arr[k], arr[j]];
    }
    return arr;
  }

  /* ---------- Practice List storage ---------- */
  const STORAGE_KEY = "practiceList";
  
  function getPracticeList() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  }
  
  function savePracticeList(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
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
  function setupQuizMode(words, category) {
    const quizMode = document.getElementById("quiz-mode");
    const flipCard = document.getElementById("flip-card");
    const cardFront = document.getElementById("card-front-clickable");
    const quizEs = document.getElementById("quiz-es");
    const quizDe = document.getElementById("quiz-de");
    const btnCorrect = document.getElementById("btn-correct");
    const btnWrong = document.getElementById("btn-wrong");
    const btnRestart = document.getElementById("btn-restart-quiz");
    const btnHomeQuiz = document.getElementById("btn-home-quiz");
    const quizProgress = document.getElementById("quiz-progress");
    const quizCorrectStat = document.getElementById("quiz-correct");
    const quizWrongStat = document.getElementById("quiz-wrong");

    if (!quizMode || !flipCard) return;

    let quizWords = shuffleArray([...words]);
    let currentQuizIndex = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const isPracticeCategory = category && category.toLowerCase() === "practice";

    function showQuizCard() {
      if (currentQuizIndex >= quizWords.length) {
        // Quiz complete
        const totalCorrect = correctCount;
        const totalWrong = wrongCount;
        const percentage = Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) || 0;
        
        alert(`Quiz Complete!\n\nCorrect: ${totalCorrect}\nNeed Practice: ${totalWrong}\nScore: ${percentage}%`);
        return;
      }

      const word = quizWords[currentQuizIndex];
      quizEs.textContent = word.es;
      quizDe.textContent = word.de;
      flipCard.classList.remove("flipped");
      
      quizProgress.textContent = `${currentQuizIndex + 1} / ${quizWords.length}`;
      quizCorrectStat.textContent = correctCount;
      quizWrongStat.textContent = wrongCount;

      // Speak the Spanish word
      setTimeout(() => speakSpanish(word.es), 100);
    }

    // Make entire front card clickable
    cardFront.addEventListener("click", () => {
      if (!flipCard.classList.contains("flipped")) {
        flipCard.classList.add("flipped");
      }
    });

    btnCorrect.onclick = () => {
      correctCount++;
      const word = quizWords[currentQuizIndex];
      
      // If in practice category, remove from practice list
      if (isPracticeCategory && isMarked(word)) {
        toggleMark(word); // This removes it
        // Remove from current quiz words array too
        quizWords = quizWords.filter((w, idx) => idx !== currentQuizIndex);
        // Don't increment currentQuizIndex since we removed the current item
        // If we've removed all words, quiz is complete
        if (quizWords.length === 0) {
          alert(`Excellent work! You've mastered all ${correctCount} words in your practice list!`);
          return;
        }
      } else {
        currentQuizIndex++;
      }
      
      showQuizCard();
    };

    btnWrong.onclick = () => {
      wrongCount++;
      const word = quizWords[currentQuizIndex];
      // Auto-mark for practice if not already marked
      if (!isMarked(word)) {
        toggleMark(word);
      }
      currentQuizIndex++;
      showQuizCard();
    };

    btnRestart.onclick = () => {
      quizWords = shuffleArray([...words]);
      currentQuizIndex = 0;
      correctCount = 0;
      wrongCount = 0;
      showQuizCard();
    };

    btnHomeQuiz.onclick = () => {
      location.href = "../";
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
      location.href = "../";
    };

    render();
  }

  /* ---------- Mode Switching ---------- */
  function setupModeSwitching(words, category) {
    const modeTabs = document.querySelectorAll(".mode-tab");
    const browseMode = document.getElementById("browse-mode");
    const quizMode = document.getElementById("quiz-mode");
    let quizInitialized = false;

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
        } else if (mode === "quiz") {
          browseMode.style.display = "none";
          quizMode.style.display = "block";
          // Only initialize quiz once
          if (!quizInitialized) {
            setupQuizMode(words, category);
            quizInitialized = true;
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
    const badgeEl = document.getElementById("cat-badge");
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
        errorEl.innerHTML = `No words found for category: <b>${category}</b>`;
        errorEl.style.display = "block";
        return;
      }

      titleEl.textContent = category === "practice" ? "⭐ Practice" : category;
      badgeEl.textContent = category;
      
      // Initialize browse mode
      initBrowseMode(words, category);
      
      // Setup mode switching
      setupModeSwitching(words, category);
      
    } catch (e) {
      errorEl.textContent = "Could not load words.tsv: " + e.message;
      errorEl.style.display = "block";
    }
  }

  window.TapVocabTSV = { initFromTSV };

})();
