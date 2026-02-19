/**
 * Coin Tracker for Tap-to-Vocab
 * Each correct answer earns 1 coin. Spending 10 coins = 1 game play.
 * Coins are stored in localStorage (persistent across sessions).
 */
(function () {

  const KEY = "tapvocab_coins";

  function getCoins() {
    return parseInt(localStorage.getItem(KEY) || "0", 10) || 0;
  }

  function setCoins(n) {
    localStorage.setItem(KEY, String(Math.max(0, n)));
    window.dispatchEvent(new CustomEvent("coinschanged", { detail: { coins: n } }));
  }

  function addCoin() {
    setCoins(getCoins() + 1);
  }

  function spendCoins(amount) {
    var current = getCoins();
    if (current < amount) return false;
    setCoins(current - amount);
    return true;
  }

  /* Auto-update any #coin-counter element on the page */
  function updateDisplay() {
    var el = document.getElementById("coin-counter");
    if (el) el.textContent = "\uD83E\uDE99 " + getCoins();
  }

  document.addEventListener("DOMContentLoaded", updateDisplay);
  window.addEventListener("coinschanged", updateDisplay);

  window.CoinTracker = { addCoin: addCoin, getCoins: getCoins, spendCoins: spendCoins };

})();
