const initiatlizeCalculator = () => {
    // DOM elements
    const screen = document.querySelector('.screen');
    const numberButtons = document.querySelectorAll('button[data-value]');
    const operatorButtons = document.querySelectorAll('button[data-operation]');
    const clearButton = document.querySelector('.key__clear');

    // state
    const calculatorState = {
        total: 0, // total calculated value of all operations
        inOperation: false, // are we in the middle of an operation (i.e. adding, subtracting, etc)?
        currentOperation: '', // current operation
        workingValue: 0, // current value being worked on
        workingValueWholeNumber: 0, // the whole number part of the working value (before decimal)
        workingValueDecimalNumber: 0, // the decimal part of the working value (after decimal)
        isDecimal: false, // is the key we just pressed a decimal?
        isDecimalWorkingValue: false, // is the working value a decimal/float?
    };

    // state setters
    const setTotal = (value) => (calculatorState.total = value);
    const setInOperation = (value) => (calculatorState.inOperation = value);
    const setCurrentOperation = (value) =>
        (calculatorState.currentOperation = value);
    const setWorkingValue = (value) => (calculatorState.workingValue = value);
    const setIsDecimal = (value) => (calculatorState.isDecimal = value);
    const setIsDecimalWorkingValue = (value) =>
        (calculatorState.isDecimalWorkingValue = value);
    const setWorkingValueWholeNumber = (value) =>
        (calculatorState.workingValueWholeNumber = value);
    const setWorkingValueDecimalNumber = (value) =>
        (calculatorState.workingValueDecimalNumber = value);

    // map keyboard keys to calculator buttons
    const keyMap = {
        Enter: 'equals',
        '=': 'equals',
        Backspace: 'clear',
        Clear: 'clear',
        '+': 'add',
        '-': 'subtract',
        '*': 'multiply',
        '/': 'divide',
        '^': 'exponentiate',
        '.': 'decimal',
    };

    // math operations
    const add = (a, b) => a + b;
    const subtract = (a, b) => a - b;
    const multiply = (a, b) => a * b;
    const divide = (a, b) => a / b;
    const exponentiate = (a, b) => a ** b;

    // helpers
    const getScreenValue = (screen) => screen.textContent;
    const updateScreen = (screen, value) => (screen.textContent = value);
    const clear = (screen) => {
        updateScreen(screen, '0');
        setTotal(0);
        setInOperation(false);
        setCurrentOperation('');
        setIsDecimal(false);
        setIsDecimalWorkingValue(false);
        setWorkingValueWholeNumber(0);
        setWorkingValueDecimalNumber(0);
        setWorkingValue(0);
    };
    const equals = () => updateScreen(calculatorState.total);
    const reverseObjectKeysAndValues = (obj) =>
        Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [value, key])
        );

    // operations map for hashing
    const operations = {
        add,
        subtract,
        multiply,
        divide,
        exponentiate,
        equals,
        clear,
    };

    // bind buttons to keyboard keys
    window.addEventListener('keydown', (e) => {
        const isNumber = !isNaN(e.key);
        const isDecimal = e.key === '.';
        const selector =
            isNumber || isDecimal
                ? `button[data-value="${e.key}"]`
                : `button[data-operation="${keyMap?.[e.key]}"]`;
        const key = document.querySelector(selector);

        // so we don't get more than one decimal point
        if (calculatorState.isDecimalWorkingValue && isDecimal) return;

        // limit key presses to only those on the calculator
        if (!key) return;
        key.click();
    });

    // calls correct operation (add, subtract, etc.)
    const operate = (operator, a, b) => operations?.[operator](a, b);

    // saves total based on inOperation state and turns inOperation on
    const saveTotal = (operator) => {
        setTotal(
            calculatorState.inOperation
                ? operate(
                      operator,
                      calculatorState.total,
                      calculatorState.workingValue
                  )
                : calculatorState.workingValue
        );
        setInOperation(true);
    };

    // calculates final total and updates screen
    const calculate = (operator, a, b) => {
        setTotal(operate(operator, a, b));
        updateScreen(screen, calculatorState.total);
    };

    // event listeners
    numberButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const value = button?.dataset?.value;

            setIsDecimal(value === '.');

            // if we just hit a decimal key, we know we're working with a decimal until we hit another operator
            if (calculatorState.isDecimal) {
                setIsDecimalWorkingValue(true);
            }

            // udpate screen
            screen.textContent =
                getScreenValue(screen) === '0'
                    ? value
                    : `${getScreenValue(screen)}${value}`;

            // if we're working with a decimal, split the working value into whole number and decimal parts
            if (calculatorState.isDecimalWorkingValue) {
                if (calculatorState.isDecimal) {
                    // if working value is 0 or a decimal number, set our whole number place to 0
                    setWorkingValueWholeNumber(
                        parseFloat(
                            calculatorState.workingValue === 0 ||
                                calculatorState.workingValue % 1
                                ? 0
                                : calculatorState.workingValue
                        )
                    );
                }

                setWorkingValueDecimalNumber(
                    parseFloat(
                        `${calculatorState.workingValueDecimalNumber}${value}`
                    )
                );
            } else {
                setWorkingValueWholeNumber(
                    parseFloat(`${calculatorState.workingValue}${value}`)
                );
            }

            // join the whole number and decimal parts together for a final working value
            setWorkingValue(
                parseFloat(
                    `${calculatorState.workingValueWholeNumber}.${calculatorState.workingValueDecimalNumber}`
                )
            );
        });
    });

    operatorButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const operation = button?.dataset?.operation;
            const symbol = reverseObjectKeysAndValues(keyMap)[operation];

            // if we're still running operations, save the total and update the screen
            if (operation !== 'equals') {
                saveTotal(calculatorState.currentOperation);
                updateScreen(screen, `${getScreenValue(screen)} ${symbol} `);
                if (!calculatorState.isDecimal) {
                    setWorkingValue(0);
                }
                setCurrentOperation(operation);
            } else {
                // otherwise calculate the final total and update the screen
                calculate(
                    calculatorState.currentOperation,
                    calculatorState.total,
                    calculatorState.workingValue
                );
                updateScreen(screen, calculatorState.total);
                setWorkingValue(calculatorState.total);
                setCurrentOperation(operation);
                setInOperation(false);
            }
            setIsDecimalWorkingValue(false);
            setWorkingValueWholeNumber(0);
            setWorkingValueDecimalNumber(0);
        });
    });

    clearButton.addEventListener('click', () => clear(screen));
};

initiatlizeCalculator();
