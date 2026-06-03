const elExpression = document.getElementById('expression');
const elResult = document.getElementById('result');
const keys = Array.from(document.querySelectorAll('.key'));

let input = '0';
let acc = null;
let pendingOp = null;
let justEvaluated = false;
let waitingForNextOperand = false;

function setResult(str) {
  input = str;
  elResult.textContent = str;
}

function getInputNumber() {
  return Number(input);
}

function setExpressionText(text) {
  elExpression.textContent = text;
}

function clearAll() {
  input = '0';
  acc = null;
  pendingOp = null;
  justEvaluated = false;
  waitingForNextOperand = false;

  setResult('0');
  setExpressionText('');
}

function backspace() {
  if (justEvaluated || waitingForNextOperand) return;

  if (input.length <= 1 || (input.length === 2 && input.startsWith('-'))) {
    setResult('0');
    return;
  }

  input = input.slice(0, -1);

  if (input === '-' || input === '') {
    input = '0';
  }

  setResult(input);
}

function appendDigit(d) {
  if (justEvaluated) {
    clearAll();
  }

  if (waitingForNextOperand) {
    setResult(d);
    waitingForNextOperand = false;
    return;
  }

  if (input === '0') {
    setResult(d);
  } else {
    setResult(input + d);
  }
}

function appendDot() {
  if (justEvaluated) {
    clearAll();
  }

  if (waitingForNextOperand) {
    setResult('0.');
    waitingForNextOperand = false;
    return;
  }

  if (!input.includes('.')) {
    setResult(input + '.');
  }
}

function toggleSign() {
  if (input === '0') return;

  if (input.startsWith('-')) {
    setResult(input.slice(1));
  } else {
    setResult('-' + input);
  }
}

function percentage() {
  if (elResult.textContent === 'Error') return;

  const current = getInputNumber();

  let result;

  if (acc !== null && pendingOp) {
    result = (acc * current) / 100;
  } else {
    result = current / 100;
  }

  setResult(String(result));
}

function applyOperation(a, op, b) {
  switch (op) {
    case '+':
      return a + b;

    case '-':
      return a - b;

    case '*':
      return a * b;

    case '/':
      return b === 0 ? NaN : a / b;

    default:
      return b;
  }
}

function chooseOperator(op) {
  if (!['+', '-', '*', '/'].includes(op)) return;

  const x = getInputNumber();

  if (justEvaluated) {
    acc = x;
    pendingOp = op;
    justEvaluated = false;
    waitingForNextOperand = true;

    setExpressionText(`${acc} ${pendingOp}`);
    return;
  }

  if (acc === null) {
    acc = x;
    pendingOp = op;
    waitingForNextOperand = true;

    setExpressionText(`${acc} ${pendingOp}`);
    return;
  }

  if (waitingForNextOperand) {
    pendingOp = op;
    setExpressionText(`${acc} ${pendingOp}`);
    return;
  }

  const res = applyOperation(acc, pendingOp, x);

  if (!Number.isFinite(res)) {
    setResult('Error');

    acc = null;
    pendingOp = null;
    justEvaluated = true;
    waitingForNextOperand = false;

    setExpressionText('');
    return;
  }

  acc = res;
  pendingOp = op;

  const resStr = String(res);

  setResult(resStr);
  setExpressionText(`${resStr} ${pendingOp}`);

  waitingForNextOperand = true;
}

function equals() {
  if (pendingOp === null || acc === null || waitingForNextOperand) {
    justEvaluated = true;
    return;
  }

  const b = getInputNumber();

  const previousAcc = acc;
  const previousOp = pendingOp;

  const res = applyOperation(acc, pendingOp, b);

  if (!Number.isFinite(res)) {
    setResult('Error');

    acc = null;
    pendingOp = null;
    justEvaluated = true;
    waitingForNextOperand = false;

    setExpressionText('');
    return;
  }

  const resStr = String(res);

  setResult(resStr);
  setExpressionText(`${previousAcc} ${previousOp} ${b} =`);

  input = resStr;

  acc = null;
  pendingOp = null;

  justEvaluated = true;
  waitingForNextOperand = false;
}

function handleAction(action, value) {
  if (elResult.textContent === 'Error' && action !== 'clear') {
    return;
  }

  switch (action) {
    case 'clear':
      clearAll();
      break;

    case 'backspace':
      backspace();
      break;

    case 'digit':
      appendDigit(value);
      break;

    case 'dot':
      appendDot();
      break;

    case 'toggle-sign':
      toggleSign();
      break;

    case 'percent':
      percentage();
      break;

    case 'operator':
      chooseOperator(value);
      break;

    case 'equals':
      equals();
      break;
  }
}

keys.forEach(btn => {
  btn.addEventListener('click', () => {
    handleAction(btn.dataset.action, btn.dataset.value);
  });
});

window.addEventListener('keydown', (e) => {
  const key = e.key;

  if (key >= '0' && key <= '9') {
    e.preventDefault();
    handleAction('digit', key);
    return;
  }

  if (key === '.') {
    e.preventDefault();
    handleAction('dot');
    return;
  }

  if (['+', '-', '*', '/'].includes(key)) {
    e.preventDefault();
    handleAction('operator', key);
    return;
  }

  if (key === '%') {
    e.preventDefault();
    handleAction('percent');
    return;
  }

  if (key === 'Enter' || key === '=') {
    e.preventDefault();
    handleAction('equals');
    return;
  }

  if (key === 'Backspace') {
    e.preventDefault();
    handleAction('backspace');
    return;
  }

  if (key === 'Escape') {
    e.preventDefault();
    handleAction('clear');
    return;
  }

  if (key === 'F9') {
    e.preventDefault();
    handleAction('toggle-sign');
  }
});

clearAll();
