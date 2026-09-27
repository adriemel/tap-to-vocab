/**
 * GameLoop for Tap-to-Vocab games
 * Shared plumbing for the canvas games: fixed 60 Hz update loop, sharp
 * canvases on high-density screens, auto-pause when the app is hidden,
 * and persisted best scores.
 */
(function () {
  var STEP_MS = 1000 / 60;   // all game tuning values assume 60 updates/sec
  var JITTER_MS = 1;         // absorbs rAF timing noise on 60 Hz screens
  var MAX_FRAME_MS = 100;    // cap after a stall so the game never "jumps ahead"
  var MAX_STEPS = 6;

  /* start(step, draw): runs step() exactly 60 times per second whatever the
     display refresh rate (60/90/120/144 Hz), then draw() once per frame.
     step() returning false stops the loop. Returns { pause, resume, stop }. */
  function start(step, draw) {
    var acc = 0, last = -1, rafId = 0;
    var running = true, paused = false;

    function frame(now) {
      if (!running || paused) return;
      if (last < 0) last = now;
      acc += Math.min(now - last, MAX_FRAME_MS);
      last = now;
      var steps = 0;
      while (acc >= STEP_MS - JITTER_MS) {
        acc -= STEP_MS;
        if (step() === false) { running = false; return; }
        if (++steps >= MAX_STEPS) { acc = 0; break; }
      }
      if (draw) draw();
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return {
      pause: function () {
        if (!running || paused) return;
        paused = true;
        cancelAnimationFrame(rafId);
      },
      resume: function () {
        if (!running || !paused) return;
        paused = false;
        last = -1;
        rafId = requestAnimationFrame(frame);
      },
      stop: function () {
        running = false;
        cancelAnimationFrame(rafId);
      },
      isPaused: function () { return paused; }
    };
  }

  /* fitCanvas: sizes the canvas backing store to its on-screen size times the
     device pixel ratio, and scales the context so drawing code keeps using
     the logical W x H coordinate system. Resizing clears the canvas, so the
     caller redraws afterwards. */
  var MAX_BACKING_W = 2400;  // keeps full-screen iPad canvases fast
  function fitCanvas(canvas, ctx, W, H, cssW, cssH) {
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    if (cssW * dpr > MAX_BACKING_W) dpr = MAX_BACKING_W / cssW;
    canvas.style.width = Math.floor(cssW) + "px";
    canvas.style.height = Math.floor(cssH) + "px";
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  }

  /* Best scores, persisted per game. */
  function loadBest(key) {
    try { return parseInt(localStorage.getItem(key) || "0", 10) || 0; } catch (e) { return 0; }
  }
  function saveBest(key, score) {
    try { localStorage.setItem(key, String(score)); } catch (e) {}
  }

  /* autoPause: when the page is hidden (app switch, lock screen, tab change)
     while isActive() is true, calls onPause() and covers the game with a
     "tap to continue" layer; tapping it calls onResume(). */
  function autoPause(opts) {
    var layer = null;
    var host = opts.container || document.body;

    function show() {
      layer = document.createElement("div");
      layer.className = "gl-pause";
      layer.style.cssText =
        "position:" + (host === document.body ? "fixed" : "absolute") + ";inset:0;z-index:30;" +
        "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;" +
        "background:rgba(6,10,22,0.85);color:#e8ecff;cursor:pointer;border-radius:inherit;" +
        "font-family:system-ui,-apple-system,sans-serif;text-align:center;";
      layer.innerHTML =
        '<div style="font-size:3rem;line-height:1;">⏸️</div>' +
        '<div style="font-size:1.4rem;font-weight:800;">Paused</div>' +
        '<div style="font-size:1rem;color:#aeb6d9;">Tap to continue</div>';
      layer.addEventListener("click", function (e) {
        e.stopPropagation();
        hide();
        opts.onResume();
      });
      host.appendChild(layer);
    }

    function hide() {
      if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
      layer = null;
    }

    function onHidden() {
      if (layer || !opts.isActive()) return;
      opts.onPause();
      show();
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) onHidden();
    });
    window.addEventListener("pagehide", onHidden);

    return { isShown: function () { return !!layer; } };
  }

  window.GameLoop = {
    start: start,
    fitCanvas: fitCanvas,
    loadBest: loadBest,
    saveBest: saveBest,
    autoPause: autoPause
  };
})();
