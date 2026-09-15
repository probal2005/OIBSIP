/**
 * Temperature Converter Website
 * Tech Stack: HTML5, CSS3, Vanilla JavaScript
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const tempInput = document.getElementById('tempInput');
  const inputUnit = document.getElementById('inputUnit');
  const clearInputBtn = document.getElementById('clearInputBtn');
  const convertBtn = document.getElementById('convertBtn');
  const resetBtn = document.getElementById('resetBtn');
  const errorContainer = document.getElementById('errorContainer');
  const errorMessage = document.getElementById('errorMessage');
  
  // Results Elements
  const celsiusValue = document.getElementById('celsiusValue');
  const fahrenheitValue = document.getElementById('fahrenheitValue');
  const kelvinValue = document.getElementById('kelvinValue');

  const celsiusFormula = document.getElementById('celsiusFormula');
  const fahrenheitFormula = document.getElementById('fahrenheitFormula');
  const kelvinFormula = document.getElementById('kelvinFormula');

  const celsiusCard = document.getElementById('celsiusCard');
  const fahrenheitCard = document.getElementById('fahrenheitCard');
  const kelvinCard = document.getElementById('kelvinCard');

  // Thermal Gauge Elements
  const thermalBadge = document.getElementById('thermalBadge');
  const thermalStateText = document.getElementById('thermalStateText');
  const thermalIndicator = thermalBadge ? thermalBadge.querySelector('.thermal-indicator') : null;

  // Preset Buttons & Copy Buttons
  const presetButtons = document.querySelectorAll('.preset-btn');
  const copyButtons = document.querySelectorAll('.copy-btn');
  const toast = document.getElementById('toast');

  // --- Absolute Zero Constants ---
  const ABSOLUTE_ZERO = {
    C: -273.15,
    F: -459.67,
    K: 0
  };

  // --- Conversion Mathematics ---
  function convertFromCelsius(c) {
    return {
      C: c,
      F: (c * 9 / 5) + 32,
      K: c + 273.15
    };
  }

  function convertFromFahrenheit(f) {
    const c = (f - 32) * 5 / 9;
    return {
      C: c,
      F: f,
      K: c + 273.15
    };
  }

  function convertFromKelvin(k) {
    const c = k - 273.15;
    return {
      C: c,
      F: (c * 9 / 5) + 32,
      K: k
    };
  }

  // --- Formatter Utility ---
  function formatNumber(num) {
    if (isNaN(num)) return '--';
    // Format to max 2 decimal places, eliminating trailing zeroes
    const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
    return rounded.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  // --- Input Validation Engine ---
  function validateInput(rawInput, unit) {
    const trimmed = rawInput.trim();

    // Empty check
    if (trimmed === '') {
      return { isValid: false, isNull: true, message: '' };
    }

    // Strict numeric check (reject letters, double decimals, etc.)
    const numberRegex = /^-?\d*(\.\d+)?$/;
    if (!numberRegex.test(trimmed) || trimmed === '-' || trimmed === '.') {
      return {
        isValid: false,
        isNull: false,
        message: 'Invalid input! Please enter a valid number (e.g., 25, -10.5).'
      };
    }

    const value = parseFloat(trimmed);

    // Absolute zero violation check
    if (value < ABSOLUTE_ZERO[unit]) {
      const minLimit = unit === 'C' ? '−273.15°C' : unit === 'F' ? '−459.67°F' : '0 K';
      return {
        isValid: false,
        isNull: false,
        message: `Absolute Zero Violation! Temperature cannot be lower than ${minLimit}.`
      };
    }

    return { isValid: true, isNull: false, value: value };
  }

  // --- UI Update & Conversion Handler ---
  function processConversion(options = { showEmptyError: false }) {
    const rawVal = tempInput.value;
    const unit = inputUnit.value;

    // Toggle Clear Button visibility
    if (rawVal.trim().length > 0) {
      clearInputBtn.classList.remove('hidden');
    } else {
      clearInputBtn.classList.add('hidden');
    }

    const validation = validateInput(rawVal, unit);

    if (!validation.isValid) {
      if (validation.isNull) {
        if (options.showEmptyError) {
          showError('Please enter a temperature value to convert.');
        } else {
          hideError();
        }
        resetResultDisplays();
        return;
      }

      showError(validation.message);
      resetResultDisplays();
      return;
    }

    // Input is valid
    hideError();

    let results;
    if (unit === 'C') {
      results = convertFromCelsius(validation.value);
    } else if (unit === 'F') {
      results = convertFromFahrenheit(validation.value);
    } else {
      results = convertFromKelvin(validation.value);
    }

    updateResultDisplays(results, unit, validation.value);
    updateThermalState(results.C);
  }

  // --- Display Updates ---
  function updateResultDisplays(results, selectedUnit, inputValue) {
    celsiusValue.textContent = formatNumber(results.C);
    fahrenheitValue.textContent = formatNumber(results.F);
    kelvinValue.textContent = formatNumber(results.K);

    // Update active unit highlights
    [celsiusCard, fahrenheitCard, kelvinCard].forEach(card => {
      if (card.dataset.unit === selectedUnit) {
        card.classList.add('is-active-input');
      } else {
        card.classList.remove('is-active-input');
      }
    });

    // Update dynamic formula hints based on input unit
    const inputValFormatted = formatNumber(inputValue);
    if (selectedUnit === 'C') {
      celsiusFormula.textContent = 'Input value';
      fahrenheitFormula.textContent = `(${inputValFormatted}°C × 9/5) + 32`;
      kelvinFormula.textContent = `${inputValFormatted}°C + 273.15`;
    } else if (selectedUnit === 'F') {
      celsiusFormula.textContent = `(${inputValFormatted}°F − 32) × 5/9`;
      fahrenheitFormula.textContent = 'Input value';
      kelvinFormula.textContent = `(${inputValFormatted}°F − 32) × 5/9 + 273.15`;
    } else {
      celsiusFormula.textContent = `${inputValFormatted}K − 273.15`;
      fahrenheitFormula.textContent = `(${inputValFormatted}K − 273.15) × 9/5 + 32`;
      kelvinFormula.textContent = 'Input value';
    }
  }

  function resetResultDisplays() {
    celsiusValue.textContent = '--';
    fahrenheitValue.textContent = '--';
    kelvinValue.textContent = '--';

    celsiusFormula.textContent = 'Standard reference';
    fahrenheitFormula.textContent = '(°C × 9/5) + 32';
    kelvinFormula.textContent = '°C + 273.15';

    [celsiusCard, fahrenheitCard, kelvinCard].forEach(card => card.classList.remove('is-active-input'));
    if (thermalBadge) thermalBadge.classList.add('hidden');
  }

  // --- Thermal Gauge State Update ---
  function updateThermalState(celsiusVal) {
    if (!thermalBadge || !thermalStateText || !thermalIndicator) return;

    thermalBadge.classList.remove('hidden');

    let stateText = '';
    let colorVar = '';

    if (celsiusVal <= -273.1) {
      stateText = 'Absolute Zero ❄️';
      colorVar = 'var(--state-abs-zero)';
    } else if (celsiusVal <= 0) {
      stateText = 'Freezing Point 🧊';
      colorVar = 'var(--state-freezing)';
    } else if (celsiusVal > 0 && celsiusVal <= 25) {
      stateText = 'Cool / Mild 🌿';
      colorVar = 'var(--state-mild)';
    } else if (celsiusVal > 25 && celsiusVal <= 45) {
      stateText = 'Warm / Hot ☀️';
      colorVar = 'var(--state-warm)';
    } else {
      stateText = 'Extreme Heat 🔥';
      colorVar = 'var(--state-hot)';
    }

    thermalStateText.textContent = stateText;
    thermalIndicator.style.backgroundColor = colorVar;
  }

  // --- Error Banner Management ---
  function showError(msg) {
    errorMessage.textContent = msg;
    errorContainer.classList.remove('hidden');
    tempInput.classList.add('has-error');
    tempInput.setAttribute('aria-invalid', 'true');
  }

  function hideError() {
    errorContainer.classList.add('hidden');
    tempInput.classList.remove('has-error');
    tempInput.setAttribute('aria-invalid', 'false');
  }

  // --- Event Listeners ---
  // Real-time input handling
  tempInput.addEventListener('input', () => processConversion());

  // Input unit selection change
  inputUnit.addEventListener('change', () => processConversion());

  // Convert Button Click
  convertBtn.addEventListener('click', () => {
    processConversion({ showEmptyError: true });
    if (!errorContainer.classList.contains('hidden')) {
      tempInput.focus();
    }
  });

  // Clear Single Input Button
  clearInputBtn.addEventListener('click', () => {
    tempInput.value = '';
    hideError();
    resetResultDisplays();
    clearInputBtn.classList.add('hidden');
    tempInput.focus();
  });

  // Reset All Button
  resetBtn.addEventListener('click', () => {
    tempInput.value = '';
    inputUnit.value = 'C';
    clearInputBtn.classList.add('hidden');
    hideError();
    resetResultDisplays();
    tempInput.focus();
  });

  // Quick Preset Buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tempInput.value = btn.dataset.value;
      inputUnit.value = btn.dataset.unit || 'C';
      processConversion();
    });
  });

  // Copy to Clipboard
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (!targetEl || targetEl.textContent === '--') return;

      const valToCopy = targetEl.textContent;
      const unitSymbol = targetId.includes('celsius') ? '°C' : targetId.includes('fahrenheit') ? '°F' : 'K';

      navigator.clipboard.writeText(`${valToCopy} ${unitSymbol}`).then(() => {
        showToast(`Copied ${valToCopy} ${unitSymbol} to clipboard!`);
      }).catch(() => {
        showToast(`Value: ${valToCopy} ${unitSymbol}`);
      });
    });
  });

  // Toast Notification Helper
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2500);
  }

  // Automatic Copyright Year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Focus input on initial page load
  tempInput.focus();
});

