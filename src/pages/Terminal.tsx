import { useState, useRef, useEffect, type MouseEvent as RME, type KeyboardEvent as KE } from 'react';

type Node = string | { [name: string]: Node };
interface TermProps {
  onClose: () => void;
  zIndex: number;
  onFocus: () => void;
  onOpen?: (app: string) => void; // wire to your window manager
  apps?: string[];
}

const W = 640, H = 420;

// folders = objects, files = strings
const fs: Node = {
  home: { 'readme.txt': 'Welcome to webOS.', notes: { 'todo.txt': 'ship the terminal' } },
  etc: { version: 'webOS 0.1' },
};

const walk = (path: string[]) =>
  path.reduce<Node | undefined>((n, k) => (n && typeof n === 'object' ? n[k] : undefined), fs);

const resolve = (cwd: string[], to: string) => {
  const out = to.startsWith('/') ? [] : [...cwd];
  for (const s of to.split('/').filter(Boolean)) {
    if (s === '..') out.pop();
    else if (s !== '.') out.push(s);
  }
  return out;
};

export default function Terminal({ onClose, zIndex, onFocus, onOpen, apps = ['clock', 'terminal'] }: TermProps) {
  const [pos, setPos] = useState(() => ({
    x: Math.max(12, (window.innerWidth - W) / 2),
    y: Math.max(12, (window.innerHeight - H) / 2 - 40),
  }));
  const [cwd, setCwd] = useState(['home']);
  const [lines, setLines] = useState<string[]>(['webOS terminal. Type "help".']);
  const [input, setInput] = useState('');
  const hist = useRef<string[]>([]);
  const idx = useRef(0);
  const end = useRef<HTMLDivElement>(null);
  const inp = useRef<HTMLInputElement>(null);
  const prompt = `/${cwd.join('/')} $`;

  useEffect(() => end.current?.scrollIntoView(), [lines]);

  const run = (line: string) => {
    const [cmd, ...rest] = line.split(/\s+/);
    const arg = rest.join(' ');
    const target = resolve(cwd, arg);
    const cmds: Record<string, [string, () => string | void]> = {
      help: ['list commands', () => Object.entries(cmds).map(([k, [d]]) => `${k.padEnd(7)} ${d}`).join('\n')],
      ls: ['list files', () => {
        const n = walk(target);
        if (n === undefined) return `ls: ${arg}: not found`;
        return typeof n === 'string' ? arg : Object.entries(n).map(([k, v]) => k + (typeof v === 'object' ? '/' : '')).join('  ');
      }],
      cd: ['change directory', () => {
        const t = arg ? target : ['home'];
        if (typeof walk(t) !== 'object') return `cd: ${arg}: not a directory`;
        setCwd(t);
      }],
      pwd: ['print directory', () => '/' + cwd.join('/')],
      cat: ['print file', () => {
        const n = walk(target);
        return typeof n === 'string' ? n : `cat: ${arg}: no such file`;
      }],
      echo: ['print text', () => arg],
      date: ['current date/time', () => new Date().toString()],
      clear: ['clear screen', () => {}],
      open: ['open an app', () => {
        const a = arg.toLowerCase();
        if (!apps.includes(a)) return `open: unknown app. try: ${apps.join(', ')}`;
        onOpen?.(a);
        return `opening ${a}...`;
      }],
    };
    return cmds[cmd] ? cmds[cmd][1]() : `${cmd}: command not found`;
  };

  const onKey = (e: KE) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      idx.current = Math.min(hist.current.length, Math.max(0, idx.current + (e.key === 'ArrowUp' ? -1 : 1)));
      setInput(hist.current[idx.current] ?? '');
    }
    if (e.key !== 'Enter') return;
    const line = input.trim();
    setInput('');
    if (!line) return;
    hist.current.push(line);
    idx.current = hist.current.length;
    if (line === 'clear') return setLines([]);
    const out = run(line);
    setLines((l) => [...l, `${prompt} ${line}`, ...(out ? [out] : [])]);
  };

  const startDrag = (e: RME) => {
    const ox = e.clientX - pos.x, oy = e.clientY - pos.y;
    const move = (ev: MouseEvent) => setPos({ x: ev.clientX - ox, y: Math.max(0, ev.clientY - oy) });
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <div onMouseDown={onFocus}
      className="absolute z-10 flex flex-col overflow-hidden rounded-xl border border-white/25 text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      style={{ left: pos.x, top: pos.y, width: W, height: H, maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100vh - 24px)', zIndex }}>
      <div onMouseDown={startDrag} className="flex h-10 shrink-0 select-none items-center justify-between bg-[rgba(17,20,27,0.95)] py-0 pl-4 pr-2">
        <span className="text-sm">Terminal</span>
        <button onMouseDown={(e) => e.stopPropagation()} onClick={onClose}
          className="h-7 w-7 cursor-pointer rounded-md border-none bg-transparent text-base text-white">×</button>
      </div>

      <div onClick={() => inp.current?.focus()} className="min-h-0 flex-1 overflow-auto bg-[rgba(24,26,32,0.96)] p-4 font-mono text-sm text-white/80">
        {lines.map((l, i) => <div key={i} className="whitespace-pre-wrap">{l}</div>)}
        <div className="flex gap-2">
          <span className="text-blue-400">{prompt}</span>
          <input ref={inp} autoFocus value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey}
            spellCheck={false} className="flex-1 border-none bg-transparent text-white outline-none" />
        </div>
        <div ref={end} />
      </div>
    </div>
  );
}