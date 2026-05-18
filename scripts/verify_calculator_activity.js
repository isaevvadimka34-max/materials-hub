'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const calculatorHtml = fs.readFileSync(path.join(root, 'calculator.html'), 'utf8');
const calculatorJs = fs.readFileSync(path.join(root, 'assets/js/calculator.js'), 'utf8');

assert.match(calculatorHtml, /name="steps"/, 'calculator form should ask for daily steps');
assert.match(calculatorHtml, /name="workouts"/, 'calculator form should ask for weekly workouts');
assert.doesNotMatch(calculatorHtml, /name="activity"/, 'legacy activity select should be replaced');
assert.match(calculatorHtml, /14 дней/, 'calculator should explain the two-week correction window');

let domReadyCallback;
const sandbox = {
  document: {
    addEventListener(eventName, callback) {
      if (eventName === 'DOMContentLoaded') domReadyCallback = callback;
    },
    querySelector() {
      return null;
    },
  },
  window: {
    __calculatorTestHooks: {},
  },
};

vm.createContext(sandbox);
vm.runInContext(calculatorJs, sandbox);
assert.equal(typeof domReadyCallback, 'function', 'calculator should register DOMContentLoaded');

domReadyCallback();

const hooks = sandbox.window.__calculatorTestHooks;
assert.equal(typeof hooks?.calculateActivityFactor, 'function', 'activity factor helper should be testable');
assert.equal(hooks.calculateActivityFactor({ steps: 'under4000', workouts: '0' }), 1.2);
assert.equal(hooks.calculateActivityFactor({ steps: '7000-10000', workouts: '3-4' }), 1.55);
assert.equal(hooks.calculateActivityFactor({ steps: '10000plus', workouts: '5-6' }), 1.73);
assert.equal(hooks.calculateActivityFactor({ steps: 'old-value', workouts: 'old-value' }), 1.2);

console.log('calculator activity checks passed');
