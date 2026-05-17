'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const mainJs = fs.readFileSync(path.join(root, 'assets/js/materials.js'), 'utf8');
const miniHtml = fs.readFileSync(path.join(root, 'free-mini.html'), 'utf8');

assert.match(
  mainJs,
  /data-status="\$\{recipe\.id\}:want"/,
  'main recipe modal should include a want/favorite button',
);
assert.match(
  mainJs,
  /recipe-modal__actions/,
  'main recipe modal should group recipe actions in the header',
);
assert.match(
  mainJs,
  /syncModalStatusButtons\(id, name\)/,
  'modal status button should update without closing the recipe',
);
assert.doesNotMatch(
  miniHtml,
  /recipe-modal__actions/,
  'mini collection should not be changed by this feature',
);

console.log('recipe modal favorite checks passed');
