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

function createProteinBuilderHarness() {
  const tabs = ['breakfast', 'lunch', 'snack', 'dinner'].map((tab) => {
    const element = createElementStub();
    element.dataset.proteinTab = tab;
    return element;
  });
  const title = createElementStub();
  const steps = {
    protein: createElementStub(),
    base: createElementStub(),
    volume: createElementStub(),
    taste: createElementStub(),
  };
  const example = createElementStub();
  let domReady;

  const document = {
    addEventListener(event, callback) {
      if (event === 'DOMContentLoaded') domReady = callback;
    },
    querySelector(selector) {
      if (selector === '[data-food-search]') return null;
      if (selector === '[data-food-result]') return null;
      if (selector === '[data-protein-title]') return title;
      if (selector === '[data-protein-example]') return example;
      const stepMatch = selector.match(/^\[data-protein-step="([^"]+)"\]$/);
      if (stepMatch) return steps[stepMatch[1]];
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-protein-tab]') return tabs;
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
    select(tab) {
      tabs.find((button) => button.dataset.proteinTab === tab).onclick();
      return {
        title: title.textContent,
        protein: steps.protein.textContent,
        base: steps.base.textContent,
        volume: steps.volume.textContent,
        taste: steps.taste.textContent,
        example: example.textContent,
        active: tabs.find((button) => button.dataset.proteinTab === tab).classList.contains('is-active'),
      };
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
assert.match(nutritionHtml, /Собери тарелку за 10 секунд/, 'nutrition guide should introduce the protein plate builder');
assert.match(nutritionHtml, /белок без сложных расчётов/, 'nutrition guide should keep the protein no-calculation eyebrow');
assert.match(nutritionHtml, /protein-flow/, 'nutrition guide should render the protein builder flow');
assert.match(nutritionHtml, /Выбери приём пищи/, 'nutrition guide should start the protein builder flow with meal choice');
assert.match(nutritionHtml, /собери формулу/, 'nutrition guide should explain the formula step');
assert.match(nutritionHtml, /адаптируй под свой день/, 'nutrition guide should explain the adaptation step');
assert.match(nutritionHtml, /data-protein-tab="breakfast"/, 'nutrition guide should include breakfast protein tab');
assert.match(nutritionHtml, /data-protein-tab="lunch"/, 'nutrition guide should include lunch protein tab');
assert.match(nutritionHtml, /data-protein-tab="snack"/, 'nutrition guide should include snack protein tab');
assert.match(nutritionHtml, /data-protein-tab="dinner"/, 'nutrition guide should include dinner protein tab');
assert.match(nutritionHtml, /БЕЛОК\s*→\s*ОСНОВА\s*→\s*ОБЪЁМ\s*→\s*ВКУС/, 'nutrition guide should show the protein plate formula');
assert.match(nutritionHtml, /data-protein-step="protein"/, 'nutrition guide should render protein builder protein step');
assert.match(nutritionHtml, /data-protein-step="base"/, 'nutrition guide should render protein builder base step');
assert.match(nutritionHtml, /data-protein-step="volume"/, 'nutrition guide should render protein builder volume step');
assert.match(nutritionHtml, /data-protein-step="taste"/, 'nutrition guide should render protein builder taste step');
assert.match(nutritionHtml, /data-protein-example/, 'nutrition guide should render a dynamic plate example');
assert.match(nutritionJs, /foodItems/, 'nutrition JS should include food scanner data');
assert.match(nutritionJs, /proteinTemplates/, 'nutrition JS should include protein tab templates');
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

const proteinBuilder = createProteinBuilderHarness();
const lunchTemplate = proteinBuilder.select('lunch');
assert.equal(lunchTemplate.title, 'Обед', 'lunch tab should render lunch title');
assert.equal(lunchTemplate.protein, 'курица / рыба / индейка', 'lunch tab should render protein options');
assert.equal(lunchTemplate.base, 'рис / гречка / картофель', 'lunch tab should render base options');
assert.equal(lunchTemplate.volume, 'овощи / салат', 'lunch tab should render volume options');
assert.equal(lunchTemplate.taste, 'соус / специи / сыр', 'lunch tab should render taste options');
assert.equal(lunchTemplate.example, 'курица + рис + овощи + соус', 'lunch tab should render the lunch plate example');
assert.equal(lunchTemplate.active, true, 'selected protein tab should become active');

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
