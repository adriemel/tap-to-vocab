/**
 * Tap-to-Vocab (TSV-driven) + Build-the-Word mode
 * - Loads /data/words.tsv
 * - Infers category from URL path (/colors/ -> colors)
 * - Always voices Spanish (es-ES), prefers "Monica" if available
 * - Optional Build mode: click letters to build the Spanish word
 */
(function () {
  // --- Speech helpers ---
  function getSpanishVoice() {
    const voices = window.speechSynthesis.getVoices();
    // Prefer Monica if present
    const monica = voices.find(v =>
      v.name && v.name.toLowerCase().includes("monica") &&
      v.lang && v.lang.toLowerCase().startsWith("es")
    );
    if (monica) return monica;

    const preferred = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith("es"));
    if (preferred.length) return preferred[0];

    return voices[0] || null;
  }

  function speakSpanish(text) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "es-ES";
      const v = getSpanishVoice();
      if (v) u.voice = v;
      u.rate = 0.95;
      u.pitch = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn("Speech synthesis failed:", e);
    }
  }

  // --- TSV loader ---
  function parseTSV(text) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];
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

  async function loadWords(tsvPath) {
    const res = await fetch(tsvPath, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + tsvPath);
    const text = await res.text();
    return parseTSV(text);
  }

  // Infer category from path: '/colors/' -> 'colors'
  function inferCategoryFromPath() {
    const segs = location.pathname.split("/").filter(Boolean);
    return segs[segs.length - 1] || "";
  }

  function normalizeWord(w) {
    return w.trim();
  }

  // --- Build Mode UI ---
  function shuffleArray(arr) {
    for (let j = arr.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [arr[j], arr[k]] = [arr[k], arr[j]];
    }
    return arr;
  }

  function setupBuildMode(targetWord) {
    const wrap = document.querySelector(".build-wrap");
    const slotsEl = document.querySelector(".build-slots");
    const bankEl = document.querySelector(".build-bank");
    const clearBtn = document.getElementById("btn-clear");
    const buildToggle = document.getElementById("toggle-build");

    if (!wrap || !slotsEl || !bankEl || !clearBtn || !buildToggle) return;

    const word = normalizeWord(targetWord);
    const chars = word.split("");
    slotsEl.innerHTML = "";
    bankEl.innerHTML = "";

    const slotMap = [];
    chars.forEach(ch => {
      if (ch === " ") {
        const spacer = document.createElement("div");
        spacer.className = "slot";
        spacer.textContent = "⎵";
        spacer.style.opacity = 0.5;
        spacer.style.borderStyle = "dotted";
        slotsEl.appendChild(spacer);
        slotMap.push({ filled: true, char: " " });
      } else {
        const slot = document.createElement("div");
        slot.className = "slot";
        slot.dataset.accepts = ch;
        slotsEl.appendChild(slot);
        slotMap.push({ filled: false, char: null, el: slot });
      }
    });

    const letters = chars.filter(c => c !== " ");
    const bank = shuffleArray(letters.slice());

    bank.forEach(ch => {
      const b = document.createElement("button");
      b.className = "letter btn";
      b.textContent = ch;
      b.addEventListener("click", () => {
        const next = slotMap.find(s => s.el && !s.filled);
        if (!next) return;
        next.el.textContent = ch;
        next.filled = true;
        next.char = ch;
        b.classList.add("hidden");
        b.disabled = true;

        const done = slotMap.filter(s => s.el).every(s => s.filled);
        if (done) {
          const finalBuilt = slotMap.map(s => s.char || "").join("");
          if (finalBuilt === word) {
            slotsEl.classList.add("success");
            setTimeout(() => slotsEl.classList.remove("success"), 450);
            speakSpanish(word);
          } else {
            slotsEl.style.animation = "bounce 200ms ease-in-out";
            setTimeout(() => { slotsEl.style.animation = ""; }, 220);
          }
        }
      });
      bankEl.appendChild(b);
    });

    clearBtn.onclick = () => {
      slotMap.forEach(s => {
        if (s.el) {
          s.el.textContent = "";
          s.filled = false;
          s.char = null;
        }
      });
      bankEl.querySelectorAll(".letter").forEach(l => {
        l.classList.remove("hidden");
        l.disabled = false;
      });
      slotsEl.classList.remove("success");
    };

    const updateVisibility = () => {
      wrap.style.display = buildToggle.checked ? "block" : "none";
    };
    buildToggle.onchange = updateVisibility;
    updateVisibility();
  }

  function initCategoryUI(words, category) {
    let i = 0;
    const elEs = document.getElementById("word-es");
    const elDe = document.getElementById("word-de");
    const hearBtn = document.getElementById("btn-hear");
    const nextBtn = document.getElementById("btn-next");
    const prevBtn = document.getElementById("btn-prev");
    const shuffleBtn = document.getElementById("btn-shuffle");
    const autoSpeakEl = document.getElementById("auto-speak");
    const counterEl = document.getElementById("counter");
    const buildToggle = document.getElementById("toggle-build");

    let order = words.map((_, idx) => idx);
    let shuffled = false;

    function render() {
      const w = words[order[i]];
      elEs.textContent = w.es;
      elDe.textContent = w.de;
      counterEl.textContent = (i + 1) + " / " + words.length;
      if (autoSpeakEl.checked) setTimeout(() => speakSpanish(w.es), 80);

      if (buildToggle && buildToggle.checked) {
        setupBuildMode(w.es);
      }
    }

    function next() { i = (i + 1) % words.length; render(); }
    function prev() { i = (i - 1 + words.length) % words.length; render(); }

    function toggleShuffle() {
      shuffled = !shuffled;
      if (shuffled) {
        order = shuffleArray(words.map((_, idx) => idx));
        shuffleBtn.classList.add("active");
      } else {
        order = words.map((_, idx) => idx);
        shuffleBtn.classList.remove("active");
      }
      i = 0;
      render();
    }

    hearBtn.addEventListener("click", () => speakSpanish(words[order[i]].es));
    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);
    shuffleBtn.addEventListener("click", toggleShuffle);

    window.speechSynthesis.onvoiceschanged = () => {};

    render();
  }

  async function initFromTSV(opts) {
    const category = (opts && opts.category) || inferCategoryFromPath();
    const tsvPath = (opts && opts.tsvPath) || "/data/words.tsv";
    const titleEl = document.getElementById("title");
    const badgeEl = document.getElementById("cat-badge");
    const errorEl = document.getElementById("error");

    try {
      const rows = await loadWords(tsvPath);
      const words = rows.filter(r => r.category.toLowerCase() === category.toLowerCase());
      if (!words.length) {
        errorEl.innerHTML = "No words found for category: <b>" + category + "</b>. Check data/words.tsv.";
        errorEl.style.display = "block";
        return;
      }
      titleEl.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      badgeEl.textContent = category;
      initCategoryUI(words, category);
    } catch (e) {
      errorEl.textContent = "Could not load words.tsv: " + e.message;
      errorEl.style.display = "block";
    }
  }

  window.TapVocabTSV = { initFromTSV, setupBuildMode };
})();
