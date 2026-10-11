import { useState, useEffect, type FormEvent, type MouseEvent as RME } from 'react';
import type { IconType } from 'react-icons';
import {
  FiSun, FiMoon, FiCloud, FiCloudRain, FiCloudDrizzle, FiCloudSnow,
  FiCloudLightning, FiSearch, FiRefreshCw, FiWind, FiDroplet, FiThermometer,
} from 'react-icons/fi';

interface WeatherProps { onClose: () => void; zIndex: number; onFocus: () => void }
interface Place { name: string; country?: string; lat: number; lon: number }
type Unit = 'c' | 'f';

interface WeatherData {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
  };
  hourly: { time: string[]; temperature_2m: number[]; weather_code: number[] };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
}


const W = 680, H = 540;
const STORAGE_KEY = 'webos-weather';
const DEFAULT_PLACE : Place = { name : 'Karachi', country : 'Pakistan', lat: 24.8607, lon:67.0011};

const BLUE = 'bg-[rgba(59,130,246,0.85)]';

const CARD = 'rounded-xl border border-white/10 bg-white/5';

const describe = (code: number, isDay = true): { label: string; Icon: IconType; color: string } => {
  if (code === 0) return isDay
    ? { label: 'Clear sky', Icon: FiSun, color: 'text-amber-300' }
    : { label: 'Clear night', Icon: FiMoon, color: 'text-indigo-300' };
  if (code <= 2) return { label: 'Partly cloudy', Icon: FiCloud, color: 'text-sky-200' };
  if (code === 3) return { label: 'Overcast', Icon: FiCloud, color: 'text-slate-300' };
  if (code === 45 || code === 48) return { label: 'Fog', Icon: FiCloud, color: 'text-slate-400' };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', Icon: FiCloudDrizzle, color: 'text-sky-300' };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
    return { label: 'Rain', Icon: FiCloudRain, color: 'text-blue-400' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return { label: 'Snow', Icon: FiCloudSnow, color: 'text-cyan-100' };
  if (code >= 95) return { label: 'Thunderstorm', Icon: FiCloudLightning, color: 'text-yellow-300' };
  return { label: 'Unknown', Icon: FiCloud, color: 'text-white/60' };
};







const loadSaved = (): { place: Place; unit: Unit } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.place?.name && typeof parsed.place.lat === 'number') {
        return { place: parsed.place, unit: parsed.unit === 'f' ? 'f' : 'c' };
      }
    }
  } catch {}
  return { place: DEFAULT_PLACE, unit: 'c' };



};





const buildUrl = (p: Place, unit: Unit) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}` +
  `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day` +
  `&hourly=temperature_2m,weather_code` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
  `&timezone=auto` +
  `&temperature_unit=${unit === 'c' ? 'celsius' : 'fahrenheit'}` +
  `&wind_speed_unit=${unit === 'c' ? 'kmh' : 'mph'}`;







export default function Weather({ onClose, zIndex, onFocus }: WeatherProps) {
  const saved = useState(loadSaved)[0];
  const [place, setPlace] = useState<Place>(saved.place);
  const [unit, setUnit] = useState<Unit>(saved.unit);
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState<string | null>(null);

  const [pos, setPos] = useState(() => ({
    x: Math.max(12, (window.innerWidth - W) / 2),
    y: Math.max(12, (window.innerHeight - H) / 2 - 40),
  }));







  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ place, unit })); } catch {}
  }, [place, unit]);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fetch(buildUrl(place, unit), { signal: ctrl.signal })
      .then((r) => { if (!r.ok) throw new Error('bad response'); return r.json(); })
      .then((json: WeatherData) => setData(json))
      .catch((e) => { if (e.name !== 'AbortError') setError('Could not load weather. Check your connection and refresh.'); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [place, unit, tick]);







  const search = async (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchMsg(null);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`,
      );
      if (!res.ok) throw new Error('bad response');
      const json = await res.json();
      const found: Place[] = (json.results ?? []).map((r: any) => ({
        name: r.name, country: r.country, lat: r.latitude, lon: r.longitude,
      }));
      setResults(found);
      if (!found.length) setSearchMsg(`No city found for "${q}".`);
    } catch {
      setResults([]);
      setSearchMsg('Search failed. Try again.');
    } finally {
      setSearching(false);
    }


  };




  const pick = (p: Place) => {
    setPlace(p);
    setResults([]);
    setQuery('');
    setSearchMsg(null);
  };





  const startDrag = (e: RME) => {
    const ox = e.clientX - pos.x, oy = e.clientY - pos.y;
    const move = (ev: MouseEvent) => setPos({ x: ev.clientX - ox, y: Math.max(0, ev.clientY - oy) });
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const deg = unit === 'c' ? '°C' : '°F';
  const speed = unit === 'c' ? 'km/h' : 'mph';





  let hourStart = 0;
  if (data) {
    const nowHour = data.current.time.slice(0, 13) + ':00';
    const i = data.hourly.time.findIndex((t) => t >= nowHour);
    hourStart = i === -1 ? 0 : i;
  }



  const hours = data ? data.hourly.time.slice(hourStart, hourStart + 12).map((t, i) => ({
    label: t.slice(11, 16),
    temp: data.hourly.temperature_2m[hourStart + i],
    code: data.hourly.weather_code[hourStart + i],
    isDay: Number(t.slice(11, 13)) >= 6 && Number(t.slice(11, 13)) < 19,
  })) : [];

  const cur = data ? describe(data.current.weather_code, data.current.is_day === 1) : null;






  return (
    <div onMouseDown={onFocus}
      className="absolute z-10 flex flex-col overflow-hidden rounded-xl border border-white/25 text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      style={{ left: pos.x, top: pos.y, width: W, height: H, maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100vh - 24px)', zIndex }}>
      <div onMouseDown={startDrag} className="flex h-10 shrink-0 select-none items-center justify-between bg-[rgba(17,20,27,0.95)] py-0 pl-4 pr-2">
        <span className="text-sm">Weather</span>
        <button onMouseDown={(e) => e.stopPropagation()} onClick={onClose}
          className="h-7 w-7 cursor-pointer rounded-md border-none bg-transparent text-base text-white">×</button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-[rgba(24,26,32,0.96)] p-5">
        <div className="relative mb-4">
          <form onSubmit={search} className="flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a city"
                spellCheck={false}
                className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-500"
              />
            </div>
            <button type="submit" disabled={searching || !query.trim()}
              className={`cursor-pointer rounded-lg border-none ${BLUE} px-4 py-2 text-sm text-white disabled:opacity-40`}>
              {searching ? 'Searching…' : 'Search'}
            </button>
            <button type="button" onClick={() => setUnit((u) => (u === 'c' ? 'f' : 'c'))}
              title="Switch units"
              className="cursor-pointer rounded-lg border-none bg-white/10 px-3 py-2 font-mono text-sm text-white hover:bg-white/20">
              {deg}
            </button>
            <button type="button" onClick={() => setTick((t) => t + 1)} title="Refresh"
              className="cursor-pointer rounded-lg border-none bg-white/10 p-2.5 text-white hover:bg-white/20">
              <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </form>





          {(results.length > 0 || searchMsg) && (
            <div className="absolute left-0 right-0 top-11 z-20 overflow-hidden rounded-lg border border-white/15 bg-[#121216] shadow-2xl">
              {searchMsg && <div className="px-3 py-2 text-xs text-white/50">{searchMsg}</div>}
              {results.map((r) => (
                <button key={`${r.lat}-${r.lon}`} onClick={() => pick(r)}
                  className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-3 py-2 text-left text-sm text-white hover:bg-white/10">
                  <span>{r.name}</span>
                  <span className="text-xs text-white/40">{r.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
        )}

        {!data && loading && <div className="mt-16 text-center text-sm text-white/40">Loading weather…</div>}



        {data && cur && (
          <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <div className={`mb-4 flex items-center justify-between p-5 ${CARD}`}>
              <div>
                <div className="text-sm text-white/60">
                  {place.name}{place.country ? `, ${place.country}` : ''}
                </div>
                <div className="mt-1 flex items-start font-mono text-7xl font-light leading-none text-white">
                  {Math.round(data.current.temperature_2m)}
                  <span className="mt-1 text-2xl text-white/50">{deg}</span>
                </div>
                <div className="mt-2 text-sm text-white/80">{cur.label}</div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <cur.Icon size={64} className={cur.color} />
                <div className="flex gap-4 text-xs text-white/60">
                  <span className="flex items-center gap-1.5"><FiThermometer size={13} />Feels {Math.round(data.current.apparent_temperature)}°</span>
                  <span className="flex items-center gap-1.5"><FiDroplet size={13} />{data.current.relative_humidity_2m}%</span>
                  <span className="flex items-center gap-1.5"><FiWind size={13} />{Math.round(data.current.wind_speed_10m)} {speed}</span>
                </div>
              </div>




            </div>

            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {hours.map((h, i) => {
                const d = describe(h.code, h.isDay);
                return (
                  <div key={h.label + i} className={`flex w-16 shrink-0 flex-col items-center gap-1.5 py-3 ${CARD}`}>
                    <span className="font-mono text-xs text-white/50">{i === 0 ? 'Now' : h.label}</span>
                    <d.Icon size={18} className={d.color} />
                    <span className="font-mono text-sm text-white">{Math.round(h.temp)}°</span>
                  </div>
                );
              })}
            </div>






            <div className={`${CARD} divide-y divide-white/5`}>
              {data.daily.time.map((day, i) => {
                const d = describe(data.daily.weather_code[i]);
                const label = i === 0 ? 'Today' : new Date(`${day}T00:00`).toLocaleDateString('en-US', { weekday: 'long' });
                const rain = data.daily.precipitation_probability_max?.[i];
                return (
                  <div key={day} className="flex items-center gap-4 px-4 py-2.5 text-sm">
                    <span className="w-24 text-white/80">{label}</span>
                    <d.Icon size={16} className={d.color} />
                    <span className="w-24 text-xs text-white/50">{d.label}</span>
                    <span className="flex w-12 items-center gap-1 text-xs text-blue-300">
                      {typeof rain === 'number' && rain > 0 && <><FiDroplet size={11} />{rain}%</>}
                    </span>
                    <span className="ml-auto flex gap-3 font-mono">
                      <span className="text-white/45">{Math.round(data.daily.temperature_2m_min[i])}°</span>
                      <span className="text-white">{Math.round(data.daily.temperature_2m_max[i])}°</span>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 text-right text-[11px] text-white/30">Data from Open-Meteo</div>
          </div>
        )}
      </div>
    </div>
  );
}