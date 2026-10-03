import { useState, useEffect } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

interface CalEvent {
  id: number;
  date: string;
  text: string;
}

const STORAGE_KEY = 'webos-events';
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

const dateKey = (d: Date) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

const loadEvents = (): CalEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

interface CalendarProps {
  zIndex: number;
  onFocus: () => void;
  onClose: () => void;
}

export default function Calendar({ zIndex, onFocus, onClose }: CalendarProps) {
  const [view, setView] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(() => new Date());
  const [events, setEvents] = useState<CalEvent[]>(loadEvents);
  const [text, setText] = useState('');
  const [pos, setPos] = useState({
    x: Math.max(12, window.innerWidth / 2 - 370),
    y: Math.max(12, window.innerHeight / 2 - 270),
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      return;
    }
  }, [events]);




  const year = view.getFullYear();
  const month = view.getMonth();


  const firstDay = new Date(year, month, 1).getDay();
  const cells = Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - firstDay + i));

  const todayKey = dateKey(new Date());
  const selectedKey = dateKey(selected);
  const dayEvents = events.filter((ev) => ev.date === selectedKey);

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

  const goToday = () => {
    const d = new Date();   setView(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelected(d);
  };

  const pickDay = (d: Date) => {
    setSelected(d);
    if (d.getMonth() !== month) setView(new Date(d.getFullYear(), d.getMonth(), 1));
  };





  const addEvent = () => {
    const t = text.trim();
    if (!t) return;
    setEvents([...events, { id: Date.now(), date: selectedKey, text: t }]);
    setText('');
  };

  const removeEvent = (id: number) => setEvents(events.filter((ev) => ev.id !== id));

  return (
    <div
      onMouseDown={onFocus}
      className="absolute flex h-[500px] w-[740px] max-w-[calc(100vw_-_24px)] flex-col overflow-hidden rounded-xl border border-[#1b1b1b] bg-[#242424] text-white shadow-xl"
      style={{ left: pos.x, top: pos.y, zIndex }}
    >
      <div

        onMouseDown={startDrag}
        className="flex h-10 shrink-0 select-none items-center justify-between bg-[#303030] pl-4 pr-2 text-sm"
      >
        <span>Calendar</span>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-[#c01c28]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex-1 text-lg font-bold">
              {view.toLocaleDateString([], { month: 'long', year: 'numeric' })}
            </div>
            <button
              onClick={() => setView(new Date(year, month - 1, 1))}
              className="cursor-pointer rounded-md p-1.5 hover:bg-[#3d3d3d]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goToday}
              className="cursor-pointer rounded-md bg-[#3d3d3d] px-3 py-1 text-xs hover:bg-[#4a4a4a]"
            >
              Today
            </button>
            <button
              onClick={() => setView(new Date(year, month + 1, 1))}
              className="cursor-pointer rounded-md p-1.5 hover:bg-[#3d3d3d]"
            >
              <ChevronRight size={18} />
            </button>
          </div>



          <div className="mb-1 grid grid-cols-7 text-center text-xs text-gray-400">
            {weekdays.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>

          <div className="grid flex-1 grid-cols-7 grid-rows-6 gap-1">
            {cells.map((d) => {
              const k = dateKey(d);
              const inMonth = d.getMonth() === month;
              const isToday = k === todayKey;

              const isSelected = k === selectedKey;
              const hasEvents = events.some((ev) => ev.date === k);

              return (
                <button
                  key={k}
                  onClick={() => pickDay(d)}
                  className={`relative flex cursor-pointer items-center justify-center rounded-lg text-sm ${
                    isToday ? 'bg-[#3584e4] hover:bg-[#4a94ee]' : 'hover:bg-[#333]'
                  } ${inMonth ? 'text-white' : 'text-gray-600'} ${
                    isSelected ? 'ring-2 ring-[#78aeed]' : ''
                  }`}
                >
                  {d.getDate()}
                  {hasEvents && (
                    <span
                      className={`absolute bottom-1.5 h-1 w-1 rounded-full ${
                        isToday ? 'bg-white' : 'bg-[#78aeed]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex w-64 shrink-0 flex-col border-l border-[#1b1b1b] bg-[#2a2a2a]">
          <div className="border-b border-[#1b1b1b] p-4 text-sm font-semibold">
            {selected.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>

          <div className="flex-1 overflow-auto">
            {dayEvents.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">Nothing planned</div>
            )}

            {dayEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-2 border-b border-[#333] px-4 py-2.5 text-sm"
              >
                <span className="flex-1 break-words">{ev.text}</span>
                <button
                  onClick={() => removeEvent(ev.id)}
                  className="cursor-pointer text-gray-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-t border-[#1b1b1b] p-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEvent()}
              placeholder="Add something"
              className="min-w-0 flex-1 rounded-md border border-[#3d3d3d] bg-[#1e1e1e] px-2.5 py-1.5 text-sm outline-none placeholder:text-gray-600"
            />
            <button
              onClick={addEvent}
              className="flex cursor-pointer items-center rounded-md bg-[#3584e4] px-2.5 hover:bg-[#4a94ee]"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
