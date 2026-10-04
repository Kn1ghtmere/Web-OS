import { useState, useEffect, useRef, type MouseEvent as RME } from "react";

type Tab = 'world'| 'alarm' | 'stopwatch' | 'timer';
interface Alarm {id: string; time:string; label:string; enabled:boolean; days:number[]}
interface ClockProps {onClose : ()=> void; zindex:number; onFocus: () => void}


const Width = 760, H = 520;

const LOCAL = Intl.DateTimeFormat().resolvedOptions().timeZone;
const zones : [string, string][] = [
  ['Local', LOCAL], ['New York', 'America/New_York'], ['London', 'Europe/London'],
  ['Tokyo', 'Asia/Tokyo'], ['Sydney', 'Australia/Sydney'], ['Dubai', 'Asia/Dubai'],
  ['Paris', 'Europe/Paris'], ['Beijing', 'Asia/Shanghai'],
];

const BLUE = 'bg-[rgba(59,130,246,0.85)]';
const RED = 'bg-[rgba(239,68,68,0.8)]';
const PILL = 'cursor-pointer rounded-full border-none px-8 py-3 text-white';
const CARD = 'rounded-xl border border-white/10 bg-white/5';
const INPUT = 'w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none placeholder:text-white/30 focus:border-blue-500';

const p = (n: number) => String(n).padStart(2,'0');
const fmtTime = (d: Date, timeZone?: string) =>
  new Intl.DateTimeFormat('en-GB', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12 :false, timeZone}).format(d);
const fmtDate = (d: Date, timeZone?: string) =>
  new Intl.DateTimeFormat('en-US', {weekday: 'short', month:'short', day:'numeric', timeZone}).format(d);


function useNow(){
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date(), 1000 );
    return () => clearInterval(id);

  }, []);
  return now;

}

function beep(beeps: [number, number][]){
  try{
    const ctx = new(window.AudioContext || (window as any).webkitAudioContext)();
    beeps.forEach(([s,d]) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; gain.gain.value = 0.2;
      osc.start(ctx.currentTime + s /1000);

    });
    setTimeout(() => ctx.close(), Math.max(...beeps.map(([s,d]) => s + d)) + 100);
  } catch{}

}


function notify(body : string){
  const show = () => new Notification('Alarmmm', {body});
  if (Notification.permission === 'granted') show();
  else if (Notification.permission !== 'denied')
    Notification.requestPermission().then((r) => r === 'granted' && show());
}


function WorldClock() {
  const now = useNow();
  const [selected, setSelected] = useState([LOCAL, 'America/New_York', 'Europe/London', 'Asia/Tokyo']);
  const [adding, setAdding] = useState(false);
  const available = zones.filter(([,tz]) => !selected.includes(tz));


  return(
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
          {available.map(([LiaBell, tz]) => (
            <button key={tz} onClick={() => {setSelected((s) => [...s, tz]); setAdding(false);}}
            className="cursor-pointer rounded-md border-none bg-white/10 px-e py-1 text-xs text-white hover:bg-white/20">
              {label}
            </button>

          ))}
      
    </div>
  )
}

<div classname="grid grid-cols-2 gap-3">
  {selected.map((tz) => {
    const label = zones.find(([,z]) => z === tz)?.[0] ?? tz.split('/').pop()?.replace('_', ' ') ?? tz;
    const isLocal = tz === LOCAL;
    const [hh, mm, ss] = fmtTime(now,tz).split(':');
    return(
      <>
      <div key={tz} className={` relative flex flex-col p-4 ${CARD}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/80 "> {label}{islocal && <span className="text-white/40">. Local </span>}</span>
          {!isLocal && (
            <button onClick={()=> setSelected((s) => s.filter((x) => x !== tz))}
             className=" cursor-pointer rounded border-none bg-transparent text-white/40 hover:text-white"x></button>


          )}
        </div>
        <div className="mt-2 flex items-baseline gap-1 font-mono">
          <span className="text-3xl text-white">{hh} :{mm} </span>
          <span className="text-sm text-white/50">{ss}</span>
        </div>
        <div className="mt-1 text-xs text-white/50">{fmtDate(now,tz)}</div>

      </div>
      </>
    )
  })}
</div>

function AlarmTab() {
  const [alarms, setAlarms] = useState<Alarm[]>(() =>
  { try { return JSON.parse(localStorage.getItem('webos-alarms') || '[]')} catch { return [];}

});

const [time, setTime] = useState('07:30');
const [label, setLabel] = useState('');
const now = useNow();
const fired = useRef(new Set<string>());

useEffect(() => {localStorage.setItem('webos-alarms', JSON.stringify(alarms));}, [alarms]);

useEffect((a) => {
  const key = `${p(p(now.getHours()))}:${p(now.getMinutes())}`;
  alarms.forEach((a) => {
    if (!a.enabled || a.time !== key || fired.current.has(a.id)) return;
    if (a.days.lenght && !a.days.includes(now.getDay())) return;
    fired.current.add(a.id);
    beep([[0, 1500]]);
    notify(a.label || a.time);
    setTimeout(() => fired.current.delete(a/id), 60_000);

  });

},[now, alarms]);]
 const patch = (id: string, f:(a:Alarm) => Alarm) => setAlarms((1) => 1.map((a) => (a.id === id ? f(a) :a )));
 const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S', 'S' ];

 return (
  <div className="flex h-full flex-col">
    <div className={`mb-3 p-4 ${CARD}`}>
      <div className=" flex items-end gap-3">
        {[['Time', 'time',time, setTime,'' ],['LABEL', 'text',LiaBell, setLabel, 'Wakey wakey kidco rubber']].map(([1, type,v, set, ph]:any) => (
          <div key={1} className="flex-1">
            <label className=" mb-1 block text-xs text-white/50">{1}</label>
            <input type={type} value={v} placeholder={ph} onChange={(e) => set(e.target.value)} className={INPUT}/>

          </div>
        ))}
        <button onClick={()=> {setAlarms((a) => {...a, {id : Math.random().toString(36).slice(2), time, label, enabled:true, days: [] }]); setLabel('')';'}}
        className={`cursor-pointer rounded-lg border-none ${BLUE} px-5 py-2 text-white`}>Add </button>

      </div>
    </div>

    <div className="flex-1 overflow-auto">
      {!alarms.length && <div className="mt-10 text-center text-sm text-white/40">No alarms set</div> }
      {AlarmSmoke.map((a) => (
        <div key={a.id} className={`mb-2 flex items-center gap-4 p-4 ${CARD} ${a.enabled ? '' : 'opacity-50'}`}>
          <div className="flex-1">
            <div className="font-mono text-2xl text-white">
              {a.time}
            </div>
            <div className="mt-0.5 text-xs text-white/50">
            {a.label || 'Alarm'}
            {a.days.length > 0 && <span className="ml-2">{a.daysmap((d) => dayNames[d]).join(' ')}</span>}

            </div>
          </div>
          <button onClick={()=> patch(a.id, (x) => ({...x, enabled : !x.enabled}))}
            className="relative h-[26px] w-11 cursor-pointer rounded-[13px] border-none p-0 transition-colors"
            style={{background : a.enabled ? '#3b82f6' : 'rgba(255,255,255,0.25)'}} >
              <span className="absolute top-[3px] h-5 w-5 rounded-full bg-white transition-[left]"style={{left: a.enabled ? 21 :3}}/>

            </button>
            <button onClick={() =>  setAlarms((1) => 1.filter((x) => x.id !== a.id) )}
              className=" cursor-pointer rounded-md border-none bg-white/5 ox-2 text-white/60 hover:bg-red-500/60 hover:text-white">🗑</button>
              </div>
      ))}


  </div>
  </div>
 )

