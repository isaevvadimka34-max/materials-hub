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
    replacements: document.querySelector('[data-replacements]'),
    sauces: document.querySelector('[data-sauces]'),
    shoppingList: document.querySelector('[data-shopping-list]'),
    copyShopping: document.querySelector('[data-copy-shopping]'),
    resetShopping: document.querySelector('[data-reset-shopping]'),
    copyStatus: document.querySelector('[data-copy-status]'),
    statusMessage: document.querySelector('[data-status-message]'),
    totalRecipes: document.querySelector('[data-total-recipes]'),
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
    showStatusMessage(recipe, name, nextValue);
  }

  function showStatusMessage(recipe, name, isActive) {
    if (!els.statusMessage || !recipe) return;

    const action = name === 'want'
      ? (isActive ? 'Добавлено в «Хочу попробовать»' : 'Убрано из «Хочу попробовать»')
      : (isActive ? 'Добавлено в «Приготовлено»' : 'Убрано из «Приготовлено»');

    els.statusMessage.textContent = `${action}: ${recipe.title}`;
  }

  function renderCategoryFilters() {
    els.categoryFilters.innerHTML = categories.map((category) => (
      `<a class="chip chip--jump" href="#recipes-${category.id}" data-jump-category="${category.id}">${category.title}</a>`
    )).join('');
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

  function recipeCard(recipe) {
    const statuses = statusFor(recipe.id);
    const kbju = recipe.kbju;
    const cardStatusClass = `${statuses.cooked ? 'is-cooked' : ''} ${statuses.want ? 'is-want' : ''}`.trim();
    return `
      <article class="recipe-card ${cardStatusClass}" id="recipe-${recipe.id}" data-recipe-card="${recipe.id}">
        <div class="recipe-summary">
          <button class="recipe-main-toggle" type="button" data-open-recipe="${recipe.id}">
            <span class="recipe-category">${recipe.category.title}</span>
            <h3 class="recipe-title">${recipe.title}</h3>
            <span class="recipe-meta">
              <span class="recipe-pill">${recipe.time}</span>
              <span class="recipe-pill">${kbju.kcal} ккал</span>
              <span class="recipe-pill">Б ${kbju.protein} / Ж ${kbju.fat} / У ${kbju.carbs}</span>
            </span>
          </button>
          <div class="recipe-card-actions" aria-label="Быстрые отметки рецепта">
            <button class="status-icon ${statuses.want ? 'is-active' : ''}" type="button" data-status="${recipe.id}:want" aria-label="Хочу попробовать: ${recipe.title}" title="Хочу попробовать">♥</button>
            <button class="status-icon status-icon--cooked ${statuses.cooked ? 'is-active' : ''}" type="button" data-status="${recipe.id}:cooked" aria-label="Приготовлено: ${recipe.title}" title="Приготовлено">✓</button>
            <button class="recipe-open" type="button" data-open-recipe="${recipe.id}" aria-label="Открыть рецепт">+</button>
          </div>
        </div>
      </article>
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

    clearTargetedRecipe();
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

  function clearTargetedRecipe() {
    document.querySelectorAll('[data-recipe-card].is-targeted').forEach((card) => {
      card.classList.remove('is-targeted');
    });
  }

  function targetRecipeCard(id) {
    const card = document.querySelector(`#recipe-${id}`);
    if (!card) return;

    clearTargetedRecipe();
    card.classList.add('is-targeted');
    card.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
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
        ${visible.map((recipe, index) => (
          `<button class="recipe-index__item" type="button" data-scroll-recipe="${recipe.id}">
            <span>${index + 1}</span>
            ${recipe.title}
          </button>`
        )).join('')}
      </div>
    `;
  }

  function renderRecipeSection(category) {
    const visible = categoryRecipes(category.id).filter(recipeMatches);
    const cards = visible.length
      ? visible.map((recipe) => recipeCard(recipe)).join('')
      : '<div class="empty-state">Пока нет блюд в этом разделе.</div>';

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
        ${renderRecipeIndex(category, visible)}
        <div class="recipe-grid">${cards}</div>
      </section>
    `;
  }

  function renderRecipes() {
    const visibleCount = recipes.filter(recipeMatches).length;

    renderCategoryFilters();

    document.querySelectorAll('[data-status-filter]').forEach((button) => {
      button.classList.toggle('is-active', state.statusFilter === button.dataset.statusFilter);
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
            <strong>${item.from}</strong>
            <span class="replace-arrow">заменить на</span>
            <span>${item.to}</span>
          </div>
        `).join('')
        : '<p>Таблица замен не распознана.</p>';
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
        : '<p>Соусы не распознаны.</p>';
    }
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
    if (!els.shoppingList) return;

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

  function copyShoppingList() {
    const selected = baseBasket().filter((item) => state.shopping[item]);

    if (!selected.length) {
      els.copyStatus.textContent = 'Сначала отметь продукты, которые нужно купить.';
      return;
    }

    const lines = selected.map((item) => `- ${item}`).join('\n');

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

    const statusFilter = event.target.closest('[data-status-filter]');
    if (statusFilter) {
      state.statusFilter = statusFilter.dataset.statusFilter;
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

    const scrollRecipe = event.target.closest('[data-scroll-recipe]');
    if (scrollRecipe) {
      targetRecipeCard(scrollRecipe.dataset.scrollRecipe);
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

  if (els.totalRecipes) {
    els.totalRecipes.textContent = `${recipes.length} ${plural(recipes.length, ['рецепт', 'рецепта', 'рецептов'])}`;
  }

  renderBonus();
  renderShopping();
  renderRecipes();
});
