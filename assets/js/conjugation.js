/**
 * Verb Conjugation Practice for Tap-to-Vocab
 * Tap conjugated forms in order (yo -> ellos) to fill the conjugation table
 */

(function () {

  const STORAGE_KEY_ENABLED = "enabledVerbs";

  /* ---------- Storage for enabled verbs ---------- */
  function getEnabledVerbs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ENABLED);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  function saveEnabledVerbs(enabledMap) {
    try { localStorage.setItem(STORAGE_KEY_ENABLED, JSON.stringify(enabledMap)); }
    catch (e) { console.warn("Could not save enabled verbs:", e); }
  }

  const PRONOUNS = [
    { key: "yo", label: "yo" },
    { key: "tu", label: "tú" },
    { key: "él", label: "él/ella/usted" },
    { key: "nosotros", label: "nosotros/as" },
    { key: "vosotros", label: "vosotros/as" },
    { key: "ellos", label: "ellos/ellas/ustedes" }
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

  /* ---------- Audio ---------- */
  let _audioCtx = null;


  function playSuccessSound() {
    try {
      if (!_audioCtx) {
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = _audioCtx;
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = now + i * 0.1;
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch (e) {
      console.warn("Could not play success sound:", e);
    }
  }

  /* ---------- Success Animation ---------- */
  function showSuccessAnimation() {
    const emojis = ["🎉", "✨", "🎊", "💃", "🕺", "🎈", "🌟", "⭐", "🥳", "👏", "💪"];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const el = document.createElement("div");
    el.className = "success-animation";
    el.textContent = emoji;
    document.body.appendChild(el);
    playSuccessSound();
    setTimeout(() => el.remove(), 800);
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

  /* ---------- Verb Manager ---------- */
  function openVerbManager(allVerbs, onSave) {
    const modal = document.getElementById("verb-manager");
    const listEl = document.getElementById("verb-list");
    const btnClose = document.getElementById("btn-close-manager");
    const btnSave = document.getElementById("btn-save-selection");
    const btnSelectAll = document.getElementById("btn-select-all");
    const btnDeselectAll = document.getElementById("btn-deselect-all");

    let enabledMap = getEnabledVerbs();
    if (!enabledMap) {
      enabledMap = {};
      allVerbs.forEach(v => { enabledMap[v.infinitive] = true; });
    }

    listEl.innerHTML = "";
    allVerbs.forEach((verb, idx) => {
      const item = document.createElement("div");
      item.className = "sentence-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `verb-${idx}`;
      checkbox.checked = enabledMap[verb.infinitive] !== false;
      checkbox.addEventListener("change", () => {
        enabledMap[verb.infinitive] = checkbox.checked;
      });

      const label = document.createElement("label");
      label.htmlFor = `verb-${idx}`;
      label.textContent = `${verb.infinitive} — ${verb.de}`;

      item.appendChild(checkbox);
      item.appendChild(label);
      listEl.appendChild(item);
    });

    btnSelectAll.onclick = () => {
      allVerbs.forEach(v => { enabledMap[v.infinitive] = true; });
      listEl.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = true);
    };

    btnDeselectAll.onclick = () => {
      allVerbs.forEach(v => { enabledMap[v.infinitive] = false; });
      listEl.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
    };

    const closeModal = () => { modal.style.display = "none"; };
    btnClose.onclick = closeModal;

    btnSave.onclick = () => {
      saveEnabledVerbs(enabledMap);
      closeModal();
      if (onSave) onSave(enabledMap);
    };

    modal.style.display = "flex";
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
    const btnBack = document.getElementById("btn-back");
    const btnHome = document.getElementById("btn-home");
    const errorEl = document.getElementById("error");

    if (verbs.length === 0) {
      errorEl.textContent = "No verbs available. Please enable some verbs in Select Verbs.";
      errorEl.style.display = "block";
      return;
    }

    let currentIndex = 0;
    let filledCount = 0;
    let history = [];

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
              history.push(currentIndex);
              currentIndex++;
              updateBackButton();
              loadVerb();
            }, 1500);
          }
        };
        wordBankEl.appendChild(btn);
      });
    }

    function updateBackButton() {
      if (btnBack) btnBack.disabled = history.length === 0;
    }

    btnReset.onclick = () => loadVerb();
    btnSkip.onclick = () => {
      history.push(currentIndex);
      currentIndex++;
      updateBackButton();
      loadVerb();
    };

    if (btnBack) {
      btnBack.onclick = () => {
        if (history.length === 0) return;
        currentIndex = history.pop();
        updateBackButton();
        loadVerb();
      };
    }

    btnHome.onclick = () => { location.href = "/"; };

    updateBackButton();
    loadVerb();
  }

  /* ---------- Main Init ---------- */
  async function init() {
    const errorEl = document.getElementById("error");
    const btnManage = document.getElementById("btn-manage");

    try {
      const allVerbs = await loadVerbs("/data/verbs.tsv");
      if (allVerbs.length === 0) {
        errorEl.textContent = "No verbs found in data file.";
        errorEl.style.display = "block";
        return;
      }

      let enabledMap = getEnabledVerbs();
      if (!enabledMap) {
        enabledMap = {};
        allVerbs.forEach(v => { enabledMap[v.infinitive] = true; });
        saveEnabledVerbs(enabledMap);
      }

      function getActiveVerbs() {
        const active = allVerbs.filter(v => enabledMap[v.infinitive] !== false);
        return shuffleArray(active);
      }

      btnManage.onclick = () => {
        openVerbManager(allVerbs, (newEnabledMap) => {
          enabledMap = newEnabledMap;
          const activeVerbs = getActiveVerbs();
          initConjugationGame(activeVerbs);
        });
      };

      const activeVerbs = getActiveVerbs();
      initConjugationGame(activeVerbs);
    } catch (e) {
      errorEl.textContent = "Could not load verbs: " + e.message;
      errorEl.style.display = "block";
    }
  }

  window.VerbConjugation = { init };

})();
