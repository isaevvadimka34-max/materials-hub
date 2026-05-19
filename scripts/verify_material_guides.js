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
  assert.match(html, /nutrition-guide\.html/, 'navigation should link to nutrition guide');
  assert.match(html, /body-guide\.html/, 'navigation should link to body guide');
  assert.match(html, /Гид по питанию/, 'navigation should name nutrition guide');
  assert.match(html, /Режим и тело/, 'navigation should name body guide');
}

assert.match(nutritionHtml, /data-food-search/, 'nutrition guide should include food scanner search');
assert.match(nutritionHtml, /nutrition-scanner/, 'nutrition guide should use the premium food scanner block');
assert.match(nutritionHtml, /scanner-zone-grid/, 'nutrition guide should merge food zones into scanner block');
assert.doesNotMatch(nutritionHtml, /Начни вводить продукт/, 'scanner empty state should not duplicate the search prompt');
assert.match(nutritionHtml, /переедание и срывы/, 'nutrition guide should introduce the overeating cycle eyebrow');
assert.match(nutritionHtml, /Срыв — это не отсутствие силы воли/, 'nutrition guide should introduce the overeating cycle block');
assert.match(nutritionHtml, /Продукт — только часть картины/, 'overeating bridge should have a clear visual heading');
assert.match(nutritionHtml, /Фудсканер помогает быстро сориентироваться с отдельным продуктом/, 'overeating bridge should connect from food scanner');
assert.match(nutritionHtml, /почему вообще тянет сорваться/, 'overeating bridge should lead into the breakdown topic');
assert.match(nutritionHtml, /сценарии дня: мало еды, много запретов и попытка держаться идеально/, 'overeating bridge should explain the daily scenario');
assert.match(nutritionHtml, /я просто не выдержала/, 'overeating cycle should name the common self-blame thought');
assert.match(nutritionHtml, /Недоела/, 'overeating cycle should include the under-eating step');
assert.match(nutritionHtml, /весь день “держалась”/, 'overeating cycle should explain the under-eating step');
assert.match(nutritionHtml, /Запретила/, 'overeating cycle should include the restriction step');
assert.match(nutritionHtml, /любое отклонение считала провалом/, 'overeating cycle should explain the restriction step');
assert.match(nutritionHtml, /Терпела/, 'overeating cycle should include the enduring hunger step');
assert.match(nutritionHtml, /игнорировала голод, усталость и желание нормально поесть/, 'overeating cycle should explain the enduring step');
assert.match(nutritionHtml, /Сорвалась/, 'overeating cycle should include the overeating step');
assert.match(nutritionHtml, /слишком долго держалась/, 'overeating cycle should explain the overeating step');
assert.match(nutritionHtml, /Обвинила себя/, 'overeating cycle should include the self-blame step');
assert.match(nutritionHtml, /снова захотела сделать всё ещё жёстче/, 'overeating cycle should explain the stricter restart');
assert.match(nutritionHtml, /и цикл повторяется/, 'overeating cycle should show the repeated loop');
assert.match(nutritionHtml, /Где ломается система/, 'overeating cycle should explain why the system breaks');
assert.match(nutritionHtml, /не хватило еды/, 'overeating cycle should include the food shortage reason');
assert.match(nutritionHtml, /слишком много запретов/, 'overeating cycle should include the restriction overload reason');
assert.match(nutritionHtml, /нет спокойного следующего шага/, 'overeating cycle should include the missing next step reason');
assert.match(nutritionHtml, /Как остановить цикл раньше/, 'overeating cycle should include an early interruption scenario');
assert.match(nutritionHtml, /поесть до сильного голода/, 'overeating cycle should include the first practical action');
assert.match(nutritionHtml, /не делить еду на “хорошую” и “плохую”/, 'overeating cycle should include the flexible food action');
assert.match(nutritionHtml, /оставить место для обычной жизни/, 'overeating cycle should include the real-life flexibility action');
assert.match(nutritionHtml, /вернуться к следующему нормальному приёму пищи/, 'overeating cycle should include the calm return action');
assert.match(nutritionHtml, /не хватает дисциплины/, 'overeating cycle should include the stronger final conclusion');
assert.match(nutritionHtml, /не через боль и наказание/, 'overeating cycle should explain that nutrition is not built through punishment');
assert.match(nutritionHtml, /через заботу к себе/, 'overeating cycle should frame the solution as self-care');
assert.match(nutritionHtml, /торт или бургер/, 'overeating cycle should allow flexible foods without shame');
assert.match(nutritionHtml, /вернуться к балансу/, 'overeating cycle should explain balance after flexible foods');
assert.match(nutritionHtml, /спокойным следующим шагом/, 'overeating cycle should include a clear replacement for plan B');
assert.doesNotMatch(nutritionHtml, /план Б/i, 'overeating cycle should not use unclear plan B wording');
assert.match(nutritionHtml, /overeating-cycle/, 'nutrition guide should use scoped overeating-cycle styles');
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

assert.match(bodyHtml, /data-water-weight/, 'body guide should include water calculator');
assert.match(bodyHtml, /data-body-check/, 'body guide should include daily checklist');
assert.match(bodyHtml, /Менструация/, 'body guide should include cycle guidance');
assert.match(bodyHtml, /Протеин/, 'body guide should include supplement guidance');
assert.match(bodyJs, /localStorage/, 'body guide JS should persist checklist state');

assert.match(css, /guide-hero/, 'shared CSS should style guide pages');
assert.match(css, /margin-left:\s*auto;[\s\S]*margin-right:\s*auto;/, 'hero titles should be centered within their content');
assert.match(css, /nutrition-scanner/, 'shared CSS should style the premium food scanner');
assert.ok(!fs.existsSync(path.join(root, 'free-mini.html')), 'mini collection should be removed from the main project');

console.log('material guide checks passed');
