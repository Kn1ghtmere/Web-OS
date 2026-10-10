import { useState, useEffect } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { Delete, Divide, Equal, Minus, Percent, Plus, X } from 'lucide-react';

interface CalcState {
  display: string;
  acc: number | null;
  op: string | null;
  expr: string;
  fresh: boolean;
}

const initialState: CalcState = { display: '0', acc: null, op: null, expr: '', fresh: true };
const errorState: CalcState = { display: 'Error', acc: null, op: null, expr: '', fresh: true };

const operators = ['+', '-', '×', '÷'];
const keys = [
  'C', '⌫', '%', '÷',
  '7', '8', '9', '×',
  '4', '5', '6', '-',
  '1', '2', '3', '+',
  '±', '0', '.', '=',
];

const WIDTH = 320;
const HEIGHT = 500;

const label = (k: string) => (k === '-' ? '−' : k);

const format = (n: number) => String(Number(n.toPrecision(12)));

const compute = (a: number, op: string, b: number) => {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '×') return a * b;
  return b === 0 ? NaN : a / b;
};

function reduce(state: CalcState, k: string): CalcState {
  if (k === 'C') return initialState;

  const base = state.display === 'Error' ? initialState : state;

  if (/^[0-9]$/.test(k)) {
    if (base.fresh) {
      return { ...base, display: k, expr: base.op ? base.expr : '', fresh: false };
    }
    if (base.display === '0') return { ...base, display: k };
    if (base.display.replace('-', '').replace('.', '').length >= 15) return base;
    return { ...base, display: base.display + k };
  }

  if (k === '.') {
    if (base.fresh) {
      return { ...base, display: '0.', expr: base.op ? base.expr : '', fresh: false };
    }
    if (base.display.includes('.')) return base;
    return { ...base, display: base.display + '.' };
  }

  if (k === '⌫') {
    if (base.fresh) return base;
    const tooShort =
      base.display.length <= 1 || (base.display.length === 2 && base.display.startsWith('-'));
    return { ...base, display: tooShort ? '0' : base.display.slice(0, -1) };
  }

  if (k === '±') {
    if (base.display === '0') return base;
    return {
      ...base,
      display: base.display.startsWith('-') ? base.display.slice(1) : '-' + base.display,
    };
  }

  if (k === '%') {
    const cur = parseFloat(base.display);
    const value =
      base.acc !== null && (base.op === '+' || base.op === '-')
        ? (base.acc * cur) / 100
        : cur / 100;
    return { ...base, display: format(value), fresh: true };
  }

  if (operators.includes(k)) {
    const cur = parseFloat(base.display);
    if (base.acc !== null && base.op && !base.fresh) {
      const result = compute(base.acc, base.op, cur);
      if (!Number.isFinite(result)) return errorState;
      return {
        display: format(result),
        acc: result,
        op: k,
        expr: `${format(result)} ${label(k)}`,
        fresh: true,
      };
    }
    if (base.acc !== null && base.op) {
      return { ...base, op: k, expr: `${format(base.acc)} ${label(k)}` };
    }
    return { display: base.display, acc: cur, op: k, expr: `${format(cur)} ${label(k)}`, fresh: true };
  }

  if (k === '=') {
    if (base.acc === null || !base.op) return base;
    const cur = parseFloat(base.display);
    const result = compute(base.acc, base.op, cur);
    if (!Number.isFinite(result)) return errorState;
    return {
      display: format(result),
      acc: null,
      op: null,
      expr: `${format(base.acc)} ${label(base.op)} ${format(cur)} =`,
      fresh: true,
    };
  }

  return base;
}

function keyToCalc(key: string): string | null {
  if (/^[0-9]$/.test(key)) return key;
  if (key === '.' || key === ',') return '.';
  if (key === '+') return '+';
  if (key === '-') return '-';
  if (key === '*' || key === 'x') return '×';
  if (key === '/') return '÷';
  if (key === 'Enter' || key === '=') return '=';
  if (key === 'Backspace') return '⌫';
  if (key === 'Escape' || key === 'c' || key === 'C') return 'C';
  if (key === '%') return '%';
  return null;
}

function bgFor(k: string) {
  if (k === '=') return 'bg-[#3584e4]';
  if (operators.includes(k)) return 'bg-[#4a4a4a]';
  if (['C', '⌫', '%', '±'].includes(k)) return 'bg-[#3c3c3c]';
  return 'bg-[#2f2f2f]';
}

function KeyLabel({ k }: { k: string }) {
  if (k === '÷') return <Divide size={20} />;
  if (k === '×') return <X size={20} />;
  if (k === '-') return <Minus size={20} />;
  if (k === '+') return <Plus size={20} />;
  if (k === '=') return <Equal size={20} />;
  if (k === '%') return <Percent size={18} />;
  if (k === '⌫') return <Delete size={20} />;
  return <>{k}</>;
}

interface CalculatorProps {
  zIndex: number;
  focused: boolean;
  onFocus: () => void;
  onClose: () => void;
}

export default function Calculator({ zIndex, focused, onFocus, onClose }: CalculatorProps) {
  const [state, setState] = useState<CalcState>(initialState);
  const [pos, setPos] = useState({
    x: Math.max(12, (window.innerWidth - WIDTH) / 2 - 200),
    y: Math.max(12, (window.innerHeight - HEIGHT) / 2 - 40),
  });

  const press = (k: string) => setState((prev) => reduce(prev, k));

  useEffect(() => {
    if (!focused) return;

    const onKey = (e: KeyboardEvent) => {
      const mapped = keyToCalc(e.key);
      if (!mapped) return;
      e.preventDefault();
      setState((prev) => reduce(prev, mapped));
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focused]);

  const startDrag = (e: ReactMouseEvent) => {
    const offX = e.clientX - pos.x;
    const offY = e.clientY - pos.y;

    const move = (ev: MouseEvent) => {
      setPos({ x: ev.clientX - offX, y: Math.max(0, ev.clientY - offY) });
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const len = state.display.length;
  const size = len > 14 ? 'text-[26px]' : len > 10 ? 'text-[34px]' : 'text-[44px]';

  return (
    <div
      onMouseDown={onFocus}
      className="absolute flex h-[500px] w-[320px] flex-col overflow-hidden rounded-[10px] border border-[#3a3a3a] bg-[#1e1e1e] text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
      style={{ left: pos.x, top: pos.y, zIndex }}
    >
      <div
        onMouseDown={startDrag}
        className="flex h-9 shrink-0 select-none items-center border-b border-[#1a1a1a] bg-[#2b2b2b] pl-3 pr-1.5 text-[13px]"
      >
        <span className="w-7" />
        <span className="flex-1 text-center">Calculator</span>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-[#c01c28]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex h-[116px] shrink-0 flex-col items-end justify-end gap-1 px-4 py-3">
        <div className="h-[18px] text-sm tabular-nums text-[#9a9a9a]">{state.expr}</div>
        <div
          className={`max-w-full overflow-hidden whitespace-nowrap leading-[1.1] tabular-nums ${size} ${
            state.display === 'Error' ? 'text-[#ff7b72]' : 'text-white'
          }`}
        >
          {state.display}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-4 gap-1.5 p-2.5">
        {keys.map((k) => (
          <button
            key={k}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => press(k)}
            className={`flex cursor-pointer items-center justify-center rounded-md border-0 text-xl text-white hover:brightness-125 ${bgFor(k)}`}
          >
            <KeyLabel k={k} />
          </button>
        ))}
      </div>
    </div>
  );
}