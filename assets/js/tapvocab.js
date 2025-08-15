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
