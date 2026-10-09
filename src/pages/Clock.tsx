import { useState, useEffect, useRef, type MouseEvent as RME, type ReactNode } from 'react';
import { Minus } from 'lucide-react';

type Tab = 'world' | 'alarm' | 'stopwatch' | 'timer';
interface Alarm { id: string; time: string; label: string; enabled: boolean; days: number[] }
interface ClockProps { onClose: () => void; onMinimize: () => void; zIndex: number; onFocus: () => void }

const W = 760, H = 520;
const LOCAL = Intl.DateTimeFormat().resolvedOptions().timeZone;
const zones: [string, string][] = [
  ['Local', LOCAL], ['New York', 'America/New_York'], ['London', 'Europe/London'],
  ['Tokyo', 'Asia/Tokyo'], ['Sydney', 'Australia/Sydney'], ['Dubai', 'Asia/Dubai'],
  ['Los Angeles', 'America/Los_Angeles'], ['Karachi', 'Asia/Karachi'],
  ['Paris', 'Europe/Paris'], ['Beijing', 'Asia/Shanghai'],
];

const BLUE = 'bg-[rgba(59,130,246,0.85)]';
const RED = 'bg-[rgba(239,68,68,0.8)]';
const PILL = 'cursor-pointer rounded-full border-none px-8 py-3 text-white';
const CARD = 'rounded-xl border border-white/10 bg-white/5';
const INPUT = 'w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none placeholder:text-white/30 focus:border-blue-500';

const p = (n: number) => String(n).padStart(2, '0');
const fmtTime = (d: Date, timeZone?: string) =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone }).format(d);
const fmtDate = (d: Date, timeZone?: string) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone }).format(d);

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// each beep: [startMs, durationMs]
function beep(beeps: [number, number][]) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    beeps.forEach(([s, d]) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; gain.gain.value = 0.2;
      osc.start(ctx.currentTime + s / 1000);
      osc.stop(ctx.currentTime + (s + d) / 1000);
    });
    setTimeout(() => ctx.close(), Math.max(...beeps.map(([s, d]) => s + d)) + 100);
  } catch {}
}

function notify(body: string) {
  const show = () => new Notification('⏰ Alarm', { body });
  if (Notification.permission === 'granted') show();
  else if (Notification.permission !== 'denied')
    Notification.requestPermission().then((r) => r === 'granted' && show());
}

function WorldClock() {
  const now = useNow();
  const [selected, setSelected] = useState([LOCAL, 'America/New_York', 'Europe/London', 'Asia/Tokyo']);
  const [adding, setAdding] = useState(false);
  const available = zones.filter(([, tz]) => !selected.includes(tz));

  return (
    <div className="h-full overflow-auto p-1">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70">World Clock</h3>
        <button onClick={() => setAdding((v) => !v)} className={`cursor-pointer rounded-lg border-none ${BLUE} px-3 py-1.5 text-xs text-white`}>
          {adding ? 'Cancel' : '+ Add City'}
        </button>
      </div>

      {adding && (
        <div className="mb-3 flex flex-wrap gap-2 rounded-lg bg-white/5 p-3">
          {!available.length && <span className="text-xs text-white/50">All cities added</span>}
          {available.map(([label, tz]) => (
            <button key={tz} onClick={() => { setSelected((s) => [...s, tz]); setAdding(false); }}
              className="cursor-pointer rounded-md border-none bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20">
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {selected.map((tz) => {
          const label = zones.find(([, z]) => z === tz)?.[0] ?? tz.split('/').pop()?.replace('_', ' ') ?? tz;
          const isLocal = tz === LOCAL;
          const [hh, mm, ss] = fmtTime(now, tz).split(':');
          return (
            <div key={tz} className={`relative flex flex-col p-4 ${CARD}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">{label} {isLocal && <span className="text-white/40">· Local</span>}</span>
                {!isLocal && (
                  <button onClick={() => setSelected((s) => s.filter((x) => x !== tz))}
                    className="cursor-pointer rounded border-none bg-transparent text-white/40 hover:text-white">×</button>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-1 font-mono">
                <span className="text-3xl text-white">{hh}:{mm}</span>
                <span className="text-sm text-white/50">:{ss}</span>
              </div>
              <div className="mt-1 text-xs text-white/50">{fmtDate(now, tz)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlarmTab() {
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    try { return JSON.parse(localStorage.getItem('webos-alarms') || '[]'); } catch { return []; }
  });
  const [time, setTime] = useState('07:30');
  const [label, setLabel] = useState('');
  const now = useNow();
  const fired = useRef(new Set<string>());

  useEffect(() => { localStorage.setItem('webos-alarms', JSON.stringify(alarms)); }, [alarms]);

  useEffect(() => {
    const key = `${p(now.getHours())}:${p(now.getMinutes())}`;
    alarms.forEach((a) => {
      if (!a.enabled || a.time !== key || fired.current.has(a.id)) return;
      if (a.days.length && !a.days.includes(now.getDay())) return;
      fired.current.add(a.id);
      beep([[0, 1500]]);
      notify(a.label || a.time);
      setTimeout(() => fired.current.delete(a.id), 60_000);
    });
  }, [now, alarms]);

  const patch = (id: string, f: (a: Alarm) => Alarm) => setAlarms((l) => l.map((a) => (a.id === id ? f(a) : a)));
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="flex h-full flex-col">
      <div className={`mb-3 p-4 ${CARD}`}>
        <div className="flex items-end gap-3">
          {[['Time', 'time', time, setTime, ''], ['Label', 'text', label, setLabel, 'Wake up']].map(([l, type, v, set, ph]: any) => (
            <div key={l} className="flex-1">
              <label className="mb-1 block text-xs text-white/50">{l}</label>
              <input type={type} value={v} placeholder={ph} onChange={(e) => set(e.target.value)} className={INPUT} />
            </div>
          ))}
          <button
            onClick={() => { setAlarms((a) => [...a, { id: Math.random().toString(36).slice(2), time, label, enabled: true, days: [] }]); setLabel(''); }}
            className={`cursor-pointer rounded-lg border-none ${BLUE} px-5 py-2 text-white`}>
            Add
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {!alarms.length && <div className="mt-10 text-center text-sm text-white/40">No alarms set</div>}
        {alarms.map((a) => (
          <div key={a.id} className={`mb-2 flex items-center gap-4 p-4 ${CARD} ${a.enabled ? '' : 'opacity-50'}`}>
            <div className="flex-1">
              <div className="font-mono text-2xl text-white">{a.time}</div>
              <div className="mt-0.5 text-xs text-white/50">
                {a.label || 'Alarm'}
                {a.days.length > 0 && <span className="ml-2">{a.days.map((d) => dayNames[d]).join(' ')}</span>}
              </div>
            </div>
            <button onClick={() => patch(a.id, (x) => ({ ...x, enabled: !x.enabled }))}
              className="relative h-[26px] w-11 cursor-pointer rounded-[13px] border-none p-0 transition-colors"
              style={{ background: a.enabled ? '#3b82f6' : 'rgba(255,255,255,0.25)' }}>
              <span className="absolute top-[3px] h-5 w-5 rounded-full bg-white transition-[left]" style={{ left: a.enabled ? 21 : 3 }} />
            </button>
            <button onClick={() => setAlarms((l) => l.filter((x) => x.id !== a.id))}
              className="cursor-pointer rounded-md border-none bg-white/5 px-2 py-1 text-white/60 hover:bg-red-500/60 hover:text-white">🗑</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    if (!running) return;
    const start = performance.now() - elapsed;
    let raf = 0;
    const tick = () => { setElapsed(performance.now() - start); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const fmt = (ms: number) => `${p(Math.floor(ms / 60000))}:${p(Math.floor((ms % 60000) / 1000))}.${p(Math.floor((ms % 1000) / 10))}`;

  return (
    <div className="flex h-full flex-col items-center">
      <div className="mt-4 font-mono text-6xl text-white">{fmt(elapsed)}</div>
      <div className="mt-6 flex gap-3">
        <button onClick={() => setRunning((r) => !r)} className={`${PILL} ${running ? RED : BLUE}`}>
          {running ? 'Stop' : elapsed > 0 ? 'Resume' : 'Start'}
        </button>
        <button
          onClick={() => (running ? setLaps((l) => [elapsed, ...l]) : (setElapsed(0), setLaps([])))}
          disabled={elapsed === 0}
          className={`${PILL} bg-white/10 disabled:opacity-40`}>
          {running ? 'Lap' : 'Reset'}
        </button>
      </div>
      <div className="mt-6 w-full flex-1 overflow-auto">
        {laps.map((l, i) => (
          <div key={i} className="mb-1 flex justify-between rounded-lg bg-white/5 px-4 py-2 font-mono text-sm text-white/80">
            <span>Lap {laps.length - i}</span><span>{fmt(l)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimerTab() {
  const [total, setTotal] = useState(300);
  const [remaining, setRemaining] = useState(300);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && remaining <= 0) {
      setRunning(false); setDone(true);
      beep([[0, 200], [300, 200], [600, 200]]);
    }
  }, [remaining, running]);

  const reset = (secs = total) => { setTotal(secs); setRemaining(secs); setRunning(false); setDone(false); };
  const r = 45, circ = 2 * Math.PI * r;
  const pct = total > 0 ? 1 - remaining / total : 0;

  return (
    <div className="flex h-full flex-col items-center">
      <div className="relative mt-6 h-52 w-52">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
          <circle cx="50" cy="50" r={r} fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} style={{ transition: 'stroke-dashoffset 0.5s linear' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-mono text-4xl text-white">{p(Math.floor(remaining / 60))}:{p(remaining % 60)}</div>
          {done && <div className="mt-1 text-xs text-red-400">Time's up!</div>}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={() => (done ? reset() : setRunning((v) => !v))} className={`${PILL} ${running ? RED : BLUE}`}>
          {done ? 'Reset' : running ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => reset()} className={`${PILL} bg-white/10`}>Reset</button>
      </div>

      <div className="mt-6 flex gap-2">
        {[1, 3, 5, 10, 25].map((m) => (
          <button key={m} onClick={() => reset(m * 60)}
            className="cursor-pointer rounded-lg border-none bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20">{m}m</button>
        ))}
      </div>
    </div>
  );
}

const tabs: [Tab, string, () => ReactNode][] = [
  ['world', 'World Clock', WorldClock],
  ['alarm', 'Alarm', AlarmTab],
  ['stopwatch', 'Stopwatch', Stopwatch],
  ['timer', 'Timer', TimerTab],
];

export default function Clock({ onClose, onMinimize, zIndex, onFocus }: ClockProps) {
  const [tab, setTab] = useState<Tab>('world');
  const [pos, setPos] = useState(() => ({
    x: Math.max(12, (window.innerWidth - W) / 2),
    y: Math.max(12, (window.innerHeight - H) / 2 - 40),
  }));

  const startDrag = (e: RME) => {
    const ox = e.clientX - pos.x, oy = e.clientY - pos.y;
    const move = (ev: MouseEvent) => setPos({ x: ev.clientX - ox, y: Math.max(0, ev.clientY - oy) });
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const View = tabs.find(([id]) => id === tab)![2];

  return (
    <div onMouseDown={onFocus}
      className="absolute flex flex-col overflow-hidden rounded-xl border border-white/25 text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      style={{ left: pos.x, top: pos.y, width: W, height: H, maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100vh - 24px)', zIndex }}>
      <div onMouseDown={startDrag} className="flex h-10 shrink-0 select-none items-center justify-between bg-[rgba(17,20,27,0.95)] py-0 pl-4 pr-2">
        <span className="text-sm">Clock</span>
        <div className="flex items-center gap-1">
          <button onMouseDown={(e) => e.stopPropagation()} onClick={onMinimize}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-white">
            <Minus size={16} />
          </button>
          <button onMouseDown={(e) => e.stopPropagation()} onClick={onClose}
            className="h-7 w-7 cursor-pointer rounded-md border-none bg-transparent text-base text-white">×</button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 bg-[rgba(24,26,32,0.96)]">
        <div className="box-border flex w-[170px] shrink-0 flex-col gap-1 border-r border-white/10 p-3">
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="w-full cursor-pointer rounded-lg border-none px-3.5 py-2.5 text-left text-sm text-white"
              style={{ background: tab === id ? 'rgba(59,130,246,0.85)' : 'transparent' }}>
              {label}
            </button>
          ))}
        </div>
        <div className="min-w-0 flex-1 overflow-auto p-5"><View /></div>
      </div>
    </div>
  );
}