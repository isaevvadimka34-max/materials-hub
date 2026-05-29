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
  const complete = createElementStub();
  const finalTitle = createElementStub();
  const finalType = createElementStub();
  const finalReason = createElementStub();
  const finalPlan = createElementStub();
  const chooseAgain = createElementStub();
  const finalHint = createElementStub();

  const startScreen = createElementStub();
  startScreen.dataset.overeatingScreen = 'start';
  const typeScreen = createElementStub();
  typeScreen.dataset.overeatingScreen = 'type';
  typeScreen.hidden = true;
  const reasonScreen = createElementStub();
  reasonScreen.dataset.overeatingScreen = 'reason';
  reasonScreen.hidden = true;
  const planScreen = createElementStub();
  planScreen.dataset.overeatingScreen = 'plan';
  planScreen.hidden = true;

  const typeFastfood = createElementStub();
  typeFastfood.dataset.overeatingType = 'fastfood';
  const typeSweets = createElementStub();
  typeSweets.dataset.overeatingType = 'sweets';
  const typeNight = createElementStub();
  typeNight.dataset.overeatingType = 'night';
  const typeVolume = createElementStub();
  typeVolume.dataset.overeatingType = 'volume';
  const typeDrinks = createElementStub();
  typeDrinks.dataset.overeatingType = 'drinks';

  const reasonHunger = createElementStub();
  reasonHunger.dataset.overeatingReason = 'hunger';
  const reasonStress = createElementStub();
  reasonStress.dataset.overeatingReason = 'stress';
  const reasonRestriction = createElementStub();
  reasonRestriction.dataset.overeatingReason = 'restriction';
  const reasonAvailable = createElementStub();
  reasonAvailable.dataset.overeatingReason = 'available';
  const reasonSocial = createElementStub();
  reasonSocial.dataset.overeatingReason = 'social';

  const typeContext = createElementStub();
  const planTitle = createElementStub();
  const planEvent = createElementStub();
  const planReason = createElementStub();
  const planBody = createElementStub();
  const planNow = createElementStub();
  const planTomorrow = createElementStub();
  const planAvoid = createElementStub();
  const planChoice = createElementStub();
  const finalSupport = createElementStub();
  const finalBalance = createElementStub();
  const finalChecklistIntro = createElementStub();

  const checklistBreakfast = createElementStub();
  checklistBreakfast.dataset.overeatingCheck = 'breakfast';
  const checklistWater = createElementStub();
  checklistWater.dataset.overeatingCheck = 'water';
  const checklistProtein = createElementStub();
  checklistProtein.dataset.overeatingCheck = 'protein';
  const checklistMovement = createElementStub();
  checklistMovement.dataset.overeatingCheck = 'movement';
  const checklistNoCompensation = createElementStub();
  checklistNoCompensation.dataset.overeatingCheck = 'no-compensation';
  const checklistScenarioOne = createElementStub();
  checklistScenarioOne.dataset.overeatingCheck = 'scenario-one';
  const checklistScenarioTwo = createElementStub();
  checklistScenarioTwo.dataset.overeatingCheck = 'scenario-two';
  const checklistItems = [
    checklistBreakfast,
    checklistWater,
    checklistProtein,
    checklistMovement,
    checklistNoCompensation,
    checklistScenarioOne,
    checklistScenarioTwo,
  ];

  const checklistLabels = checklistItems.map((item) => {
    const label = createElementStub();
    label.dataset.overeatingCheckLabel = item.dataset.overeatingCheck;
    return label;
  });

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
        '[data-overeating-type-context]': typeContext,
        '[data-overeating-plan-title]': planTitle,
        '[data-overeating-plan-event]': planEvent,
        '[data-overeating-plan-reason]': planReason,
        '[data-overeating-plan-body]': planBody,
        '[data-overeating-plan-now]': planNow,
        '[data-overeating-plan-tomorrow]': planTomorrow,
        '[data-overeating-plan-avoid]': planAvoid,
        '[data-overeating-plan-choice]': planChoice,
        '[data-overeating-complete]': complete,
        '[data-overeating-final]': final,
        '[data-overeating-final-title]': finalTitle,
        '[data-overeating-final-type]': finalType,
        '[data-overeating-final-reason]': finalReason,
        '[data-overeating-final-plan]': finalPlan,
        '[data-overeating-final-support]': finalSupport,
        '[data-overeating-final-balance]': finalBalance,
        '[data-overeating-checklist-intro]': finalChecklistIntro,
        '[data-overeating-choose-again]': chooseAgain,
        '[data-overeating-final-hint]': finalHint,
      };
      return map[selector] || null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-overeating-screen]') return [startScreen, typeScreen, reasonScreen, planScreen];
      if (selector === '[data-overeating-type]') return [typeFastfood, typeSweets, typeNight, typeVolume, typeDrinks];
      if (selector === '[data-overeating-reason]') return [reasonHunger, reasonStress, reasonRestriction, reasonAvailable, reasonSocial];
      if (selector === '[data-overeating-check]') return checklistItems;
      if (selector === '[data-overeating-check-label]') return checklistLabels;
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
    removeItem(key) {
      delete store[key];
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
    complete,
    finalTitle,
    finalType,
    finalReason,
    finalPlan,
    chooseAgain,
    finalHint,
    startScreen,
    typeScreen,
    reasonScreen,
    planScreen,
    typeFastfood,
    typeSweets,
    typeNight,
    typeVolume,
    typeDrinks,
    reasonHunger,
    reasonStress,
    reasonRestriction,
    reasonAvailable,
    reasonSocial,
    typeContext,
    planTitle,
    planEvent,
    planReason,
    planBody,
    planNow,
    planTomorrow,
    planAvoid,
    planChoice,
    finalSupport,
    finalBalance,
    finalChecklistIntro,
    checklistBreakfast,
    checklistWater,
    checklistProtein,
    checklistMovement,
    checklistNoCompensation,
    checklistScenarioOne,
    checklistScenarioTwo,
    checklistItems,
    checklistLabels,
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
assert.match(nutritionHtml, /Разберем срыв и соберем план/, 'cycle protocol should use the diagnostic plan title');
assert.match(nutritionHtml, /data-overeating-start/, 'cycle protocol should include the start action');
assert.match(nutritionHtml, /data-overeating-type="fastfood"/, 'cycle protocol should expose fastfood scenario');
assert.match(nutritionHtml, /data-overeating-type="sweets"/, 'cycle protocol should expose sweets scenario');
assert.match(nutritionHtml, /data-overeating-type="night"/, 'cycle protocol should expose night scenario');
assert.match(nutritionHtml, /data-overeating-type="volume"/, 'cycle protocol should expose overeating volume scenario');
assert.match(nutritionHtml, /data-overeating-type="drinks"/, 'cycle protocol should expose drinks scenario');
assert.match(nutritionHtml, /data-overeating-reason="hunger"/, 'cycle protocol should ask for the likely reason');
assert.match(nutritionHtml, /data-overeating-plan-tomorrow/, 'cycle protocol should render tomorrow plan output');
assert.match(nutritionHtml, /data-overeating-plan-avoid/, 'cycle protocol should render what not to do');
assert.match(nutritionHtml, /data-overeating-plan-choice/, 'cycle protocol should show selected path on the plan step');
assert.match(nutritionHtml, /data-overeating-complete/, 'cycle protocol should include the completion action');
assert.match(nutritionHtml, /data-overeating-final/, 'cycle protocol should include the final fixed-plan state');
assert.match(nutritionHtml, /data-overeating-final-plan/, 'cycle protocol should show the chosen plan in the final state');
assert.match(nutritionHtml, /data-overeating-final-support/, 'cycle protocol should render anti-guilt support copy');
assert.match(nutritionHtml, /data-overeating-final-balance/, 'cycle protocol should render 80/20 balance copy');
assert.match(nutritionHtml, /data-overeating-checklist-intro/, 'cycle protocol should include checklist intro');
assert.match(nutritionHtml, /data-overeating-check="breakfast"/, 'cycle protocol should include breakfast checklist item');
assert.match(nutritionHtml, /data-overeating-check="scenario-one"/, 'cycle protocol should include scenario checklist item');
assert.match(nutritionHtml, /data-overeating-final-type/, 'cycle protocol should show chosen type in the final state');
assert.match(nutritionHtml, /data-overeating-final-reason/, 'cycle protocol should show chosen reason in the final state');
assert.match(nutritionHtml, /data-overeating-choose-again/, 'cycle protocol should allow choosing another option');
assert.match(nutritionHtml, /План будет доступен до конца завтрашнего дня/, 'cycle protocol should explain checklist availability');
assert.doesNotMatch(nutritionHtml, /запретила → терпела → сорвалась → обвинила себя → снова запретила/, 'cycle material should remove the long old visual chain');
assert.doesNotMatch(nutritionHtml, /data-overeating-checklist(?!-intro)/, 'cycle protocol should remove old checklist output');
assert.doesNotMatch(nutritionHtml, /data-overeating-reset/, 'cycle protocol should remove reset action');
assert.match(nutritionJs, /ggc_material_overeating_cycle/, 'cycle protocol should persist to the approved localStorage key');
assert.match(nutritionJs, /completedDate/, 'cycle protocol should persist completion date');
assert.match(nutritionJs, /expiresDate/, 'cycle protocol should persist expiration date');
assert.match(nutritionJs, /chosenPlan/, 'cycle protocol should persist chosen plan text');
assert.match(nutritionJs, /checkedItems/, 'cycle protocol should persist checklist state');
assert.match(nutritionJs, /bingeType/, 'cycle protocol should persist selected binge type');
assert.match(nutritionJs, /data-overeating-type/, 'cycle protocol should wire scenario chips');
assert.match(nutritionJs, /data-overeating-reason/, 'cycle protocol should wire reason chips');
assert.match(nutritionJs, /todayStamp/, 'cycle protocol should only treat today as completed');
assert.doesNotMatch(nutritionJs, /checksByScenario/, 'cycle protocol should remove checklist persistence');
assert.doesNotMatch(nutritionJs, /data-overeating-impulse/, 'cycle protocol should remove guilt-impulse chips');
assert.doesNotMatch(nutritionJs, /data-overeating-reaction/, 'cycle protocol should remove reaction chips');
assert.match(nutritionJs, /prefers-reduced-motion/, 'cycle protocol scrolling should respect reduced motion');
assert.match(css, /overeating-protocol/, 'shared CSS should style the cycle protocol');
assert.match(css, /overeating-protocol__flow/, 'cycle protocol should style collapsible flow state');
assert.match(css, /overeating-protocol__final/, 'cycle protocol should style fixed-plan state');
assert.match(css, /overeating-chip-list button\.is-active/, 'cycle protocol should style active chips');
assert.match(css, /overeating-choice-trail/, 'cycle protocol should style selected path chips');
assert.match(css, /overeating-next-checklist/, 'cycle protocol should style next-day checklist');
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
assert.equal(overeatingHarness.flow.hidden, false, 'diagnostic flow should start visible');
assert.equal(overeatingHarness.final.hidden, true, 'final fixed-plan state should start hidden');
assert.equal(overeatingHarness.startScreen.classList.contains('is-active'), true, 'start screen should be active on load');

overeatingHarness.start.onclick();
assert.equal(overeatingHarness.typeScreen.hidden, false, 'type screen should show after start action');
assert.equal(overeatingHarness.typeScreen.classList.contains('is-active'), true, 'type screen should become active after start action');

overeatingHarness.typeFastfood.onclick();
assert.equal(overeatingHarness.reasonScreen.hidden, false, 'reason screen should show after type selection');
assert.match(overeatingHarness.typeContext.textContent, /Фастфуд/, 'selected type context should render before reason choice');
assert.equal(overeatingHarness.store.ggc_material_overeating_cycle, undefined, 'type choice should not persist before completion');

overeatingHarness.reasonHunger.onclick();
assert.equal(overeatingHarness.planScreen.hidden, false, 'plan screen should show after reason selection');
assert.match(overeatingHarness.planTitle.textContent, /Фастфуд/, 'fastfood type should render a targeted plan title');
assert.match(overeatingHarness.planEvent.textContent, /соль/i, 'fastfood plan should explain likely body response');
assert.match(overeatingHarness.planReason.textContent, /долго не ела/i, 'selected reason should explain why it happened');
assert.match(overeatingHarness.planTomorrow.textContent, /обычный завтрак/i, 'plan should include tomorrow action');
assert.match(overeatingHarness.planAvoid.textContent, /не урезать/i, 'plan should include what not to do');
assert.match(overeatingHarness.planChoice.textContent, /Фастфуд.*Долго не ела|Долго не ела.*Фастфуд/s, 'plan step should show selected type and reason');

overeatingHarness.typeSweets.onclick();
overeatingHarness.reasonStress.onclick();
assert.match(overeatingHarness.planEvent.textContent, /быстрые углеводы/i, 'sweets type should render sweets-specific consequences');
overeatingHarness.typeNight.onclick();
overeatingHarness.reasonRestriction.onclick();
assert.match(overeatingHarness.planNow.textContent, /сон/i, 'night type should prioritize sleep');
overeatingHarness.typeVolume.onclick();
overeatingHarness.reasonAvailable.onclick();
assert.match(overeatingHarness.planBody.textContent, /объем/i, 'volume type should explain overeating volume');
overeatingHarness.typeDrinks.onclick();
overeatingHarness.reasonSocial.onclick();
assert.match(overeatingHarness.planEvent.textContent, /алкоголь|напит/i, 'drinks type should render drinks-specific consequences');

overeatingHarness.complete.onclick();
const completedState = JSON.parse(overeatingHarness.store.ggc_material_overeating_cycle);
assert.equal(completedState.completed, true, 'completion should persist completed flag');
assert.match(completedState.completedDate, /^\d{4}-\d{2}-\d{2}$/, 'completion should persist completion date');
assert.match(completedState.expiresDate, /^\d{4}-\d{2}-\d{2}$/, 'completion should persist expiration date');
assert.equal(completedState.bingeType, 'drinks', 'completion should persist selected binge type');
assert.equal(completedState.reason, 'social', 'completion should persist selected reason');
assert.match(completedState.chosenPlan, /Алкоголь|напит/i, 'completion should persist chosen plan text');
assert.deepEqual(completedState.checkedItems, [], 'completion should initialize empty checklist state');
assert.equal(overeatingHarness.flow.hidden, true, 'completion should collapse the choice flow');
assert.equal(overeatingHarness.final.hidden, false, 'completion should show final fixed-plan state');
assert.match(overeatingHarness.finalTitle.textContent, /План на завтра зафиксирован/, 'completion should render final title');
assert.match(overeatingHarness.finalType.textContent, /Алкоголь|напит/i, 'completion should render selected type in final state');
assert.match(overeatingHarness.finalReason.textContent, /за компанию/i, 'completion should render selected reason in final state');
assert.match(overeatingHarness.finalPlan.textContent, /обычный режим/i, 'completion should render chosen plan in final state');
assert.match(overeatingHarness.finalSupport.textContent, /не перечеркивает прогресс/i, 'completion should render anti-guilt support copy');
assert.match(overeatingHarness.finalBalance.textContent, /80.*20/s, 'completion should render 80/20 balance copy');
assert.match(overeatingHarness.finalChecklistIntro.textContent, /завтра/i, 'completion should render next-day checklist intro');
assert.match(overeatingHarness.checklistBreakfast.textContent, /завтрак/i, 'completion should render base checklist item');
assert.match(overeatingHarness.checklistScenarioOne.textContent, /вод|напит/i, 'completion should render scenario checklist item');
assert.equal(overeatingHarness.checklistBreakfast.checked, false, 'checklist should start unchecked');

 overeatingHarness.checklistBreakfast.checked = true;
 overeatingHarness.checklistBreakfast.onchange({ target: overeatingHarness.checklistBreakfast });
let checkedState = JSON.parse(overeatingHarness.store.ggc_material_overeating_cycle);
assert.deepEqual(checkedState.checkedItems, ['breakfast'], 'checking item should persist checklist state');
assert.equal(overeatingHarness.checklistBreakfast.checked, true, 'checking item should update local checkbox state');
 overeatingHarness.checklistBreakfast.checked = false;
 overeatingHarness.checklistBreakfast.onchange({ target: overeatingHarness.checklistBreakfast });
checkedState = JSON.parse(overeatingHarness.store.ggc_material_overeating_cycle);
assert.deepEqual(checkedState.checkedItems, [], 'unchecking item should remove it from checklist state');
assert.match(overeatingHarness.finalHint.textContent, /до конца завтрашнего дня/i, 'completion should render availability hint');

const now = new Date();
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-');
const tomorrowDate = new Date(now);
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrow = [
  tomorrowDate.getFullYear(),
  String(tomorrowDate.getMonth() + 1).padStart(2, '0'),
  String(tomorrowDate.getDate()).padStart(2, '0'),
].join('-');
const savedOvereatingHarness = createOvereatingProtocolHarness({
  completed: true,
  completedDate: today,
  expiresDate: tomorrow,
  bingeType: 'fastfood',
  reason: 'hunger',
  chosenPlan: 'Фастфуд: завтра обычный завтрак, вода и шаги. Не урезать еду и не отрабатывать',
  checkedItems: ['breakfast', 'scenario-one'],
});
assert.equal(savedOvereatingHarness.flow.hidden, true, 'completed today should show only final state on reload');
assert.equal(savedOvereatingHarness.final.hidden, false, 'completed today should keep final state visible on reload');
assert.match(savedOvereatingHarness.finalType.textContent, /Фастфуд/, 'completed today should restore selected binge type');
assert.match(savedOvereatingHarness.finalReason.textContent, /долго не ела/i, 'completed today should restore selected reason');
assert.match(savedOvereatingHarness.finalPlan.textContent, /обычный завтрак/, 'completed today should restore chosen plan text');
assert.equal(savedOvereatingHarness.checklistBreakfast.checked, true, 'completed today should restore checked base item');
assert.equal(savedOvereatingHarness.checklistScenarioOne.checked, true, 'completed today should restore checked scenario item');

savedOvereatingHarness.chooseAgain.onclick();
assert.equal(savedOvereatingHarness.store.ggc_material_overeating_cycle, undefined, 'choosing again should clear stored completion');
assert.equal(savedOvereatingHarness.flow.hidden, false, 'choosing again should return to the flow');
assert.equal(savedOvereatingHarness.final.hidden, true, 'choosing again should hide final state');

const nextDayAvailableHarness = createOvereatingProtocolHarness({
  completed: true,
  completedDate: '2000-01-01',
  expiresDate: tomorrow,
  bingeType: 'sweets',
  reason: 'restriction',
  chosenPlan: 'Сладкое: завтра обычный завтрак с белком и углеводами. Не запрещать углеводы',
  checkedItems: ['protein'],
});
assert.equal(nextDayAvailableHarness.flow.hidden, true, 'plan should stay available through expiration date');
assert.equal(nextDayAvailableHarness.final.hidden, false, 'plan should show final checklist through expiration date');
assert.match(nextDayAvailableHarness.finalType.textContent, /Сладкое/, 'available plan should restore selected type through expiration date');
assert.equal(nextDayAvailableHarness.checklistProtein.checked, true, 'available plan should restore checked item through expiration date');

const staleOvereatingHarness = createOvereatingProtocolHarness({
  completed: true,
  completedDate: '2000-01-01',
  expiresDate: '2000-01-02',
  bingeType: 'fastfood',
  reason: 'hunger',
  chosenPlan: 'Фастфуд: завтра обычный завтрак, вода и шаги. Не урезать еду и не отрабатывать',
  checkedItems: [],
});
assert.equal(staleOvereatingHarness.flow.hidden, false, 'stale completion should return to the flow');
assert.equal(staleOvereatingHarness.final.hidden, true, 'stale completion should not show final state');
assert.equal(staleOvereatingHarness.store.ggc_material_overeating_cycle, undefined, 'stale completion should be cleared from storage');

const legacyOvereatingHarness = createOvereatingProtocolHarness({
  impulse: 'weigh',
  completed: true,
  completedDate: today,
  chosenPlan: 'Вес завтра покажет задержку воды от углеводов и соли. Это не жир. Убери весы на 3 дня',
});
assert.equal(legacyOvereatingHarness.flow.hidden, false, 'legacy completion without new fields should return to the flow');
assert.equal(legacyOvereatingHarness.final.hidden, true, 'legacy completion without new fields should not show final state');
assert.equal(legacyOvereatingHarness.store.ggc_material_overeating_cycle, undefined, 'legacy completion without new fields should be cleared from storage');

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
