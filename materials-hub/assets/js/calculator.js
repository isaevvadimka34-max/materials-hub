'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'ggc-materials-calculator-v1';
  const minKcal = 1200;

  const goalSettings = {
    softCut: {
      title: 'Мягкое похудение',
      factor: 0.9,
      proteinPerKg: 1.8,
      fatPerKg: 0.8,
      summary: 'Комфортный дефицит: подойдет, если хочется снижать вес без жестких ограничений.',
    },
    activeCut: {
      title: 'Активное похудение',
      factor: 0.82,
      proteinPerKg: 2,
      fatPerKg: 0.7,
      summary: 'Более выраженный дефицит: следи за самочувствием, сном и восстановлением.',
    },
    maintain: {
      title: 'Поддержание формы',
      factor: 1,
      proteinPerKg: 1.6,
      fatPerKg: 0.8,
      summary: 'Норма для стабильного веса и понятного контроля рациона.',
    },
    recomp: {
      title: 'Рекомпозиция',
      factor: 1,
      proteinPerKg: 2,
      fatPerKg: 0.8,
      summary: 'Калории около поддержки, белок выше: вес может стоять, а качество тела меняться.',
    },
    shapeGain: {
      title: 'Набор формы',
      factor: 1.08,
      proteinPerKg: 1.8,
      fatPerKg: 0.9,
      summary: 'Аккуратный профицит для набора формы без резкого скачка калорий.',
    },
  };

  const form = document.querySelector('[data-calculator-form]');
  const result = document.querySelector('[data-calculator-result]');
  const error = document.querySelector('[data-calculator-error]');
  const warning = document.querySelector('[data-result-warning]');
  const layout = document.querySelector('[data-calculator-layout]');

  if (!form || !result) return;

  function syncSelectedGoal() {
    form.querySelectorAll('.goal-option').forEach((option) => {
      const input = option.querySelector('input[type="radio"]');
      option.classList.toggle('is-selected', Boolean(input && input.checked));
    });
  }

  const output = {
    mode: document.querySelector('[data-result-mode]'),
    kcal: document.querySelector('[data-result-kcal]'),
    summary: document.querySelector('[data-result-summary]'),
    protein: document.querySelector('[data-result-protein]'),
    fat: document.querySelector('[data-result-fat]'),
    carbs: document.querySelector('[data-result-carbs]'),
    bmr: document.querySelector('[data-result-bmr]'),
    tdee: document.querySelector('[data-result-tdee]'),
    date: document.querySelector('[data-result-date]'),
    proteinBar: document.querySelector('[data-bar-protein]'),
    fatBar: document.querySelector('[data-bar-fat]'),
    carbsBar: document.querySelector('[data-bar-carbs]'),
  };

  function round(value) {
    return Math.round(value);
  }

  function parsePositive(formData, name) {
    const value = Number(String(formData.get(name) || '').replace(',', '.'));
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function setError(message) {
    if (error) error.textContent = message;
  }

  function validate(values) {
    if (!values.weight || !values.height || !values.age) {
      return 'Заполни вес, рост и возраст.';
    }

    if (values.weight < 35 || values.weight > 220) return 'Проверь вес: нужен диапазон от 35 до 220 кг.';
    if (values.height < 130 || values.height > 220) return 'Проверь рост: нужен диапазон от 130 до 220 см.';
    if (values.age < 16 || values.age > 80) return 'Проверь возраст: нужен диапазон от 16 до 80 лет.';

    return '';
  }

  function calculate(values) {
    const settings = goalSettings[values.goal] || goalSettings.softCut;
    const bmr = (10 * values.weight) + (6.25 * values.height) - (5 * values.age) - 161;
    const tdee = bmr * values.activity;
    const rawTarget = tdee * settings.factor;
    const targetKcal = Math.max(minKcal, rawTarget);
    const hitMinimum = rawTarget < minKcal;

    const protein = settings.proteinPerKg * values.weight;
    const fatFloor = values.weight * 0.6;
    const carbFloor = values.goal === 'activeCut' ? values.weight * 1.2 : values.weight * 1.5;
    let fat = settings.fatPerKg * values.weight;
    let carbs = (targetKcal - (protein * 4) - (fat * 9)) / 4;

    if (carbs < carbFloor && targetKcal > minKcal) {
      const fatAfterCarbFloor = (targetKcal - (protein * 4) - (carbFloor * 4)) / 9;
      if (fatAfterCarbFloor >= fatFloor) {
        carbs = carbFloor;
        fat = fatAfterCarbFloor;
      }
    }

    if (carbs < 0) {
      carbs = 0;
      fat = Math.max(0, (targetKcal - (protein * 4)) / 9);
    }

    return {
      goal: values.goal,
      modeTitle: settings.title,
      summary: settings.summary,
      bmr: round(bmr),
      tdee: round(tdee),
      kcal: round(targetKcal),
      protein: round(protein),
      fat: round(fat),
      carbs: round(carbs),
      hitMinimum,
      calculatedAt: new Date().toISOString(),
    };
  }

  function percent(value, total) {
    if (!total) return 0;
    return Math.max(0, Math.min(100, (value / total) * 100));
  }

  function render(calculation) {
    const proteinKcal = calculation.protein * 4;
    const fatKcal = calculation.fat * 9;
    const carbsKcal = calculation.carbs * 4;

    output.mode.textContent = calculation.modeTitle;
    output.kcal.textContent = `${calculation.kcal} ккал`;
    output.summary.textContent = calculation.summary;
    output.protein.textContent = `${calculation.protein} г`;
    output.fat.textContent = `${calculation.fat} г`;
    output.carbs.textContent = `${calculation.carbs} г`;
    output.bmr.textContent = `${calculation.bmr} ккал`;
    output.tdee.textContent = `${calculation.tdee} ккал`;
    output.date.textContent = new Intl.DateTimeFormat('ru-RU').format(new Date(calculation.calculatedAt));

    output.proteinBar.style.width = `${percent(proteinKcal, calculation.kcal)}%`;
    output.fatBar.style.width = `${percent(fatKcal, calculation.kcal)}%`;
    output.carbsBar.style.width = `${percent(carbsKcal, calculation.kcal)}%`;

    warning.hidden = !calculation.hitMinimum;
    result.hidden = false;
    layout?.classList.add('is-calculated');
  }

  function save(values, calculation) {
    localStorage.setItem(storageKey, JSON.stringify({ values, calculation }));
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || !saved.values || !saved.calculation) return;

      form.elements.weight.value = saved.values.weight || '';
      form.elements.height.value = saved.values.height || '';
      form.elements.age.value = saved.values.age || '';
      form.elements.activity.value = saved.values.activity || '1.2';

      const goal = form.querySelector(`[name="goal"][value="${saved.values.goal}"]`);
      if (goal) goal.checked = true;

      syncSelectedGoal();
      render(saved.calculation);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }

  form.addEventListener('change', (event) => {
    if (event.target.matches('[name="goal"]')) {
      syncSelectedGoal();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const values = {
      weight: parsePositive(formData, 'weight'),
      height: parsePositive(formData, 'height'),
      age: parsePositive(formData, 'age'),
      activity: parsePositive(formData, 'activity') || 1.2,
      goal: String(formData.get('goal') || 'softCut'),
    };

    const validationMessage = validate(values);
    if (validationMessage) {
      setError(validationMessage);
      result.hidden = true;
      layout?.classList.remove('is-calculated');
      return;
    }

    setError('');
    const calculation = calculate(values);
    render(calculation);
    save(values, calculation);
  });

  syncSelectedGoal();
  restore();
});
