// components/Waybar.tsx
import { useState, useEffect } from 'react';

interface WaybarProps {
  openWindows: string[];
  active?: string;
  onSelect: (id: string) => void;
}

export default function Waybar({ openWindows, active, onSelect }: WaybarProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute left-2 right-2 top-2 z-[900] flex h-9 items-center justify-between rounded-xl border border-white/15 bg-black/50 px-3 text-sm text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      {/* LEFT */}
      <div className="flex-1">webOS</div>

      {/* CENTER: open windows */}
      <div className="flex gap-1">
        {openWindows.map((id) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`cursor-pointer rounded-md border-none px-3 py-1 text-white ${
              id === active ? 'bg-white/20' : 'bg-transparent hover:bg-white/10'
            }`}
          >
            {id}
          </button>
        ))}
      </div>

      {/* RIGHT */}
      <div className="flex-1 text-right font-mono">
        {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}