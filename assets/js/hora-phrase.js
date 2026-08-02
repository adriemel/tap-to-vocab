/**
 * Spanish time-phrase grammar engine for "Qué hora es?" (Phase 22).
 *
 * Pure function, zero DOM/global dependencies, dual-exported so the same
 * file can be loaded by a browser <script> tag (window.HoraPhrase) and by
 * a plain Node test (module.exports) with no build step.
 *
 * Grammar rules and pitfalls: see
 * .planning/phases/22-qu-hora-es-time-telling-practice-tool/22-RESEARCH.md
 * lines 96-235.
 */
(function () {

  var MINUTE_WORDS = {
    0: '',
    5: 'cinco',
    10: 'diez',
    15: 'cuarto',
    20: 'veinte',
    25: 'veinticinco',
    30: 'media',
    35: 'veinticinco',
    40: 'veinte',
    45: 'cuarto',
    50: 'diez',
    55: 'cinco'
  };

  // Index 1-12 map to spoken hour words. Index 0 is an unused filler
  // ('doce' repeated) — h12/spokenHour are always resolved to 1-12, never 0.
  var HOUR_WORDS = [
    'doce', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis',
    'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'
  ];

  /**
   * Period suffix (mañana/tarde/noche) computed from the RAW 24h hour only.
   * Kept as its own function so it can never accidentally be fed the
   * post-menos-shift spokenHour (Pitfall 1 in RESEARCH.md).
   */
  function periodFromHour24(hour24) {
    if (hour24 < 12) return 'de la mañana';
    if (hour24 < 18) return 'de la tarde';
    return 'de la noche';
  }

  /**
   * buildTimePhrase(hour24, minute) -> string
   *
   * @param {number} hour24 - integer 0-23
   * @param {number} minute - integer, one of 0,5,10,...,55
   * @returns {string} a single-line Spanish phrase, no leading/trailing
   *   whitespace, no HTML.
   */
  function buildTimePhrase(hour24, minute) {
    var isPast = minute <= 30; // 0..30 uses "y", 35..55 uses "menos"

    var h12 = hour24 % 12;
    if (h12 === 0) h12 = 12;

    // The menos branch counts down to the NEXT hour and wraps 12 -> 1.
    var spokenHour = isPast ? h12 : (h12 % 12) + 1;

    // MUST check spokenHour (post-shift), never h12 (Pitfall 2).
    var verb = (spokenHour === 1) ? 'Es la' : 'Son las';
    var hourWord = HOUR_WORDS[spokenHour];

    var minuteSuffix;
    if (minute === 0) {
      minuteSuffix = ' en punto';
    } else if (isPast) {
      minuteSuffix = ' y ' + MINUTE_WORDS[minute];
    } else {
      minuteSuffix = ' menos ' + MINUTE_WORDS[minute];
    }

    // Period suffix derived from the raw hour24, never from h12/spokenHour
    // (Pitfall 1).
    var period = periodFromHour24(hour24);

    return verb + ' ' + hourWord + minuteSuffix + ' ' + period;
  }

  if (typeof window !== 'undefined') {
    window.HoraPhrase = { buildTimePhrase: buildTimePhrase };
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildTimePhrase: buildTimePhrase };
  }

})();
