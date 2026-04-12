(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Practice count badge
    try {
      var list = JSON.parse(localStorage.getItem("practiceList") || "[]");
      var practiceBtn = document.getElementById("practice-btn");
      if (practiceBtn) {
        practiceBtn.textContent = list.length > 0
          ? "\u2B50 Practice (" + list.length + ")"
          : "\u2B50 Practice";
      }
    } catch (e) {}

    // Games button: spend 10 coins to play
    var gamesBtn = document.getElementById("btn-games");
    if (gamesBtn) gamesBtn.addEventListener("click", function () {
      if (CoinTracker.spendCoins(10)) {
        sessionStorage.setItem("game_lives", "3");
        location.assign("/games.html");
      } else {
        var msg = document.getElementById("coins-msg");
        msg.textContent = "Need 10 coins to play \u2014 keep answering correctly!";
        msg.style.display = "block";
        setTimeout(function () { msg.style.display = "none"; }, 2500);
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
})();
