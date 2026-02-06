/**
 * Sentence Builder for Tap-to-Vocab
 * Filters sentences (3+ words), allows selection, and builds interactive sentence construction game
 */

(function () {
  
  const STORAGE_KEY_ENABLED = "enabledSentences";

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
    localStorage.setItem(STORAGE_KEY_ENABLED, JSON.stringify(enabledMap));
  }

  /* ---------- Filter sentences (3+ words) ---------- */
  function filterSentences(words) {
    return words.filter(w => {
      const wordCount = w.es.trim().split(/\s+/).length;
      return wordCount >= 3;
    });
  }

  /* ---------- Success Animation ---------- */
  function showSuccessAnimation() {
    const emojis = ["🎉", "✨", "🎊", "💃", "🕺", "🎈", "🌟", "⭐"];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    const el = document.createElement("div");
    el.className = "success-animation";
    el.textContent = emoji;
    document.body.appendChild(el);
    
    setTimeout(() => el.remove(), 600);
  }

  /* ---------- Confetti ---------- */
  function confettiBurst(count = 30) {
    const container = document.body;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.style.cssText = `
        position:fixed;
        width:10px;
        height:10px;
        opacity:.9;
        border-radius:50%;
        left:${50 + (Math.random() * 20 - 10)}%;
        top:${30}%;
        background:hsl(${Math.random() * 360} 80% 60%);
        transform:translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) rotate(${Math.random() * 360}deg);
        animation: fall ${800 + Math.random() * 400}ms ease-out forwards;
        pointer-events: none;
        z-index: 9999;
      `;
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 1500);
    }
  }

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
    allSentences.forEach(sentence => {
      const item = document.createElement("div");
      item.className = "sentence-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `sent-${sentence.de}`;
      checkbox.checked = enabledMap[sentence.de] !== false;
      checkbox.addEventListener("change", () => {
        enabledMap[sentence.de] = checkbox.checked;
      });

      const label = document.createElement("label");
      label.htmlFor = `sent-${sentence.de}`;
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
    const btnHome = document.getElementById("btn-home");
    const errorEl = document.getElementById("error");

    if (sentences.length === 0) {
      errorEl.textContent = "No sentences available. Please enable some sentences in the sentence manager.";
      errorEl.style.display = "block";
      return;
    }

    let currentIndex = 0;
    let placedWords = [];

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
          
          // Add to build area
          placedWords.push(word);
          const slot = document.createElement("span");
          slot.className = "word-slot placed";
          slot.textContent = word;
          slot.onclick = () => {
            // Remove from build area
            placedWords = placedWords.filter(w => w !== word);
            slot.remove();
            btn.classList.remove("used");
            
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

          // Check if correct
          if (placedWords.length === words.length) {
            const builtSentence = placedWords.join(" ");
            if (builtSentence === sentence.es) {
              // Correct!
              buildAreaEl.classList.add("correct");
              showSuccessAnimation();
              confettiBurst(30);
              setTimeout(() => {
                currentIndex++;
                loadSentence();
              }, 1500);
            }
          }
        };
        wordBankEl.appendChild(btn);
      });
    }

    btnReset.onclick = () => {
      loadSentence();
    };

    btnSkip.onclick = () => {
      currentIndex++;
      loadSentence();
    };

    btnHome.onclick = () => {
      location.href = "/";
    };

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
