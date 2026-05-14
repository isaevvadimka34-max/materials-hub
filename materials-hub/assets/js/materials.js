'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const data = window.MATERIALS_DATA || { recipes: [], bonus: {} };
  const recipes = data.recipes || [];
  const bonus = data.bonus || {};

  const storageKey = 'ggc-materials-status-v1';
  const shoppingKey = 'ggc-materials-shopping-v1';

  const categoryTitles = {
    all: 'Все',
    breakfast: 'Завтраки',
    lunch: 'Обеды',
    snack: 'Перекусы',
    dinner: 'Ужины',
    dessert: 'Десерты',
  };

  const collections = [
    {
      title: 'Быстро до 15 минут',
      desc: 'Для дней, когда нужно без долгой готовки.',
      tag: 'до 15 минут',
    },
    {
      title: 'Больше белка',
      desc: 'Рецепты, где заявлено от 30 г белка.',
      tag: 'больше белка',
    },
    {
      title: 'Когда хочется сладкого',
      desc: 'Десерты из текущего сборника.',
      tag: 'когда хочется сладкого',
    },
    {
      title: 'Можно заранее',
      desc: 'Подборка по словам в рецепте: запекание, ночь, холодильник, маффины и похожие сценарии.',
      tag: 'можно заранее',
    },
  ];

  const state = {
    query: '',
    category: 'all',
    statusFilter: '',
    tagFilter: '',
    statuses: readJson(storageKey, {}),
    shopping: readJson(shoppingKey, {}),
  };

  const els = {
    search: document.querySelector('[data-search]'),
    categoryFilters: document.querySelector('[data-category-filters]'),
    resultCount: document.querySelector('[data-result-count]'),
    recipeList: document.querySelector('[data-recipes-list]'),
    resetFilters: document.querySelector('[data-reset-filters]'),
    statusFilters: document.querySelectorAll('[data-status-filter]'),
    collections: document.querySelector('[data-collections]'),
    replacements: document.querySelector('[data-replacements]'),
    sauces: document.querySelector('[data-sauces]'),
    shoppingList: document.querySelector('[data-shopping-list]'),
    copyShopping: document.querySelector('[data-copy-shopping]'),
    resetShopping: document.querySelector('[data-reset-shopping]'),
    copyStatus: document.querySelector('[data-copy-status]'),
    totalRecipes: document.querySelector('[data-total-recipes]'),
    cookedCount: document.querySelector('[data-cooked-count]'),
    progressCooked: document.querySelector('[data-progress-cooked]'),
    progressFavorite: document.querySelector('[data-progress-favorite]'),
    progressWant: document.querySelector('[data-progress-want]'),
    auditShort: document.querySelector('[data-audit-short]'),
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

  function toggleRecipeStatus(id, name) {
    const current = statusFor(id);
    state.statuses[id] = {
      ...current,
      [name]: !current[name],
    };
    writeJson(storageKey, state.statuses);
    renderRecipes();
    renderProgress();
  }

  function categoryList() {
    return ['all', ...Array.from(new Set(recipes.map((recipe) => recipe.category.id)))];
  }

  function renderCategoryFilters() {
    els.categoryFilters.innerHTML = categoryList().map((id) => (
      `<button class="chip ${state.category === id ? 'is-active' : ''}" type="button" data-category="${id}">${categoryTitles[id] || id}</button>`
    )).join('');
  }

  function recipeMatches(recipe) {
    const query = state.query.trim().toLowerCase();
    const statuses = statusFor(recipe.id);

    if (state.category !== 'all' && recipe.category.id !== state.category) {
      return false;
    }

    if (state.statusFilter && !statuses[state.statusFilter]) {
      return false;
    }

    if (state.tagFilter && !recipe.tags.includes(state.tagFilter)) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      recipe.title,
      recipe.ingredients,
      recipe.category.title,
      recipe.tags.join(' '),
    ].join(' ').toLowerCase().includes(query);
  }

  function auditLabel(audit) {
    if (!audit) {
      return 'Аудит не выполнен';
    }

    if (audit.status === 'ok') {
      return `КБЖУ согласовано: разница ${audit.kcalDiff || 0} ккал`;
    }

    if (audit.status === 'minor_review') {
      return `Нужна быстрая проверка: ${audit.issues.join('; ')}`;
    }

    return `Ручная проверка: ${audit.issues.join('; ')}`;
  }

  function recipeCard(recipe) {
    const statuses = statusFor(recipe.id);
    const kbju = recipe.kbju;
    const tagHtml = recipe.tags.map((tag) => `<span class="tag">${tag}</span>`).join('');
    const steps = recipe.steps.map((step) => `<li>${step}</li>`).join('');

    return `
      <article class="recipe-card" id="recipe-${recipe.id}" data-recipe-card="${recipe.id}">
        <button class="recipe-summary" type="button" data-toggle-recipe="${recipe.id}" aria-expanded="false">
          <span>
            <span class="recipe-category">${recipe.category.title}</span>
            <h3 class="recipe-title">${recipe.title}</h3>
            <span class="recipe-meta">
              <span class="recipe-pill">${recipe.time}</span>
              <span class="recipe-pill">${kbju.kcal} ккал</span>
              <span class="recipe-pill">Б ${kbju.protein} / Ж ${kbju.fat} / У ${kbju.carbs}</span>
            </span>
          </span>
          <span class="recipe-open" aria-hidden="true">+</span>
        </button>
        <div class="recipe-details">
          <div class="recipe-tags">${tagHtml}</div>
          <div class="recipe-actions" aria-label="Отметки рецепта">
            <button class="status-button ${statuses.favorite ? 'is-active' : ''}" type="button" data-status="${recipe.id}:favorite">В избранное</button>
            <button class="status-button ${statuses.cooked ? 'is-active' : ''}" type="button" data-status="${recipe.id}:cooked">Приготовлено</button>
            <button class="status-button ${statuses.want ? 'is-active' : ''}" type="button" data-status="${recipe.id}:want">Хочу попробовать</button>
          </div>
          <div class="recipe-block">
            <h4>Ингредиенты</h4>
            <p>${recipe.ingredients}</p>
          </div>
          <div class="recipe-block">
            <h4>Приготовление</h4>
            <ol>${steps}</ol>
          </div>
          ${recipe.note ? `<div class="recipe-note"><strong>Заметка:</strong> ${recipe.note}</div>` : ''}
          <div class="recipe-audit" data-status="${recipe.audit.status}">
            <strong>Аудит:</strong> ${auditLabel(recipe.audit)}
          </div>
        </div>
      </article>
    `;
  }

  function renderRecipes() {
    renderCategoryFilters();

    document.querySelectorAll('[data-status-filter]').forEach((button) => {
      button.classList.toggle('is-active', state.statusFilter === button.dataset.statusFilter);
    });

    const visible = recipes.filter(recipeMatches);
    els.resultCount.textContent = `${visible.length} ${plural(visible.length, ['рецепт', 'рецепта', 'рецептов'])}`;
    els.recipeList.innerHTML = visible.length
      ? visible.map(recipeCard).join('')
      : '<div class="empty-state">Ничего не найдено. Попробуй сбросить фильтры или изменить поиск.</div>';
  }

  function plural(count, words) {
    const lastTwo = count % 100;
    const last = count % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return words[2];
    if (last === 1) return words[0];
    if (last >= 2 && last <= 4) return words[1];
    return words[2];
  }

  function renderCollections() {
    els.collections.innerHTML = collections.map((item) => {
      const count = recipes.filter((recipe) => recipe.tags.includes(item.tag)).length;
      return `
        <article class="collection-card">
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
          <span class="recipe-pill">${count} ${plural(count, ['рецепт', 'рецепта', 'рецептов'])}</span>
          <button class="button button--small" type="button" data-collection="${item.tag}">Показать</button>
        </article>
      `;
    }).join('');
  }

  function renderBonus() {
    const replacements = bonus.replacements || [];
    const sauces = bonus.sauces || [];

    els.replacements.innerHTML = replacements.length
      ? replacements.map((item) => `<div class="replace-row"><strong>${item.from}</strong><span>${item.to}</span></div>`).join('')
      : '<p>Таблица замен не распознана.</p>';

    els.sauces.innerHTML = sauces.length
      ? sauces.map((item) => `<div class="sauce-row"><strong>${item.title}</strong><span>${item.body}</span></div>`).join('')
      : '<p>Соусы не распознаны.</p>';
  }

  function baseBasket() {
    const fromSource = bonus.basketItems || [];
    if (fromSource.length) {
      return fromSource;
    }

    return [
      'Яйца',
      'Творог',
      'Греческий йогурт',
      'Курица',
      'Рыба',
      'Крупы',
      'Овощи',
      'Фрукты',
      'Цельнозерновой хлеб',
      'Специи',
    ];
  }

  function renderShopping() {
    els.shoppingList.innerHTML = baseBasket().map((item, index) => {
      const id = `shop-${index}`;
      const checked = Boolean(state.shopping[item]);
      return `
        <div class="shopping-item ${checked ? 'is-checked' : ''}">
          <label for="${id}">
            <input id="${id}" type="checkbox" ${checked ? 'checked' : ''} data-shopping-item="${item}">
            <span>${item}</span>
          </label>
        </div>
      `;
    }).join('');
  }

  function renderProgress() {
    const counts = recipes.reduce((acc, recipe) => {
      const statuses = statusFor(recipe.id);
      if (statuses.cooked) acc.cooked += 1;
      if (statuses.favorite) acc.favorite += 1;
      if (statuses.want) acc.want += 1;
      return acc;
    }, { cooked: 0, favorite: 0, want: 0 });

    const statusCounts = recipes.reduce((acc, recipe) => {
      const status = recipe.audit.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    els.totalRecipes.textContent = recipes.length;
    els.cookedCount.textContent = counts.cooked;
    els.progressCooked.textContent = `${counts.cooked} из ${recipes.length}`;
    els.progressFavorite.textContent = counts.favorite;
    els.progressWant.textContent = counts.want;
    els.auditShort.textContent = `${statusCounts.ok || 0} без замечаний, ${statusCounts.minor_review || 0} на быструю проверку, ${statusCounts.needs_review || 0} на ручную проверку`;
  }

  function copyShoppingList() {
    const lines = baseBasket().map((item) => `${state.shopping[item] ? '[x]' : '[ ]'} ${item}`).join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(lines).then(() => {
        els.copyStatus.textContent = 'Список скопирован.';
      }).catch(() => fallbackCopy(lines));
      return;
    }

    fallbackCopy(lines);
  }

  function fallbackCopy(lines) {
    const textarea = document.createElement('textarea');
    textarea.value = lines;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.append(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      els.copyStatus.textContent = 'Список скопирован.';
    } catch {
      els.copyStatus.textContent = 'Не удалось скопировать список.';
    } finally {
      textarea.remove();
    }
  }

  els.search.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderRecipes();
  });

  els.categoryFilters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    state.tagFilter = '';
    renderRecipes();
  });

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-toggle-recipe]');
    if (toggle) {
      const card = document.querySelector(`[data-recipe-card="${toggle.dataset.toggleRecipe}"]`);
      const isOpen = card.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      return;
    }

    const status = event.target.closest('[data-status]');
    if (status) {
      const [id, name] = status.dataset.status.split(':');
      toggleRecipeStatus(id, name);
      return;
    }

    const statusFilter = event.target.closest('[data-status-filter]');
    if (statusFilter) {
      const value = statusFilter.dataset.statusFilter;
      state.statusFilter = state.statusFilter === value ? '' : value;
      renderRecipes();
      return;
    }

    const collection = event.target.closest('[data-collection]');
    if (collection) {
      state.tagFilter = collection.dataset.collection;
      state.statusFilter = '';
      state.category = 'all';
      document.querySelector('#recipes').scrollIntoView({ behavior: 'smooth' });
      renderRecipes();
    }
  });

  els.resetFilters.addEventListener('click', () => {
    state.query = '';
    state.category = 'all';
    state.statusFilter = '';
    state.tagFilter = '';
    els.search.value = '';
    renderRecipes();
  });

  els.shoppingList.addEventListener('change', (event) => {
    const checkbox = event.target.closest('[data-shopping-item]');
    if (!checkbox) return;
    state.shopping[checkbox.dataset.shoppingItem] = checkbox.checked;
    writeJson(shoppingKey, state.shopping);
    renderShopping();
  });

  els.copyShopping.addEventListener('click', copyShoppingList);

  els.resetShopping.addEventListener('click', () => {
    state.shopping = {};
    writeJson(shoppingKey, state.shopping);
    renderShopping();
    els.copyStatus.textContent = 'Галочки сброшены.';
  });

  renderCollections();
  renderBonus();
  renderShopping();
  renderProgress();
  renderRecipes();
});
