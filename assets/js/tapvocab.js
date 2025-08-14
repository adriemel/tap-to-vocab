/**
 * Tap-to-Vocab (TSV-driven)
 * - Loads /data/words.tsv
 * - Filters rows by category derived from the URL path (e.g., /colors/)
 * - Always voices the Spanish word (es)
 */
(function () {
  // --- Speech helpers ---
  function getSpanishVoice() {
    const voices = window.speechSynthesis.getVoices();
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
    return segs[segs.length - 1] || ""; // in '/colors/' last is 'colors'
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

    let order = words.map((_, idx) => idx);
    let shuffled = false;

    function shuffleArray(arr) {
      for (let j = arr.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [arr[j], arr[k]] = [arr[k], arr[j]];
      }
      return arr;
    }

    function render() {
      const w = words[order[i]];
      elEs.textContent = w.es;
      elDe.textContent = w.de;
      counterEl.textContent = (i + 1) + " / " + words.length;
      if (autoSpeakEl.checked) setTimeout(() => speakSpanish(w.es), 80);
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

  window.TapVocabTSV = { initFromTSV };
})();