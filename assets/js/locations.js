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

    // Zone hover highlight: hide self so elementFromPoint sees through to zones
    el.hidden = true;
    var below = document.elementFromPoint(e.clientX, e.clientY);
    el.hidden = false;
    var zone = below && below.closest('[data-zone]');
    document.querySelectorAll('[data-zone]').forEach(function (z) {
      z.classList.toggle('zone-hover', z === zone);
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

    // Final hit detection
    el.hidden = true;
    var below = document.elementFromPoint(e.clientX, e.clientY);
    el.hidden = false;
    var zone = below && below.closest('[data-zone]');

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

  window.LocationsGame = { init: init, resetDraggable: resetDraggable };
})();
