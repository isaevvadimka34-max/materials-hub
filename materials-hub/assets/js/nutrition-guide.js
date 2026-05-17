'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'ggc-nutrition-guide-v1';

  const foodItems = [
    { names: ['огурец', 'огурцы', 'помидор', 'томаты', 'сельдерей', 'кабачок', 'цукини', 'капуста', 'брокколи', 'зелень', 'шпинат', 'грибы', 'перец'], status: 'Можно не считать', tone: 'green', text: 'Много воды и клетчатки, мало калорий. Масло, сметану и соусы считаем отдельно.' },
    { names: ['картофель', 'батат', 'кукуруза', 'горошек', 'фасоль', 'чечевица', 'нут', 'свекла', 'морковь', 'тыква', 'авокадо', 'оливки', 'маслины'], status: 'Нужно считать', tone: 'amber', text: 'Это уже плотный источник энергии: крахмал, бобовые или жиры. Лучше взвешивать порцию.' },
    { names: ['банан', 'виноград', 'хурма', 'манго', 'груша', 'дыня', 'арбуз', 'яблоко', 'клубника', 'малина', 'голубика', 'смородина', 'финики', 'изюм', 'курага', 'чернослив', 'сок'], status: 'Считаем углеводы', tone: 'rose', text: 'Фрукты и сухофрукты полезнее сладостей, но это тоже энергия. Соки лучше заменить цельным фруктом.' },
  ];

  const proteinItems = [
    { type: 'snack', title: 'Творог + ягоды', text: 'Быстрый вариант, когда хочется сладкого и нужно добрать белок.' },
    { type: 'snack', title: 'Тунец + хлебец + огурец', text: 'Собирается за пару минут и хорошо держит сытость.' },
    { type: 'snack', title: 'Яйца + овощи', text: 'Простой перекус без лишней готовки.' },
    { type: 'meal', title: 'Курица или индейка к гарниру', text: 'Самый простой способ поднять белок в обеде или ужине.' },
    { type: 'meal', title: 'Паста с тунцом или легким сыром', text: 'Обычное блюдо становится плотнее по белку без сложного рецепта.' },
    { type: 'meal', title: 'Овсянка на молоке с протеином', text: 'Подходит, если завтрак обычно выходит углеводным.' },
    { type: 'shop', title: 'База для холодильника', text: 'Яйца, творог, греческий йогурт, куриное филе, рыба, тунец, легкий сыр.' },
    { type: 'shop', title: 'Растительный белок', text: 'Чечевица, фасоль, нут, тофу и соевое молоко помогают разнообразить рацион.' },
  ];

  const search = document.querySelector('[data-food-search]');
  const result = document.querySelector('[data-food-result]');
  const proteinResults = document.querySelector('[data-protein-results]');
  const proteinFilters = document.querySelectorAll('[data-protein-filter]');

  function writeState(value) {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch {
      return {};
    }
  }

  function findFood(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return null;
    return foodItems.find((item) => item.names.some((name) => name.includes(normalized) || normalized.includes(name)));
  }

  function renderFood(query) {
    if (!result) return;

    const item = findFood(query);
    if (!query.trim()) {
      result.className = 'guide-result';
      result.textContent = 'Начни вводить продукт, чтобы понять: считать, не считать или быть аккуратнее с порцией.';
      return;
    }

    if (!item) {
      result.className = 'guide-result guide-result--neutral';
      result.textContent = 'Такого продукта пока нет в базе. Если это фрукт, сухофрукт, масло, соус или плотный гарнир — лучше считать.';
      return;
    }

    result.className = `guide-result guide-result--${item.tone}`;
    result.innerHTML = `<strong>${item.status}</strong><span>${item.text}</span>`;
  }

  function renderProteins(type = 'all') {
    if (!proteinResults) return;

    const items = proteinItems.filter((item) => type === 'all' || item.type === type);
    proteinResults.innerHTML = items.map((item) => `
      <article class="guide-mini-card">
        <span>${item.type === 'snack' ? 'Перекус' : item.type === 'meal' ? 'Прием пищи' : 'Покупки'}</span>
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </article>
    `).join('');
  }

  function setFilter(filter) {
    proteinFilters.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.proteinFilter === filter);
    });
    renderProteins(filter);
    writeState({ ...readState(), proteinFilter: filter, query: search?.value || '' });
  }

  const saved = readState();
  if (search && saved.query) {
    search.value = saved.query;
    renderFood(saved.query);
  }
  renderProteins(saved.proteinFilter || 'all');
  setFilter(saved.proteinFilter || 'all');

  search?.addEventListener('input', () => {
    renderFood(search.value);
    writeState({ ...readState(), query: search.value });
  });

  proteinFilters.forEach((button) => {
    button.addEventListener('click', () => setFilter(button.dataset.proteinFilter || 'all'));
  });
});
