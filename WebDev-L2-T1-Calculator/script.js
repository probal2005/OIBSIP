/**
 * Modern Vanilla JavaScript Calculator Engine
 * Handles arithmetic calculations, state management, operator chaining,
 * division-by-zero protection, keyboard shortcuts, and theme toggling.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const mainDisplay = document.getElementById('main-display');
    const subDisplay = document.getElementById('sub-display');
    const keysContainer = document.querySelector('.calculator-keys');
    const themeToggleBtn = document.getElementById('theme-toggle');

    // Calculator State Variables
    let currentInput = '0';
    let previousOperand = null;
    let currentOperator = null;
    let shouldResetScreen = false;
    let isErrorState = false;
    let isCalculated = false;

    // Standard Math Operators mapping
    const OPERATORS = {
        '+': (a, b) => a + b,
        '−': (a, b) => a - b,
        '-': (a, b) => a - b,
        '×': (a, b) => a * b,
        '*': (a, b) => a * b,
        '÷': (a, b) => (b === 0 ? null : a / b),
        '/': (a, b) => (b === 0 ? null : a / b),
    };

    // --- Core Display Update ---
    function updateDisplay() {
        if (isErrorState) {
            mainDisplay.textContent = currentInput;
            mainDisplay.classList.add('error-text');
            return;
        }

        mainDisplay.classList.remove('error-text');
        mainDisplay.textContent = formatDisplayNumber(currentInput);

        if (previousOperand !== null && currentOperator !== null) {
            subDisplay.textContent = `${formatDisplayNumber(previousOperand.toString())} ${currentOperator}`;
        } else {
            subDisplay.textContent = '';
        }
    }

    // Format numbers with commas for readability while preserving decimals during typing
    function formatDisplayNumber(numberStr) {
        if (!numberStr) return '0';
        if (numberStr === 'Cannot divide by 0' || numberStr === 'Error') return numberStr;

        const parts = numberStr.split('.');
        const integerPart = parts[0];
        const decimalPart = parts.length > 1 ? parts[1] : null;

        // Handle negative numbers or solitary zero/minus
        let formattedInteger = '';
        if (integerPart === '-' || integerPart === '') {
            formattedInteger = integerPart;
        } else {
            const parsed = parseFloat(integerPart);
            if (isNaN(parsed)) {
                formattedInteger = integerPart;
            } else {
                formattedInteger = parsed.toLocaleString('en-US');
            }
        }

        if (decimalPart !== null) {
            return `${formattedInteger}.${decimalPart}`;
        }
        return formattedInteger;
    }

    // --- Calculator Actions ---

    // Append Numeric / Decimal Input
    function appendNumber(number) {
        if (isErrorState) {
            resetState();
        }

        if (shouldResetScreen || isCalculated) {
            currentInput = '';
            shouldResetScreen = false;
            if (isCalculated) {
                // If user starts typing a number after equals, clear previous calculation context
                previousOperand = null;
                currentOperator = null;
                isCalculated = false;
            }
        }

        // Prevent multiple decimal points
        if (number === '.' && currentInput.includes('.')) {
            return;
        }

        // Handle initial decimal entry (e.g. '.' -> '0.')
        if (number === '.' && (currentInput === '' || currentInput === '0')) {
            currentInput = '0.';
            updateDisplay();
            return;
        }

        // Prevent multiple leading zeros
        if (currentInput === '0' && number === '0') {
            return;
        }

        // Replace lone initial '0' with new digit
        if (currentInput === '0' && number !== '.') {
            currentInput = number;
        } else {
            currentInput += number;
        }

        updateDisplay();
    }

    // Handle Operator Selection (+, −, ×, ÷)
    function handleOperator(op) {
        if (isErrorState) return;

        // Normalize operator character
        let displayOp = op;
        if (op === '*') displayOp = '×';
        if (op === '/') displayOp = '÷';
        if (op === '-') displayOp = '−';

        // Operator switching if user presses consecutive operators
        if (currentOperator !== null && shouldResetScreen) {
            currentOperator = displayOp;
            updateDisplay();
            return;
        }

        // Chained calculation if previous operand exists
        if (previousOperand !== null && currentOperator !== null && !shouldResetScreen) {
            calculateResult();
            if (isErrorState) return;
        }

        previousOperand = parseFloat(currentInput);
        currentOperator = displayOp;
        shouldResetScreen = true;
        isCalculated = false;
        updateDisplay();
    }

    // Evaluate Expression (=)
    function calculateResult() {
        if (previousOperand === null || currentOperator === null || isErrorState) {
            return;
        }

        const currentVal = parseFloat(currentInput);
        const prevVal = previousOperand;

        let result = null;
        const mathFunc = OPERATORS[currentOperator];

        if (mathFunc) {
            result = mathFunc(prevVal, currentVal);
        }

        // Check Division by Zero
        if (result === null) {
            currentInput = 'Cannot divide by 0';
            isErrorState = true;
            subDisplay.textContent = `${formatDisplayNumber(prevVal.toString())} ${currentOperator} 0 =`;
            updateDisplay();
            return;
        }

        // Round floating point inaccuracies (e.g., 0.1 + 0.2 = 0.3)
        result = Math.round(result * 1e12) / 1e12;

        subDisplay.textContent = `${formatDisplayNumber(prevVal.toString())} ${currentOperator} ${formatDisplayNumber(currentVal.toString())} =`;
        currentInput = result.toString();
        previousOperand = null;
        currentOperator = null;
        shouldResetScreen = true;
        isCalculated = true;

        updateDisplay();
    }

    // Clear Calculator (C)
    function resetState() {
        currentInput = '0';
        previousOperand = null;
        currentOperator = null;
        shouldResetScreen = false;
        isErrorState = false;
        isCalculated = false;
        updateDisplay();
    }

    // Backspace / Delete (⌫)
    function deleteLastDigit() {
        if (isErrorState) {
            resetState();
            return;
        }

        if (shouldResetScreen || isCalculated) return;

        if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
            currentInput = '0';
        } else {
            currentInput = currentInput.slice(0, -1);
        }

        updateDisplay();
    }

    // Toggle Plus/Minus Sign (±)
    function toggleSign() {
        if (isErrorState || currentInput === '0') return;

        if (currentInput.startsWith('-')) {
            currentInput = currentInput.slice(1);
        } else {
            currentInput = '-' + currentInput;
        }
        updateDisplay();
    }

    // Calculate Percentage (%)
    function calculatePercent() {
        if (isErrorState || currentInput === '0') return;

        const val = parseFloat(currentInput);
        const percentResult = Math.round((val / 100) * 1e12) / 1e12;
        currentInput = percentResult.toString();
        updateDisplay();
    }

    // --- Event Listeners Setup ---

    // Click Events via Event Delegation on Button Container
    keysContainer.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('button');
        if (!targetBtn) return;

        const action = targetBtn.dataset.action;
        const value = targetBtn.dataset.value;

        // Visual click active effect
        triggerButtonFeedback(targetBtn);

        if (!action) {
            // Digit or decimal button
            appendNumber(value);
        } else if (action === 'operator') {
            handleOperator(value);
        } else if (action === 'calculate') {
            calculateResult();
        } else if (action === 'clear') {
            resetState();
        } else if (action === 'backspace') {
            deleteLastDigit();
        } else if (action === 'toggle-sign') {
            toggleSign();
        } else if (action === 'percent') {
            calculatePercent();
        }
    });

    // Keyboard Shortcuts Support
    window.addEventListener('keydown', (e) => {
        // Prevent key defaults for calculator keys if focused
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
        }

        let matchedButton = null;

        if (e.key >= '0' && e.key <= '9') {
            appendNumber(e.key);
            matchedButton = document.querySelector(`button[data-value="${e.key}"]`);
        } else if (e.key === '.' || e.key === ',') {
            appendNumber('.');
            matchedButton = document.querySelector(`button[data-value="."]`);
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            handleOperator(e.key);
            const opSymbol = e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key === '-' ? '−' : '+';
            matchedButton = document.querySelector(`button[data-value="${opSymbol}"]`);
        } else if (e.key === 'Enter' || e.key === '=') {
            calculateResult();
            matchedButton = document.querySelector(`button[data-action="calculate"]`);
        } else if (e.key === 'Backspace') {
            deleteLastDigit();
            matchedButton = document.querySelector(`button[data-action="backspace"]`);
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
            resetState();
            matchedButton = document.querySelector(`button[data-action="clear"]`);
        } else if (e.key === '%') {
            calculatePercent();
            matchedButton = document.querySelector(`button[data-action="percent"]`);
        }

        if (matchedButton) {
            triggerButtonFeedback(matchedButton);
        }
    });

    // Visual button press animation helper
    function triggerButtonFeedback(buttonEl) {
        buttonEl.classList.add('active-key');
        setTimeout(() => {
            buttonEl.classList.remove('active-key');
        }, 120);
    }

    // --- Theme Toggle Handler ---
    const savedTheme = localStorage.getItem('calc-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('calc-theme', newTheme);
    });

    // Automatic Copyright Year
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Initial Display Render
    updateDisplay();
});

