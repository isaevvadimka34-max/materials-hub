'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'ggc-body-guide-v1';
  const waterWeight = document.querySelector('[data-water-weight]');
  const waterButton = document.querySelector('[data-water-calc]');
  const waterResult = document.querySelector('[data-water-result]');
  const checks = document.querySelectorAll('[data-body-check]');

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || { checks: {} };
    } catch {
      return { checks: {} };
    }
  }

  function writeState(next) {
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function parseWeight(value) {
    const number = Number(String(value || '').replace(',', '.'));
    return Number.isFinite(number) && number > 0 ? number : 0;
  }

  function renderWater() {
    if (!waterResult || !waterWeight) return;

    const weight = parseWeight(waterWeight.value);
    if (!weight) {
      waterResult.textContent = 'Введи вес, чтобы получить ориентир по воде на день.';
      return;
    }

    const min = Math.round(weight * 30);
    const max = Math.round(weight * 35);
    waterResult.innerHTML = `<strong>${(min / 1000).toFixed(1)}-${(max / 1000).toFixed(1)} л в день</strong><span>Это ориентир. В жару, при тренировках и высокой активности воды может хотеться больше.</span>`;
    writeState({ ...readState(), weight: waterWeight.value });
  }

  const saved = readState();
  if (waterWeight && saved.weight) {
    waterWeight.value = saved.weight;
    renderWater();
  }

  checks.forEach((check) => {
    check.checked = Boolean(saved.checks?.[check.dataset.bodyCheck]);
    check.addEventListener('change', () => {
      const current = readState();
      writeState({
        ...current,
        checks: {
          ...(current.checks || {}),
          [check.dataset.bodyCheck]: check.checked,
        },
      });
    });
  });

  waterButton?.addEventListener('click', renderWater);
  waterWeight?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      renderWater();
    }
  });
});
