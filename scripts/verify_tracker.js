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
  'data-tracker-cycle',
  'data-tracker-cycle-summary',
  'data-tracker-metric',
  'data-tracker-program-map',
  'data-tracker-week-detail',
  'data-tracker-progress-tags',
  'data-tracker-diary-field',
]) {
  assert.match(trackerHtml, new RegExp(marker), `program tracker should include ${marker}`);
}

for (const marker of [
  'data-tracker-week-card',
  'data-tracker-workout',
  'data-tracker-complex',
  'data-tracker-week-note',
  'data-tracker-week-win',
  'data-tracker-progress-tag',
]) {
  assert.match(trackerJs, new RegExp(marker), `program tracker JS should render ${marker}`);
}

for (const removedMarker of [
  'data-tracker-today-focus',
  'data-tracker-status',
  'data-tracker-skip-reason',
  'data-tracker-recommendation',
  'data-tracker-barriers',
  'data-tracker-mood',
  'data-tracker-energy',
]) {
  assert.doesNotMatch(trackerHtml, new RegExp(removedMarker), `program tracker should remove ${removedMarker}`);
}

assert.match(trackerHtml, /Карта программы/, 'tracker hero should frame program progress');
assert.match(trackerHtml, /Отмечай тренировки, комплексы и маленькие шаги/, 'tracker hero should use the requested subtitle');
assert.match(trackerHtml, /Мезоцикл 1/, 'tracker should include cycle 1 switch');
assert.match(trackerHtml, /Мезоцикл 2/, 'tracker should include cycle 2 switch');
assert.match(trackerHtml, /Что стало чуть лучше/, 'tracker should include weekly non-weight progress');
assert.match(trackerHtml, /Что я забираю из этой недели/, 'tracker should include diary block');
assert.match(trackerHtml, /Очистить мои отметки/, 'tracker reset should be a secondary action');
assert.match(trackerHtml, /assets\/js\/tracker\.js\?v=hub-4/, 'tracker page should load bumped program tracker JS');

assert.match(trackerJs, /ggc-tracker-program-v1/, 'tracker JS should use the program tracker storage key');
assert.doesNotMatch(trackerJs, /ggc-tracker-rhythm-v1/, 'tracker JS should not use the rhythm storage key');
assert.match(trackerJs, /activeCycle/, 'tracker JS should store active cycle');
assert.match(trackerJs, /selectedWeeks/, 'tracker JS should store selected week by cycle');
assert.match(trackerJs, /workouts:\s*Array\.from/, 'tracker JS should generate weekly workouts separately');
assert.match(trackerJs, /complexes:\s*complexTemplates\.map/, 'tracker JS should generate complexes separately');
assert.match(trackerJs, /weeksPerCycle\s*=\s*6/, 'tracker JS should define 6 weeks per cycle');
assert.match(trackerJs, /workoutsPerWeek\s*=\s*3/, 'tracker JS should define 3 workouts per week');
assert.match(trackerJs, /\[1,\s*2\]\.map/, 'tracker JS should generate 2 mesocycles');
assert.match(trackerJs, /workoutsDone/, 'tracker JS should count completed workouts');
assert.match(trackerJs, /complexesDone/, 'tracker JS should count completed complexes separately');
assert.match(trackerJs, /isWeekStarted/, 'tracker JS should detect started weeks');
assert.match(trackerJs, /isWeekCompleted/, 'tracker JS should detect completed weeks');
assert.match(
  trackerJs,
  /week\.workouts\.every\(\(workout\) => workout\.completed\)/,
  'week completion should depend only on the 3 main workouts',
);
assert.doesNotMatch(trackerJs, /statusMeta|skipReasonMeta|rhythmStatuses|hasConsecutiveSkips|returnedAfterSkip/, 'tracker JS should remove rhythm dashboard logic');

for (const copy of [
  'Основные тренировки',
  '3 тренировки — главная линия недели',
  'Поддерживающие практики',
  'Можно делать отдельно от тренировок',
  'Комплексы не блокируют завершение недели',
]) {
  assert.match(trackerJs + trackerHtml, new RegExp(copy), `tracker should include copy: ${copy}`);
}

assert.match(css, /tracker-program-map/, 'shared CSS should style program map');
assert.match(css, /tracker-detail-block--primary/, 'shared CSS should prioritize main workouts');
assert.match(css, /tracker-detail-block--support/, 'shared CSS should soften supporting practices');
assert.match(css, /tracker-progress-options/, 'shared CSS should style progress tags');
assert.ok(!fs.existsSync(path.join(root, 'free-mini.html')), 'mini collection should be removed from the main project');

console.log('tracker checks passed');
