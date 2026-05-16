'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const data = window.MATERIALS_DATA || { recipes: [], bonus: {} };
  const recipes = data.recipes || [];
  const bonus = data.bonus || {};

  const storageKey = 'ggc-materials-status-v1';
  const shoppingKey = 'ggc-materials-shopping-v2';

  const categories = [
    { id: 'breakfast', title: 'Завтраки', all: 'Все завтраки' },
    { id: 'lunch', title: 'Обеды', all: 'Все обеды' },
    { id: 'snack', title: 'Перекусы', all: 'Все перекусы' },
    { id: 'dinner', title: 'Ужины', all: 'Все ужины' },
    { id: 'dessert', title: 'Десерты', all: 'Все десерты' },
  ];

  const subcategoriesByCategory = {
    breakfast: [
      { label: 'Быстро', tag: 'быстро' },
      { label: 'Больше белка', tag: 'больше белка' },
      { label: 'Сытно', tag: 'сытно' },
      { label: 'Можно заранее', tag: 'можно заранее' },
      { label: 'Больше углеводов', tag: 'больше углеводов' },
    ],
    lunch: [
      { label: 'Больше белка', tag: 'больше белка' },
      { label: 'Сытно', tag: 'сытно' },
      { label: 'Быстро', tag: 'быстро' },
      { label: 'Можно заранее', tag: 'можно заранее' },
      { label: 'Больше углеводов', tag: 'больше углеводов' },
    ],
    snack: [
      { label: 'Быстро', tag: 'быстро' },
      { label: 'Легкий перекус', tag: 'легкий вариант' },
      { label: 'Можно заранее', tag: 'можно заранее' },
    ],
    dinner: [
      { label: 'Больше белка', tag: 'больше белка' },
      { label: 'Сытно', tag: 'сытно' },
      { label: 'Быстро', tag: 'быстро' },
      { label: 'Можно заранее', tag: 'можно заранее' },
      { label: 'Легче по калориям', tag: 'легче по калориям' },
    ],
    dessert: [
      { label: 'Сладкое', tag: 'сладкое' },
      { label: 'Быстро', tag: 'быстро' },
      { label: 'Можно заранее', tag: 'можно заранее' },
      { label: 'Легче по калориям', tag: 'легкий вариант' },
    ],
  };

  const state = {
    statusFilter: '',
    tagFilters: {},
    statuses: readJson(storageKey, {}),
    shopping: readJson(shoppingKey, {}),
  };

  const els = {
    categoryFilters: document.querySelector('[data-category-filters]'),
    resultCount: document.querySelector('[data-result-count]'),
    recipeList: document.querySelector('[data-recipes-list]'),
    resetFilters: document.querySelector('[data-reset-filters]'),
    statusFilters: document.querySelectorAll('[data-status-filter]'),
    statusCounts: document.querySelectorAll('[data-status-count]'),
    shoppingCounts: document.querySelectorAll('[data-shopping-count]'),
    replacements: document.querySelector('[data-replacements]'),
    sauces: document.querySelector('[data-sauces]'),
    boosters: document.querySelector('[data-boosters]'),
    statusMessage: document.querySelector('[data-status-message]'),
    recipeModal: document.querySelector('[data-recipe-modal]'),
    recipeModalContent: document.querySelector('[data-recipe-modal-content]'),
  };

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function text(value) {
    return String(value || '');
  }

  function statusFor(id) {
    return state.statuses[id] || {};
  }

  function shoppingState() {
    const value = state.shopping || {};
    return {
      recipes: value.recipes && typeof value.recipes === 'object' ? value.recipes : {},
      checked: value.checked && typeof value.checked === 'object' ? value.checked : {},
    };
  }

  function writeShopping(next) {
    state.shopping = next;
    writeJson(shoppingKey, state.shopping);
    renderShopping();
  }

  function isInShopping(id) {
    return Boolean(shoppingState().recipes[id]);
  }

  function statusCount(name) {
    return recipes.reduce((count, recipe) => count + (statusFor(recipe.id)[name] ? 1 : 0), 0);
  }

  function plural(count, words) {
    const lastTwo = count % 100;
    const last = count % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return words[2];
    if (last === 1) return words[0];
    if (last >= 2 && last <= 4) return words[1];
    return words[2];
  }

  function toggleRecipeStatus(id, name) {
    const current = statusFor(id);
    const nextValue = !current[name];
    const recipe = recipes.find((item) => item.id === id);

    state.statuses[id] = {
      ...current,
      [name]: nextValue,
    };

    writeJson(storageKey, state.statuses);
    renderRecipes();
    renderShopping();
    showStatusMessage(recipe, name, nextValue);
  }

  function toggleShoppingRecipe(id) {
    const recipe = recipes.find((item) => item.id === id);
    const current = shoppingState();
    const nextValue = !current.recipes[id];
    current.recipes[id] = nextValue;
    writeShopping(current);
    renderRecipes();

    if (els.statusMessage && recipe) {
      els.statusMessage.textContent = `${nextValue ? 'Добавлено в корзину' : 'Убрано из корзины'}: ${recipe.title}`;
    }
  }

  function markRecipeCooked(id) {
    const current = statusFor(id);
    const recipe = recipes.find((item) => item.id === id);

    state.statuses[id] = {
      ...current,
      want: false,
      cooked: true,
    };

    writeJson(storageKey, state.statuses);
    renderRecipes();
    if (els.statusMessage && recipe) {
      els.statusMessage.textContent = `Приготовлено: ${recipe.title}`;
    }
  }

  function showStatusMessage(recipe, name, isActive) {
    if (!els.statusMessage || !recipe) return;

    const action = name === 'want'
      ? (isActive ? 'Добавлено в «Хочу попробовать»' : 'Убрано из «Хочу попробовать»')
      : (isActive ? 'Добавлено в «Приготовлено»' : 'Убрано из «Приготовлено»');

    els.statusMessage.textContent = `${action}: ${recipe.title}`;
  }

  function renderCategoryFilters() {
    const categoryLinks = categories.map((category) => (
      `<a class="chip chip--jump" href="#recipes-${category.id}" data-jump-category="${category.id}">${category.title}</a>`
    )).join('');

    els.categoryFilters.innerHTML = `${categoryLinks}<a class="chip chip--jump" href="#bonus" data-jump-category="bonus">Бонусы</a>`;
  }

  function categoryRecipes(categoryId) {
    return recipes.filter((recipe) => recipe.category.id === categoryId);
  }

  function availableSubcategories(categoryId) {
    const list = categoryRecipes(categoryId);
    return (subcategoriesByCategory[categoryId] || [])
      .map((item) => ({
        ...item,
        count: list.filter((recipe) => {
          const statuses = statusFor(recipe.id);
          return recipe.tags.includes(item.tag) && (!state.statusFilter || statuses[state.statusFilter]);
        }).length,
      }))
      .filter((item) => item.count > 0);
  }

  function recipeMatches(recipe) {
    const statuses = statusFor(recipe.id);
    const tagFilter = state.tagFilters[recipe.category.id];

    if (state.statusFilter && !statuses[state.statusFilter]) {
      return false;
    }

    if (tagFilter && !recipe.tags.includes(tagFilter)) {
      return false;
    }

    return true;
  }

  function recipeIndexRow(recipe, index) {
    const statuses = statusFor(recipe.id);
    const rowStatusClass = `${statuses.cooked ? 'is-cooked' : ''} ${statuses.want ? 'is-want' : ''}`.trim();
    const inShopping = isInShopping(recipe.id);
    const cookedAction = state.statusFilter === 'want'
      ? `<button class="mark-cooked-button" type="button" data-mark-cooked="${recipe.id}">Приготовила</button>`
      : '';

    return `
      <div class="recipe-index__item ${rowStatusClass}">
        <button class="recipe-index__open" type="button" data-open-recipe="${recipe.id}">
          <span>${index + 1}</span>
          <strong>${recipe.title}</strong>
        </button>
        <div class="recipe-card-actions" aria-label="Быстрые отметки рецепта">
          <button class="status-icon ${statuses.want ? 'is-active' : ''}" type="button" data-status="${recipe.id}:want" aria-label="Хочу попробовать: ${recipe.title}" title="Хочу попробовать">♥</button>
          <button class="status-icon status-icon--shopping ${inShopping ? 'is-active' : ''}" type="button" data-shopping-recipe="${recipe.id}" aria-label="В корзину: ${recipe.title}" title="В корзину">🛒</button>
          ${cookedAction}
        </div>
      </div>
    `;
  }

  function recipeDetails(recipe) {
    const kbju = recipe.kbju;
    const tagHtml = recipe.tags.map((tag) => `<span class="tag">${tag}</span>`).join('');
    const steps = recipe.steps.map((step) => `<li>${step}</li>`).join('');

    return `
      <header class="recipe-modal__head">
        <div>
          <span class="recipe-category">${recipe.category.title}</span>
          <h3 id="recipe-modal-title">${recipe.title}</h3>
        </div>
        <button class="recipe-modal__close" type="button" data-close-recipe aria-label="Закрыть рецепт">×</button>
      </header>
      <div class="recipe-modal__body">
        <div class="recipe-tags">${tagHtml}</div>
        <div class="recipe-meta recipe-modal__meta">
          <span class="recipe-pill">${recipe.time}</span>
          <span class="recipe-pill">${kbju.kcal} ккал</span>
          <span class="recipe-pill">Белки ${kbju.protein}</span>
          <span class="recipe-pill">Жиры ${kbju.fat}</span>
          <span class="recipe-pill">Углеводы ${kbju.carbs}</span>
        </div>
        <div class="recipe-block">
          <h4>Ингредиенты</h4>
          <p>${recipe.ingredients}</p>
        </div>
        <div class="recipe-block">
          <h4>Приготовление</h4>
          <ol>${steps}</ol>
        </div>
        ${recipe.note ? `<div class="recipe-note"><strong>Чем хорош рецепт:</strong> ${recipe.note}</div>` : ''}
      </div>
      <footer class="recipe-modal__footer">
        <button class="button button--primary" type="button" data-close-recipe>Закрыть</button>
      </footer>
    `;
  }

  function openRecipeModal(id) {
    const recipe = recipes.find((item) => item.id === id);
    if (!recipe || !els.recipeModal || !els.recipeModalContent) return;

    els.recipeModalContent.innerHTML = recipeDetails(recipe);
    els.recipeModal.hidden = false;
    document.body.classList.add('is-modal-open');
    els.recipeModal.querySelector('.recipe-modal__close')?.focus();
  }

  function closeRecipeModal() {
    if (!els.recipeModal || !els.recipeModalContent) return;

    els.recipeModal.hidden = true;
    els.recipeModalContent.innerHTML = '';
    document.body.classList.remove('is-modal-open');
  }

  function renderSubcategoryChips(category) {
    const active = state.tagFilters[category.id] || '';
    const items = availableSubcategories(category.id);
    const allCount = categoryRecipes(category.id).filter((recipe) => {
      const statuses = statusFor(recipe.id);
      return !state.statusFilter || statuses[state.statusFilter];
    }).length;

    return `
      <div class="section-chips" aria-label="${category.title}">
        <button class="chip ${!active ? 'is-active' : ''}" type="button" data-tag-filter="${category.id}:">${category.all} <span>${allCount}</span></button>
        ${items.map((item) => (
          `<button class="chip ${active === item.tag ? 'is-active' : ''}" type="button" data-tag-filter="${category.id}:${item.tag}">${item.label} <span>${item.count}</span></button>`
        )).join('')}
      </div>
    `;
  }

  function renderRecipeIndex(category, visible) {
    if (!visible.length) return '';

    return `
      <div class="recipe-index" aria-label="Список блюд: ${category.title}">
        ${visible.map((recipe, index) => recipeIndexRow(recipe, index)).join('')}
      </div>
    `;
  }

  function renderRecipeSection(category) {
    const visible = categoryRecipes(category.id).filter(recipeMatches);

    return `
      <section class="recipe-section" id="recipes-${category.id}" aria-labelledby="recipes-${category.id}-title">
        <div class="recipe-section__head">
          <div>
            <span class="recipe-section__count">${visible.length} ${plural(visible.length, ['рецепт', 'рецепта', 'рецептов'])}</span>
            <h3 id="recipes-${category.id}-title">${category.title}</h3>
          </div>
          <a href="#recipes" class="recipe-section__top">К началу</a>
        </div>
        ${renderSubcategoryChips(category)}
        ${visible.length ? renderRecipeIndex(category, visible) : '<div class="empty-state">Пока нет блюд в этом разделе</div>'}
      </section>
    `;
  }

  function renderRecipes() {
    const visibleCount = recipes.filter(recipeMatches).length;

    renderCategoryFilters();

    document.querySelectorAll('[data-status-filter]').forEach((button) => {
      button.classList.toggle('is-active', state.statusFilter === button.dataset.statusFilter);
    });

    els.statusCounts.forEach((item) => {
      item.textContent = statusCount(item.dataset.statusCount);
    });

    els.resultCount.textContent = `${visibleCount} ${plural(visibleCount, ['рецепт', 'рецепта', 'рецептов'])}`;
    els.recipeList.innerHTML = categories.map((category) => renderRecipeSection(category)).join('');
  }

  function renderBonus() {
    const replacements = bonus.replacements || [];
    const sauces = bonus.sauces || [];

    if (els.replacements) {
      els.replacements.innerHTML = replacements.length
        ? replacements.map((item) => `
          <div class="replace-row">
            <strong>Нет: ${item.from}</strong>
            <span class="replace-arrow">Можно взять</span>
            <span>${item.to}</span>
          </div>
        `).join('')
        : '<p>Таблица замен не распознана</p>';
    }

    if (els.sauces) {
      els.sauces.innerHTML = sauces.length
        ? sauces.map((item) => {
          const title = item.title.replace(/^[^А-Яа-яA-Za-z0-9]+\s*/, '');
          const parts = item.body.split('Идеально к:');
          const ingredients = (parts[0] || '').split('•').map((part) => part.trim()).filter(Boolean);
          const pairs = text(parts[1]).trim();

          return `
            <div class="sauce-row">
              <strong>${title}</strong>
              <ul>${ingredients.map((ingredient) => `<li>${ingredient}</li>`).join('')}</ul>
              ${pairs ? `<span class="sauce-pair">К чему: ${pairs}</span>` : ''}
            </div>
          `;
        }).join('')
        : '<p>Соусы не распознаны</p>';
    }

    if (els.boosters) {
      const boosters = [
        { title: 'Добавить белок', body: 'яйцо, творог, курица, тунец или греческий йогурт' },
        { title: 'Добавить овощи', body: 'огурцы, томаты, зелень, брокколи или замороженная смесь' },
        { title: 'Добавить углеводы', body: 'хлебцы, рис, гречка, булгур или цельнозерновой хлеб' },
        { title: 'Сделать вкуснее', body: 'быстрый соус, лимонный сок, чеснок, зелень или специи' },
      ];

      els.boosters.innerHTML = boosters.map((item) => `
        <div class="booster-row">
          <strong>${item.title}</strong>
          <span>${item.body}</span>
        </div>
      `).join('');
    }
  }

  function baseBasket() {
    const selected = shoppingState().recipes;
    return recipes.filter((recipe) => selected[recipe.id]);
  }

  function splitIngredients(value) {
    const result = [];
    let current = '';
    let depth = 0;

    text(value).split('').forEach((char) => {
      if (char === '(') depth += 1;
      if (char === ')' && depth > 0) depth -= 1;

      if ((char === ',' || char === ';' || char === '•') && depth === 0) {
        if (current.trim()) result.push(current.trim());
        current = '';
        return;
      }

      current += char;
    });

    if (current.trim()) result.push(current.trim());
    return result;
  }

  function shoppingGroups() {
    return baseBasket().map((recipe) => ({
      recipe,
      ingredients: splitIngredients(recipe.ingredients),
    })).filter((group) => group.ingredients.length);
  }

  function renderShopping() {
    const groups = shoppingGroups();
    els.shoppingCounts.forEach((item) => {
      item.textContent = groups.length;
    });
  }

  function shoppingContent() {
    const groups = shoppingGroups();
    const checkedItems = shoppingState().checked;

    if (!groups.length) {
      return '<div class="empty-state">Добавь блюда кнопкой +, и здесь появится список покупок</div>';
    }

    return groups.map((group) => `
      <article class="shopping-recipe">
        <h3>${group.recipe.title}</h3>
        ${group.ingredients.map((item, index) => {
      const key = `${group.recipe.id}:${item}`;
      const id = `shop-${group.recipe.id}-${index}`;
      const checked = Boolean(checkedItems[key]);
      return `
        <div class="shopping-item ${checked ? 'is-checked' : ''}">
          <label for="${id}">
            <input id="${id}" type="checkbox" ${checked ? 'checked' : ''} data-shopping-item="${key}">
            <span>${item}</span>
          </label>
        </div>
      `;
    }).join('')}
      </article>
    `).join('');
  }

  function openShoppingModal() {
    if (!els.recipeModal || !els.recipeModalContent) return;

    els.recipeModalContent.innerHTML = `
      <header class="recipe-modal__head">
        <div>
          <span class="recipe-category">Мои списки</span>
          <h3 id="recipe-modal-title">Моя продуктовая корзина</h3>
        </div>
        <button class="recipe-modal__close" type="button" data-close-recipe aria-label="Закрыть корзину">×</button>
      </header>
      <div class="recipe-modal__body">
        <p class="shopping-hint">Добавь блюда кнопкой корзины, и здесь появится список покупок</p>
        <div class="shopping-list shopping-list--modal" data-shopping-list>${shoppingContent()}</div>
      </div>
    `;
    els.recipeModal.hidden = false;
    document.body.classList.add('is-modal-open');
    els.recipeModal.querySelector('.recipe-modal__close')?.focus();
  }

  els.categoryFilters.addEventListener('click', (event) => {
    const link = event.target.closest('[data-jump-category]');
    if (!link) return;

    document.querySelector(link.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
  });

  document.addEventListener('click', (event) => {
    const closeRecipe = event.target.closest('[data-close-recipe]');
    if (closeRecipe) {
      closeRecipeModal();
      return;
    }

    const openRecipe = event.target.closest('[data-open-recipe]');
    if (openRecipe) {
      openRecipeModal(openRecipe.dataset.openRecipe);
      return;
    }

    const status = event.target.closest('[data-status]');
    if (status) {
      event.preventDefault();
      const [id, name] = status.dataset.status.split(':');
      toggleRecipeStatus(id, name);
      return;
    }

    const shoppingRecipe = event.target.closest('[data-shopping-recipe]');
    if (shoppingRecipe) {
      event.preventDefault();
      toggleShoppingRecipe(shoppingRecipe.dataset.shoppingRecipe);
      return;
    }

    const markCooked = event.target.closest('[data-mark-cooked]');
    if (markCooked) {
      event.preventDefault();
      markRecipeCooked(markCooked.dataset.markCooked);
      return;
    }

    const openShopping = event.target.closest('[data-open-shopping]');
    if (openShopping) {
      openShoppingModal();
      return;
    }

    const statusFilter = event.target.closest('[data-status-filter]');
    if (statusFilter) {
      const nextFilter = statusFilter.dataset.statusFilter;
      state.statusFilter = state.statusFilter === nextFilter ? '' : nextFilter;
      renderRecipes();
      return;
    }

    const tagFilter = event.target.closest('[data-tag-filter]');
    if (tagFilter) {
      const [categoryId, tag] = tagFilter.dataset.tagFilter.split(':');
      state.tagFilters[categoryId] = tag;
      renderRecipes();
      return;
    }

  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && els.recipeModal && !els.recipeModal.hidden) {
      closeRecipeModal();
    }
  });

  els.resetFilters.addEventListener('click', () => {
    state.statusFilter = '';
    state.tagFilters = {};
    renderRecipes();
    document.querySelector('#recipes')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.addEventListener('change', (event) => {
    const checkbox = event.target.closest('[data-shopping-item]');
    if (!checkbox) return;
    const current = shoppingState();
    current.checked[checkbox.dataset.shoppingItem] = checkbox.checked;
    writeShopping(current);
    checkbox.closest('.shopping-item')?.classList.toggle('is-checked', checkbox.checked);
  });

  renderBonus();
  renderShopping();
  renderRecipes();
});
