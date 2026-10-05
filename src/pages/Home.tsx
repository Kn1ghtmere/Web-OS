import { useState, useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

import {dockItems} from "../components/dock/dockItems";
import DialDock from '../components/dock/DialDock';
import Settings from './Settings';
import Notes from './Notes';
import Calendar from './Calender';
import MusicPlayer from './MusicPlayer';
import Todo from './Todo';



import {
  wallpapers,
  defaultSettings,
  loadSettings,
  saveSettings,
} from '../components/settings/SettingsConfig';

import type { SettingsState } from '../components/settings/SettingsConfig';


type WindowId = 'settings' | 'calc' | 'music' | 'notes' | 'Calendar'|'todo';

const isWindowId = (id: string): id is WindowId =>
  id === 'settings' || id === 'calc' || id === 'music' || id === 'notes' || id === 'Calendar' || id === 'todo';



export default function Home() {
  const [settings, setSettings] = useState<SettingsState>(loadSettings);
  const [openWindows, setOpenWindows] = useState<WindowId[]>([]);
  const [scales, setScales] = useState<number[]>(dockItems.map(() => 1));
  const [hovered, setHovered] = useState<number | null>(null);
  const [minimized, setMinimized] = useState<WindowId[]>([]);




  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = (patch: Partial<SettingsState>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  const bringToFront = (id: WindowId) => {
  setMinimized((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : prev));
  setOpenWindows((prev) =>
    prev[prev.length - 1] === id ? prev : [...prev.filter((w) => w !== id), id]
  );
  };

  const minimizeWindow = (id: WindowId) => 
    setMinimized((prev) => (prev.includes(id) ? prev : [...prev, id]));

  const closeWindow = (id: WindowId) => {
    setOpenWindows((prev) => prev.filter((w) => w !== id));
    setMinimized((prev) => prev.filter((w) => w !== id));
  };


  const topWindow = openWindows[openWindows.length - 1];

  const handleItemClick = (id: string) => {
    if (!isWindowId(id)) return;

    if (!openWindows.includes(id) || minimized.includes(id) || topWindow !== id) bringToFront(id);
    else minimizeWindow(id);
  };

  const wallpaper =
    wallpapers.find((w) => w.id === settings.wallpaper) ?? wallpapers[0];

  const iconSize = settings.iconSize;
  const gap = Math.round(iconSize * 0.32);
  const maxDist = iconSize * 2.7;
  const amount = settings.magnificationAmount / 100;

  const winStyle = (id: WindowId) => ({ display: minimized.includes(id) ? 'none' : 'block' } );

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!settings.magnification) return;

    setScales(
      dockItems.map((_, i) => {
        const el = itemRefs.current[i];
        if (!el) return 1;

        const rect = el.getBoundingClientRect();
        const distance = Math.abs(e.clientX - (rect.left + rect.width / 2));

        return distance < maxDist
          ? 1 + amount * Math.pow(1 - distance / maxDist, 2)
          : 1;
      })
    );
  };

  const handleMouseLeave = () => {
    setScales(dockItems.map(() => 1));
    setHovered(null);
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden text-left font-sans text-white"
      style={{
        backgroundImage: `url(${wallpaper.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {openWindows.includes('settings') && (
       <div style={winStyle('settings')}>
        <Settings
       settings={settings}
       onChange={updateSettings}
       onReset={() => setSettings(defaultSettings)}
       onClose={() => closeWindow('settings')}
       onMinimize={() => minimizeWindow('settings')}
       zIndex={10 + openWindows.indexOf('settings')}
       onFocus={() => bringToFront('settings')}
    />
        </div>
)}

      {openWindows.includes('notes') && (
        <div style={winStyle('notes')}>
        <Notes
          zIndex={10 + openWindows.indexOf('notes')}
          onFocus={() => bringToFront('notes')}
          onMinimize={() => minimizeWindow('notes')}
          onClose={() => closeWindow('notes')}
        />
        </div>
      )}

      {openWindows.includes('Calendar') && (
        <div style={winStyle('Calendar')}>
        <Calendar
          zIndex={10 + openWindows.indexOf('Calendar')}
          onFocus={() => bringToFront('Calendar')}
          onClose={() => closeWindow('Calendar')}
          onMinimize={() => minimizeWindow('Calendar')}
        />
        </div>
      )}

      {openWindows.includes('music') && (
        <div style={winStyle('music')}>
          <MusicPlayer
          zIndex={10 + openWindows.indexOf('music')}
          onFocus={()=> bringToFront('music')}
          onMinimize={() => minimizeWindow('music')}
          onClose={()=> closeWindow('music')}
          />
          </div>
      )}

      {openWindows.includes('todo') && (
        <div style={winStyle('todo')}>
          <Todo
          zIndex={10 + openWindows.indexOf('todo')}
          onFocus={() => bringToFront('todo')}
          onMinimize={() => minimizeWindow('todo')}
          onClose={() => closeWindow('todo')}
          />
          </div>
      )}

      
      
      {settings.dockStyle ==='dial' && (
        <DialDock
         items={dockItems}
         iconSize={iconSize}
         onItemClick={handleItemClick}
         showLabels={settings.showLabels}
         openIds={openWindows}
         minimizedIds={minimized}
         opacity={settings.dockOpacity}
         magnification={settings.magnification}
         magnificationAmount={settings.magnificationAmount}
         />
      )}
      
    {settings.dockStyle === 'bottom' && (

      <div className="pointer-events-none absolute bottom-3 left-0 right-0 z-[1000] flex justify-center">
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="pointer-events-auto flex items-end rounded-[26px] border border-white/30 px-[18px] pb-[14px] pt-[10px] shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-[16px]"
          style={{
            gap,
            background: `rgba(255,255,255,${settings.dockOpacity / 100})`,
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {dockItems.map((item, i) => {
            const scale = settings.magnification ? scales[i] : 1;
            const clickable = isWindowId(item.id);
            const open = isWindowId(item.id) && openWindows.includes(item.id);
            const isMin = isWindowId(item.id) && minimized.includes(item.id);

            return (
              <div
                key={item.id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                onClick={() => handleItemClick(item.id)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={`relative ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
                style={{
                  width: iconSize,
                  height: iconSize,
                }}
              >
                {settings.showLabels && hovered === i && (
                  <span
                    className="pointer-events-none absolute left-1/2 whitespace-nowrap rounded-md bg-[rgba(20,20,25,0.85)] px-[10px] py-1 text-xs text-white"
                    style={{
                      bottom: iconSize * scale + 12,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {item.label}
                  </span>
                )}

                <img
                  src={item.icon}
                  alt={item.label}
                  draggable={false}
                  className="block object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] transition-transform duration-100 ease-out"
                  style={{
                    width: iconSize,
                    height: iconSize,
                    transform: `scale(${scale})`,
                    transformOrigin: 'bottom center',
                  }}
                />

                {open && (
                  <span className={`absolute bottom-[-9px] left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full ${ isMin ? 'bg-white/40' : 'bg-white'}`}
                   />
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}


