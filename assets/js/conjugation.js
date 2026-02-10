/**
 * Verb Conjugation Practice for Tap-to-Vocab
 * Tap conjugated forms in order (yo -> ellos) to fill the conjugation table
 */

(function () {

  const PRONOUNS = [
    { key: "yo", label: "yo" },
    { key: "tu", label: "tú" },
    { key: "él", label: "él/ella" },
    { key: "nosotros", label: "nosotros/as" },
    { key: "vosotros", label: "vosotros/as" },
    { key: "ellos", label: "ellos/ellas" }
  ];

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
  async function loadVerbs(tsvPath) {
    const res = await fetch(tsvPath, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + tsvPath);
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const header = lines[0].split("\t").map(h => h.trim());
    return lines.slice(1).map(line => {
      const cols = line.split("\t");
      const obj = {};
      header.forEach((h, i) => {
        obj[h] = (cols[i] || "").trim();
      });
      return obj;
    }).filter(v => v.infinitive && v.de);
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
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.style.cssText = `
        position:fixed;
        width:10px;height:10px;opacity:.9;border-radius:50%;
        left:${50 + (Math.random() * 20 - 10)}%;top:30%;
        background:hsl(${Math.random() * 360} 80% 60%);
        transform:translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) rotate(${Math.random() * 360}deg);
        animation:fall ${800 + Math.random() * 400}ms ease-out forwards;
        pointer-events:none;z-index:9999;
      `;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 1500);
    }
  }

  /* ---------- Error Sound ---------- */
  let _audioCtx = null;
  function playErrorSound() {
    try {
      if (!_audioCtx) {
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = _audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 150;
      osc.type = "sawtooth";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Could not play error sound:", e);
    }
  }

  /* ---------- Conjugation Game ---------- */
  function initConjugationGame(verbs) {
    const infinitiveEl = document.getElementById("verb-infinitive");
    const germanEl = document.getElementById("verb-german");
    const tableEl = document.getElementById("conj-table");
    const wordBankEl = document.getElementById("word-bank");
    const progressEl = document.getElementById("progress-badge");
    const btnReset = document.getElementById("btn-reset");
    const btnSkip = document.getElementById("btn-skip");
    const btnHome = document.getElementById("btn-home");
    const errorEl = document.getElementById("error");

    if (verbs.length === 0) {
      errorEl.textContent = "No verbs available.";
      errorEl.style.display = "block";
      return;
    }

    let currentIndex = 0;
    let filledCount = 0;

    function loadVerb() {
      if (currentIndex >= verbs.length) {
        infinitiveEl.textContent = "🎉 All verbs completed!";
        germanEl.textContent = "";
        tableEl.innerHTML = '<div style="color: var(--ok); font-weight: 700; text-align:center; padding:20px;">Great job!</div>';
        wordBankEl.innerHTML = "";
        confettiBurst(50);
        return;
      }

      const verb = verbs[currentIndex];
      filledCount = 0;

      infinitiveEl.textContent = verb.infinitive;
      germanEl.textContent = verb.de;
      progressEl.textContent = `${currentIndex + 1} / ${verbs.length}`;

      // Build conjugation table rows
      tableEl.innerHTML = "";
      tableEl.classList.remove("conj-complete");
      const slots = [];

      PRONOUNS.forEach((p, i) => {
        const row = document.createElement("div");
        row.className = "conj-row";

        const label = document.createElement("span");
        label.className = "conj-pronoun";
        label.textContent = p.label;

        const slot = document.createElement("span");
        slot.className = "conj-slot";
        slot.dataset.index = i;

        row.appendChild(label);
        row.appendChild(slot);
        tableEl.appendChild(row);
        slots.push(slot);
      });

      // Build scrambled word bank
      wordBankEl.innerHTML = "";
      const forms = PRONOUNS.map(p => verb[p.key]);
      const scrambled = shuffleArray(forms);

      scrambled.forEach(form => {
        const btn = document.createElement("button");
        btn.className = "word-btn";
        btn.textContent = form;
        btn.onclick = () => {
          if (btn.classList.contains("used")) return;

          // Check if this is the correct next form
          const expectedForm = verb[PRONOUNS[filledCount].key];

          if (form !== expectedForm) {
            btn.classList.add("wrong-word");
            playErrorSound();
            setTimeout(() => btn.classList.remove("wrong-word"), 500);
            return;
          }

          // Correct - fill the slot
          slots[filledCount].textContent = form;
          slots[filledCount].classList.add("filled");
          btn.classList.add("used");
          filledCount++;

          // Check if all filled
          if (filledCount === PRONOUNS.length) {
            tableEl.classList.add("conj-complete");
            showSuccessAnimation();
            confettiBurst(30);
            setTimeout(() => {
              currentIndex++;
              loadVerb();
            }, 1500);
          }
        };
        wordBankEl.appendChild(btn);
      });
    }

    btnReset.onclick = () => loadVerb();
    btnSkip.onclick = () => { currentIndex++; loadVerb(); };
    btnHome.onclick = () => { location.href = "/"; };

    loadVerb();
  }

  /* ---------- Main Init ---------- */
  async function init() {
    const errorEl = document.getElementById("error");
    try {
      const verbs = await loadVerbs("/data/verbs.tsv");
      if (verbs.length === 0) {
        errorEl.textContent = "No verbs found in data file.";
        errorEl.style.display = "block";
        return;
      }
      const shuffled = shuffleArray(verbs);
      initConjugationGame(shuffled);
    } catch (e) {
      errorEl.textContent = "Could not load verbs: " + e.message;
      errorEl.style.display = "block";
    }
  }

  window.VerbConjugation = { init };

})();
