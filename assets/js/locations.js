(function () {
  var shiftX, shiftY, originLeft, originTop, snapTimer;
  var onDropCallback = null;
  var activeDraggable = null;

  function init(draggableEl, onDrop) {
    onDropCallback = onDrop;
    draggableEl.addEventListener('pointerdown', onPointerDown);
    draggableEl.ondragstart = function () { return false; }; // disable native image drag on desktop Chrome
  }

  function onPointerDown(e) {
    if (!e.isPrimary) return; // ignore secondary touches (multi-touch)
    var el = e.currentTarget;
    if (snapTimer) { clearTimeout(snapTimer); snapTimer = null; }

    var rect = el.getBoundingClientRect();
    shiftX = e.clientX - rect.left;
    shiftY = e.clientY - rect.top;
    originLeft = rect.left;
    originTop = rect.top;

    el.style.position = 'fixed';
    el.style.zIndex = '1000';
    el.style.transition = 'none';
    el.style.left = (e.clientX - shiftX) + 'px';
    el.style.top = (e.clientY - shiftY) + 'px';

    activeDraggable = el;
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp); // iOS diagonal drag safety
  }

  function onPointerMove(e) {
    if (!e.isPrimary) return;
    var el = activeDraggable;
    if (!el) return;

    el.style.left = (e.clientX - shiftX) + 'px';
    el.style.top = (e.clientY - shiftY) + 'px';

    // Zone hover highlight: use cat center vs zone bounding box
    var rect = el.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    document.querySelectorAll('[data-zone]').forEach(function (z) {
      var zr = z.getBoundingClientRect();
      var inside = cx >= zr.left && cx <= zr.right && cy >= zr.top && cy <= zr.bottom;
      z.classList.toggle('zone-hover', inside);
    });
  }

  function onPointerUp(e) {
    if (!e.isPrimary) return;
    var el = activeDraggable;
    if (!el) return;

    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerUp);
    activeDraggable = null;

    // Clear all zone highlights
    document.querySelectorAll('[data-zone]').forEach(function (z) {
      z.classList.remove('zone-hover');
    });

    // Final hit detection: cat center vs zone bounding box
    var rect = el.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var zone = null;
    document.querySelectorAll('[data-zone]').forEach(function (z) {
      var zr = z.getBoundingClientRect();
      if (cx >= zr.left && cx <= zr.right && cy >= zr.top && cy <= zr.bottom) { zone = z; }
    });

    if (zone) {
      onDropCallback(zone.dataset.zone, el);
    } else {
      snapBack(el);
    }
  }

  function snapBack(el) {
    el.style.transition = 'left 0.25s ease, top 0.25s ease';
    el.style.left = originLeft + 'px';
    el.style.top = originTop + 'px';
    snapTimer = setTimeout(function () {
      el.style.position = '';
      el.style.transition = '';
      el.style.zIndex = '';
      el.style.left = '';
      el.style.top = '';
      snapTimer = null;
    }, 260);
  }

  function resetDraggable(el) {
    if (snapTimer) { clearTimeout(snapTimer); snapTimer = null; }
    el.style.position = '';
    el.style.transition = '';
    el.style.zIndex = '';
    el.style.left = '';
    el.style.top = '';
  }

  // ── Game loop state ────────────────────────────────────────────────────────
  var EXERCISES = [
    { zone: 'encima-de',         es: 'encima de',         de: 'oben auf' },
    { zone: 'debajo-de',         es: 'debajo de',         de: 'unter' },
    { zone: 'delante-de',        es: 'delante de',        de: 'vor' },
    { zone: 'detras-de',         es: 'detrás de',         de: 'hinter' },
    { zone: 'al-lado-de',        es: 'al lado de',        de: 'neben' },
    { zone: 'a-la-derecha-de',   es: 'a la derecha de',   de: 'rechts von' },
    { zone: 'a-la-izquierda-de', es: 'a la izquierda de', de: 'links von' },
    { zone: 'al-lado-de',        es: 'cerca de',          de: 'in der Nähe von' },
    { zone: 'lejos-de',          es: 'lejos de',          de: 'weit weg von' },
    { zone: 'en',                es: 'en',                de: 'in / auf' }
  ];
  var queue = [];            // shuffled working copy, reset each game
  var currentIndex = 0;
  var gameHistory = [];      // renamed from 'history' to avoid shadowing window.history
  var advanceTimer = null;
  var draggableEl = null;

  function startGame() {
    currentIndex = 0;
    gameHistory = [];
    queue = SharedUtils.shuffleArray(EXERCISES);
    draggableEl = document.getElementById('draggable');
    // Reset session stats at the start of each round (STATS-04)
    if (window.SessionStats) SessionStats.reset();
    var btnStats = document.getElementById('btn-stats');
    var btnStatsClose = document.getElementById('btn-stats-close');
    if (btnStats) btnStats.onclick = function () {
      if (window.SessionStats) SessionStats.showPanel();
    };
    if (btnStatsClose) btnStatsClose.onclick = function () {
      if (window.SessionStats) SessionStats.hidePanel();
    };
    init(draggableEl, checkDrop);
    document.getElementById('btn-skip').onclick = function () { advanceExercise(true); };
    document.getElementById('btn-back').onclick = function () {
      if (gameHistory.length === 0) return;
      if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
      currentIndex = gameHistory.pop();
      updateBackButton();
      loadExercise();
    };
    document.getElementById('btn-home').onclick = function () { location.href = '/'; };
    updateBackButton();
    loadExercise();
  }

  function loadExercise() {
    if (currentIndex >= queue.length) { showCompletion(); return; }
    var ex = queue[currentIndex];
    document.getElementById('prompt-es').textContent = ex.es;
    document.getElementById('progress-badge').textContent = (currentIndex + 1) + ' / ' + EXERCISES.length;
    resetDraggable(draggableEl);
    var fb = document.getElementById('feedback');
    if (fb) { fb.textContent = ''; fb.style.display = 'none'; }
  }

  function checkDrop(zoneName, el) {
    if (advanceTimer) return; // guard: ignore drop if advance already queued
    var ex = queue[currentIndex];
    if (zoneName === ex.zone) {
      if (window.SharedUtils) SharedUtils.playSuccessSound();
      if (window.SharedUtils) SharedUtils.confettiBurst(30);
      if (window.CoinTracker) CoinTracker.addCoin();
      if (window.SessionStats) SessionStats.record(true);
      advanceTimer = setTimeout(function () {
        advanceTimer = null;
        advanceExercise(false);
      }, 900);
    } else {
      if (window.SharedUtils) SharedUtils.playErrorSound();
      if (window.SessionStats) SessionStats.record(false);
      var fb = document.getElementById('feedback');
      if (fb) { fb.textContent = 'Falsch! Try again.'; fb.style.display = 'block'; }
      resetDraggable(el);
    }
  }

  function advanceExercise(isSkip) {
    if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
    gameHistory.push(currentIndex);
    currentIndex++;
    updateBackButton();
    loadExercise();
  }

  function updateBackButton() {
    var btn = document.getElementById('btn-back');
    if (btn) btn.disabled = gameHistory.length === 0;
  }

  function showCompletion() {
    if (window.SessionStats) SessionStats.showPanel();
    if (window.SharedUtils) SharedUtils.confettiBurst(50);
    document.getElementById('prompt-card').innerHTML =
      '<div style="text-align:center; padding: 16px;">' +
      '<div style="font-size:2rem; margin-bottom:8px;">&#127881;</div>' +
      '<div style="font-weight:700; font-size:1.2rem; color:var(--ok);">All 10 done!</div>' +
      '<div style="color:var(--muted); margin-top:8px;">Gut gemacht!</div>' +
      '</div>';
    document.getElementById('progress-badge').textContent = '10 / 10';
    var btnSkip = document.getElementById('btn-skip');
    if (btnSkip) btnSkip.style.display = 'none';
  }

  window.LocationsGame = { init: init, resetDraggable: resetDraggable, startGame: startGame };
})();
