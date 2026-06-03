'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'ggc-tracker-program-v1';
  const workoutsPerWeek = 3;
  const weeksPerCycle = 6;
  const workoutTitles = ['День 1 низ A', 'День 2 верх', 'День 3 низ B'];
  const weekLabels = ['1 неделя', '2 неделя', '3 неделя', '4 неделя', '5 неделя', '6 неделя'];
  const weekShortLabels = ['1 нед.', '2 нед.', '3 нед.', '4 нед.', '5 нед.', '6 нед.'];
  const supportTemplates = [
    { key: 'breathing-mon', legacyKey: 'breathing', title: 'Дыхание' },
    { key: 'posture-tue', legacyKey: 'posture', title: 'Осанка' },
    { key: 'core-tue', legacyKey: 'core', title: 'Кор' },
    { key: 'breathing-wed', legacyKey: 'breathing', title: 'Дыхание' },
    { key: 'posture-thu', legacyKey: 'posture', title: 'Осанка' },
    { key: 'pelvic-floor-thu', legacyKey: 'pelvic-floor', title: 'Тазовое дно' },
    { key: 'breathing-fri', legacyKey: 'breathing', title: 'Дыхание' },
    { key: 'posture-sat', legacyKey: 'posture', title: 'Осанка' },
    { key: 'core-sat', legacyKey: 'core', title: 'Кор' },
    { key: 'recovery-sun', legacyKey: 'recovery', title: 'Отдых / дыхание / прогулка' },
  ];
  const scheduleRows = {
    base: [
      { day: 'Пн', title: 'День 1 низ A + дыхание', tasks: [{ type: 'workout', index: 0 }, { type: 'complex', key: 'breathing-mon' }] },
      { day: 'Вт', title: 'Осанка', tasks: [{ type: 'complex', key: 'posture-tue' }] },
      { day: 'Ср', title: 'День 2 верх + дыхание', tasks: [{ type: 'workout', index: 1 }, { type: 'complex', key: 'breathing-wed' }] },
      { day: 'Чт', title: 'Тазовое дно', tasks: [{ type: 'complex', key: 'pelvic-floor-thu' }] },
      { day: 'Пт', title: 'День 3 низ B + дыхание', tasks: [{ type: 'workout', index: 2 }, { type: 'complex', key: 'breathing-fri' }] },
      { day: 'Сб', title: 'Кор', tasks: [{ type: 'complex', key: 'core-sat' }] },
      { day: 'Вс', title: 'Отдых / дыхание / прогулка', tasks: [{ type: 'complex', key: 'recovery-sun' }] },
    ],
    advanced: [
      { day: 'Пн', title: 'День 1 низ A + дыхание', tasks: [{ type: 'workout', index: 0 }, { type: 'complex', key: 'breathing-mon' }] },
      { day: 'Вт', title: 'Осанка + кор', tasks: [{ type: 'complex', key: 'posture-tue' }, { type: 'complex', key: 'core-tue' }] },
      { day: 'Ср', title: 'День 2 верх + дыхание', tasks: [{ type: 'workout', index: 1 }, { type: 'complex', key: 'breathing-wed' }] },
      { day: 'Чт', title: 'Осанка + тазовое дно', tasks: [{ type: 'complex', key: 'posture-thu' }, { type: 'complex', key: 'pelvic-floor-thu' }] },
      { day: 'Пт', title: 'День 3 низ B + дыхание', tasks: [{ type: 'workout', index: 2 }, { type: 'complex', key: 'breathing-fri' }] },
      { day: 'Сб', title: 'Осанка + кор', tasks: [{ type: 'complex', key: 'posture-sat' }, { type: 'complex', key: 'core-sat' }] },
      { day: 'Вс', title: 'Отдых / дыхание / прогулка', tasks: [{ type: 'complex', key: 'recovery-sun' }] },
    ],
  };

  const variantLabels = {
    base: 'Базовый вариант',
    advanced: 'Усиленный вариант',
  };
  const progressTags = [];

  const els = {
    cycleButtons: [...document.querySelectorAll('[data-tracker-cycle]')],
    variantButtons: [...document.querySelectorAll('[data-tracker-variant]')],
    cycleSummary: document.querySelector('[data-tracker-cycle-summary]'),
    trackerGoal: document.querySelector('[data-tracker-goal]'),
    manifestFields: [...document.querySelectorAll('[data-tracker-manifest-field]')],
    statusLine: document.querySelector('[data-tracker-status-line]'),
    progressFill: document.querySelector('[data-tracker-progress-fill]'),
    progressCaption: document.querySelector('[data-tracker-progress-caption]'),
    metrics: [...document.querySelectorAll('[data-tracker-metric]')],
    map: document.querySelector('[data-tracker-program-map]'),
    detail: document.querySelector('[data-tracker-week-detail]'),
    progressTags: document.querySelector('[data-tracker-progress-tags]'),
    diaryFields: [...document.querySelectorAll('[data-tracker-diary-field]')],
    reset: document.querySelector('[data-tracker-reset]'),
  };

  function createWeek(cycleId, weekNumber) {
    return {
      id: weekNumber,
      title: `Неделя ${weekNumber}`,
      workouts: Array.from({ length: workoutsPerWeek }, (_, index) => ({
        id: `m${cycleId}-w${weekNumber}-t${index + 1}`,
        title: workoutTitles[index],
        completed: false,
      })),
      complexes: supportTemplates.map((complex) => ({
        id: `m${cycleId}-w${weekNumber}-${complex.key}`,
        legacyId: `m${cycleId}-w${weekNumber}-${complex.legacyKey}`,
        title: complex.title,
        fullTitle: complex.title,
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
      trackVariant: 'base',
      goal: '',
      goalWhy: '',
      goalPace: '',
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
      const savedItem = savedItems.find((candidate) => (
        candidate?.id === item.id || (item.legacyId && candidate?.id === item.legacyId)
      ));
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
      trackVariant: ['base', 'advanced'].includes(saved?.trackVariant) ? saved.trackVariant : defaults.trackVariant,
      goal: typeof saved?.goal === 'string' ? saved.goal : '',
      goalWhy: typeof saved?.goalWhy === 'string' ? saved.goalWhy : '',
      goalPace: typeof saved?.goalPace === 'string' ? saved.goalPace : '',
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

  function resizeManifestField(field) {
    field.style.height = 'auto';
    field.style.height = `${field.scrollHeight}px`;
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
    renderDashboard(next);
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

  function toggleTaskGroup(week, tasks) {
    const taskItems = tasks.map((task) => getTaskItem(week, task)).filter(Boolean);
    const shouldComplete = !taskItems.some((item) => item.completed);
    const taskIds = new Set(taskItems.map((item) => item.id));

    return {
      ...week,
      workouts: week.workouts.map((item) => (
        taskIds.has(item.id) ? { ...item, completed: shouldComplete } : item
      )),
      complexes: week.complexes.map((item) => (
        taskIds.has(item.id) ? { ...item, completed: shouldComplete } : item
      )),
    };
  }

  function renderDashboard(state) {
    const cycle = getActiveCycle(state);
    const selectedWeek = getSelectedWeek(state);
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

    const progressPercent = Math.round((metrics.workoutsDone / metrics.workoutsTotal) * 100);

    if (els.progressFill) {
      els.progressFill.style.width = `${progressPercent}%`;
    }

    if (els.progressCaption) {
      els.progressCaption.textContent = `${progressPercent}% программы · ${metrics.workoutsDone}/${metrics.workoutsTotal}`;
    }

    if (els.cycleSummary) {
      els.cycleSummary.textContent = `6 недель · 18 тренировок · ${variantLabels[state.trackVariant] || variantLabels.base}`;
    }

    if (els.statusLine) {
      els.statusLine.textContent = `Выполнено ${metrics.workoutsDone}/${metrics.workoutsTotal}`;
    }

    els.manifestFields.forEach((field) => {
      if (document.activeElement === field) return;
      field.value = state[field.dataset.trackerManifestField] || '';
      resizeManifestField(field);
    });
  }

  function renderCycleButtons(state) {
    els.cycleButtons.forEach((button) => {
      const isActive = Number(button.dataset.trackerCycle) === state.activeCycle;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    els.variantButtons.forEach((button) => {
      const isActive = button.dataset.trackerVariant === state.trackVariant;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function renderProgramMap(state) {
    if (!els.map) return;

    const cycle = getActiveCycle(state);
    const selectedWeek = getSelectedWeek(state);
    const rows = scheduleRows[state.trackVariant] || scheduleRows.base;

    const header = `
      <div class="tracker-planner-row tracker-planner-row--head" data-tracker-planner-row="head">
        <span></span>
        ${cycle.weeks.map((week) => `
          <button class="tracker-planner-week ${week.id === selectedWeek.id ? 'is-selected' : ''}" type="button" data-week-select="${week.id}" aria-label="${weekLabels[week.id - 1] || `${week.id} неделя`}">
            <span class="tracker-week-full">${weekLabels[week.id - 1] || `${week.id} неделя`}</span>
            <span class="tracker-week-short">${weekShortLabels[week.id - 1] || `${week.id} нед.`}</span>
          </button>
        `).join('')}
      </div>
    `;

    const body = rows.map((row, rowIndex) => `
      <div class="tracker-planner-row" data-tracker-planner-row="${row.day}">
        <strong class="tracker-day-label">
          <span class="tracker-day-label__day">${row.day}</span>
          <span class="tracker-day-label__title">${row.title}</span>
        </strong>
        ${cycle.weeks.map((week) => renderPlannerCell(row.tasks, week, rowIndex, row.title)).join('')}
      </div>
    `).join('');

    els.map.innerHTML = `${header}${body}`;
  }

  function getTaskItem(week, task) {
    if (task.type === 'workout') return week.workouts[task.index];
    return week.complexes.find((item) => item.id.endsWith(task.key));
  }

  function renderPlannerCell(tasks, week, rowIndex, rowTitle) {
    const items = tasks.map((task) => getTaskItem(week, task)).filter(Boolean);
    const isComplete = items.some((item) => item.completed);

    return `
      <div class="tracker-planner-cell" data-tracker-planner-cell>
        <button class="tracker-orbit tracker-orbit--day ${isComplete ? 'is-complete' : ''}" type="button" data-tracker-day-task="${rowIndex}" data-week-id="${week.id}" aria-pressed="${String(isComplete)}" aria-label="${rowTitle}, ${weekLabels[week.id - 1] || `${week.id} неделя`}">
          <span></span>
          <small>${rowTitle}</small>
        </button>
      </div>
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
    renderCycleButtons(state);
    renderDashboard(state);
    renderProgramMap(state);
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
    const dayButton = event.target.closest('[data-tracker-day-task]');
    if (dayButton) {
      const weekId = Number(dayButton.dataset.weekId);
      const rowIndex = Number(dayButton.dataset.trackerDayTask);
      updateState((state) => {
        const rows = scheduleRows[state.trackVariant] || scheduleRows.base;
        const tasks = rows[rowIndex]?.tasks || [];
        return updateWeekById(state, weekId, (week) => toggleTaskGroup(week, tasks));
      });
      return;
    }

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

  els.variantButtons.forEach((button) => {
    button.addEventListener('click', () => {
      updateState((state) => ({
        ...state,
        trackVariant: button.dataset.trackerVariant === 'advanced' ? 'advanced' : 'base',
      }));
    });
  });

  els.manifestFields.forEach((field) => {
    field.addEventListener('input', () => {
      resizeManifestField(field);
      const next = {
        ...readState(),
        [field.dataset.trackerManifestField]: field.value,
      };
      writeState(next);
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
  els.manifestFields.forEach(resizeManifestField);
});
