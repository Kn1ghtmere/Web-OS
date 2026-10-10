import { useState, useEffect } from 'react';

interface WaybarProps {
  openWindows: string[];
  active?: string;
  onSelect: (id: string) => void;
}

export default function Waybar({ onOpenAbout, onOpenSettings, onOpenTerminal }: WaybarProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute left-2 right-2 top-1 z-[900] grid h-9 grid-cols-3 items-center rounded-xl border border-white/15 bg-black/50 px-3 text-sm text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      
      <div className="flex items-center">
        <h1 className="relative cursor-pointer font-semibold pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-pink-500 after:shadow-[0_0_10px_#ec4899] after:transition-all after:duration-300 hover:after:w-full">
          WofOS
        </h1>
      </div>

      <div className="flex items-center justify-center font-mono">
        {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </div>

      <div></div>

    </div>
  );
}