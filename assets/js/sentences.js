/**
 * Sentence Builder for Tap-to-Vocab
 * Filters sentences (3+ words), allows selection, and builds interactive sentence construction game
 */

(function () {
  
  const STORAGE_KEY_ENABLED = "enabledSentences";

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
    catch (e) { console.warn("Could not save enabled sentences:", e); }
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

    // Get current enabled state
    let enabledMap = getEnabledSentences();
    if (!enabledMap) {
      // First time - enable all by default
      enabledMap = {};
      allSentences.forEach(s => {
        enabledMap[s.de] = true;
      });
    }

    // Render list
    listEl.innerHTML = "";
    allSentences.forEach((sentence, idx) => {
      const item = document.createElement("div");
      item.className = "sentence-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `sent-${idx}`;
      checkbox.checked = enabledMap[sentence.de] !== false;
      checkbox.addEventListener("change", () => {
        enabledMap[sentence.de] = checkbox.checked;
      });

      const label = document.createElement("label");
      label.htmlFor = `sent-${idx}`;
      label.textContent = sentence.de;

      item.appendChild(checkbox);
      item.appendChild(label);
      listEl.appendChild(item);
    });

    // Select/Deselect All
    btnSelectAll.onclick = () => {
      allSentences.forEach(s => {
        enabledMap[s.de] = true;
      });
      listEl.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = true);
    };

    btnDeselectAll.onclick = () => {
      allSentences.forEach(s => {
        enabledMap[s.de] = false;
      });
      listEl.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
    };

    // Close handlers
    const closeModal = () => {
      modal.style.display = "none";
    };

    btnClose.onclick = closeModal;
    
    btnSave.onclick = () => {
      saveEnabledSentences(enabledMap);
      closeModal();
      if (onSave) onSave(enabledMap);
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

    if (sentences.length === 0) {
      errorEl.textContent = "No sentences available. Please enable some sentences in the sentence manager.";
      errorEl.style.display = "block";
      return;
    }

    let currentIndex = 0;
    let placedWords = [];
    let placedItems = []; // Track {word, slot, bankBtn} for proper undo
    let history = []; // Track completed sentence indices for back button

    function loadSentence() {
      if (currentIndex >= sentences.length) {
        // All done!
        targetEl.textContent = "🎉 All sentences completed!";
        buildAreaEl.innerHTML = '<span style="color: var(--ok); font-weight: 700;">Great job!</span>';
        wordBankEl.innerHTML = "";
        confettiBurst(50);
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
            
            // Remove animation class after it completes
            setTimeout(() => {
              btn.classList.remove("wrong-word");
            }, 500);
            
            return; // Don't add the word
          }
          
          // Correct word - add to build area
          placedWords.push(word);
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
              setTimeout(() => {
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
      loadSentence();
    };

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

      // Get enabled sentences
      let enabledMap = getEnabledSentences();
      if (!enabledMap) {
        // First time - enable all
        enabledMap = {};
        allSentences.forEach(s => {
          enabledMap[s.de] = true;
        });
        saveEnabledSentences(enabledMap);
      }

      function getActiveSentences() {
        const active = allSentences.filter(s => enabledMap[s.de] !== false);
        return shuffleArray(active);
      }

      // Open sentence manager
      btnManage.onclick = () => {
        openSentenceManager(allSentences, (newEnabledMap) => {
          enabledMap = newEnabledMap;
          // Restart with new selection
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
