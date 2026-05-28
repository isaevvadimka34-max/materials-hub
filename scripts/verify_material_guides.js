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
    hidden: false,
    innerHTML: '',
    textContent: '',
    value: '',
    checked: false,
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
    removeAttribute(name) {
      delete this[name];
    },
    getBoundingClientRect() {
      return { top: 0, bottom: 0 };
    },
    scrollIntoView() {},
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

function createOvereatingProtocolHarness(savedState = null) {
  let domReady;
  const store = savedState ? { ggc_material_overeating_cycle: JSON.stringify(savedState) } : {};
  const protocol = createElementStub();
  const flow = createElementStub();
  const final = createElementStub();
  final.hidden = true;
  const start = createElementStub();
  const solution = createElementStub();
  const complete = createElementStub();

  const startScreen = createElementStub();
  startScreen.dataset.overeatingScreen = 'start';
  const impulseScreen = createElementStub();
  impulseScreen.dataset.overeatingScreen = 'impulse';
  impulseScreen.hidden = true;
  const solutionScreen = createElementStub();
  solutionScreen.dataset.overeatingScreen = 'solution';
  solutionScreen.hidden = true;

  const impulseRestrictFood = createElementStub();
  impulseRestrictFood.dataset.overeatingImpulse = 'restrict-food';
  const impulseTrainOff = createElementStub();
  impulseTrainOff.dataset.overeatingImpulse = 'train-off';
  const impulseWeigh = createElementStub();
  impulseWeigh.dataset.overeatingImpulse = 'weigh';
  const impulseMonday = createElementStub();
  impulseMonday.dataset.overeatingImpulse = 'monday';

  const document = {
    documentElement: { clientHeight: 600 },
    addEventListener(event, callback) {
      if (event === 'DOMContentLoaded') domReady = callback;
    },
    querySelector(selector) {
      const map = {
        '[data-overeating-protocol]': protocol,
        '[data-overeating-flow]': flow,
        '[data-overeating-start]': start,
        '[data-overeating-solution]': solution,
        '[data-overeating-complete]': complete,
        '[data-overeating-final]': final,
      };
      return map[selector] || null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-overeating-screen]') return [startScreen, impulseScreen, solutionScreen];
      if (selector === '[data-overeating-impulse]') {
        return [impulseRestrictFood, impulseTrainOff, impulseWeigh, impulseMonday];
      }
      return [];
    },
  };

  const localStorage = {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value;
    },
  };

  const window = {
    innerHeight: 600,
    location: { hash: '', pathname: '/nutrition-guide.html', search: '' },
    history: { pushState() {} },
    addEventListener() {},
    matchMedia() {
      return { matches: false };
    },
    setTimeout(callback) {
      callback();
    },
  };

  vm.runInNewContext(nutritionJs, {
    document,
    localStorage,
    window,
    requestAnimationFrame(callback) {
      callback();
    },
    Date,
  });
  domReady();

  return {
    flow,
    final,
    start,
    solution,
    complete,
    startScreen,
    impulseScreen,
    solutionScreen,
    impulseRestrictFood,
    impulseTrainOff,
    impulseWeigh,
    impulseMonday,
    store,
  };
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
assert.match(nutritionHtml, /data-overeating-protocol/, 'cycle material should include the return protocol');
assert.match(nutritionHtml, /Срыв — это физиология, а не слабость/, 'cycle protocol should use the emotional reset title');
assert.match(nutritionHtml, /data-overeating-start/, 'cycle protocol should include the start action');
assert.match(nutritionHtml, /data-overeating-impulse="restrict-food"/, 'cycle protocol should expose impulse chips');
assert.match(nutritionHtml, /data-overeating-solution/, 'cycle protocol should expose one solution output');
assert.match(nutritionHtml, /data-overeating-complete/, 'cycle protocol should include the completion action');
assert.match(nutritionHtml, /data-overeating-final/, 'cycle protocol should include the final fixed-plan state');
assert.doesNotMatch(nutritionHtml, /запретила → терпела → сорвалась → обвинила себя → снова запретила/, 'cycle material should remove the long old visual chain');
assert.doesNotMatch(nutritionHtml, /data-overeating-checklist/, 'cycle protocol should remove checklist output');
assert.doesNotMatch(nutritionHtml, /data-overeating-reset/, 'cycle protocol should remove reset action');
assert.match(nutritionJs, /ggc_material_overeating_cycle/, 'cycle protocol should persist to the approved localStorage key');
assert.match(nutritionJs, /completedDate/, 'cycle protocol should persist completion date');
assert.match(nutritionJs, /data-overeating-impulse/, 'cycle protocol should wire impulse chips');
assert.match(nutritionJs, /todayStamp/, 'cycle protocol should only treat today as completed');
assert.doesNotMatch(nutritionJs, /checksByScenario/, 'cycle protocol should remove checklist persistence');
assert.doesNotMatch(nutritionJs, /data-overeating-scenario/, 'cycle protocol should remove scenario chips');
assert.doesNotMatch(nutritionJs, /data-overeating-reaction/, 'cycle protocol should remove reaction chips');
assert.match(nutritionJs, /prefers-reduced-motion/, 'cycle protocol scrolling should respect reduced motion');
assert.match(css, /overeating-protocol/, 'shared CSS should style the cycle protocol');
assert.match(css, /overeating-protocol__flow/, 'cycle protocol should style collapsible flow state');
assert.match(css, /overeating-protocol__final/, 'cycle protocol should style fixed-plan state');
assert.match(css, /overeating-chip-list button\.is-active/, 'cycle protocol should style active chips');
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
assert.doesNotMatch(nutritionHtml, /план\s+Б(?:\s|$|[.,;:!?])/i, 'overeating cycle should not use unclear plan B wording');
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

const overeatingHarness = createOvereatingProtocolHarness();
assert.equal(overeatingHarness.flow.hidden, false, 'emotional reset flow should start visible');
assert.equal(overeatingHarness.final.hidden, true, 'final fixed-plan state should start hidden');
assert.equal(overeatingHarness.startScreen.classList.contains('is-active'), true, 'start screen should be active on load');

overeatingHarness.start.onclick();
assert.equal(overeatingHarness.impulseScreen.hidden, false, 'impulse screen should show after start action');
assert.equal(overeatingHarness.impulseScreen.classList.contains('is-active'), true, 'impulse screen should become active after start action');

overeatingHarness.impulseRestrictFood.onclick();
assert.equal(overeatingHarness.solutionScreen.hidden, false, 'solution screen should show after impulse selection');
assert.match(overeatingHarness.solution.textContent, /обычный первый прием пищи/, 'restrict-food impulse should render one targeted solution');
assert.equal(JSON.parse(overeatingHarness.store.ggc_material_overeating_cycle).impulse, 'restrict-food', 'impulse should persist to localStorage');

overeatingHarness.impulseTrainOff.onclick();
assert.match(overeatingHarness.solution.textContent, /Жесткая тренировка из чувства вины/, 'train-off impulse should render training copy');
overeatingHarness.impulseWeigh.onclick();
assert.match(overeatingHarness.solution.textContent, /Убери весы на 3 дня/, 'weigh impulse should render scale copy');
overeatingHarness.impulseMonday.onclick();
assert.match(overeatingHarness.solution.textContent, /Завтра просто возвращаемся к базе/, 'monday impulse should render course return copy');

overeatingHarness.complete.onclick();
const completedState = JSON.parse(overeatingHarness.store.ggc_material_overeating_cycle);
assert.equal(completedState.completed, true, 'completion should persist completed flag');
assert.match(completedState.completedDate, /^\d{4}-\d{2}-\d{2}$/, 'completion should persist completion date');
assert.equal(overeatingHarness.flow.hidden, true, 'completion should collapse the choice flow');
assert.equal(overeatingHarness.final.hidden, false, 'completion should show final fixed-plan state');

const now = new Date();
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-');
const savedOvereatingHarness = createOvereatingProtocolHarness({
  impulse: 'weigh',
  completed: true,
  completedDate: today,
});
assert.equal(savedOvereatingHarness.flow.hidden, true, 'completed today should show only final state on reload');
assert.equal(savedOvereatingHarness.final.hidden, false, 'completed today should keep final state visible on reload');

const staleOvereatingHarness = createOvereatingProtocolHarness({
  impulse: 'weigh',
  completed: true,
  completedDate: '2000-01-01',
});
assert.equal(staleOvereatingHarness.flow.hidden, false, 'stale completion should return to the flow');
assert.equal(staleOvereatingHarness.final.hidden, true, 'stale completion should not show final state');

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
