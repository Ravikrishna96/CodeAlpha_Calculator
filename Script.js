const display = document.getElementById("display");
const history = document.getElementById("history");
const buttons = document.querySelector(".buttons");

let current = "0";
let stored = null;
let operation = null;
let waiting = false;
let finished = false;

function render() {
    display.value = current;
}

function symbol(op) {
    return {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷",
        "%": "%"
    }[op] || op;
}

function format(n) {
    if (!Number.isFinite(n)) return "Error";
    if (Object.is(n, -0)) n = 0;
    return String(Number(n.toPrecision(10)));
}

function inputNumber(value) {
    if (current === "Error") clearAll();

    if (waiting || finished) {
        current = value === "." ? "0." : value;
        waiting = false;
        finished = false;
        render();
        return;
    }

    if (value === "." && current.includes(".")) return;

    if (current === "0" && value !== ".") {
        current = value;
    } else if (current.length < 15) {
        current += value;
    }

    render();
}

function calculateResult(a, b, op) {
    switch (op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return b === 0 ? null : a / b;
        case "%": return b === 0 ? null : a % b;
        default: return null;
    }
}

function chooseOperator(next) {
    if (current === "Error") return;

    const value = Number(current);

    if (operation && !waiting) {
        const result = calculateResult(stored, value, operation);

        if (result === null || !Number.isFinite(result)) {
            showError();
            return;
        }

        stored = result;
        current = format(result);
    } else if (stored === null || finished) {
        stored = value;
    }

    operation = next;
    waiting = true;
    finished = false;

    history.textContent =
        format(stored) + " " + symbol(operation);

    render();
}

function equals() {
    if (
        operation === null ||
        stored === null ||
        waiting ||
        current === "Error"
    ) return;

    const a = stored;
    const b = Number(current);
    const op = operation;
    const result = calculateResult(a, b, op);

    history.textContent =
        format(a) + " " + symbol(op) + " " +
        format(b) + " =";

    if (result === null || !Number.isFinite(result)) {
        showError();
        return;
    }

    current = format(result);
    stored = null;
    operation = null;
    waiting = false;
    finished = true;

    render();
}

function showError() {
    current = "Error";
    stored = null;
    operation = null;
    waiting = false;
    finished = true;
    render();
}

function clearAll() {
    current = "0";
    stored = null;
    operation = null;
    waiting = false;
    finished = false;
    history.textContent = "READY TO CALCULATE";
    render();
}

function deleteLast() {
    if (current === "Error") {
        clearAll();
        return;
    }

    if (waiting || finished) {
        current = "0";
        waiting = false;
        finished = false;
    } else if (current.length > 1) {
        current = current.slice(0, -1);

        if (current === "-") current = "0";
    } else {
        current = "0";
    }

    render();
}

function toggleSign() {
    if (current === "Error" || current === "0") return;

    current = current.startsWith("-")
        ? current.slice(1)
        : "-" + current;

    render();
}

buttons.addEventListener("click", function(event) {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.value !== undefined) {
        const value = button.dataset.value;

        if ("0123456789.".includes(value) && value.length === 1) {
            inputNumber(value);
        } else {
            chooseOperator(value);
        }

        return;
    }

    switch (button.dataset.action) {
        case "clear":
            clearAll();
            break;
        case "delete":
            deleteLast();
            break;
        case "sign":
            toggleSign();
            break;
        case "equals":
            equals();
            break;
    }
});

document.addEventListener("keydown", function(event) {
    if (/^[0-9.]$/.test(event.key)) {
        inputNumber(event.key);
    } else if (["+", "-", "*", "/", "%"].includes(event.key)) {
        chooseOperator(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        equals();
    } else if (event.key === "Backspace") {
        deleteLast();
    } else if (event.key === "Escape") {
        clearAll();
    }
});

render();