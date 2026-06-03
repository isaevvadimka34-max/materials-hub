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
  const element = {
    className: '',
    children: [],
    dataset: {},
    hidden: false,
    innerHTML: '',
    textContent: '',
    type: '',
    value: '',
    checked: false,
    open: false,
    append(...nodes) {
      this.children.push(...nodes);
      nodes.forEach((node, index) => {
        if (node?.dataset?.overeatingCheck && nodes[index + 1]?.textContent) {
          node.textContent = nodes[index + 1].textContent;
        }
      });
    },
    replaceChildren(...nodes) {
      this.children = [...nodes];
    },
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
  return element;
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
  const interactiveDisclosure = createElementStub();
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
  const backToStart = createElementStub();
  backToStart.dataset.overeatingBack = 'start';
  const backToType = createElementStub();
  backToType.dataset.overeatingBack = 'type';
  const backToReason = createElementStub();
  backToReason.dataset.overeatingBack = 'reason';
  const backToPlan = createElementStub();
  backToPlan.dataset.overeatingBack = 'plan';

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
  const finalChecklist = createElementStub();
  const finalChecklistIntro = createElementStub();
  finalChecklist.children = [finalChecklistIntro];

  function currentChecklistItems() {
    return finalChecklist.children
      .flatMap((child) => child.children || [])
      .filter((child) => child.dataset?.overeatingCheck);
  }

  const document = {
    documentElement: { clientHeight: 600 },
    addEventListener(event, callback) {
      if (event === 'DOMContentLoaded') domReady = callback;
    },
    createElement() {
      return createElementStub();
    },
    querySelector(selector) {
      const map = {
        '[data-overeating-protocol]': protocol,
        '[data-overeating-interactive-disclosure]': interactiveDisclosure,
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
        '[data-overeating-checklist]': finalChecklist,
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
      if (selector === '[data-overeating-check]') return currentChecklistItems();
      if (selector === '[data-overeating-back]') return [backToStart, backToType, backToReason, backToPlan];
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
    protocol,
    flow,
    interactiveDisclosure,
    final,
    start,
    complete,
    finalTitle,
    finalType,
    finalReason,
    finalPlan,
    chooseAgain,
    finalHint,
    backToStart,
    backToType,
    backToReason,
    backToPlan,
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
    finalChecklist,
    finalChecklistIntro,
    get checklistItems() {
      return currentChecklistItems();
    },
    store,
  };
}

for (const materialId of [
  'food-scanner',
  'overeating-cycle',
]) {
  assert.match(nutritionHtml, new RegExp(`data-material-card="${materialId}"`), `materials library should include ${materialId} card`);
  assert.match(nutritionHtml, new RegExp(`data-material-panel="${materialId}"`), `materials library should include ${materialId} panel`);
  assert.match(nutritionHtml, new RegExp(`#${materialId}`), `materials library should expose #${materialId} link`);
}

for (const materialId of [
  'swelling',
  'cellulite',
  'cycle-training',
  'supplements',
]) {
  assert.match(nutritionHtml, new RegExp(`data-material-card="${materialId}"[\\s\\S]*data-material-status="coming-soon"`), `materials library should mark ${materialId} as coming soon`);
  assert.match(nutritionHtml, new RegExp(`data-material-card="${materialId}"[\\s\\S]*Скоро`), `materials library should show a soon badge for ${materialId}`);
  assert.doesNotMatch(nutritionHtml, new RegExp(`href="#${materialId}"[\\s\\S]*data-material-card="${materialId}"`), `materials library should not expose #${materialId} link`);
}

assert.doesNotMatch(nutritionHtml, /data-material-card="daily-base"/, 'materials library should remove the daily base card');
assert.doesNotMatch(nutritionHtml, /href="#daily-base"/, 'materials library should remove the daily base link');
assert.match(nutritionJs, /comingSoonMaterialIds/, 'nutrition JS should define coming-soon materials');
assert.match(nutritionJs, /showLibrary\(\);[\s\S]*window\.history\.replaceState/, 'nutrition JS should return manual coming-soon hashes to the library');
assert.match(css, /material-card--coming-soon/, 'materials CSS should style coming-soon cards');

assert.match(nutritionHtml, /data-material-library/, 'nutrition guide should include the materials library view');
assert.match(nutritionHtml, /data-material-back/, 'nutrition guide should include a return to library action');
assert.match(nutritionHtml, /data-material-title/, 'nutrition guide should expose the active material title');
assert.doesNotMatch(nutritionHtml, /data-material-card="stress-overeating"/, 'materials guide should remove stress overeating card');
assert.doesNotMatch(nutritionHtml, /data-material-panel="stress-overeating"/, 'materials guide should remove stress overeating panel');
assert.doesNotMatch(nutritionHtml, /href="#stress-overeating"/, 'materials guide should remove stress overeating link');
assert.doesNotMatch(nutritionHtml, /Продукт — только часть картины/, 'materials guide should remove duplicated stress bridge');
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
assert.match(nutritionHtml, /data-overeating-checklist/, 'cycle protocol should include dynamic checklist container');
assert.doesNotMatch(nutritionHtml, /data-overeating-check="/, 'cycle protocol should render checklist items dynamically');
assert.match(nutritionHtml, /data-overeating-final-type/, 'cycle protocol should show chosen type in the final state');
assert.match(nutritionHtml, /data-overeating-final-reason/, 'cycle protocol should show chosen reason in the final state');
assert.match(nutritionHtml, /data-overeating-choose-again/, 'cycle protocol should allow choosing another option');
assert.match(nutritionHtml, /data-overeating-theory-disclosure/, 'cycle material should include collapsible theory panel');
assert.match(nutritionHtml, /Всё, что нужно знать про срывы/, 'cycle theory panel should have the approved title');
assert.match(nutritionHtml, /data-overeating-interactive-disclosure/, 'cycle material should include collapsible interactive panel');
assert.match(nutritionHtml, /Собери план после срыва/, 'cycle interactive panel should have the approved title');
assert.doesNotMatch(nutritionHtml, /data-overeating-cycle-exit-disclosure/, 'cycle material should remove the separate cycle-exit panel');
assert.doesNotMatch(nutritionHtml, /<strong>Выйти из цикла/, 'cycle material should remove the separate cycle-exit title');
assert.match(nutritionHtml, /Что делать после срыва/, 'cycle theory panel should introduce the recovery actions');
assert.match(nutritionHtml, /overeating-recovery-route/, 'cycle theory recovery actions should use a route layout');
assert.doesNotMatch(nutritionHtml, /overeating-practice-list/, 'cycle theory should replace the old practice card list');
assert.match(nutritionHtml, /data-overeating-theory-disclosure[\s\S]*Не уходить в чувство вины после срыва[\s\S]*data-overeating-interactive-disclosure/, 'cycle theory panel should address guilt after a slip');
assert.match(nutritionHtml, /data-overeating-theory-disclosure[\s\S]*Что делать на следующий день после переедания[\s\S]*data-overeating-interactive-disclosure/, 'cycle theory panel should address the next day after overeating');
assert.match(nutritionHtml, /data-overeating-theory-disclosure[\s\S]*Как вернуться в режим без жестких ограничений[\s\S]*data-overeating-interactive-disclosure/, 'cycle theory panel should address returning without hard restrictions');
assert.match(nutritionHtml, /data-overeating-theory-disclosure[\s\S]*Что делать, если сорвалась на сладкое[\s\S]*data-overeating-interactive-disclosure/, 'cycle theory panel should address sweets slips');
assert.match(nutritionHtml, /data-overeating-theory-disclosure[\s\S]*Как встроить сладкое без нового запрета[\s\S]*data-overeating-interactive-disclosure/, 'cycle theory panel should address fitting sweets into the plan');
assert.match(nutritionHtml, /План будет доступен до конца завтрашнего дня/, 'cycle protocol should explain checklist availability');
assert.doesNotMatch(nutritionHtml, /запретила → терпела → сорвалась → обвинила себя → снова запретила/, 'cycle material should remove the long old visual chain');
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
assert.match(css, /overeating-recovery-route[\s\S]*::before/, 'cycle theory route should draw a vertical guide line');
assert.match(css, /overeating-recovery-route__step[\s\S]*grid-template-columns/, 'cycle theory route steps should have a structured route layout');
assert.match(css, /@media \(max-width:\s*520px\)[\s\S]*\.overeating-protocol__final[\s\S]*text-align:\s*left/, 'cycle final screen should stay compact and left-aligned on mobile');
assert.match(css, /#overeating-cycle\s+\.material-panel__head[\s\S]*text-align:\s*center/, 'cycle material head should be centered on desktop');
assert.match(css, /\.overeating-disclosures[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/, 'cycle disclosure cards should use two columns on desktop');
assert.match(css, /@media \(max-width:\s*980px\)[\s\S]*\.overeating-disclosures[\s\S]*grid-template-columns:\s*1fr/, 'cycle disclosure cards should collapse to one column on tablet and mobile');
assert.match(css, /@media \(max-width:\s*640px\)[\s\S]*#overeating-cycle\s+\.material-panel__head[\s\S]*text-align:\s*left/, 'cycle material head should return to left alignment on mobile');
assert.match(css, /\.overeating-disclosure--interactive\[open\][\s\S]*justify-self:\s*center/, 'cycle interactive disclosure should center when open on desktop');
assert.match(css, /\.overeating-disclosure--interactive\[open\][\s\S]*max-width:\s*900px/, 'cycle interactive disclosure should keep a readable desktop width when open');
assert.match(nutritionJs, /backTop\?\.addEventListener\('click'/, 'back top control should use JS instead of hash navigation');
assert.match(nutritionJs, /event\.preventDefault\(\)/, 'back top control should not trigger hashchange to the library');
assert.match(css, /@media \(max-width:\s*640px\)[\s\S]*\.hub-lead[\s\S]*max-width:\s*100%/, 'materials hero lead should stay inside the mobile viewport');
assert.match(css, /@media \(max-width:\s*640px\)[\s\S]*\.material-reader__bar[\s\S]*grid-template-columns:\s*1fr/, 'material reader bar should stack inside the mobile viewport');
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
assert.match(overeatingHarness.finalTitle.textContent, /Чек-лист готов/, 'completion should render compact checklist-first title');
assert.match(overeatingHarness.finalType.textContent, /Алкоголь|напит/i, 'completion should render selected type in final state');
assert.match(overeatingHarness.finalReason.textContent, /за компанию/i, 'completion should render selected reason in final state');
assert.match(overeatingHarness.finalPlan.textContent, /Фокус плана/i, 'completion should render a compact plan focus');
assert.match(overeatingHarness.finalSupport.textContent, /Один срыв/i, 'completion should render short anti-guilt support copy');
assert.match(overeatingHarness.finalBalance.textContent, /80.*20/s, 'completion should keep compact 80/20 balance copy');
assert.match(overeatingHarness.finalChecklistIntro.textContent, /Мой чек-лист на завтра/i, 'completion should render checklist-first intro');
assert.equal(overeatingHarness.checklistItems.length, 6, 'completion should render six concrete checklist items');
assert.match(overeatingHarness.checklistItems.map((item) => item.textContent).join('\n'), /например|яйц|творог|куриц|рыб|йогурт|бобов|картоф|прогул/i, 'completion should render concrete checklist examples');
assert.equal(overeatingHarness.checklistItems[0].checked, false, 'checklist should start unchecked');

 overeatingHarness.checklistItems[0].checked = true;
 overeatingHarness.finalChecklist.onchange({ target: overeatingHarness.checklistItems[0] });
let checkedState = JSON.parse(overeatingHarness.store.ggc_material_overeating_cycle);
assert.deepEqual(checkedState.checkedItems, ['first-meal'], 'checking item should persist checklist state');
assert.equal(overeatingHarness.checklistItems[0].checked, true, 'checking item should update local checkbox state');
 overeatingHarness.checklistItems[0].checked = false;
 overeatingHarness.finalChecklist.onchange({ target: overeatingHarness.checklistItems[0] });
checkedState = JSON.parse(overeatingHarness.store.ggc_material_overeating_cycle);
assert.deepEqual(checkedState.checkedItems, [], 'unchecking item should remove it from checklist state');
assert.match(overeatingHarness.finalHint.textContent, /до конца завтрашнего дня/i, 'completion should render availability hint');

overeatingHarness.protocol.onclick({ target: overeatingHarness.backToPlan });
assert.equal(overeatingHarness.flow.hidden, false, 'back to plan should reopen the flow');
assert.equal(overeatingHarness.final.hidden, true, 'back to plan should hide final state');
assert.equal(overeatingHarness.planScreen.hidden, false, 'back to plan should show plan screen');
assert.equal(JSON.parse(overeatingHarness.store.ggc_material_overeating_cycle).completed, false, 'back to plan should remove completed lock from storage');

overeatingHarness.protocol.onclick({ target: overeatingHarness.backToReason });
assert.equal(overeatingHarness.reasonScreen.hidden, false, 'back to reason should show reason screen');
assert.equal(overeatingHarness.planScreen.classList.contains('is-active'), false, 'back to reason should deactivate plan screen');
assert.equal(JSON.parse(overeatingHarness.store.ggc_material_overeating_cycle).reason, '', 'back to reason should clear selected reason');

overeatingHarness.protocol.onclick({ target: overeatingHarness.backToType });
assert.equal(overeatingHarness.typeScreen.hidden, false, 'back to type should show type screen');
assert.equal(JSON.parse(overeatingHarness.store.ggc_material_overeating_cycle).reason, '', 'back to type should keep reason cleared');

overeatingHarness.protocol.onclick({ target: overeatingHarness.backToStart });
assert.equal(overeatingHarness.startScreen.hidden, false, 'back to start should show start screen');
assert.equal(overeatingHarness.store.ggc_material_overeating_cycle, undefined, 'back to start should clear stored scenario');

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
  checkedItems: ['first-meal', 'hydration'],
});
assert.equal(savedOvereatingHarness.flow.hidden, true, 'completed today should show only final state on reload');
assert.equal(savedOvereatingHarness.final.hidden, false, 'completed today should keep final state visible on reload');
assert.match(savedOvereatingHarness.finalType.textContent, /Фастфуд/, 'completed today should restore selected binge type');
assert.match(savedOvereatingHarness.finalReason.textContent, /долго не ела/i, 'completed today should restore selected reason');
assert.match(savedOvereatingHarness.finalPlan.textContent, /обычный завтрак/, 'completed today should restore chosen plan text');
assert.equal(savedOvereatingHarness.checklistItems[0].checked, true, 'completed today should restore checked first item');
assert.equal(savedOvereatingHarness.checklistItems[1].checked, true, 'completed today should restore checked hydration item');

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
  checkedItems: ['protein-carbs'],
});
assert.equal(nextDayAvailableHarness.flow.hidden, true, 'plan should stay available through expiration date');
assert.equal(nextDayAvailableHarness.final.hidden, false, 'plan should show final checklist through expiration date');
assert.match(nextDayAvailableHarness.finalType.textContent, /Сладкое/, 'available plan should restore selected type through expiration date');
assert.equal(nextDayAvailableHarness.checklistItems[2].checked, true, 'available plan should restore checked item through expiration date');

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

const overeatingTypeButtons = {
  fastfood: 'typeFastfood',
  sweets: 'typeSweets',
  night: 'typeNight',
  volume: 'typeVolume',
  drinks: 'typeDrinks',
};
const overeatingReasonButtons = {
  hunger: 'reasonHunger',
  stress: 'reasonStress',
  restriction: 'reasonRestriction',
  available: 'reasonAvailable',
  social: 'reasonSocial',
};
const vagueChecklistCopy = [
  /съесть обычный завтрак/i,
  /выпить воду и не пытаться сушиться/i,
  /добавить белок в 1-2 приема пищи/i,
  /сделать спокойную активность по самочувствию/i,
  /не взвешиваться и не компенсировать/i,
  /нормальные углеводы/i,
  /верни спокойный баланс/i,
];

for (const [type, typeButton] of Object.entries(overeatingTypeButtons)) {
  for (const [reason, reasonButton] of Object.entries(overeatingReasonButtons)) {
    const branchHarness = createOvereatingProtocolHarness();
    branchHarness[typeButton].onclick();
    branchHarness[reasonButton].onclick();
    branchHarness.complete.onclick();

    const visibleChecklistItems = branchHarness.checklistItems
      .filter((item) => !item.hidden)
      .map((item) => item.textContent.trim())
      .filter(Boolean);
    const checklistCopy = visibleChecklistItems.join('\n');

    assert.ok(
      visibleChecklistItems.length >= 5 && visibleChecklistItems.length <= 6,
      `${type}/${reason} should render 5-6 concrete checklist items, got ${visibleChecklistItems.length}`,
    );
    assert.match(checklistCopy, /например|яйц|творог|куриц|рыб|йогурт|бобов|каша|рис|картоф|хлеб|фрукт|прогул|растяж/i, `${type}/${reason} should include concrete examples`);
    for (const vagueCopy of vagueChecklistCopy) {
      assert.doesNotMatch(checklistCopy, vagueCopy, `${type}/${reason} should avoid vague checklist copy`);
    }
  }
}

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
assert.match(nutritionHtml, /Назад к материалам/, 'material back action should use a clearer back label');
assert.match(css, /\.material-reader__back[\s\S]*background:\s*var\(--dusty-rose\)/, 'material back action should use a rose pill');
assert.match(css, /@media \(max-width:\s*640px\)[\s\S]*\.material-reader__back span:last-child[\s\S]*text-overflow:\s*ellipsis/, 'material back action should compact on mobile');
assert.ok(!fs.existsSync(path.join(root, 'free-mini.html')), 'mini collection should be removed from the main project');

console.log('material guide checks passed');
