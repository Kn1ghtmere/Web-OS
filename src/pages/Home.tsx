import { useState, useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

import {dockItems} from "../components/dock/dockItems";
import DialDock from '../components/dock/DialDock';
 
import Settings from './Settings';

import {
  wallpapers,
  defaultSettings,
  loadSettings,
  saveSettings,
} from '../components/settings/SettingsConfig';

import type { SettingsState } from '../components/settings/SettingsConfig';


type WindowId = 'settings' | 'calc' | 'music';

const isWindowId = (id: string): id is WindowId =>
  id === 'settings' || id === 'calc' || id === 'music';



export default function Home() {
  const [settings, setSettings] = useState<SettingsState>(loadSettings);
  const [openWindows, setOpenWindows] = useState<WindowId[]>([]);
  const [scales, setScales] = useState<number[]>(dockItems.map(() => 1));
  const [hovered, setHovered] = useState<number | null>(null);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = (patch: Partial<SettingsState>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  const bringToFront = (id: WindowId) =>
    setOpenWindows((prev) =>
      prev[prev.length - 1] === id ? prev : [...prev.filter((w) => w !== id), id]
    );

  const closeWindow = (id: WindowId) =>
    setOpenWindows((prev) => prev.filter((w) => w !== id));

  const topWindow = openWindows[openWindows.length - 1];

  const handleItemClick = (id: string) => {
    if (!isWindowId(id)) return;

    if (!openWindows.includes(id) || topWindow !== id) bringToFront(id);
    else closeWindow(id);
  };

  const wallpaper =
    wallpapers.find((w) => w.id === settings.wallpaper) ?? wallpapers[0];

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
        <Settings
          settings={settings}
          onChange={updateSettings}
          onReset={() => setSettings(defaultSettings)}
          onClose={() => closeWindow('settings')}
          zIndex={10 + openWindows.indexOf('settings')}
          onFocus={() => bringToFront('settings')}
        />
      )}

      
      
      {settings.dockStyle ==='dial' && (
        <DialDock
         items={dockItems}
         iconSize={iconSize}
         onItemClick={handleItemClick}
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
                  <span className="absolute bottom-[-9px] left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-white" />
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


