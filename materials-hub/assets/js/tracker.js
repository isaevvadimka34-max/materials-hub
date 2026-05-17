'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'ggc-tracker-v1';
  const days = [
    { id: 'mon', label: 'Пн' },
    { id: 'tue', label: 'Вт' },
    { id: 'wed', label: 'Ср' },
    { id: 'thu', label: 'Чт' },
    { id: 'fri', label: 'Пт' },
    { id: 'sat', label: 'Сб' },
    { id: 'sun', label: 'Вс' },
  ];
  const habits = [
    { id: 'training', label: 'Тренировка', hint: 'зал, дом или активная нагрузка' },
    { id: 'water', label: 'Вода', hint: 'своя норма на день' },
    { id: 'steps', label: 'Шаги', hint: '8 000+ или личная цель' },
    { id: 'sleep', label: 'Сон', hint: '7-9 часов или восстановление' },
    { id: 'food', label: 'Питание', hint: 'белок и нормальные приемы пищи' },
    { id: 'wellbeing', label: 'Самочувствие', hint: 'без жесткого давления на себя' },
  ];

  const goalInput = document.querySelector('[data-tracker-goal]');
  const summary = document.querySelector('[data-tracker-summary]');
  const progress = document.querySelector('[data-tracker-progress]');
  const grid = document.querySelector('[data-tracker-grid]');
  const moodWrap = document.querySelector('[data-tracker-mood]');
  const energyInput = document.querySelector('[data-tracker-energy]');
  const energyValue = document.querySelector('[data-tracker-energy-value]');
  const notesInput = document.querySelector('[data-tracker-notes]');
  const winInput = document.querySelector('[data-tracker-win]');
  const resetButton = document.querySelector('[data-tracker-reset]');

  function getDefaultState() {
    return {
      goal: '',
      checks: {},
      mood: '',
      energy: '50',
      notes: '',
      win: '',
    };
  }

  function readState() {
    try {
      return { ...getDefaultState(), ...JSON.parse(localStorage.getItem(storageKey)) };
    } catch {
      return getDefaultState();
    }
  }

  function writeState(next) {
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function getTodayId() {
    return days[(new Date().getDay() + 6) % 7].id;
  }

  function getCheckKey(dayId, habitId) {
    return `${dayId}:${habitId}`;
  }

  function renderSummary(state) {
    if (!summary || !progress) return;

    const total = days.length * habits.length;
    const done = Object.values(state.checks || {}).filter(Boolean).length;
    const percent = total ? Math.round((done / total) * 100) : 0;

    summary.textContent = `${done} из ${total} привычек закрыто`;
    progress.style.width = `${percent}%`;
  }

  function renderMood(state) {
    moodWrap?.querySelectorAll('[data-mood]').forEach((button) => {
      const isActive = button.dataset.mood === state.mood;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function renderEnergy(state) {
    if (!energyInput || !energyValue) return;

    energyInput.value = state.energy;
    energyValue.textContent = `${state.energy}%`;
  }

  function renderGrid(state) {
    if (!grid) return;

    const todayId = getTodayId();
    grid.replaceChildren();

    days.forEach((day) => {
      const dayCard = document.createElement('article');
      dayCard.className = 'tracker-day';
      if (day.id === todayId) {
        dayCard.classList.add('is-today');
      }

      const title = document.createElement('h3');
      title.textContent = day.id === todayId ? `${day.label} / сегодня` : day.label;
      dayCard.append(title);

      const list = document.createElement('div');
      list.className = 'tracker-habits';

      habits.forEach((habit) => {
        const key = getCheckKey(day.id, habit.id);
        const isChecked = Boolean(state.checks?.[key]);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tracker-habit';
        button.dataset.day = day.id;
        button.dataset.habit = habit.id;
        button.setAttribute('aria-pressed', String(isChecked));
        button.classList.toggle('is-checked', isChecked);

        const label = document.createElement('span');
        label.textContent = habit.label;
        const hint = document.createElement('small');
        hint.textContent = habit.hint;

        button.append(label, hint);
        list.append(button);
      });

      dayCard.append(list);
      grid.append(dayCard);
    });
  }

  function render(state = readState()) {
    if (goalInput) goalInput.value = state.goal;
    if (notesInput) notesInput.value = state.notes;
    if (winInput) winInput.value = state.win;
    renderSummary(state);
    renderMood(state);
    renderEnergy(state);
    renderGrid(state);
  }

  goalInput?.addEventListener('input', () => {
    writeState({ ...readState(), goal: goalInput.value });
  });

  notesInput?.addEventListener('input', () => {
    writeState({ ...readState(), notes: notesInput.value });
  });

  winInput?.addEventListener('input', () => {
    writeState({ ...readState(), win: winInput.value });
  });

  energyInput?.addEventListener('input', () => {
    const next = { ...readState(), energy: energyInput.value };
    writeState(next);
    renderEnergy(next);
  });

  moodWrap?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-mood]');
    if (!button) return;

    const current = readState();
    const nextMood = current.mood === button.dataset.mood ? '' : button.dataset.mood;
    const next = { ...current, mood: nextMood };
    writeState(next);
    renderMood(next);
  });

  grid?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-habit][data-day]');
    if (!button) return;

    const current = readState();
    const key = getCheckKey(button.dataset.day, button.dataset.habit);
    const next = {
      ...current,
      checks: {
        ...(current.checks || {}),
        [key]: !current.checks?.[key],
      },
    };

    writeState(next);
    renderGrid(next);
    renderSummary(next);
  });

  resetButton?.addEventListener('click', () => {
    const current = readState();
    const shouldReset = window.confirm('Сбросить отметки, настроение, энергию и заметки за неделю? Цель недели сохранится.');
    if (!shouldReset) return;

    const next = { ...getDefaultState(), goal: current.goal };
    writeState(next);
    render(next);
  });

  render();
});
