/**
 * Tap‑to‑Vocab (with ⭐ Practice list)
 * - Loads /words.tsv
 * - Adds "Mark / Unmark" star button
 * - New category "practice" showing saved words
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
      piece.style.setProperty("--dy", `${80 + Math.random() * 80}px`);
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

  /* ---------- Build Mode ---------- */
  function setupBuildMode(targetWord) {
    const slotsEl = document.querySelector(".build-slots");
    const bankEl = document.querySelector(".build-bank");
    const clearBtn = document.getElementById("btn-clear");
    if (!slotsEl || !bankEl || !clearBtn) return;

    const word = targetWord.trim();
    const chars = Array.from(word);
    slotsEl.innerHTML = "";
    bankEl.innerHTML = "";

    const slotMap = [];
    chars.forEach(ch => {
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.textContent = ch === " " ? "⎵" : "";
      if (ch === " ") {
        slot.style.opacity = 0.4; slot.style.borderStyle = "dotted";
        slotMap.push({ filled: true, char: " " });
      } else {
        slotMap.push({ filled: false, char: null, el: slot, expected: ch });
      }
      slotsEl.appendChild(slot);
    });

    const bank = shuffleArray(chars.filter(c => c !== " "));
    function nextEmptyIndex() {
      return slotMap.findIndex(s => s.el && !s.filled);
    }

    bank.forEach(ch => {
      const b = document.createElement("button");
      b.className = "letter btn";
      b.textContent = ch;
      b.addEventListener("click", () => {
        const idx = nextEmptyIndex();
        if (idx < 0) return;
        const expected = slotMap[idx];
        if (ch === expected.expected) {
          expected.el.textContent = ch;
          expected.filled = true;
          b.classList.add("used"); b.disabled = true;
          const done = slotMap.filter(s => s.el).every(s => s.filled);
          if (done) {
            const built = slotMap.map(s => s.el ? (s.el.textContent || "") : s.char).join("");
            if (built === word) {
              slotsEl.classList.add("success");
              setTimeout(() => slotsEl.classList.remove("success"), 450);
              speakSpanish(word);
              confettiBurst(slotsEl);
              // optional: auto‑unmark mastered word
              let list = getPracticeList().filter(w => w.es !== word);
              savePracticeList(list);
            }
          }
        } else {
          b.classList.add("wrong");
          setTimeout(() => b.classList.remove("wrong"), 220);
        }
      });
      bankEl.appendChild(b);
    });

    clearBtn.onclick = () => {
      slotMap.forEach(s => { if (s.el) { s.el.textContent = ""; s.filled = false; } });
      bankEl.querySelectorAll(".letter").forEach(l => {
        l.classList.remove("used","wrong"); l.disabled = false;
      });
      slotsEl.classList.remove("success");
    };
  }

  /* ---------- UI logic ---------- */
  function initCategoryUI(words, category) {
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
      markBtn.textContent = isMarked(w) ? "⭐ Marked" : "✩ Mark";
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
      setupBuildMode(w.es);
    }

    function next() { i = (i + 1) % words.length; render(); }
    function prev() { i = (i - 1 + words.length) % words.length; render(); }

    hearBtn.onclick = () => speakSpanish(words[i].es);
    nextBtn.onclick = next;
    prevBtn.onclick = prev;
    btnShow.onclick = () => {
      if (elDe.classList.contains("shown")) {
        elDe.classList.remove("shown"); btnShow.textContent = "Show";
      } else { elDe.classList.add("shown"); btnShow.textContent = "Hide"; }
    };
    markBtn.onclick = () => {
      toggleMark(words[i]); updateMarkButton(words[i]);
    };
    homeBtn.onclick = () => { location.href = "../"; };

    render();
  }

  /* ---------- Main init ---------- */
  async function initFromTSV(opts) {
    const category = (opts && opts.category) || inferCategoryFromPath();
    const tsvPath = (opts && opts.tsvPath) || "/words.tsv";
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

      titleEl.textContent = category === "practice" ? "⭐ Practice" : category;
      badgeEl.textContent = category;
      initCategoryUI(words, category);
    } catch (e) {
      errorEl.textContent = "Could not load words.tsv: " + e.message;
      errorEl.style.display = "block";
    }
  }

  window.TapVocabTSV = { initFromTSV };

})();
