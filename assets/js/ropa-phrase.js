/**
 * Spanish clothing + colour noun-phrase engine for "La ropa" (ropa.html).
 *
 * Pure data + functions, zero DOM dependencies, dual-exported like
 * hora-phrase.js: window.RopaPhrase in the browser, module.exports in Node
 * (tested by ropa-phrase.test.js, which also checks every word against
 * data/words.tsv).
 *
 * Grammar:
 *   - definite article by gender/number: el / la / los / las
 *   - colour adjective follows the whole noun ("las gafas de sol rojas")
 *     and agrees in gender and number
 *   - rosa / naranja: same form for both genders, plural with -s
 *     ("las faldas rosas", "los zapatos naranjas"); RAE also accepts the
 *     invariable plural, this app teaches the inflected one
 */
(function () {

  // tsv: the exact `es` cell in data/words.tsv this item comes from.
  // sg: null marks a plural-only noun (gafas de sol).
  var CLOTHES = [
    { id: 'camiseta',  tsv: 'la camiseta',  gender: 'f', sg: 'camiseta',  pl: 'camisetas',  deSg: 'das T-Shirt',    dePl: 'die T-Shirts' },
    { id: 'camisa',    tsv: 'la camisa',    gender: 'f', sg: 'camisa',    pl: 'camisas',    deSg: 'das Hemd',       dePl: 'die Hemden' },
    { id: 'blusa',     tsv: 'la blusa',     gender: 'f', sg: 'blusa',     pl: 'blusas',     deSg: 'die Bluse',      dePl: 'die Blusen' },
    { id: 'jersey',    tsv: 'el jersey (pl. los jerséis)', gender: 'm', sg: 'jersey', pl: 'jerséis', deSg: 'der Pullover', dePl: 'die Pullover' },
    { id: 'chaqueta',  tsv: 'la chaqueta',  gender: 'f', sg: 'chaqueta',  pl: 'chaquetas',  deSg: 'die Jacke',      dePl: 'die Jacken' },
    { id: 'abrigo',    tsv: 'el abrigo',    gender: 'm', sg: 'abrigo',    pl: 'abrigos',    deSg: 'der Mantel',     dePl: 'die Mäntel' },
    { id: 'vestido',   tsv: 'el vestido',   gender: 'm', sg: 'vestido',   pl: 'vestidos',   deSg: 'das Kleid',      dePl: 'die Kleider' },
    { id: 'falda',     tsv: 'la falda',     gender: 'f', sg: 'falda',     pl: 'faldas',     deSg: 'der Rock',       dePl: 'die Röcke' },
    { id: 'pantalon',  tsv: 'el pantalón',  gender: 'm', sg: 'pantalón',  pl: 'pantalones', deSg: 'die Hose',       dePl: 'die Hosen' },
    { id: 'vaquero',   tsv: 'el vaquero',   gender: 'm', sg: 'vaquero',   pl: 'vaqueros',   deSg: 'die Jeans',      dePl: 'die Jeans' },
    { id: 'banador',   tsv: 'el bañador',   gender: 'm', sg: 'bañador',   pl: 'bañadores',  deSg: 'der Badeanzug',  dePl: 'die Badeanzüge' },
    { id: 'bufanda',   tsv: 'la bufanda',   gender: 'f', sg: 'bufanda',   pl: 'bufandas',   deSg: 'der Schal',      dePl: 'die Schals' },
    { id: 'calcetin',  tsv: 'el calcetín',  gender: 'm', sg: 'calcetín',  pl: 'calcetines', deSg: 'die Socke',      dePl: 'die Socken' },
    { id: 'zapato',    tsv: 'el zapato',    gender: 'm', sg: 'zapato',    pl: 'zapatos',    deSg: 'der Schuh',      dePl: 'die Schuhe' },
    { id: 'zapatilla', tsv: 'las zapatillas de deporte', gender: 'f', sg: 'zapatilla de deporte', pl: 'zapatillas de deporte', deSg: 'der Sportschuh', dePl: 'die Sportschuhe' },
    { id: 'gafas',     tsv: 'las gafas de sol', gender: 'f', sg: null,    pl: 'gafas de sol', deSg: null,           dePl: 'die Sonnenbrille' }
  ];

  // Adjective forms: ms / fs / mp / fp. tsv = `es` cell in the Colores rows.
  // hex = fill colour of the drawings; line = outline colour that stays
  // visible on that fill.
  var COLORS = [
    { id: 'rojo',     tsv: 'rojo',     de: 'rot',     hex: '#e53935', line: '#1b1f3b', ms: 'rojo',     fs: 'roja',     mp: 'rojos',     fp: 'rojas' },
    { id: 'naranja',  tsv: 'naranja',  de: 'orange',  hex: '#ff8c1a', line: '#1b1f3b', ms: 'naranja',  fs: 'naranja',  mp: 'naranjas',  fp: 'naranjas' },
    { id: 'amarillo', tsv: 'amarillo', de: 'gelb',    hex: '#ffd60a', line: '#1b1f3b', ms: 'amarillo', fs: 'amarilla', mp: 'amarillos', fp: 'amarillas' },
    { id: 'verde',    tsv: 'verde',    de: 'grün',    hex: '#2eb84b', line: '#1b1f3b', ms: 'verde',    fs: 'verde',    mp: 'verdes',    fp: 'verdes' },
    { id: 'azul',     tsv: 'azul',     de: 'blau',    hex: '#2f6bff', line: '#e8ecff', ms: 'azul',     fs: 'azul',     mp: 'azules',    fp: 'azules' },
    { id: 'morado',   tsv: 'morado',   de: 'violett', hex: '#8e44ad', line: '#e8ecff', ms: 'morado',   fs: 'morada',   mp: 'morados',   fp: 'moradas' },
    { id: 'rosa',     tsv: 'rosa',     de: 'pink',    hex: '#ff8fc8', line: '#1b1f3b', ms: 'rosa',     fs: 'rosa',     mp: 'rosas',     fp: 'rosas' },
    { id: 'marron',   tsv: 'marrón',   de: 'braun',   hex: '#8b5a2b', line: '#e8ecff', ms: 'marrón',   fs: 'marrón',   mp: 'marrones',  fp: 'marrones' },
    { id: 'gris',     tsv: 'gris',     de: 'grau',    hex: '#8c8c8c', line: '#1b1f3b', ms: 'gris',     fs: 'gris',     mp: 'grises',    fp: 'grises' },
    { id: 'negro',    tsv: 'negro',    de: 'schwarz', hex: '#1b1b1b', line: '#e8ecff', ms: 'negro',    fs: 'negra',    mp: 'negros',    fp: 'negras' },
    { id: 'blanco',   tsv: 'blanco',   de: 'weiß',    hex: '#f5f5f5', line: '#1b1f3b', ms: 'blanco',   fs: 'blanca',   mp: 'blancos',   fp: 'blancas' }
  ];

  var ARTICLES = { ms: 'el', fs: 'la', mp: 'los', fp: 'las' };

  function findById(list, id, what) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    throw new Error('Unknown ' + what + ': ' + id);
  }

  /**
   * Reel entries: every item once in singular (1 picture) and once in plural
   * (2 pictures). Plural-only items (gafas de sol) appear once, plural
   * grammar, 1 picture (one pair).
   */
  function buildEntries() {
    var out = [];
    CLOTHES.forEach(function (c) {
      if (c.sg) out.push({ id: c.id, plural: false, pictures: 1, de: c.deSg });
      out.push({ id: c.id, plural: true, pictures: c.sg ? 2 : 1, de: c.dePl });
    });
    return out;
  }

  /**
   * buildClothingPhrase(clothingId, plural, colorId) -> e.g. "la falda roja"
   */
  function buildClothingPhrase(clothingId, plural, colorId) {
    var c = findById(CLOTHES, clothingId, 'clothing');
    var col = findById(COLORS, colorId, 'color');
    if (typeof plural !== 'boolean') throw new Error('plural must be a boolean');
    if (!plural && !c.sg) throw new Error(c.id + ' only exists in plural');
    var key = c.gender + (plural ? 'p' : 's');
    return ARTICLES[key] + ' ' + (plural ? c.pl : c.sg) + ' ' + col[key];
  }

  var api = {
    CLOTHES: CLOTHES,
    COLORS: COLORS,
    ENTRIES: buildEntries(),
    buildClothingPhrase: buildClothingPhrase
  };

  if (typeof window !== 'undefined') window.RopaPhrase = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
