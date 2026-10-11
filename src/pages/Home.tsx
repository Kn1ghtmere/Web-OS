import { useState, useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent , ReactNode} from "react";

import {dockItems} from "../components/dock/dockItems";
import DialDock from '../components/dock/DialDock';
import FileManager from './Filemanager';
import CameraBooth from './CameraBooth';
import Settings from './Settings';
import Notes from './Notes';
import Calculator from './Calculator';
import Calendar from './Calender';
import MusicPlayer from './MusicPlayer';
import Clock from '../pages/Clock';
import Todo from './Todo';
import Terminal from "../pages/Terminal";
import Waybar from "../pages/Waybar";
import WidgetFrame from '../components/widgets/WidgetFrame';
import WidgetTrash from '../components/widgets/WidgetTrash';
import TodoWidget from '../components/widgets/TodoWidget';
import { loadWidgets, saveWidgets } from '../components/widgets/widgets';
import type { WidgetInstance , WidgetType } from '../components/widgets/widgets';
import { loadTasks, saveTasks } from '../components/todo/todoUtils';
import type { Task } from '../components/todo/todoUtils';
import NotesWidget from '../components/widgets/NotesWidget';
import { LayoutGrid } from 'lucide-react';

import AppGrid from './Appgrid';

import {
  wallpapers,
  defaultSettings,
  loadSettings,
  saveSettings,
} from "../components/settings/SettingsConfig";

import type { SettingsState } from '../components/settings/SettingsConfig';


const windowIds = [ 
  'settings',
  'music',
  'notes',
  'calendar',
  'clock',
  'todo',
  'file-manager',
  'terminal',
  'calculator',
  'camera-booth',
] as const;

type WindowId = (typeof windowIds)[number];

const isWindowId = (id: string): id is WindowId => (windowIds as readonly string[]).includes(id);

export default function Home() {
  const [settings, setSettings] = useState<SettingsState>(loadSettings);
  const [openWindows, setOpenWindows] = useState<WindowId[]>([]);
  const [gridOpen, setGridOpen] = useState(false);
  const [scales, setScales] = useState<number[]>(dockItems.map(() => 1));
  const [hovered, setHovered] = useState<number | null>(null);
  const [minimized, setMinimized] = useState<WindowId[]>([]);

  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [widgets, setWidgets] = useState<WidgetInstance[]>(loadWidgets);
  const [drag, setDrag] = useState({ dragging: false , overTrash: false});


  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = (patch: Partial<SettingsState>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    saveTasks(tasks);
    },[tasks]);


  useEffect(() => {
    saveWidgets(widgets);
  },[widgets]);

  useEffect(() => {
    setWidgets((prev) => {
      const next = prev.filter((w) => w.type !== 'todo-task' || tasks.some((t) => t.id === w.taskId));
      return next.length === prev.length ? prev : next;
    });
  },[tasks]);

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


  const hasWidget = (id: string) => widgets.some((w) => w.id === id);

  const toggleWidget = (id: string, type: WidgetType, taskId?: number) =>
    setWidgets((prev) => 
    prev.some((w) => w.id === id)
? prev.filter((w) => w.id !== id)
 : [...prev, {id, type, taskId, x: window.innerWidth - 264, y: 56 + prev.length * 130}]);


 
  const moveWidget = (id: string, x: number, y: number) => 
    setWidgets((prev) => prev.map((w) => (w.id === id ? {...w, x, y } : w )));

  const removeWidget = (id: string) => setWidgets((prev) => prev.filter((w) => w.id !== id));


  const handleDrag = (dragging: boolean, overTrash: boolean) => 
    setDrag((prev) => 
    prev.dragging === dragging && prev.overTrash === overTrash ? prev : { dragging, overTrash});


  const toggleTask = (id: number) => 
    setTasks((prev) => prev.map((t) => (t.id === id ? {...t, done: !t.done } : t )));

  const renderWidget = (id: string, content: ReactNode) => {
    const w = widgets.find((x) => x.id === id);
    if (!w) return null;
    return (
      <WidgetFrame
      key={w.id}
      x={w.x}
      y={w.y}
      onMove={(x,y) => moveWidget(w.id, x, y)}
      onDragChange={handleDrag}
      onRemove={() => removeWidget(w.id)}
      >
        {content}
      </WidgetFrame>
    );
  };
 






  const topWindow = openWindows[openWindows.length - 1];

  const handleItemClick = (id: string) => {
    if (!isWindowId(id)) return;
    
    setGridOpen(false);
    if (!openWindows.includes(id) || minimized.includes(id) || topWindow !== id) bringToFront(id);
    else minimizeWindow(id);
  };

  const openFromGrid = (id: string) => {
    if (!isWindowId(id)) return;

    bringToFront(id);
    setGridOpen(false);
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
      }),
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
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
  <Waybar
      openWindows={openWindows}
      active={topWindow}
      onSelect={(id) => isWindowId(id) && bringToFront(id)}
    /> 
    {openWindows.includes("terminal") && (
      <div style={winStyle('terminal')}>
        <Terminal
          onClose={() => closeWindow("terminal")}
          zIndex={10 + openWindows.indexOf("terminal")}
          onFocus={() => bringToFront("terminal")}
          apps={["settings", "clock", "terminal", "todo", "calendar", "notes", "file-manager","music", "calculator", "camera-booth"]}
          onOpen={(id) => isWindowId(id) && bringToFront(id)}
        />
        </div>
      )}
    {openWindows.includes('clock') && (
  <div style={winStyle('clock')}>
    <Clock
      onClose={() => closeWindow('clock')}
      onMinimize={() => minimizeWindow('clock')}
      zIndex={10 + openWindows.indexOf('clock')}
      onFocus={() => bringToFront('clock')}
    />
  </div>
)}
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
          hasWidget={hasWidget}
          toggleWidget={toggleWidget}
        />
        </div>
      )}

      {openWindows.includes('calendar') && (
        <div style={winStyle('calendar')}>
        <Calendar
          zIndex={10 + openWindows.indexOf('calendar')}
          onFocus={() => bringToFront('calendar')}
          onClose={() => closeWindow('calendar')}
          />
        </div>
      )}

      {openWindows.includes('music') && (
          <MusicPlayer
          zIndex={10 + openWindows.indexOf('music')}
          minimized={minimized.includes('music')}
          onFocus={()=> bringToFront('music')}
          onMinimize={() => minimizeWindow('music')}
          onClose={()=> closeWindow('music')}
          widgetOn={hasWidget('music')}
          onToggleWidget={() => toggleWidget('music' , 'music')}
          renderWidget={renderWidget}
          />
      )}

      {openWindows.includes('todo') && (
        <div style={winStyle('todo')}>
          <Todo
          zIndex={10 + openWindows.indexOf('todo')}
          onFocus={() => bringToFront('todo')}
          onMinimize={() => minimizeWindow('todo')}
          onClose={() => closeWindow('todo')}
          tasks={tasks}
          setTasks={setTasks}
          hasWidget={hasWidget}
          toggleWidget={toggleWidget}
          />
          </div>
      )}

        {openWindows.includes('file-manager') && (
          <div style={winStyle('file-manager')}>
  <FileManager
    zIndex={10 + openWindows.indexOf('file-manager')}
    onFocus={() => bringToFront('file-manager')}
    onClose={() => closeWindow('file-manager')}
  />
  </div>
)}


{openWindows.includes('calculator') && (
      <div style={winStyle('calculator')}>
        <Calculator
          zIndex={10 + openWindows.indexOf('calculator')}
          focused={topWindow === 'calculator'}
          onFocus={() => bringToFront('calculator')}
          onClose={() => closeWindow('calculator')}
        />
        </div>
      )}


      {openWindows.includes('camera-booth') && (
        <div style={winStyle('camera-booth')}>
        <CameraBooth
          zIndex={10 + openWindows.indexOf('camera-booth')}
          onFocus={() => bringToFront('camera-booth')}
          onClose={() => closeWindow('camera-booth')}
        />
        </div>
      )}

      {gridOpen && (
        <AppGrid apps={dockItems} onOpen={openFromGrid} onClose={() => setGridOpen(false)} />
      )}


    
    {widgets
    .filter((w) => w.type !== 'music')
    .map((w) => 
    renderWidget(
      w.id,
      w.type === 'notes-recent' ? (
        <NotesWidget onOpen={() => bringToFront('notes')} />
      ) : (
      <TodoWidget
      mode={w.type === 'todo-recent' ? 'recent' : 'task'}
      tasks={tasks}
      taskId={w.taskId}
      onToggle={toggleTask}
      onOpen={() => bringToFront('todo')}
      />
      )
    ))}
      
     <WidgetTrash visible={drag.dragging} active={drag.overTrash} />

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
      <div className="pointer-events-none absolute left-0 right-0 z-[1000] flex justify-center"
           style={{ bottom: drag.dragging ? 96 : 12, transition: 'bottom 200ms ease-out'}}
      >
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="pointer-events-auto flex items-end rounded-[26px] border border-white/30 px-[18px] pb-[14px] pt-[10px] shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-[16px]"
          style={{
            gap,
            background: `rgba(255,255,255,${settings.dockOpacity / 100})`,
            WebkitBackdropFilter: "blur(16px)",
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
                className={`relative ${clickable ? "cursor-pointer" : "cursor-default"}`}
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
                      transform: "translateX(-50%)",
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
                    transformOrigin: "bottom center",
                  }}
                />

                {open && (
                  <span className={`absolute bottom-[-9px] left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full ${ isMin ? 'bg-white/40' : 'bg-white'}`}
                   />
                )}
              </div>
            );
          })}

          <div className="h-10 w-px shrink-0 self-center bg-white/30" />

          <button
            onClick={() => setGridOpen((open) => !open)}
            title="Show apps"
            className={`flex shrink-0 cursor-pointer items-center justify-center rounded-xl border-none text-white ${
              gridOpen ? 'bg-white/35' : 'bg-white/20 hover:bg-white/30'
            }`}
            style={{ width: iconSize, height: iconSize }}
          >
            <LayoutGrid size={Math.round(iconSize * 0.5)} />
          </button>
        </div>
      </div>
      )}
    </div>
  );
}