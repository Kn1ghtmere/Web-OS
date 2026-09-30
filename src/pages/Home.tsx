import { useState, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import calcIcon from '../assets/icons/calc.svg';
import calendarIcon from '../assets/icons/calendar.svg';
import fileManagerIcon from '../assets/icons/file-manager.svg';
import musicIcon from '../assets/icons/gnome-music.svg';
import todoIcon from '../assets/icons/gnome-todo.svg';
import settingsIcon from '../assets/icons/settings-icon.svg';
import terminalIcon from '../assets/icons/terminal.svg';
import bgJapan from '../assets/backgrounds/japan.jpg';

interface DockItem {
  id: string;
  label: string;
  icon: string;
}

const ICON = 56;
const GAP = 18;
const MAX_DIST = 150;

const dockItems: DockItem[] = [
  { id: 'file-manager', label: 'Files', icon: fileManagerIcon },
  { id: 'terminal', label: 'Terminal', icon: terminalIcon },
  { id: 'todo', label: 'To-Do', icon: todoIcon },
  { id: 'music', label: 'Music', icon: musicIcon },
  { id: 'calc', label: 'Calculator', icon: calcIcon },
  { id: 'calendar', label: 'Calendar', icon: calendarIcon },
  { id: 'settings', label: 'Settings', icon: settingsIcon },
];

export default function Home() {
  const [scales, setScales] = useState<number[]>(dockItems.map(() => 1));
  const [hovered, setHovered] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    setScales(
      dockItems.map((_, i) => {
        const el = itemRefs.current[i];
        if (!el) return 1;
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(e.clientX - (rect.left + rect.width / 2));
        return distance < MAX_DIST ? 1 + 0.5 * Math.pow(1 - distance / MAX_DIST, 2) : 1;
      })
    );
  };

  const handleMouseLeave = () => {
    setScales(dockItems.map(() => 1));
    setHovered(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        backgroundImage: `url(${bgJapan})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        color: '#fff',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 12,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'flex-end',
            gap: GAP,
            padding: '10px 18px 14px',
            borderRadius: 26,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          }}
        >
          {dockItems.map((item, i) => {
            const scale = scales[i];
            return (
              <div
                key={item.id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ position: 'relative', width: ICON, height: ICON }}
              >
                {hovered === i && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: ICON * scale + 12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(20,20,25,0.85)',
                      color: '#fff',
                      fontSize: 12,
                      padding: '4px 10px',
                      borderRadius: 6,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                    }}
                  >
                    {item.label}
                  </span>
                )}
                <img
                  src={item.icon}
                  alt={item.label}
                  draggable={false}
                  style={{
                    display: 'block',
                    width: ICON,
                    height: ICON,
                    objectFit: 'contain',
                    transform: `scale(${scale})`,
                    transformOrigin: 'bottom center',
                    transition: 'transform 100ms ease-out',
                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}