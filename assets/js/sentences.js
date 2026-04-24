/**
 * Sentence Builder for Tap-to-Vocab
 * Filters sentences (3+ words), allows selection, and builds interactive sentence construction game
 */

(function () {
  
  const STORAGE_KEY_ENABLED = "enabledSentences";
  const STORAGE_KEY_CATEGORIES = "sentenceCategories";

  /* ---------- Utilities (from shared-utils) ---------- */
  var shuffleArray = SharedUtils.shuffleArray;
  var loadWords = SharedUtils.loadWords;

  /* ---------- Storage for enabled sentences ---------- */
  function getEnabledSentences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ENABLED);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  function saveEnabledSentences(enabledMap) {
    try { localStorage.setItem(STORAGE_KEY_ENABLED, JSON.stringify(enabledMap)); }
    catch (e) {
      console.warn("Could not save enabled sentences:", e);
      var el = document.getElementById("error");
      if (el) { el.textContent = "Storage full — changes could not be saved."; el.style.display = "block"; }
    }
  }

  function getCategoryFilter() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  function saveCategoryFilter(filterMap) {
    try { localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(filterMap)); }
    catch (e) {
      console.warn("Could not save category filter:", e);
      var el = document.getElementById("error");
      if (el) { el.textContent = "Storage full — changes could not be saved."; el.style.display = "block"; }
    }
  }

  /* ---------- Filter sentences (entries ending with . ? !) ---------- */
  function filterSentences(words) {
    return words.filter(w => {
      const s = w.es.trim();
      return /[.?!]$/.test(s) && !s.endsWith('..');
    });
  }

  /* ---------- Audio & Animations (from shared-utils) ---------- */
  var playSuccessSound = SharedUtils.playSuccessSound;
  var showSuccessAnimation = SharedUtils.showSuccessAnimation;
  var confettiBurst = SharedUtils.confettiBurst;
  var playErrorSound = SharedUtils.playErrorSound;

  /* ---------- Sentence Manager ---------- */
  function openSentenceManager(allSentences, onSave) {
    const modal = document.getElementById("sentence-manager");
    const listEl = document.getElementById("sentence-list");
    const btnClose = document.getElementById("btn-close-manager");
    const btnSave = document.getElementById("btn-save-selection");
    const btnSelectAll = document.getElementById("btn-select-all");
    const btnDeselectAll = document.getElementById("btn-deselect-all");

    // Extract unique categories in order of first appearance
    const categories = [];
    const seen = new Set();
    allSentences.forEach(s => {
      if (!seen.has(s.category)) { seen.add(s.category); categories.push(s.category); }
    });

    // Get current filter state; default all enabled
    let filterMap = getCategoryFilter();
    if (!filterMap) {
      filterMap = {};
      categories.forEach(c => { filterMap[c] = true; });
    }
    // Ensure any new categories (not yet in stored filterMap) default to true
    categories.forEach(c => {
      if (filterMap[c] === undefined) filterMap[c] = true;
    });

    // Render one checkbox per category
    listEl.innerHTML = "";
    categories.forEach(cat => {
      const count = allSentences.filter(s => s.category === cat).length;
      const item = document.createElement("div");
      item.className = "sentence-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = "cat-" + cat;
      checkbox.checked = filterMap[cat] !== false;
      checkbox.addEventListener("change", () => { filterMap[cat] = checkbox.checked; });

      const label = document.createElement("label");
      label.htmlFor = "cat-" + cat;
      label.textContent = cat + " (" + count + ")";

      item.appendChild(checkbox);
      item.appendChild(label);
      listEl.appendChild(item);
    });

    btnSelectAll.onclick = () => {
      categories.forEach(c => { filterMap[c] = true; });
      listEl.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = true);
    };

    btnDeselectAll.onclick = () => {
      categories.forEach(c => { filterMap[c] = false; });
      listEl.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
    };

    btnClose.onclick = () => { modal.style.display = "none"; };

    btnSave.onclick = () => {
      saveCategoryFilter(filterMap);
      modal.style.display = "none";
      if (onSave) onSave(filterMap);
    };

    modal.style.display = "flex";
  }

  /* ---------- Sentence Builder Game ---------- */
  function initSentenceBuilder(sentences) {
    const targetEl = document.getElementById("target-sentence");
    const buildAreaEl = document.getElementById("build-area");
    const wordBankEl = document.getElementById("word-bank");
    const progressEl = document.getElementById("progress-badge");
    const btnReset = document.getElementById("btn-reset");
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
      errorEl.textContent = "No sentences available. Please enable some sentences in the sentence manager.";
      errorEl.style.display = "block";
      return;
    }

    let currentIndex = 0;
    let placedWords = [];
    let placedItems = []; // Track {word, slot, bankBtn} for proper undo
    let history = []; // Track completed sentence indices for back button
    let advanceTimer = null; // Auto-advance timer (cleared on skip/reset/back)

    // Reset session stats at the start of each round (STATS-04)
    if (window.SessionStats) SessionStats.reset();

    function loadSentence() {
      if (currentIndex >= sentences.length) {
        // All done!
        targetEl.textContent = "🎉 All sentences completed!";
        buildAreaEl.innerHTML = '<span style="color: var(--ok); font-weight: 700;">Great job!</span>';
        wordBankEl.innerHTML = "";
        confettiBurst(50);
        if (window.SessionStats) SessionStats.showPanel();
        return;
      }

      const sentence = sentences[currentIndex];
      const words = sentence.es.split(/\s+/);
      
      targetEl.textContent = sentence.de;
      placedWords = [];
      placedItems = [];
      buildAreaEl.innerHTML = "";
      buildAreaEl.classList.remove("correct");
      wordBankEl.innerHTML = "";
      progressEl.textContent = `${currentIndex + 1} / ${sentences.length}`;

      // Create scrambled word buttons
      const scrambled = shuffleArray(words);
      scrambled.forEach(word => {
        const btn = document.createElement("button");
        btn.className = "word-btn";
        btn.textContent = word;
        btn.onclick = () => {
          if (btn.classList.contains("used")) return;
          
          // Check if this is the correct next word
          const nextWordIndex = placedWords.length;
          const correctNextWord = words[nextWordIndex];
          
          if (word !== correctNextWord) {
            // Wrong word - show error animation and play error sound
            btn.classList.add("wrong-word");
            
            // Play error sound
            playErrorSound();
            if (window.SessionStats) SessionStats.record(false);

            // Remove animation class after it completes
            setTimeout(() => {
              btn.classList.remove("wrong-word");
            }, 500);
            
            return; // Don't add the word
          }
          
          // Correct word - add to build area
          placedWords.push(word);
          if (window.SessionStats) SessionStats.record(true);
          const slot = document.createElement("span");
          slot.className = "word-slot placed";
          slot.textContent = word;
          const item = {word, slot, bankBtn: btn};
          placedItems.push(item);
          slot.onclick = () => {
            // Remove this word and all words placed after it (order matters)
            const itemIndex = placedItems.indexOf(item);
            if (itemIndex < 0) return;
            const removed = placedItems.splice(itemIndex);
            removed.forEach(r => {
              r.slot.remove();
              r.bankBtn.classList.remove("used");
            });
            placedWords = placedItems.map(r => r.word);

            // If build area is empty, show hint
            if (placedWords.length === 0) {
              buildAreaEl.innerHTML = '<span style="color: var(--muted); font-style: italic;">Tap words below to build the sentence</span>';
            }
          };
          
          if (buildAreaEl.querySelector("span[style]")) {
            buildAreaEl.innerHTML = "";
          }
          buildAreaEl.appendChild(slot);
          btn.classList.add("used");

          // Check if complete and correct
          if (placedWords.length === words.length) {
            const builtSentence = placedWords.join(" ");
            if (builtSentence === sentence.es) {
              // Correct!
              buildAreaEl.classList.add("correct");
              showSuccessAnimation();
              confettiBurst(30);
              if (window.CoinTracker) CoinTracker.addCoin();
              advanceTimer = setTimeout(() => {
                advanceTimer = null;
                history.push(currentIndex);
                currentIndex++;
                updateBackButton();
                loadSentence();
              }, 1500);
            }
          }
        };
        wordBankEl.appendChild(btn);
      });
    }

    function updateBackButton() {
      if (btnBack) btnBack.disabled = history.length === 0;
    }

    btnReset.onclick = () => {
      if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
      loadSentence();
    };

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

    btnHome.onclick = () => {
      location.href = "/";
    };

    updateBackButton();
    loadSentence();
  }

  /* ---------- Main Init ---------- */
  async function init() {
    const btnManage = document.getElementById("btn-manage");
    const errorEl = document.getElementById("error");

    try {
      // Load all words
      const allWords = await loadWords("/data/words.tsv");
      
      // Filter to sentences only
      const allSentences = filterSentences(allWords);

      if (allSentences.length === 0) {
        errorEl.textContent = "No sentences found in vocabulary (need 3+ words).";
        errorEl.style.display = "block";
        return;
      }

      // Get category filter state
      const categories = [];
      const seen = new Set();
      allSentences.forEach(s => {
        if (!seen.has(s.category)) { seen.add(s.category); categories.push(s.category); }
      });

      let filterMap = getCategoryFilter();
      if (!filterMap) {
        filterMap = {};
        categories.forEach(c => { filterMap[c] = true; });
        saveCategoryFilter(filterMap);
      }
      categories.forEach(c => {
        if (filterMap[c] === undefined) filterMap[c] = true;
      });

      function getActiveSentences() {
        const active = allSentences.filter(s => filterMap[s.category] !== false);
        return shuffleArray(active);
      }

      // Open sentence manager
      btnManage.onclick = () => {
        openSentenceManager(allSentences, (newFilterMap) => {
          filterMap = newFilterMap;
          const activeSentences = getActiveSentences();
          initSentenceBuilder(activeSentences);
        });
      };

      // Start game
      const activeSentences = getActiveSentences();
      initSentenceBuilder(activeSentences);

    } catch (e) {
      errorEl.textContent = "Could not load vocabulary: " + e.message;
      errorEl.style.display = "block";
    }
  }

  // Export
  window.SentenceBuilder = { init };

})();
