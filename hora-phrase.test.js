/**
 * Zero-dependency Node test for assets/js/hora-phrase.js
 * Run: node hora-phrase.test.js
 *
 * Covers the RESEARCH.md worked-example table (exact-output cases) plus an
 * exhaustive invariant sweep across all 288 reachable (hour, minute) states.
 */
const assert = require("node:assert/strict");
const { buildTimePhrase } = require("./assets/js/hora-phrase.js");

// Exact-output cases: input -> expected string, byte-for-byte including accents.
const exactCases = [
  [[1, 0], "Es la una en punto de la mañana"],
  [[7, 5], "Son las siete y cinco de la mañana"],
  [[13, 0], "Es la una en punto de la tarde"],
  [[14, 15], "Son las dos y cuarto de la tarde"],
  [[17, 30], "Son las cinco y media de la tarde"],
  [[0, 0], "Son las doce en punto de la mañana"],
  [[12, 0], "Son las doce en punto de la tarde"],
  [[18, 45], "Son las siete menos cuarto de la noche"],
  [[23, 40], "Son las doce menos veinte de la noche"],
  [[0, 40], "Es la una menos veinte de la mañana"],
  [[12, 40], "Es la una menos veinte de la tarde"],
  [[11, 35], "Son las doce menos veinticinco de la mañana"],
];

for (const [[hour24, minute], expected] of exactCases) {
  const actual = buildTimePhrase(hour24, minute);
  assert.equal(
    actual,
    expected,
    `buildTimePhrase(${hour24}, ${minute}) => "${actual}" !== "${expected}"`
  );
}

// Exhaustive invariant sweep: all 24 hours x 12 minute steps = 288 states.
const MINUTE_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
let sweepCount = 0;
for (let hour24 = 0; hour24 < 24; hour24++) {
  for (const minute of MINUTE_STEPS) {
    const result = buildTimePhrase(hour24, minute);
    sweepCount++;

    assert.equal(typeof result, "string", `result for (${hour24},${minute}) is not a string`);
    assert.ok(result.length > 0, `result for (${hour24},${minute}) is empty`);

    assert.ok(
      result.startsWith("Es la ") || result.startsWith("Son las "),
      `result for (${hour24},${minute}) does not start with "Es la " or "Son las ": "${result}"`
    );

    const endsMañana = result.endsWith(" de la mañana");
    const endsTarde = result.endsWith(" de la tarde");
    const endsNoche = result.endsWith(" de la noche");
    const periodCount = [endsMañana, endsTarde, endsNoche].filter(Boolean).length;
    assert.equal(
      periodCount,
      1,
      `result for (${hour24},${minute}) does not end with exactly one period suffix: "${result}"`
    );

    assert.ok(
      !/\d/.test(result),
      `result for (${hour24},${minute}) contains a digit character: "${result}"`
    );
  }
}

assert.equal(sweepCount, 288, `expected 288 sweep states, got ${sweepCount}`);

console.log("ALL PASS (" + exactCases.length + " exact cases + " + sweepCount + " invariant states)");
