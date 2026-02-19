/**
 * Reward Tracker for Tap-to-Vocab
 * Tracks correct/wrong answers across quiz modes and sentence completions.
 * Unlocks the Game Zone when performance thresholds are met.
 * Uses sessionStorage so counters reset when the tab is closed.
 */
(function () {

  const KEYS = {
    correct: "reward_correct",
    total: "reward_total",
    sentences: "reward_sentences",
    unlocked: "reward_unlocked"
  };

  function getInt(key) {
    return parseInt(sessionStorage.getItem(key) || "0", 10) || 0;
  }

  function setInt(key, val) {
    sessionStorage.setItem(key, String(val));
  }

  function addCorrect(mode) {
    if (mode === "sentences") {
      setInt(KEYS.sentences, getInt(KEYS.sentences) + 1);
    } else {
      setInt(KEYS.correct, getInt(KEYS.correct) + 1);
      setInt(KEYS.total, getInt(KEYS.total) + 1);
    }
    checkUnlock();
  }

  function addWrong(mode) {
    if (mode !== "sentences") {
      setInt(KEYS.total, getInt(KEYS.total) + 1);
    }
  }

  function checkUnlock() {
    if (sessionStorage.getItem(KEYS.unlocked) === "1") return;
    var correct = getInt(KEYS.correct);
    var total = getInt(KEYS.total);
    var sentences = getInt(KEYS.sentences);
    if ((total >= 10 && correct / total >= 0.70) || sentences >= 20) {
      sessionStorage.setItem(KEYS.unlocked, "1");
    }
  }

  function isUnlocked() {
    checkUnlock();
    return sessionStorage.getItem(KEYS.unlocked) === "1";
  }

  function reset() {
    Object.values(KEYS).forEach(function (k) { sessionStorage.removeItem(k); });
  }

  function getStats() {
    return {
      correct: getInt(KEYS.correct),
      total: getInt(KEYS.total),
      sentences: getInt(KEYS.sentences),
      unlocked: isUnlocked()
    };
  }

  window.RewardTracker = {
    addCorrect: addCorrect,
    addWrong: addWrong,
    isUnlocked: isUnlocked,
    reset: reset,
    getStats: getStats
  };

})();
