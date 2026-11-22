/**
 * Zero-dependency Node test for assets/js/ropa-phrase.js
 * Run: node ropa-phrase.test.js
 *
 * 1. Exact-output cases (gender, number, invariable-gender colours).
 * 2. Agreement sweep over every reel entry x every colour.
 * 3. Every clothing item and colour exists in data/words.tsv.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { CLOTHES, COLORS, ENTRIES, buildClothingPhrase } = require("./assets/js/ropa-phrase.js");

const exactCases = [
  [["falda", false, "rojo"], "la falda roja"],
  [["falda", true, "rojo"], "las faldas rojas"],
  [["zapato", false, "negro"], "el zapato negro"],
  [["zapato", true, "blanco"], "los zapatos blancos"],
  [["pantalon", false, "azul"], "el pantalón azul"],
  [["pantalon", true, "azul"], "los pantalones azules"],
  [["calcetin", true, "gris"], "los calcetines grises"],
  [["jersey", true, "marron"], "los jerséis marrones"],
  [["banador", true, "verde"], "los bañadores verdes"],
  [["camiseta", false, "rosa"], "la camiseta rosa"],
  [["vestido", true, "naranja"], "los vestidos naranjas"],
  [["blusa", true, "rosa"], "las blusas rosas"],
  [["chaqueta", false, "morado"], "la chaqueta morada"],
  [["abrigo", false, "amarillo"], "el abrigo amarillo"],
  [["gafas", true, "rojo"], "las gafas de sol rojas"],
  [["zapatilla", false, "blanco"], "la zapatilla de deporte blanca"],
  [["zapatilla", true, "azul"], "las zapatillas de deporte azules"],
];
for (const [args, expected] of exactCases) {
  assert.equal(buildClothingPhrase(...args), expected, `buildClothingPhrase(${args.join(", ")})`);
}

// Input checks
assert.throws(() => buildClothingPhrase("gafas", false, "rojo"), /only exists in plural/);
assert.throws(() => buildClothingPhrase("sombrero", false, "rojo"), /Unknown clothing/);
assert.throws(() => buildClothingPhrase("falda", false, "lila"), /Unknown color/);
assert.throws(() => buildClothingPhrase("falda", "yes", "rojo"), /boolean/);

// Agreement sweep
const ARTICLE = { ms: "el", fs: "la", mp: "los", fp: "las" };
let sweep = 0;
for (const e of ENTRIES) {
  const c = CLOTHES.find((x) => x.id === e.id);
  const key = c.gender + (e.plural ? "p" : "s");
  for (const col of COLORS) {
    const p = buildClothingPhrase(e.id, e.plural, col.id);
    const words = p.split(" ");
    assert.equal(words[0], ARTICLE[key], p);
    const adj = words[words.length - 1];
    if (e.plural) assert.ok(adj.endsWith("s"), `plural adjective must end in -s: ${p}`);
    else assert.ok(!adj.endsWith("s") || adj === "gris", `singular adjective ends in -s: ${p}`);
    if (c.gender === "f") assert.ok(!/os?$/.test(adj), `feminine noun with -o adjective: ${p}`);
    const invariableGender = col.id === "naranja" || col.id === "rosa";
    if (c.gender === "m" && !invariableGender) assert.ok(!/as?$/.test(adj), `masculine noun with -a adjective: ${p}`);
    sweep++;
  }
}
assert.equal(ENTRIES.length, 31);
assert.equal(sweep, 31 * 11);

// words.tsv cross-check
const tsv = fs.readFileSync(path.join(__dirname, "data", "words.tsv"), "utf8").split(/\r?\n/).slice(1);
const rows = tsv.filter(Boolean).map((l) => l.split("\t"));
const esAll = new Set(rows.map((r) => r[1].trim()));
const esColores = new Set(rows.filter((r) => r[0] === "Colores").map((r) => r[1].trim()));
for (const c of CLOTHES) assert.ok(esAll.has(c.tsv), `clothing not in words.tsv: ${c.tsv}`);
for (const col of COLORS) assert.ok(esColores.has(col.tsv), `colour not in words.tsv: ${col.tsv}`);
const tsvColours = [...esColores].filter((w) => !/[¿.]/.test(w));
assert.equal(tsvColours.length, COLORS.length, `words.tsv has colours not covered: ${tsvColours}`);

console.log(`ALL PASS (${exactCases.length} exact cases + ${sweep} agreement states + words.tsv check)`);
