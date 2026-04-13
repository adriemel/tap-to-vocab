/**
 * SessionStats for Tap-to-Vocab
 * Per-session correct/incorrect counters + stats modal controller.
 * In-memory only — NO localStorage (STATS-04).
 */
(function () {
  var correct = 0;
  var incorrect = 0;

  function reset() {
    correct = 0;
    incorrect = 0;
  }

  function record(isCorrect) {
    if (isCorrect) {
      correct++;
    } else {
      incorrect++;
    }
  }

  function getCorrect() { return correct; }
  function getIncorrect() { return incorrect; }

  function getAccuracy() {
    var total = correct + incorrect;
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  }

  function showPanel() {
    var modal = document.getElementById('stats-modal');
    if (!modal) return;
    var correctEl = modal.querySelector('#stats-correct');
    var incorrectEl = modal.querySelector('#stats-incorrect');
    var accuracyEl = modal.querySelector('#stats-accuracy');
    if (correctEl) correctEl.textContent = correct;
    if (incorrectEl) incorrectEl.textContent = incorrect;
    if (accuracyEl) accuracyEl.textContent = getAccuracy() + '%';
    modal.style.display = 'flex';
  }

  function hidePanel() {
    var modal = document.getElementById('stats-modal');
    if (modal) modal.style.display = 'none';
  }

  window.SessionStats = {
    reset: reset,
    record: record,
    showPanel: showPanel,
    hidePanel: hidePanel,
    getAccuracy: getAccuracy,
    getCorrect: getCorrect,
    getIncorrect: getIncorrect
  };
})();
