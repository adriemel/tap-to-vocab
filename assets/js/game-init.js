(function () {
  function requireLives(errorTargetSelector) {
    if (parseInt(sessionStorage.getItem("game_lives") || "0", 10) <= 0) {
      var target = document.querySelector(errorTargetSelector);
      if (target) {
        target.insertAdjacentHTML("afterend",
          '<p style="color:var(--error);text-align:center;padding:16px 0;">No games remaining. <a href="/" style="color:var(--accent);">Earn more coins \u2192</a></p>'
        );
      }
      return false;
    }
    return true;
  }

  window.GameInit = { requireLives: requireLives };
})();
