'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const indexHtml = read('index.html');
const calculatorHtml = read('calculator.html');
const nutritionHtml = read('nutrition-guide.html');
const bodyHtml = read('body-guide.html');
const nutritionJs = read('assets/js/nutrition-guide.js');
const bodyJs = read('assets/js/body-guide.js');
const css = read('assets/css/materials.css');
const miniHtml = read('free-mini.html');

for (const html of [indexHtml, calculatorHtml, nutritionHtml, bodyHtml]) {
  assert.match(html, /nutrition-guide\.html/, 'navigation should link to nutrition guide');
  assert.match(html, /body-guide\.html/, 'navigation should link to body guide');
  assert.match(html, /Гид по питанию/, 'navigation should name nutrition guide');
  assert.match(html, /Режим и тело/, 'navigation should name body guide');
}

assert.match(nutritionHtml, /data-food-search/, 'nutrition guide should include food scanner search');
assert.match(nutritionHtml, /data-protein-filter/, 'nutrition guide should include protein filters');
assert.match(nutritionHtml, /Высокий белок/, 'nutrition guide should link to high-protein recipes');
assert.match(nutritionJs, /foodItems/, 'nutrition JS should include food scanner data');
assert.match(nutritionJs, /localStorage/, 'nutrition JS should persist guide state');

assert.match(bodyHtml, /data-water-weight/, 'body guide should include water calculator');
assert.match(bodyHtml, /data-body-check/, 'body guide should include daily checklist');
assert.match(bodyHtml, /Менструация/, 'body guide should include cycle guidance');
assert.match(bodyHtml, /Протеин/, 'body guide should include supplement guidance');
assert.match(bodyJs, /localStorage/, 'body guide JS should persist checklist state');

assert.match(css, /guide-hero/, 'shared CSS should style guide pages');
assert.doesNotMatch(miniHtml, /nutrition-guide\.html|body-guide\.html/, 'mini collection should stay untouched');

console.log('material guide checks passed');
