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

