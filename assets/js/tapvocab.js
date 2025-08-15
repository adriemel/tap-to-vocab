/**
 * Tap-to-Vocab (TSV-driven) — Build mode (strict, multi-word) + confetti + Monica/Mónica + Show translation
 * - Loads /data/words.tsv
 * - Infers category from URL path (/Colores/ -> Colores)
 * - Always voices Spanish (es-ES), prefers "Monica/Mónica" if available
 * - Build mode is always active: only the correct next letter is accepted
 * - "Show" button reveals the German translation (hidden by default for each word)
 */
(function () {
  // --- Inject tiny CSS for confetti (so you don't have to edit styles.css) ---
  (function injectConfettiCSS() {
    const css = `
      .tv-confetti {
        position: absolute; width: 8px; height: 12px; opacity: 0.9; border-radius: 2px;
        will-change: transform, opacity; pointer-events: none;
      }
      @keyframes tv-confetti-fall {
        0%   { transform: translate(0,0) rotate(0deg);   opacity: 1; }
        100% { transform: translate(var(--dx, 0), var(--dy, 120px)) rotate(var(--rot, 180deg)); opacity: 0; }
      }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  })();

  // --- Speech helpers ---
  function getSpanishVoice() {
    const voices = window.speechSynthesis.getVoices();
    const normalize = s => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // Prefer Monica/Mónica if present
    const monica = voices.find(v =>
      normalize(v.name).includes("monica") &&
      v.lang && v.lang.toLowerCase().startsWith("es")
    );
    if (monica) return monica;

    // Otherwise any Spanish voice
    const preferred = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith("es"));
    if (preferred.length) return preferred[0];

    // Fallback: any voice
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

  // --- Confetti burst near a target element ---
  function confettiBurst(targetEl, count = 24) {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const container = document.body;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "tv-confetti";
      const left = rect.left + rect.width / 2 + (Math.random() * 40 - 20);
      const top = rect.top + 10;
      piece.style.left = `${left}px`;
      piece.style.top = `${top}px`;
      const hue = Math.floor(Math.random() * 360);
      piece.style.background = `hsl(${hue} 80% 60%)`;
      piece.style.setProperty("--dx", `${Math.random() * 120 - 60}px`);
      piece.style.setProperty("--dy", `${80 + Math.random() * 80}px`);
      piece.style.setProperty("--rot", `${90 + Math.random() * 180}deg`);
      piece.style.animation = `tv-confetti-fall ${600 + Math.random() * 500}ms ease-out forwards`;
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 1200);
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

  // Infer category from path: '/Colores/' -> 'Colores'
  function inferCategoryFromPath() {
    const segs = location.pathname.split("/").filter(Boolean);
    return segs[segs.length - 1] || "";
  }

  function normalizeWord(w) {
    return (w || "").trim();
  }

  // --- Build Mode UI (always on, strict matching; supports spaces in phrases) ---
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

    if (!wrap || !slotsEl || !bankEl || !clearBtn) return;
    wrap.style.display = "block"; // ALWAYS ON

    const word = normalizeWord(targetWord);
    const chars = Array.from(word); // keep spaces as real characters
    slotsEl.innerHTML = "";
    bankEl.innerHTML = "";

    // Create slots; store the expected char on each non-space slot
    const slotMap = [];
    chars.forEach(ch => {
      if (ch === " ") {
        const spacer = document.createElement("div");
        spacer.className = "slot";
        spacer.textContent = "⎵";
        spacer.style.opacity = 0.5;
        spacer.style.borderStyle = "dotted";
        slotsEl.appendChild(spacer);
        slotMap.push({ filled: true, char: " " }); // fixed, already "filled"
      } else {
        const slot = document.createElement("div");
        slot.className = "slot";
        slotsEl.appendChild(slot);
        slotMap.push({ filled: false, char: null, el: slot, expected: ch });
      }
    });

    // Letter bank: letters only (no spaces), shuffled
    const letters = chars.filter(c => c !== " ");
    const bank = shuffleArray(letters.slice());

    // Helper: index of next expected slot (skips spaces because they are "filled")
    function nextEmptyIndex() {
      return slotMap.findIndex(s => s.el && !s.filled);
    }

    bank.forEach(ch => {
      const b = document.createElement("button");
      b.className = "letter btn";
      b.textContent = ch;
      b.addEventListener("click", () => {
        const idx = nextEmptyIndex();
        if (idx < 0) return; // already complete
        const expectedSlot = slotMap[idx];         // has .expected
        const expectedChar = expectedSlot.expected; // correct letter at this position

        if (ch === expectedChar) {
          // correct: fill the slot and mark button "used" (keep its place)
          expectedSlot.el.textContent = ch;
          expectedSlot.filled = true;
          expectedSlot.char = ch;
          b.classList.add("used");
          b.setAttribute("aria-disabled", "true");
          b.disabled = true;

          // if finished, check and celebrate
          const done = slotMap.filter(s => s.el).every(s => s.filled);
          if (done) {
            // Rebuild including spaces
            const finalBuilt = slotMap.map(s => (s.el ? (s.char || "") : s.char)).join("");
            if (finalBuilt === word) {
              slotsEl.classList.add("success");
              setTimeout(() => slotsEl.classList.remove("success"), 450);
              speakSpanish(word);
              confettiBurst(slotsEl, 24); // tiny party 🎉
            } else {
              slotsEl.style.animation = "bounce 200ms ease-in-out";
              setTimeout(() => { slotsEl.style.animation = ""; }, 220);
            }
          }
        } else {
          // wrong: shake the button; do not remove or move it
          b.classList.add("wrong");
          setTimeout(() => b.classList.remove("wrong"), 220);
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
        l.classList.remove("used", "wrong");
        l.removeAttribute("aria-disabled");
        l.disabled = false;
      });
      slotsEl.classList.remove("success");
    };
  }

  function initCategoryUI(words) {
    let i = 0;
    const elEs = document.getElementById("word-es");
    const elDe = document.getElementById("word-de");
    const btnShow = document.getElementById("btn-show");
    const hearBtn = document.getElementById("btn-hear");
    const nextBtn = document.getElementById("btn-next");
    const prevBtn = document.getElementById("btn-prev");
    const shuffleBtn = document.getElementById("btn-shuffle");
    const autoSpeakEl = document.getElementById("auto-speak");
    const counterEl = document.getElementById("counter");

    let order = words.map((_, idx) => idx);
    let shuffled = false;

    function hideTranslation() {
      elDe.classList.remove("shown");
      if (btnShow) btnShow.textContent = "Show";
    }

    function render() {
      const w = words[order[i]];
      elEs.textContent = w.es;
      elDe.textContent = w.de;
      counterEl.textContent = (i + 1) + " / " + words.length;
      hideTranslation(); // hide DE by default for each word
      if (autoSpeakEl.checked) setTimeout(() => speakSpanish(w.es), 80);

      // Build mode for this word (always)
      setupBuildMode(w.es);
    }

    function next() { i = (i + 1) % words.length; render(); }
    function prev() { i = (i - 1 + words.length) % words.length; render(); }

    function toggleShuffle() {
      shuffled = !shuffled;
      if (shuffled) {
        order = (function(arr){ for (let j=arr.length-1;j>0;j--){ const k=Math.floor(Math.random()*(j+1)); [arr[j],arr[k]]=[arr[k],arr[j]] } return arr })(words.map((_, idx) => idx));
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

    if (btnShow) {
      btnShow.addEventListener("click", () => {
        if (elDe.classList.contains("shown")) {
          elDe.classList.remove("shown");
          btnShow.textContent = "Show";
        } else {
          elDe.classList.add("shown");
          btnShow.textContent = "Hide";
        }
      });
    }

    // iOS loads voices lazily
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
      initCategoryUI(words);
    } catch (e) {
      errorEl.textContent = "Could not load words.tsv: " + e.message;
      errorEl.style.display = "block";
    }
  }

  window.TapVocabTSV = { initFromTSV };
})();
