import { useState, useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import calcIcon from '../assets/icons/calc.svg';
import calendarIcon from '../assets/icons/calendar.svg';
import fileManagerIcon from '../assets/icons/file-manager.svg';
import musicIcon from '../assets/icons/gnome-music.svg';
import todoIcon from '../assets/icons/gnome-todo.svg';
import settingsIcon from '../assets/icons/settings-icon.svg';
import terminalIcon from '../assets/icons/terminal.svg';
import Settings from './Settings';
import {
  wallpapers,
  defaultSettings,
  loadSettings,
  saveSettings,
} from '../components/settings/SettingsConfig';
import type { SettingsState } from '../components/settings/SettingsConfig';

interface DockItem {
  id: string;
  label: string;
  icon: string;
}

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
  const [settings, setSettings] = useState<SettingsState>(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scales, setScales] = useState<number[]>(dockItems.map(() => 1));
  const [hovered, setHovered] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = (patch: Partial<SettingsState>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  const wallpaper = wallpapers.find((w) => w.id === settings.wallpaper) ?? wallpapers[0];
  const iconSize = settings.iconSize;
  const gap = Math.round(iconSize * 0.32);
  const maxDist = iconSize * 2.7;
  const amount = settings.magnificationAmount / 100;

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!settings.magnification) return;
    setScales(
      dockItems.map((_, i) => {
        const el = itemRefs.current[i];
        if (!el) return 1;
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(e.clientX - (rect.left + rect.width / 2));
        return distance < maxDist ? 1 + amount * Math.pow(1 - distance / maxDist, 2) : 1;
      })
    );
  };

  const handleMouseLeave = () => {
    setScales(dockItems.map(() => 1));
    setHovered(null);
  };

  const handleItemClick = (id: string) => {
    if (id === 'settings') setSettingsOpen((open) => !open);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        backgroundImage: `url(${wallpaper.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        color: '#fff',
        textAlign: 'left',
      }}
    >
      {settingsOpen && (
        <Settings
          settings={settings}
          onChange={updateSettings}
          onReset={() => setSettings(defaultSettings)}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 12,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 20,
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
            gap,     padding: '10px 18px 14px',   borderRadius: 26,
            background: `rgba(255,255,255,${settings.dockOpacity / 100})`,  backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          }}
        >
          {dockItems.map((item, i) => {
            const scale = settings.magnification ? scales[i] : 1;
            const isSettings = item.id === 'settings';
            return (
              <div
                key={item.id}   ref={(el) => {    
                   itemRefs.current[i] = el;
                }}
                onClick={() => handleItemClick(item.id)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'relative',
                  width: iconSize,
                  height: iconSize,
                  cursor: isSettings ? 'pointer' : 'default',
                }}
              >
                {settings.showLabels && hovered === i && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: iconSize * scale + 12,
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
                    width: iconSize,
                    height: iconSize,
                    objectFit: 'contain',
                    transform: `scale(${scale})`,
                    transformOrigin: 'bottom center',
                    transition: 'transform 100ms ease-out',



                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))',
                  }}
                />
                {isSettings && settingsOpen && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -9,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#fff',
                    }}
                  />
                )}
              </div>
            );
          })}
          
        </div>


      </div>
    </div>
  );
}