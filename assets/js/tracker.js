'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'ggc-tracker-program-v1';
  const workoutsPerWeek = 3;
  const weeksPerCycle = 6;
  const progressTags = [
    { id: 'easier_start', title: 'Легче начать тренировку' },
    { id: 'endurance', title: 'Больше выносливости' },
    { id: 'core_feel', title: 'Лучше чувствую мышцы кора' },
    { id: 'posture', title: 'Легче держать осанку' },
    { id: 'back_relief', title: 'Меньше напряжения в спине' },
    { id: 'breathing', title: 'Лучше дыхание' },
    { id: 'pelvic_control', title: 'Лучше контроль тазового дна' },
    { id: 'regularity', title: 'Больше регулярности' },
    { id: 'returned', title: 'Вернулась после паузы' },
    { id: 'self_kindness', title: 'Стала мягче к себе' },
  ];
  const complexTemplates = [
    { key: 'posture', title: 'Осанка', fullTitle: 'Комплекс на осанку' },
    { key: 'pelvic-floor', title: 'Тазовое дно', fullTitle: 'Комплекс на тазовое дно' },
    { key: 'core', title: 'Кор', fullTitle: 'Комплекс на мышцы кора' },
    { key: 'breathing', title: 'Дыхание', fullTitle: 'Дыхательная практика' },
  ];

  const els = {
    cycleButtons: [...document.querySelectorAll('[data-tracker-cycle]')],
    cycleSummary: document.querySelector('[data-tracker-cycle-summary]'),
    metrics: [...document.querySelectorAll('[data-tracker-metric]')],
    map: document.querySelector('[data-tracker-program-map]'),
    detail: document.querySelector('[data-tracker-week-detail]'),
    progressTags: document.querySelector('[data-tracker-progress-tags]'),
    diaryFields: [...document.querySelectorAll('[data-tracker-diary-field]')],
    reset: document.querySelector('[data-tracker-reset]'),
  };

  function createWeek(cycleId, weekNumber) {
    const firstWorkoutNumber = (weekNumber - 1) * workoutsPerWeek + 1;
    return {
      id: weekNumber,
      title: `Неделя ${weekNumber}`,
      workouts: Array.from({ length: workoutsPerWeek }, (_, index) => {
        const number = firstWorkoutNumber + index;
        return {
          id: `m${cycleId}-w${weekNumber}-t${index + 1}`,
          title: `Тренировка ${number}`,
          completed: false,
        };
      }),
      complexes: complexTemplates.map((complex) => ({
        id: `m${cycleId}-w${weekNumber}-${complex.key}`,
        title: complex.title,
        fullTitle: complex.fullTitle,
        completed: false,
      })),
      note: '',
      win: '',
      diaryWorked: '',
      diaryHard: '',
      diaryNext: '',
      progressTags: [],
    };
  }

  function getDefaultState() {
    return {
      activeCycle: 1,
      selectedWeeks: { 1: 1, 2: 1 },
      cycles: [1, 2].map((cycleId) => ({
        id: cycleId,
        title: `Мезоцикл ${cycleId}`,
        weeks: Array.from({ length: weeksPerCycle }, (_, index) => createWeek(cycleId, index + 1)),
      })),
    };
  }

  function mergeWeek(defaultWeek, savedWeek = {}) {
    const mergeItems = (defaultItems, savedItems = []) => defaultItems.map((item) => {
      const savedItem = savedItems.find((candidate) => candidate?.id === item.id);
      return { ...item, completed: Boolean(savedItem?.completed) };
    });

    return {
      ...defaultWeek,
      workouts: mergeItems(defaultWeek.workouts, savedWeek.workouts),
      complexes: mergeItems(defaultWeek.complexes, savedWeek.complexes),
      note: typeof savedWeek.note === 'string' ? savedWeek.note : '',
      win: typeof savedWeek.win === 'string' ? savedWeek.win : '',
      diaryWorked: typeof savedWeek.diaryWorked === 'string' ? savedWeek.diaryWorked : '',
      diaryHard: typeof savedWeek.diaryHard === 'string' ? savedWeek.diaryHard : '',
      diaryNext: typeof savedWeek.diaryNext === 'string' ? savedWeek.diaryNext : '',
      progressTags: Array.isArray(savedWeek.progressTags)
        ? savedWeek.progressTags.filter((tag) => progressTags.some((item) => item.id === tag))
        : [],
    };
  }

  function normalizeState(saved) {
    const defaults = getDefaultState();
    const activeCycle = [1, 2].includes(Number(saved?.activeCycle)) ? Number(saved.activeCycle) : defaults.activeCycle;
    const selectedWeeks = {
      1: clampWeek(saved?.selectedWeeks?.[1] || saved?.selectedWeekId || defaults.selectedWeeks[1]),
      2: clampWeek(saved?.selectedWeeks?.[2] || defaults.selectedWeeks[2]),
    };

    return {
      activeCycle,
      selectedWeeks,
      cycles: defaults.cycles.map((cycle) => {
        const savedCycle = Array.isArray(saved?.cycles)
          ? saved.cycles.find((candidate) => Number(candidate?.id) === cycle.id)
          : null;
        return {
          ...cycle,
          weeks: cycle.weeks.map((week) => {
            const savedWeek = savedCycle?.weeks?.find((candidate) => Number(candidate?.id) === week.id);
            return mergeWeek(week, savedWeek);
          }),
        };
      }),
    };
  }

  function clampWeek(value) {
    const week = Number(value);
    return week >= 1 && week <= weeksPerCycle ? week : 1;
  }

  function readState() {
    try {
      return normalizeState(JSON.parse(localStorage.getItem(storageKey)) || {});
    } catch {
      return getDefaultState();
    }
  }

  function writeState(next) {
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function getActiveCycle(state) {
    return state.cycles.find((cycle) => cycle.id === state.activeCycle) || state.cycles[0];
  }

  function getSelectedWeek(state) {
    const cycle = getActiveCycle(state);
    const selectedWeek = state.selectedWeeks?.[cycle.id] || 1;
    return cycle.weeks.find((week) => week.id === selectedWeek) || cycle.weeks[0];
  }

  function isWeekStarted(week) {
    return [...week.workouts, ...week.complexes].some((item) => item.completed);
  }

  function isWeekCompleted(week) {
    return week.workouts.every((workout) => workout.completed);
  }

  function hasWeekNote(week) {
    return Boolean(
      week.note.trim()
      || week.win.trim()
      || week.diaryWorked.trim()
      || week.diaryHard.trim()
      || week.diaryNext.trim()
      || week.progressTags.length,
    );
  }

  function analyzeCycle(cycle) {
    const workoutsDone = cycle.weeks.flatMap((week) => week.workouts).filter((workout) => workout.completed).length;
    const workoutsTotal = cycle.weeks.length * workoutsPerWeek;
    const startedWeeks = cycle.weeks.filter(isWeekStarted).length;
    const completedWeeks = cycle.weeks.filter(isWeekCompleted).length;
    const complexesDone = cycle.weeks.flatMap((week) => week.complexes).filter((complex) => complex.completed).length;
    const notesCount = cycle.weeks.filter(hasWeekNote).length;

    return { workoutsDone, workoutsTotal, startedWeeks, completedWeeks, complexesDone, notesCount };
  }

  function updateState(updater) {
    const next = updater(readState());
    writeState(next);
    render(next);
  }

  function saveState(updater) {
    const next = updater(readState());
    writeState(next);
    renderMetrics(getActiveCycle(next));
  }

  function updateSelectedWeek(state, updater) {
    const cycleId = state.activeCycle;
    const weekId = state.selectedWeeks?.[cycleId] || 1;
    return {
      ...state,
      cycles: state.cycles.map((cycle) => {
        if (cycle.id !== cycleId) return cycle;
        return {
          ...cycle,
          weeks: cycle.weeks.map((week) => (week.id === weekId ? updater(week) : week)),
        };
      }),
    };
  }

  function updateWeekById(state, weekId, updater) {
    const cycleId = state.activeCycle;
    return {
      ...state,
      cycles: state.cycles.map((cycle) => {
        if (cycle.id !== cycleId) return cycle;
        return {
          ...cycle,
          weeks: cycle.weeks.map((week) => (week.id === weekId ? updater(week) : week)),
        };
      }),
    };
  }

  function toggleItem(week, itemId, type) {
    return {
      ...week,
      [type]: week[type].map((item) => (
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )),
    };
  }

  function renderMetrics(cycle) {
    const metrics = analyzeCycle(cycle);
    const copy = {
      workouts: [`${metrics.workoutsDone}/${metrics.workoutsTotal}`, 'Основная линия программы'],
      weeks: [`${metrics.completedWeeks}/${cycle.weeks.length}`, `${metrics.startedWeeks} недель начато`],
      complexes: [String(metrics.complexesDone), 'Дополнительные практики'],
      notes: [String(metrics.notesCount), 'Заметки прогресса'],
    };

    els.metrics.forEach((card) => {
      const metric = copy[card.dataset.trackerMetric];
      if (!metric) return;
      card.querySelector('strong').textContent = metric[0];
      card.querySelector('p').textContent = metric[1];
    });

    if (els.cycleSummary) {
      els.cycleSummary.textContent = '6 недель · 18 тренировок · поддерживающие комплексы';
    }
  }

  function renderCycleButtons(state) {
    els.cycleButtons.forEach((button) => {
      const isActive = Number(button.dataset.trackerCycle) === state.activeCycle;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function renderProgramMap(state) {
    if (!els.map) return;

    const cycle = getActiveCycle(state);
    const selectedWeek = getSelectedWeek(state);
    els.map.replaceChildren();

    cycle.weeks.forEach((week) => {
      const workoutsDone = week.workouts.filter((workout) => workout.completed).length;
      const complexesDone = week.complexes.filter((complex) => complex.completed).length;
      const card = document.createElement('article');
      card.className = 'tracker-week-card';
      card.classList.toggle('is-selected', week.id === selectedWeek.id);
      card.classList.toggle('is-complete', isWeekCompleted(week));
      card.dataset.trackerWeekCard = String(week.id);

      card.innerHTML = `
        <button class="tracker-week-card__select" type="button" data-week-select="${week.id}">
          <span>${week.title}</span>
          <strong>${workoutsDone}/3</strong>
        </button>
        <p>Основная линия недели</p>
        <div class="tracker-mini-list tracker-mini-list--workouts">
          ${week.workouts.map((workout) => renderMiniItem(workout, 'workout', week.id)).join('')}
        </div>
        <div class="tracker-mini-practices">
          <span>Поддерживающие практики</span>
          <strong>${complexesDone}/${week.complexes.length}</strong>
        </div>
        <div class="tracker-mini-list tracker-mini-list--complexes">
          ${week.complexes.map((complex) => renderMiniItem(complex, 'complex', week.id)).join('')}
        </div>
      `;

      els.map.append(card);
    });
  }

  function renderMiniItem(item, type, weekId) {
    const attr = type === 'workout' ? 'data-tracker-workout' : 'data-tracker-complex';
    return `
      <button class="tracker-mini-check ${item.completed ? 'is-complete' : ''}" type="button" ${attr}="${item.id}" data-week-id="${weekId}" aria-pressed="${String(item.completed)}">
        <span></span>${item.title}
      </button>
    `;
  }

  function renderWeekDetail(state) {
    if (!els.detail) return;

    const week = getSelectedWeek(state);
    els.detail.innerHTML = `
      <div class="tracker-section-head tracker-section-head--split">
        <div>
          <span class="guide-kicker">Детальная карточка</span>
          <h2>${week.title}</h2>
        </div>
        <p>Комплексы не блокируют завершение недели. Они помогают усилить результат, но не превращают неделю в провал.</p>
      </div>
      <div class="tracker-detail-grid">
        <section class="tracker-detail-block tracker-detail-block--primary">
          <span class="guide-kicker">Основные тренировки</span>
          <h3>3 тренировки — главная линия недели.</h3>
          <div class="tracker-check-list">
            ${week.workouts.map((workout) => renderDetailItem(workout, 'workout')).join('')}
          </div>
        </section>
        <section class="tracker-detail-block tracker-detail-block--support">
          <span class="guide-kicker">Поддерживающие практики</span>
          <h3>Можно делать отдельно от тренировок, в удобный день.</h3>
          <div class="tracker-check-list tracker-check-list--soft">
            ${week.complexes.map((complex) => renderDetailItem(complex, 'complex')).join('')}
          </div>
        </section>
      </div>
      <div class="tracker-week-notes">
        <label class="tracker-field">
          <span>Заметка недели</span>
          <textarea data-tracker-week-note rows="4" placeholder="Что заметила в теле, настроении или регулярности?">${escapeHtml(week.note)}</textarea>
        </label>
        <label class="tracker-field">
          <span>Маленькая победа недели</span>
          <textarea data-tracker-week-win rows="4" placeholder="Например: прошла 2 тренировки, вернулась после паузы, стало легче держать осанку">${escapeHtml(week.win)}</textarea>
        </label>
      </div>
    `;
  }

  function renderDetailItem(item, type) {
    const attr = type === 'workout' ? 'data-tracker-workout' : 'data-tracker-complex';
    const title = item.fullTitle || item.title;
    return `
      <button class="tracker-check ${item.completed ? 'is-complete' : ''}" type="button" ${attr}="${item.id}" aria-pressed="${String(item.completed)}">
        <span></span>
        <strong>${title}</strong>
      </button>
    `;
  }

  function renderProgressTags(week) {
    if (!els.progressTags) return;
    els.progressTags.innerHTML = progressTags.map((tag) => {
      const isActive = week.progressTags.includes(tag.id);
      return `
        <button type="button" data-tracker-progress-tag="${tag.id}" class="${isActive ? 'is-active' : ''}" aria-pressed="${String(isActive)}">
          ${tag.title}
        </button>
      `;
    }).join('');
  }

  function renderDiaryFields(week) {
    els.diaryFields.forEach((field) => {
      field.value = week[field.dataset.trackerDiaryField] || '';
    });
  }

  function render(state = readState()) {
    const cycle = getActiveCycle(state);
    const week = getSelectedWeek(state);
    renderCycleButtons(state);
    renderMetrics(cycle);
    renderProgramMap(state);
    renderWeekDetail(state);
    renderProgressTags(week);
    renderDiaryFields(week);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  els.cycleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      updateState((state) => ({
        ...state,
        activeCycle: Number(button.dataset.trackerCycle),
      }));
    });
  });

  els.map?.addEventListener('click', (event) => {
    const itemButton = event.target.closest('[data-tracker-workout], [data-tracker-complex]');
    if (itemButton) {
      const weekId = Number(itemButton.dataset.weekId);
      const type = itemButton.matches('[data-tracker-workout]') ? 'workouts' : 'complexes';
      const itemId = itemButton.dataset.trackerWorkout || itemButton.dataset.trackerComplex;
      updateState((state) => updateWeekById(state, weekId, (week) => toggleItem(week, itemId, type)));
      return;
    }

    const select = event.target.closest('[data-week-select], [data-tracker-week-card]');
    if (!select) return;
    const weekId = Number(select.dataset.weekSelect || select.dataset.trackerWeekCard);
    updateState((state) => ({
      ...state,
      selectedWeeks: { ...state.selectedWeeks, [state.activeCycle]: weekId },
    }));
  });

  els.detail?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tracker-workout], [data-tracker-complex]');
    if (!button) return;

    const type = button.matches('[data-tracker-workout]') ? 'workouts' : 'complexes';
    const itemId = button.dataset.trackerWorkout || button.dataset.trackerComplex;
    updateState((state) => updateSelectedWeek(state, (week) => toggleItem(week, itemId, type)));
  });

  els.detail?.addEventListener('input', (event) => {
    const note = event.target.closest('[data-tracker-week-note]');
    const win = event.target.closest('[data-tracker-week-win]');
    if (!note && !win) return;

    saveState((state) => updateSelectedWeek(state, (week) => ({
      ...week,
      note: note ? note.value : week.note,
      win: win ? win.value : week.win,
    })));
  });

  els.progressTags?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tracker-progress-tag]');
    if (!button) return;

    updateState((state) => updateSelectedWeek(state, (week) => {
      const tag = button.dataset.trackerProgressTag;
      const nextTags = week.progressTags.includes(tag)
        ? week.progressTags.filter((item) => item !== tag)
        : [...week.progressTags, tag];
      return { ...week, progressTags: nextTags };
    }));
  });

  els.diaryFields.forEach((field) => {
    field.addEventListener('input', () => {
      saveState((state) => updateSelectedWeek(state, (week) => ({
        ...week,
        [field.dataset.trackerDiaryField]: field.value,
      })));
    });
  });

  els.reset?.addEventListener('click', () => {
    const shouldReset = window.confirm('Очистить все отметки, заметки и выбранные теги прогресса?');
    if (!shouldReset) return;
    const next = getDefaultState();
    writeState(next);
    render(next);
  });

  render();
});
