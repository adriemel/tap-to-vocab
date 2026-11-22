/**
 * Flat clothing drawings for ropa.html -> window.RopaArt.svg(id, pictures)
 *
 * Each drawing lives in a 100x100 box. Shapes use classes styled in
 * styles.css (.ropa-svg ...) so the colour comes from the CSS variables
 * --ropa-fill / --ropa-line set on an ancestor:
 *   b  = body (fill colour + outline)    d  = detail line
 *   dd = dashed seam    t = dot (button)  s = light sole   k = dark lens
 */
(function () {
  var ART = {
    camiseta:
      '<path class="b" d="M36 14 Q50 24 64 14 L84 24 L94 42 L80 50 L74 42 L74 90 L26 90 L26 42 L20 50 L6 42 L16 24 Z"/>' +
      '<path class="d" d="M38 15 Q50 30 62 15"/>',
    camisa:
      '<path class="b" d="M38 12 L62 12 L82 20 L94 80 L82 83 L74 44 L74 92 L26 92 L26 44 L18 83 L6 80 L18 20 Z"/>' +
      '<path class="d" d="M50 26 L50 92"/>' +
      '<path class="b" d="M38 12 L50 26 L42 32 L34 16 Z"/><path class="b" d="M62 12 L50 26 L58 32 L66 16 Z"/>' +
      '<circle class="t" cx="54" cy="42" r="2.2"/><circle class="t" cx="54" cy="57" r="2.2"/><circle class="t" cx="54" cy="72" r="2.2"/>',
    blusa:
      '<path class="b" d="M36 14 Q50 26 64 14 L74 18 Q90 22 88 40 L74 42 L72 56 L80 92 L20 92 L28 56 L26 42 L12 40 Q10 22 26 18 Z"/>' +
      '<path class="d" d="M28 56 Q50 62 72 56"/>' +
      '<path class="d" d="M50 26 L42 21 L42 31 Z M50 26 L58 21 L58 31 Z"/>',
    jersey:
      '<path class="b" d="M38 12 Q50 22 62 12 L80 18 Q90 22 92 34 L96 82 L84 84 L76 44 L76 90 L24 90 L24 44 L16 84 L4 82 L8 34 Q10 22 20 18 Z"/>' +
      '<path class="d" d="M39 13 Q50 27 61 13 M25 82 L75 82 M5 75 L17 77 M95 75 L83 77 M38 52 L50 42 L62 52 L50 62 Z"/>',
    chaqueta:
      '<path class="b" d="M36 12 L64 12 L82 20 L94 80 L82 83 L75 46 L75 90 L25 90 L25 46 L18 83 L6 80 L18 20 Z"/>' +
      '<path class="d" d="M36 12 L44 22 L50 18 L56 22 L64 12 M50 18 L50 90 M30 66 L42 72 M70 66 L58 72"/>' +
      '<rect class="t" x="47" y="26" width="6" height="8" rx="1.5"/>',
    abrigo:
      '<path class="b" d="M36 6 L64 6 L82 14 L94 72 L82 75 L75 40 L78 97 L22 97 L25 40 L18 75 L6 72 L18 14 Z"/>' +
      '<path class="d" d="M36 6 L45 28 L50 48 M64 6 L55 28 L50 48 M50 48 L50 97 M25 60 L75 60"/>' +
      '<circle class="t" cx="43" cy="70" r="2.2"/><circle class="t" cx="57" cy="70" r="2.2"/><circle class="t" cx="43" cy="82" r="2.2"/><circle class="t" cx="57" cy="82" r="2.2"/>',
    vestido:
      '<path class="b" d="M38 8 L42 8 L44 22 Q50 26 56 22 L58 8 L62 8 L64 26 L62 42 L84 92 L16 92 L38 42 L36 26 Z"/>' +
      '<path class="d" d="M38 42 Q50 46 62 42 M44 58 L38 90 M56 58 L62 90"/>',
    falda:
      '<path class="b" d="M28 18 L72 18 L72 30 L88 84 Q50 94 12 84 L28 30 Z"/>' +
      '<path class="d" d="M28 30 L72 30 M40 30 L32 88 M50 30 L50 91 M60 30 L68 88"/>',
    pantalon:
      '<path class="b" d="M26 8 L74 8 L80 94 L58 94 L50 34 L42 94 L20 94 Z"/>' +
      '<path class="d" d="M26 16 L74 16 M50 16 L50 34"/>',
    vaquero:
      '<path class="b" d="M26 8 L74 8 L80 94 L58 94 L50 34 L42 94 L20 94 Z"/>' +
      '<path class="d" d="M26 16 L74 16 M50 16 L50 34 M30 18 Q33 30 43 26 M70 18 Q67 30 57 26"/>' +
      '<path class="dd" d="M25 22 L22 90 M75 22 L78 90"/>',
    banador:
      '<path class="b" d="M34 8 L40 8 L44 30 Q50 34 56 30 L60 8 L66 8 L68 40 Q66 56 72 72 Q60 72 54 90 L46 90 Q40 72 28 72 Q34 56 32 40 Z"/>' +
      '<path class="d" d="M33 48 Q50 54 67 48"/>',
    bufanda:
      '<path class="b" d="M58 38 L71 40 L76 84 L62 86 Z"/>' +
      '<path class="b" d="M18 22 Q50 42 82 22 L86 34 Q50 56 14 34 Z"/>' +
      '<path class="d" d="M60 56 L73 55 M61 70 L75 69 M64 86 L64 94 M68 86 L68 94 M72 85 L72 93 M76 84 L76 92"/>',
    calcetin:
      '<path class="b" d="M38 8 L64 8 L64 58 Q64 64 70 68 L86 76 Q96 82 90 90 Q86 94 76 92 L46 86 Q34 82 36 70 Z"/>' +
      '<path class="d" d="M38 20 L64 20 M37 70 Q46 70 47 86 M82 75 Q76 84 80 92"/>',
    zapato:
      '<path class="b" d="M10 46 L30 44 Q40 54 52 49 L64 53 Q86 57 92 70 L92 76 L10 76 Z"/>' +
      '<path class="s" d="M8 76 L94 76 L92 82 L30 82 L28 88 L10 88 Z"/>' +
      '<path class="d" d="M30 44 Q40 56 52 49 M50 51 L56 56 M45 53 L51 58"/>',
    zapatilla:
      '<path class="b" d="M12 40 Q14 32 22 32 L36 36 Q46 46 56 43 L70 51 Q90 57 92 68 L92 74 L12 74 Z"/>' +
      '<path class="s" d="M10 74 L94 74 Q94 84 86 84 L16 84 Q10 84 10 74 Z"/>' +
      '<path class="d" d="M44 46 L50 54 M50 45 L56 53 M56 47 L61 55 M22 62 L72 64"/>',
    gafas:
      '<path class="b" d="M6 36 L94 36 L94 46 L88 46 Q86 72 68 72 Q52 72 52 52 Q50 46 48 52 Q48 72 32 72 Q14 72 12 46 L6 46 Z"/>' +
      '<path class="k" d="M17 46 Q19 65 32 65 Q44 65 44 46 Z"/>' +
      '<path class="k" d="M56 46 Q56 65 68 65 Q81 65 83 46 Z"/>'
  };

  function svg(id, pictures) {
    var art = ART[id];
    if (!art) throw new Error('No drawing for clothing: ' + id);
    var body = pictures === 2
      ? '<g transform="translate(34 2) scale(0.64)">' + art + '</g>' +
        '<g transform="translate(2 34) scale(0.64)">' + art + '</g>'
      : art;
    return '<svg class="ropa-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  window.RopaArt = { svg: svg, ids: Object.keys(ART) };
})();
