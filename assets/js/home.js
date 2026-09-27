(function () {
  var GAME_COST = 10;

  /* Games panel: progress bar towards the next game */
  function updateGamesProgress() {
    var fill = document.getElementById("games-progress-fill");
    if (!fill) return;
    var coins = CoinTracker.getCoins();
    var shown = Math.min(coins, GAME_COST);
    fill.style.width = (shown / GAME_COST * 100) + "%";
    fill.parentNode.setAttribute("aria-valuenow", String(shown));
    document.getElementById("games-progress-label").textContent = shown + " / " + GAME_COST;
    var hint = document.getElementById("games-progress-hint");
    var missing = GAME_COST - coins;
    hint.textContent = missing > 0
      ? missing + (missing === 1 ? " more correct answer to unlock a game" : " more correct answers to unlock a game")
      : "Ready to play!";
    document.getElementById("btn-games").classList.toggle("is-ready", missing <= 0);
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Practice count badge
    try {
      var list = JSON.parse(localStorage.getItem("practiceList") || "[]");
      var countEl = document.getElementById("practice-count");
      if (countEl && list.length > 0) {
        countEl.textContent = list.length;
        countEl.hidden = false;
      }
    } catch (e) {}

    updateGamesProgress();

    // Games button: spend 10 coins to play
    var gamesBtn = document.getElementById("btn-games");
    if (gamesBtn) gamesBtn.addEventListener("click", function () {
      if (CoinTracker.spendCoins(GAME_COST)) {
        sessionStorage.setItem("game_lives", "3");
        location.assign("/games.html");
      } else {
        var msg = document.getElementById("coins-msg");
        msg.textContent = "Need 10 coins to play — keep answering correctly!";
        msg.hidden = false;
        setTimeout(function () { msg.hidden = true; }, 2500);
      }
    });

    // Reset coins button
    var resetBtn = document.getElementById("btn-reset-coins");
    if (resetBtn) resetBtn.addEventListener("click", function () {
      if (confirm("Are you sure you want to reset your coins to 0?")) {
        CoinTracker.resetCoins();
      }
    });
  });

  window.addEventListener("coinschanged", updateGamesProgress);
  window.addEventListener("pageshow", function (e) { if (e.persisted) updateGamesProgress(); });
  window.addEventListener("storage", function (e) { if (e.key === "tapvocab_coins") updateGamesProgress(); });
})();
