'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');

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

function createElementStub() {
  const classes = new Set();
  return {
    className: '',
    dataset: {},
    innerHTML: '',
    textContent: '',
    value: '',
    addEventListener(event, callback) {
      this[`on${event}`] = callback;
    },
    classList: {
      add(value) {
        classes.add(value);
      },
      remove(value) {
        classes.delete(value);
      },
      toggle(value, force) {
        if (force) classes.add(value);
        else classes.delete(value);
      },
      contains(value) {
        return classes.has(value);
      },
    },
    setAttribute(name, value) {
      this[name] = value;
    },
  };
}

function createFoodScannerHarness() {
  const search = createElementStub();
  const result = createElementStub();
  let domReady;

  const document = {
    addEventListener(event, callback) {
      if (event === 'DOMContentLoaded') domReady = callback;
    },
    querySelector(selector) {
      if (selector === '[data-food-search]') return search;
      if (selector === '[data-food-result]') return result;
      return null;
    },
    querySelectorAll() {
      return [];
    },
  };

  const localStorage = {
    getItem() {
      return null;
    },
    setItem() {},
  };

  vm.runInNewContext(nutritionJs, { document, localStorage });
  domReady();

  return {
    scan(query) {
      search.value = query;
      search.oninput();
      return result.innerHTML.replace(/\s+/g, ' ').trim();
    },
  };
}

for (const html of [indexHtml, calculatorHtml, nutritionHtml, bodyHtml]) {
  assert.match(html, /nutrition-guide\.html/, 'navigation should link to materials guide');
  assert.match(html, /Полезные материалы/, 'navigation should name the unified materials guide');
}

for (const materialId of [
  'food-scanner',
  'stress-overeating',
  'overeating-cycle',
  'swelling',
  'cellulite',
  'daily-base',
  'cycle-training',
  'supplements',
]) {
  assert.match(nutritionHtml, new RegExp(`data-material-card="${materialId}"`), `materials library should include ${materialId} card`);
  assert.match(nutritionHtml, new RegExp(`data-material-panel="${materialId}"`), `materials library should include ${materialId} panel`);
  assert.match(nutritionHtml, new RegExp(`#${materialId}`), `materials library should expose #${materialId} link`);
}

assert.match(nutritionHtml, /data-material-library/, 'nutrition guide should include the materials library view');
assert.match(nutritionHtml, /data-material-back/, 'nutrition guide should include a return to library action');
assert.match(nutritionHtml, /data-material-title/, 'nutrition guide should expose the active material title');
assert.match(nutritionHtml, /Стресс и переедание/, 'materials guide should include stress overeating material');
assert.match(nutritionHtml, /Продукт — только часть картины/, 'stress material should restore the old bridge heading');
assert.match(nutritionHtml, /Фудсканер помогает быстро сориентироваться с отдельным продуктом/, 'stress material should restore the old food scanner bridge copy');
assert.match(nutritionHtml, /Срыв — это не отсутствие силы воли/, 'stress material should restore the old overeating headline');
assert.match(nutritionHtml, /я просто не выдержала/, 'stress material should restore the old self-blame framing');
assert.match(nutritionHtml, /Срыв часто выглядит как проблема сладкого или “слабой силы воли”/, 'stress material should restore the old system explanation');
assert.match(nutritionHtml, /Мой главный совет: не пытайся “исправить” срыв жёсткостью/, 'stress material should restore the old expert note');
assert.match(nutritionHtml, /запретила → терпела → сорвалась → обвинила себя → снова запретила/, 'cycle material should include the approved visual chain');
assert.match(nutritionHtml, /Недоела/, 'cycle material should restore the old under-eating step');
assert.match(nutritionHtml, /и цикл повторяется/, 'cycle material should restore the old loop note');
assert.match(nutritionHtml, /Как остановить цикл раньше/, 'cycle material should restore the old interruption block');
assert.match(nutritionHtml, /Когда это нормально/, 'swelling material should include normal swelling context');
assert.match(nutritionHtml, /Когда лучше обратиться к специалисту/, 'swelling material should include specialist escalation');
assert.match(nutritionHtml, /что не обещать/i, 'cellulite material should include honest promise boundaries');
assert.match(nutritionHtml, /Белок/, 'daily base material should include protein');
assert.match(nutritionHtml, /Менструация/, 'cycle training material should include phase guidance');
assert.match(nutritionHtml, /что не нужно покупать без причины/i, 'supplements material should include no-reason purchase guidance');
assert.match(nutritionHtml, /БАДы не заменяют питание, сон и тренировки/, 'supplements material should name the base priority');
assert.match(nutritionHtml, /data-food-search/, 'nutrition guide should include food scanner search');
assert.match(nutritionHtml, /nutrition-scanner/, 'nutrition guide should use the premium food scanner block');
assert.match(nutritionHtml, /scanner-zone-grid/, 'nutrition guide should merge food zones into scanner block');
assert.doesNotMatch(nutritionHtml, /Начни вводить продукт/, 'scanner empty state should not duplicate the search prompt');
assert.doesNotMatch(nutritionHtml, /план Б/i, 'overeating cycle should not use unclear plan B wording');
assert.doesNotMatch(nutritionHtml, /Собери тарелку за 10 секунд/, 'nutrition guide should remove the old protein plate builder');
assert.doesNotMatch(nutritionHtml, /data-protein-tab/, 'nutrition guide should remove old protein tabs');
assert.match(nutritionJs, /foodItems/, 'nutrition JS should include food scanner data');
assert.doesNotMatch(nutritionJs, /proteinTemplates/, 'nutrition JS should remove protein constructor templates');
assert.doesNotMatch(nutritionJs, /data-protein-tab/, 'nutrition JS should remove protein tab handlers');
assert.match(nutritionJs, /portionTip/, 'nutrition JS should output practical portion advice');
assert.match(nutritionJs, /data-food-status/, 'nutrition JS should render scanner status separately');
assert.doesNotMatch(nutritionJs, /Начни вводить продукт/, 'scanner JS empty state should not duplicate the search prompt');
assert.match(nutritionJs, /clarifyOptions/, 'nutrition JS should include ambiguous product clarifications');
assert.match(nutritionJs, /localStorage/, 'nutrition JS should persist guide state');

const aliasCount = [...nutritionJs.matchAll(/names:\s*\[([^\]]+)\]/g)]
  .reduce((total, match) => total + (match[1].match(/'/g) || []).length / 2, 0);
assert.ok(aliasCount >= 180, `food scanner should include at least 180 aliases, found ${aliasCount}`);

const scanner = createFoodScannerHarness();
for (const [query, expected] of [
  ['масло', 'Уточни продукт'],
  ['масло подсолнечное', 'Аккуратно'],
  ['сливочное масло', 'Аккуратно'],
  ['оливковое масло', 'Аккуратно'],
  ['хлеб цельнозерновой', 'Нужно считать'],
  ['цельнозерновой хлеб', 'Нужно считать'],
  ['лаваш', 'Нужно считать'],
  ['хлебцы', 'Нужно считать'],
  ['картошка', 'Нужно считать'],
  ['батат', 'Нужно считать'],
  ['бобы', 'Нужно считать'],
  ['фасоль', 'Нужно считать'],
  ['гречка', 'Нужно считать'],
  ['рис', 'Нужно считать'],
  ['сыр', 'Уточни продукт'],
  ['йогурт', 'Уточни продукт'],
  ['соус', 'Уточни продукт'],
  ['майонез', 'Аккуратно'],
  ['оливки', 'Аккуратно'],
  ['авокадо', 'Аккуратно'],
  ['орехи', 'Аккуратно'],
  ['банан', 'Аккуратно'],
  ['огурец', 'Можно не считать'],
  ['помидор', 'Можно не считать'],
  ['зелень', 'Можно не считать'],
  ['грибы', 'Можно не считать'],
  ['свекла', 'Нужно считать'],
  ['морковь', 'Нужно считать'],
  ['кукуруза', 'Нужно считать'],
  ['непонятный продукт', 'Лучше считать'],
]) {
  assert.match(scanner.scan(query), new RegExp(expected), `food scanner should classify "${query}" as "${expected}"`);
}
assert.doesNotMatch(scanner.scan('масло'), /Варианты:/, 'clarification should not duplicate options');
assert.doesNotMatch(scanner.scan('масло'), /сливочное.*сливочное/s, 'clarification should not repeat the same option twice');
assert.doesNotMatch(scanner.scan('непонятный продукт'), /Пока нет в базе/, 'unknown product should not show a missing database dead end');

assert.match(bodyHtml, /Полезные материалы/, 'body guide navigation should point users to the unified materials guide');
assert.match(bodyJs, /localStorage/, 'body guide JS should persist checklist state');

assert.match(css, /guide-hero/, 'shared CSS should style guide pages');
assert.match(css, /margin-left:\s*auto;[\s\S]*margin-right:\s*auto;/, 'hero titles should be centered within their content');
assert.match(css, /nutrition-scanner/, 'shared CSS should style the premium food scanner');
assert.match(css, /materials-library/, 'shared CSS should style the materials library');
assert.match(css, /material-panel/, 'shared CSS should style active material panels');
assert.ok(!fs.existsSync(path.join(root, 'free-mini.html')), 'mini collection should be removed from the main project');

console.log('material guide checks passed');
