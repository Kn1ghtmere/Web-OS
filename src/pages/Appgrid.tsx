import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface AppItem {
  id: string;
  label: string;
  icon: string;
}


interface AppGridProps {
  apps: AppItem[];
  onOpen: (id: string) => void;
  onClose: () => void;
}

export default function AppGrid({ apps, onOpen, onClose }: AppGridProps) {
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      const typing = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
      if (typing && document.activeElement !== inputRef.current) inputRef.current?.focus();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const shown = apps.filter((a) => a.label.toLowerCase().includes(q));

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-[900] flex flex-col items-center overflow-auto bg-black/45 px-10 pb-36 pt-14 backdrop-blur-2xl transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-[380px] max-w-full items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 text-white"
      >
        <Search size={16} className="shrink-0 text-white/70" />
        <input
          ref={inputRef}
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && shown[0]) onOpen(shown[0].id);
          }}
          placeholder="Type to search"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/60"
        />
      </div>

      <div className="mt-12 grid w-full max-w-[860px] grid-cols-[repeat(auto-fill,minmax(120px,1fr))] justify-items-center gap-x-4 gap-y-8">
        {shown.map((app) => (
          <button
            key={app.id}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(app.id);
            }}
            className="flex w-[110px] cursor-pointer flex-col items-center gap-2 rounded-xl p-3 text-white hover:bg-white/15"
          >
            <img
              src={app.icon}
              alt={app.label}
              draggable={false}
              className="h-[72px] w-[72px] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]"
            />
            <span className="text-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{app.label}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 && <div className="mt-16 text-white/70">No apps found</div>}
    </div>
  );
}



