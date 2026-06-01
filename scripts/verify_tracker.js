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
  assert.match(html, /Мой трекер/, `${pagePath} should name tracker page`);
}

const trackerHtml = read('tracker.html');
const trackerJs = read('assets/js/tracker.js');
const css = read('assets/css/materials.css');

for (const marker of [
  'data-tracker-week-goal',
  'data-tracker-week-summary',
  'data-tracker-today-focus',
  'data-tracker-status',
  'data-tracker-skip-reasons',
  'data-tracker-skip-reason',
  'data-tracker-day-note',
  'data-tracker-week-grid',
  'data-tracker-recommendation',
  'data-tracker-weekly-progress',
  'data-tracker-reset',
]) {
  assert.match(trackerHtml, new RegExp(marker), `rhythm tracker should include ${marker}`);
}

for (const removedMarker of [
  'data-tracker-mood',
  'data-tracker-energy',
  'data-tracker-win',
]) {
  assert.doesNotMatch(trackerHtml, new RegExp(removedMarker), `rhythm tracker should remove old daily field ${removedMarker}`);
}

for (const status of ['full', 'minimum', 'recovery', 'skipped', 'empty']) {
  assert.match(trackerJs, new RegExp(status), `tracker JS should include ${status} day status`);
}

for (const focus of ['workout', 'activity', 'recovery', 'nutrition', 'selfcare']) {
  assert.match(trackerJs, new RegExp(focus), `tracker JS should include ${focus} day focus`);
}

for (const reason of ['time', 'tired', 'health', 'mood', 'forgot', 'other']) {
  assert.match(trackerJs, new RegExp(reason), `tracker JS should include ${reason} skip reason`);
}

for (const removedHabit of ['training', 'water', 'steps', 'sleep', 'food', 'wellbeing']) {
  assert.doesNotMatch(trackerJs, new RegExp(`id:\\s*['"]${removedHabit}['"]`), `tracker JS should remove old ${removedHabit} habit checklist`);
}

assert.match(trackerHtml, /Неделя в ритме/, 'tracker page should frame the rhythm concept');
assert.match(trackerHtml, /Хочу запомнить/, 'tracker page should keep only an optional daily note');
assert.match(trackerHtml, /Прогресс без веса/, 'tracker page should include weekly non-weight progress');
assert.match(trackerHtml, /assets\/js\/tracker\.js\?v=hub-3/, 'tracker page should load bumped tracker JS');
assert.match(trackerJs, /ggc-tracker-rhythm-v1/, 'tracker JS should use the rhythm tracker storage key');
assert.match(trackerJs, /weeklyNonWeightProgress/, 'tracker JS should store non-weight progress at week level');
assert.match(trackerJs, /rhythmStatuses/, 'tracker JS should count full, minimum, and recovery as rhythm days');
assert.match(trackerJs, /hasConsecutiveSkips/, 'tracker JS should detect consecutive skipped days');
assert.match(trackerJs, /returnedAfterSkip/, 'tracker JS should detect return after a skipped day');
assert.match(trackerJs, /skipReasonMeta\[day\.skipReason\]/, 'tracker JS should only analyze known saved skip reasons');
assert.match(trackerJs, /skipReasonMeta\[day\.skipReason\]\?\.label/, 'tracker JS should tolerate unknown saved skip reasons');
assert.match(trackerJs, /localStorage/, 'tracker JS should persist state');
assert.match(css, /tracker-shell/, 'shared CSS should style tracker page');
assert.match(css, /tracker-status-actions/, 'shared CSS should style rhythm status actions');
assert.match(css, /tracker-progress-options/, 'shared CSS should style weekly non-weight progress');
assert.ok(!fs.existsSync(path.join(root, 'free-mini.html')), 'mini collection should be removed from the main project');

console.log('tracker checks passed');
