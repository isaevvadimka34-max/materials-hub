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
  'data-tracker-variant',
  'data-tracker-goal',
  'data-tracker-manifest-field',
  'data-tracker-status-line',
  'data-tracker-progress-fill',
  'data-tracker-planner-table-title',
  'data-tracker-metric',
  'data-tracker-program-map',
]) {
  assert.match(trackerHtml, new RegExp(marker), `program tracker should include ${marker}`);
}

for (const marker of [
  'data-tracker-planner-row',
  'data-tracker-planner-cell',
  'data-tracker-day-task',
]) {
  assert.match(trackerJs, new RegExp(marker), `program tracker JS should render ${marker}`);
}

for (const removedMarker of [
  'data-tracker-today-focus',
  'data-tracker-skip-reason',
  'data-tracker-recommendation',
  'data-tracker-barriers',
  'data-tracker-mood',
  'data-tracker-energy',
]) {
  assert.doesNotMatch(trackerHtml, new RegExp(removedMarker), `program tracker should remove ${removedMarker}`);
}
assert.doesNotMatch(trackerHtml, /data-tracker-status(?!-line)/, 'program tracker should remove old daily status controls');

assert.match(trackerHtml, /Карта программы/, 'tracker hero should frame program progress');
assert.match(trackerHtml, /Отмечай тренировки, комплексы и маленькие шаги/, 'tracker hero should use the requested subtitle');
assert.match(trackerHtml, /TRACKER/, 'tracker dashboard should use the planner reference title');
assert.match(trackerHtml, /мой прогресс/i, 'tracker dashboard should name personal progress');
assert.match(trackerHtml, /Моя цель на курс/, 'tracker dashboard should include a course goal field');
assert.match(trackerHtml, /Мой мини-манифест/, 'tracker dashboard should include the mini-manifest block');
assert.match(trackerHtml, /Зачем мне это/, 'tracker dashboard should include a why field');
assert.match(trackerHtml, /Как я иду без гонки/, 'tracker dashboard should include a pace field');
assert.doesNotMatch(trackerHtml, /tracker-map-card/, 'tracker should not render the program map as a separate site card');
assert.match(trackerHtml, /Мезоцикл 1/, 'tracker should include cycle 1 switch');
assert.match(trackerHtml, /Мезоцикл 2/, 'tracker should include cycle 2 switch');
assert.match(trackerHtml, /Базовый вариант/, 'tracker should include base track variant');
assert.match(trackerHtml, /Усиленный вариант/, 'tracker should include advanced track variant');
assert.match(trackerHtml, /tracker-planner-table-head[\s\S]*data-tracker-variant/, 'track variant switch should sit inside the daily tracker header');
assert.match(trackerHtml, /tracker-progress-line[\s\S]*data-tracker-progress-fill/, 'tracker should include a visual progress line');
assert.doesNotMatch(trackerHtml, /Что стало чуть лучше/, 'tracker should remove weekly non-weight progress');
assert.doesNotMatch(trackerHtml, /Что я забираю из этой недели/, 'tracker should remove diary block');
assert.doesNotMatch(trackerHtml, /data-tracker-week-detail/, 'tracker should remove detailed week card');
assert.doesNotMatch(trackerHtml, /data-tracker-progress-tags/, 'tracker should remove progress tags UI');
assert.doesNotMatch(trackerHtml, /data-tracker-diary-field/, 'tracker should remove diary fields UI');
assert.match(trackerHtml, /Очистить мои отметки/, 'tracker reset should be a secondary action');
assert.match(trackerHtml, /assets\/js\/tracker\.js\?v=hub-8/, 'tracker page should load bumped program tracker JS');

assert.match(trackerJs, /ggc-tracker-program-v1/, 'tracker JS should use the program tracker storage key');
assert.doesNotMatch(trackerJs, /ggc-tracker-rhythm-v1/, 'tracker JS should not use the rhythm storage key');
assert.match(trackerJs, /goal:/, 'tracker JS should preserve the course goal');
assert.match(trackerJs, /goalWhy/, 'tracker JS should preserve the why field');
assert.match(trackerJs, /goalPace/, 'tracker JS should preserve the pace field');
assert.match(trackerJs, /trackVariant/, 'tracker JS should preserve the selected track variant');
assert.match(trackerJs, /trackerGoal/, 'tracker JS should save the goal input');
assert.match(trackerJs, /manifestFields/, 'tracker JS should save all mini-manifest fields');
assert.match(trackerJs, /resizeManifestField/, 'tracker JS should auto-resize mini-manifest fields');
assert.match(trackerJs, /statusLine/, 'tracker JS should render a motivating status line');
assert.match(trackerJs, /activeCycle/, 'tracker JS should store active cycle');
assert.match(trackerJs, /selectedWeeks/, 'tracker JS should store selected week by cycle');
assert.match(trackerJs, /workouts:\s*Array\.from/, 'tracker JS should generate weekly workouts separately');
assert.match(trackerJs, /complexes:\s*supportTemplates\.map/, 'tracker JS should generate support tasks separately');
assert.match(trackerJs, /weeksPerCycle\s*=\s*6/, 'tracker JS should define 6 weeks per cycle');
assert.match(trackerJs, /workoutsPerWeek\s*=\s*3/, 'tracker JS should define 3 workouts per week');
assert.match(trackerJs, /\[1,\s*2\]\.map/, 'tracker JS should generate 2 mesocycles');
assert.match(trackerJs, /workoutsDone/, 'tracker JS should count completed workouts');
assert.match(trackerJs, /complexesDone/, 'tracker JS should count completed complexes separately');
assert.match(trackerJs, /toggleTaskGroup/, 'tracker JS should toggle one visible dot for the whole day');
assert.match(trackerJs, /isWeekStarted/, 'tracker JS should detect started weeks');
assert.match(trackerJs, /isWeekCompleted/, 'tracker JS should detect completed weeks');
assert.match(
  trackerJs,
  /week\.workouts\.every\(\(workout\) => workout\.completed\)/,
  'week completion should depend only on the 3 main workouts',
);
assert.doesNotMatch(trackerJs, /statusMeta|skipReasonMeta|rhythmStatuses|hasConsecutiveSkips|returnedAfterSkip/, 'tracker JS should remove rhythm dashboard logic');

for (const copy of [
  'День 1 низ A',
  'День 2 верх',
  'День 3 низ B',
  'День 1 низ A + дыхание',
  '1 неделя',
  '6 неделя',
  'Отдых / дыхание / прогулка',
]) {
  assert.ok((trackerJs + trackerHtml).includes(copy), `tracker should include copy: ${copy}`);
}

assert.match(css, /tracker-program-map/, 'shared CSS should style program map');
assert.match(css, /tracker-planner-dashboard/, 'shared CSS should style planner dashboard');
assert.match(css, /tracker-planner-title/, 'shared CSS should style planner title');
assert.match(css, /tracker-goal-card/, 'shared CSS should style the goal card');
assert.match(css, /tracker-manifest-card/, 'shared CSS should style the mini-manifest card');
assert.match(css, /tracker-manifest-field/, 'shared CSS should style the mini-manifest fields');
assert.match(css, /tracker-orbit/, 'shared CSS should style progress check orbits');
assert.match(css, /tracker-planner-table/, 'shared CSS should style the planner table');
assert.match(css, /tracker-planner-cell/, 'shared CSS should style planner check cells');
assert.match(css, /tracker-variant-switch/, 'shared CSS should style the variant switch');
assert.match(css, /tracker-progress-line/, 'shared CSS should style the progress line');
assert.match(css, /tracker-day-label/, 'shared CSS should style day labels');
assert.ok(!fs.existsSync(path.join(root, 'free-mini.html')), 'mini collection should be removed from the main project');

console.log('tracker checks passed');
