import { useState } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { X } from 'lucide-react';
import BackgroundSwitcher from '../components/settings/BacgroundSwitcher';
import type { SettingsState } from '../components/settings/SettingsConfig';

type Tab = 'wallpaper' | 'dock' | 'general';

const tabs: { id: Tab; label: string }[] = [
  { id: 'wallpaper', label: 'Wallpaper' },
  { id: 'dock', label: 'Dock' },
  { id: 'general', label: 'General' },
];

const WIDTH = 720;
const HEIGHT = 480;

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-[26px] w-11 cursor-pointer rounded-[13px] border-none p-0 transition-colors duration-150 ${
        checked ? 'bg-blue-500' : 'bg-white/25'
      }`}
    >
      <span
        className={`absolute top-[3px] h-5 w-5 rounded-full bg-white transition-[left] duration-150 ${
          checked ? 'left-[21px]' : 'left-[3px]'
        }`}
      />
    </button>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div>
        <div className="text-sm">{label}</div>
        {hint && <div className="mt-0.5 text-xs text-white/55">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

function SliderRow({ label, value, min, max, unit, disabled, onChange }: SliderRowProps) {
  return (
    <div className={`mb-5 ${disabled ? 'opacity-40' : 'opacity-100'}`}>
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-white/60">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );
}

interface SettingsProps {
  settings: SettingsState;
  onChange: (patch: Partial<SettingsState>) => void;
  onReset: () => void;
  onClose: () => void;
  zIndex: number;
  onFocus: () => void;
}

export default function Settings({ settings, onChange, onReset, onClose, zIndex, onFocus }: SettingsProps) {
  const [tab, setTab] = useState<Tab>('wallpaper');
  const [pos, setPos] = useState(() => ({
    x: Math.max(12, (window.innerWidth - WIDTH) / 2),
    y: Math.max(12, (window.innerHeight - HEIGHT) / 2 - 40),
  }));

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

  return (
    <div
      onMouseDown={onFocus}
      className="absolute box-border flex max-h-[calc(100vh_-_24px)] max-w-[calc(100vw_-_24px)] flex-col overflow-hidden rounded-xl border border-white/25 text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      style={{ left: pos.x, top: pos.y, width: WIDTH, height: HEIGHT, zIndex }}
    >
      <div
        onMouseDown={startDrag}
        className="flex h-10 shrink-0 select-none items-center justify-between bg-[rgba(17,20,27,0.95)] py-0 pl-4 pr-2"
      >
        <span className="text-sm">Settings</span>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-white hover:bg-red-500"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 bg-[rgba(24,26,32,0.96)]">
        <div className="box-border flex w-[170px] shrink-0 flex-col gap-1 border-r border-white/10 p-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full cursor-pointer rounded-lg border-none px-3.5 py-2.5 text-left text-sm text-white ${
                tab === t.id ? 'bg-blue-500/[0.85]' : 'bg-transparent hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="min-w-0 flex-1 overflow-auto p-5">
          {tab === 'wallpaper' && (
            <BackgroundSwitcher value={settings.wallpaper} onChange={(id) => onChange({ wallpaper: id })} />
          )}

          {tab === 'dock' && (
            <div>
              <SliderRow
                label="Icon size"
                value={settings.iconSize}
                min={40}
                max={80}
                unit="px"
                onChange={(iconSize) => onChange({ iconSize })}
              />
              <Row label="Magnification" hint="Icons grow as the cursor moves over the dock">
                <Toggle checked={settings.magnification} onChange={(magnification) => onChange({ magnification })} />
              </Row>
              <SliderRow
                label="Magnification amount"
                value={settings.magnificationAmount}
                min={10}
                max={70}
                unit="%"
                disabled={!settings.magnification}
                onChange={(magnificationAmount) => onChange({ magnificationAmount })}
              />
              <Row label="Show labels" hint="Name above an icon on hover">
                <Toggle checked={settings.showLabels} onChange={(showLabels) => onChange({ showLabels })} />
              </Row>
              <SliderRow
                label="Dock transparency"
                value={settings.dockOpacity}
                min={0}
                max={60}
                unit="%"
                onChange={(dockOpacity) => onChange({ dockOpacity })}
              />
            </div>
          )}

          {tab === 'general' && (
            <div>
              <Row label="Reset settings" hint="Restore the wallpaper and dock to their defaults">
                <button
                  onClick={onReset}
                  className="cursor-pointer rounded-lg border-none bg-red-500/80 px-4 py-2 text-sm text-white hover:bg-red-500"
                >
                  Reset
                </button>
              </Row>
              <div className="text-[13px] leading-[1.5] text-white/55">
                Settings are saved in this browser and restored the next time you open the page.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}