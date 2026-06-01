'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'ggc-tracker-rhythm-v1';
  const rhythmStatuses = ['full', 'minimum', 'recovery'];

  const focusMeta = {
    workout: {
      label: 'Тренировка',
      title: 'Тренировка «Ноги и ягодицы»',
      full: '35 минут',
      minimum: '10 минут разминки или 15 минут прогулки',
    },
    activity: {
      label: 'Активность',
      title: 'Прогулка или легкая активность',
      full: '30 минут движения',
      minimum: '10 минут спокойной ходьбы',
    },
    recovery: {
      label: 'Восстановление',
      title: 'День восстановления',
      full: 'Сон, мягкая растяжка и спокойный режим',
      minimum: 'Лечь раньше или сделать 5 минут разгрузки',
    },
    nutrition: {
      label: 'Питание',
      title: 'Спокойная база по питанию',
      full: 'Белок и нормальные приемы пищи',
      minimum: 'Один понятный прием пищи без наказания',
    },
    selfcare: {
      label: 'Забота',
      title: 'Забота о себе',
      full: '30 минут без спешки для себя',
      minimum: '5 минут паузы, душ или короткая прогулка',
    },
  };

  const statusMeta = {
    full: {
      label: 'Полный шаг',
      short: 'Полностью',
      copy: 'Отлично. Полный шаг засчитан, но не превращаем его в новую планку обязательности.',
    },
    minimum: {
      label: 'Минимум',
      short: 'Минимум',
      copy: 'Минимум дня засчитан. Это не провал, а способ остаться в процессе в сложный день.',
    },
    recovery: {
      label: 'Восстановление',
      short: 'Восстановление',
      copy: 'Восстановление отмечено. Хороший ритм — это чередовать нагрузку и заботу о теле.',
    },
    skipped: {
      label: 'Пропуск',
      short: 'Пропуск',
      copy: 'Ок, день не потерян. Отметь, что помешало, и выбери мягкий шаг на завтра.',
    },
    empty: {
      label: 'План',
      short: 'План',
      copy: 'День еще не отмечен. Можно начать с минимума дня.',
    },
  };

  const skipReasonMeta = {
    time: {
      label: 'Не было времени',
      copy: 'Главный барьер — время. На завтра лучше поставить короткий вариант: 10–15 минут.',
    },
    tired: {
      label: 'Устала',
      copy: 'Похоже, телу нужен более мягкий вход. Завтра выбери минимум дня или короткую тренировку без перегруза.',
    },
    health: {
      label: 'Плохо себя чувствовала',
      copy: 'Самочувствие важнее плана. Возвращайся через восстановление или самый маленький шаг.',
    },
    mood: {
      label: 'Не было настроя',
      copy: 'Настрой не обязан быть идеальным. Поможет действие на 5–10 минут без давления.',
    },
    forgot: {
      label: 'Забыла',
      copy: 'Так бывает. Поставь один видимый ориентир на завтра и начни с минимума.',
    },
    other: {
      label: 'Другое',
      copy: 'Не нужно догонять. Достаточно вернуться через один реалистичный шаг.',
    },
  };

  const progressLabels = {
    endurance: 'Больше выносливости',
    better_sleep: 'Лучше сон',
    more_energy: 'Больше энергии',
    less_swelling: 'Меньше отеков',
    more_regular: 'Стала регулярнее',
    returned_after_skip: 'Вернулась после пропуска',
  };

  const dayTemplates = [
    { id: 'mon', dayLabel: 'Пн', date: '1', focus: 'workout', status: 'empty', skipReason: null, note: '' },
    { id: 'tue', dayLabel: 'Вт', date: '2', focus: 'activity', status: 'minimum', skipReason: null, note: 'Сделала короткую прогулку.' },
    { id: 'wed', dayLabel: 'Ср', date: '3', focus: 'recovery', status: 'recovery', skipReason: null, note: '' },
    { id: 'thu', dayLabel: 'Чт', date: '4', focus: 'nutrition', status: 'skipped', skipReason: 'tired', note: '' },
    { id: 'fri', dayLabel: 'Пт', date: '5', focus: 'workout', status: 'full', skipReason: null, note: 'Вернулась после паузы.' },
    { id: 'sat', dayLabel: 'Сб', date: '6', focus: 'activity', status: 'empty', skipReason: null, note: '' },
    { id: 'sun', dayLabel: 'Вс', date: '7', focus: 'selfcare', status: 'empty', skipReason: null, note: '' },
  ];

  const els = {
    weekGoal: document.querySelector('[data-tracker-week-goal]'),
    weekSummary: document.querySelector('[data-tracker-week-summary]'),
    today: document.querySelector('[data-tracker-today]'),
    todayFocus: document.querySelector('[data-tracker-today-focus]'),
    focusTitle: document.querySelector('[data-tracker-focus-title]'),
    focusFull: document.querySelector('[data-tracker-focus-full]'),
    focusMinimum: document.querySelector('[data-tracker-focus-minimum]'),
    statusButtons: [...document.querySelectorAll('[data-tracker-status]')],
    skipReasons: document.querySelector('[data-tracker-skip-reasons]'),
    skipReasonButtons: [...document.querySelectorAll('[data-tracker-skip-reason]')],
    dayNote: document.querySelector('[data-tracker-day-note]'),
    weekGrid: document.querySelector('[data-tracker-week-grid]'),
    recommendation: document.querySelector('[data-tracker-recommendation]'),
    barriers: document.querySelector('[data-tracker-barriers]'),
    weeklyProgress: document.querySelector('[data-tracker-weekly-progress]'),
    weekResult: document.querySelector('[data-tracker-week-result]'),
    nextStep: document.querySelector('[data-tracker-next-step]'),
    reset: document.querySelector('[data-tracker-reset]'),
  };

  function cloneDay(day) {
    return {
      status: day.status,
      focus: day.focus,
      skipReason: day.skipReason,
      note: day.note,
    };
  }

  function getDefaultState() {
    return {
      weekGoal: '3 тренировки · 2 мягких дня · 1 день восстановления',
      weekFocus: 'регулярность',
      days: Object.fromEntries(dayTemplates.map((day) => [day.id, cloneDay(day)])),
      weeklyNonWeightProgress: [],
    };
  }

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey)) || {};
      const defaults = getDefaultState();
      return {
        ...defaults,
        ...saved,
        days: {
          ...defaults.days,
          ...(saved.days || {}),
        },
        weeklyNonWeightProgress: Array.isArray(saved.weeklyNonWeightProgress)
          ? saved.weeklyNonWeightProgress
          : [],
      };
    } catch {
      return getDefaultState();
    }
  }

  function writeState(next) {
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function getTodayId() {
    return dayTemplates[(new Date().getDay() + 6) % 7].id;
  }

  function getDayState(state, dayId) {
    return state.days?.[dayId] || cloneDay(dayTemplates.find((day) => day.id === dayId));
  }

  function getDayList(state) {
    return dayTemplates.map((day) => ({
      ...day,
      ...getDayState(state, day.id),
    }));
  }

  function analyzeWeek(state) {
    const days = getDayList(state);
    const rhythmDays = days.filter((day) => rhythmStatuses.includes(day.status)).length;
    const skippedDays = days.filter((day) => day.status === 'skipped').length;
    const hasConsecutiveSkips = days.some((day, index) => (
      day.status === 'skipped' && days[index - 1]?.status === 'skipped'
    ));
    const returnedAfterSkip = days.some((day, index) => (
      ['full', 'minimum'].includes(day.status) && days[index - 1]?.status === 'skipped'
    ));
    const reasons = days
      .filter((day) => day.status === 'skipped' && skipReasonMeta[day.skipReason])
      .map((day) => day.skipReason);
    const topReason = reasons
      .sort((a, b) => reasons.filter((reason) => reason === b).length - reasons.filter((reason) => reason === a).length)[0] || '';

    return { days, rhythmDays, skippedDays, hasConsecutiveSkips, returnedAfterSkip, topReason };
  }

  function buildRecommendation(state) {
    const today = getDayState(state, getTodayId());
    const metrics = analyzeWeek(state);

    if (today.status === 'skipped' && today.skipReason) {
      return skipReasonMeta[today.skipReason]?.copy || statusMeta.skipped.copy;
    }

    if (today.status === 'skipped') {
      return statusMeta.skipped.copy;
    }

    if (metrics.hasConsecutiveSkips) {
      return 'Пауза затянулась, но это не откат. Следующий лучший шаг — минимум дня.';
    }

    if (metrics.returnedAfterSkip) {
      return 'Ты вернулась после паузы. Это важный прогресс, даже если шаг был небольшим.';
    }

    if (metrics.skippedDays >= 2) {
      return 'Неделя получилась неровной. Выбери минимум дня, чтобы мягко вернуться.';
    }

    if (metrics.rhythmDays >= 4) {
      return 'Ты в ритме. Неделя идет устойчиво.';
    }

    return statusMeta[today.status]?.copy || 'Выбери статус дня — и трекер подскажет следующий спокойный шаг.';
  }

  function renderToday(state) {
    const todayId = getTodayId();
    const today = getDayState(state, todayId);
    const focus = focusMeta[today.focus] || focusMeta.workout;

    if (els.todayFocus) els.todayFocus.textContent = focus.label;
    if (els.focusTitle) els.focusTitle.textContent = focus.title;
    if (els.focusFull) els.focusFull.textContent = focus.full;
    if (els.focusMinimum) els.focusMinimum.textContent = focus.minimum;
    if (els.dayNote) els.dayNote.value = today.note || '';

    els.statusButtons.forEach((button) => {
      const isActive = button.dataset.trackerStatus === today.status;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    if (els.skipReasons) {
      els.skipReasons.hidden = today.status !== 'skipped';
    }

    els.skipReasonButtons.forEach((button) => {
      const isActive = button.dataset.trackerSkipReason === today.skipReason;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function renderWeekGrid(state) {
    if (!els.weekGrid) return;

    const todayId = getTodayId();
    const days = getDayList(state);
    els.weekGrid.replaceChildren();

    days.forEach((day) => {
      const status = statusMeta[day.status] || statusMeta.empty;
      const focus = focusMeta[day.focus] || focusMeta.workout;
      const card = document.createElement('article');
      card.className = 'tracker-day tracker-day--' + day.status;
      if (day.id === todayId) card.classList.add('is-today');

      const head = document.createElement('div');
      head.className = 'tracker-day__head';

      const title = document.createElement('h3');
      title.textContent = day.id === todayId ? day.dayLabel + ' · сегодня' : day.dayLabel;

      const date = document.createElement('span');
      date.textContent = day.date;
      head.append(title, date);

      const badge = document.createElement('strong');
      badge.textContent = status.short;

      const copy = document.createElement('p');
      copy.textContent = day.status === 'skipped' && day.skipReason
        ? (skipReasonMeta[day.skipReason]?.label || status.short)
        : focus.label;

      card.append(head, badge, copy);
      els.weekGrid.append(card);
    });
  }

  function renderInsights(state) {
    const metrics = analyzeWeek(state);
    const progress = state.weeklyNonWeightProgress || [];

    if (els.weekSummary) {
      els.weekSummary.textContent = 'В ритме: ' + metrics.rhythmDays + ' из 7 дней';
    }

    if (els.recommendation) {
      els.recommendation.textContent = buildRecommendation(state);
    }

    if (els.barriers) {
      els.barriers.textContent = metrics.topReason
        ? 'Чаще всего мешало: ' + skipReasonMeta[metrics.topReason].label.toLowerCase() + '. Это сигнал для более мягкого планирования.'
        : 'Пока нет повторяющегося барьера. Отметки помогут увидеть, что реально мешает.';
    }

    if (els.weekResult) {
      const selected = progress.map((id) => progressLabels[id]).filter(Boolean);
      els.weekResult.textContent = selected.length
        ? 'Ты отметила: ' + selected.join(', ').toLowerCase() + '. Это тоже прогресс.'
        : 'Неделя в ритме: ' + metrics.rhythmDays + ' из 7 дней. Даже минимум и восстановление засчитываются.';
    }

    if (els.nextStep) {
      els.nextStep.textContent = metrics.skippedDays >= 2
        ? 'На следующей неделе начни с короткого варианта и одного восстановительного дня.'
        : 'Продолжай через реалистичный фокус дня: полный шаг или минимум — оба варианта работают.';
    }

    els.weeklyProgress?.querySelectorAll('[data-progress]').forEach((button) => {
      const isActive = progress.includes(button.dataset.progress);
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function render(state = readState()) {
    if (els.weekGoal) els.weekGoal.value = state.weekGoal || '';
    renderToday(state);
    renderWeekGrid(state);
    renderInsights(state);
  }

  function updateToday(updater) {
    const current = readState();
    const todayId = getTodayId();
    const today = getDayState(current, todayId);
    const nextDay = updater(today);
    const next = {
      ...current,
      days: {
        ...current.days,
        [todayId]: nextDay,
      },
    };
    writeState(next);
    render(next);
  }

  els.weekGoal?.addEventListener('input', () => {
    const current = readState();
    writeState({ ...current, weekGoal: els.weekGoal.value });
  });

  els.statusButtons.forEach((button) => {
    button.addEventListener('click', () => {
      updateToday((today) => ({
        ...today,
        status: button.dataset.trackerStatus,
        skipReason: button.dataset.trackerStatus === 'skipped' ? today.skipReason : null,
      }));
    });
  });

  els.skipReasonButtons.forEach((button) => {
    button.addEventListener('click', () => {
      updateToday((today) => ({
        ...today,
        status: 'skipped',
        skipReason: button.dataset.trackerSkipReason,
      }));
    });
  });

  els.dayNote?.addEventListener('input', () => {
    updateToday((today) => ({
      ...today,
      note: els.dayNote.value,
    }));
  });

  els.weeklyProgress?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-progress]');
    if (!button) return;

    const current = readState();
    const progress = current.weeklyNonWeightProgress || [];
    const value = button.dataset.progress;
    const nextProgress = progress.includes(value)
      ? progress.filter((item) => item !== value)
      : [...progress, value];
    const next = { ...current, weeklyNonWeightProgress: nextProgress };
    writeState(next);
    render(next);
  });

  els.reset?.addEventListener('click', () => {
    const shouldReset = window.confirm('Сбросить отметки недели? Цель недели сохранится.');
    if (!shouldReset) return;

    const current = readState();
    const next = { ...getDefaultState(), weekGoal: current.weekGoal };
    writeState(next);
    render(next);
  });

  render();
});
