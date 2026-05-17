'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const pagePaths = [
  'index.html',
  'calculator.html',
  'nutrition-guide.html',
  'body-guide.html',
  'tracker.html',
];

for (const pagePath of pagePaths) {
  assert.ok(fs.existsSync(path.join(root, pagePath)), `${pagePath} should exist`);
  const html = read(pagePath);
  assert.match(html, /tracker\.html/, `${pagePath} should link to tracker page`);
  assert.match(html, /Мой трекер|РњРѕР№ С‚СЂРµРєРµСЂ/, `${pagePath} should name tracker page`);
}

const trackerHtml = read('tracker.html');
const trackerJs = read('assets/js/tracker.js');
const css = read('assets/css/materials.css');
const miniHtml = read('free-mini.html');

for (const marker of [
  'data-tracker-goal',
  'data-tracker-summary',
  'data-tracker-grid',
  'data-tracker-mood',
  'data-tracker-energy',
  'data-tracker-notes',
  'data-tracker-win',
  'data-tracker-reset',
]) {
  assert.match(trackerHtml, new RegExp(marker), `tracker page should include ${marker}`);
}

for (const habit of ['training', 'water', 'steps', 'sleep', 'food', 'wellbeing']) {
  assert.match(trackerJs, new RegExp(habit), `tracker JS should include ${habit} habit`);
}

assert.match(trackerHtml, /assets\/js\/tracker\.js/, 'tracker page should load tracker JS');
assert.match(trackerJs, /ggc-tracker-v1/, 'tracker JS should use the tracker storage key');
assert.match(trackerJs, /localStorage/, 'tracker JS should persist state');
assert.match(css, /tracker-shell/, 'shared CSS should style tracker page');
assert.doesNotMatch(miniHtml, /tracker\.html|Мой трекер|РњРѕР№ С‚СЂРµРєРµСЂ/, 'mini collection should stay untouched');

console.log('tracker checks passed');
