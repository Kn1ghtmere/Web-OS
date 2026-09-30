import { useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
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
      style={{
        position: 'relative',
        width: 44,
        height: 26,
        padding: 0,
        border: 'none',
        borderRadius: 13,
        cursor: 'pointer',
        background: checked ? '#3b82f6' : 'rgba(255,255,255,0.25)',
        transition: 'background 150ms',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 150ms',
        }}
      />
    </button>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 20,
      }}
    >
      <div>
        <div style={{ fontSize: 14 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{hint}</div>}
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
    <div style={{ marginBottom: 20, opacity: disabled ? 0.4 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
        <span>{label}</span>
        <span style={{ color: 'rgba(255,255,255,0.6)' }}>
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
        style={{ width: '100%', accentColor: '#3b82f6' }}
      />
    </div>
  );
}

interface SettingsProps {
  settings: SettingsState;
  onChange: (patch: Partial<SettingsState>) => void;
  onReset: () => void;
  onClose: () => void;
}

export default function Settings({ settings, onChange, onReset, onClose }: SettingsProps) {
  const [tab, setTab] = useState<Tab>('wallpaper');
  const [pos, setPos] = useState(() => ({
    x: Math.max(12, (window.innerWidth - WIDTH) / 2),
    y: Math.max(12, (window.innerHeight - HEIGHT) / 2 - 40),
  }));

  const startDrag = (e: ReactMouseEvent) => {
    const offX = e.clientX - pos.x;
    const offY = e.clientY - pos.y;
    const move = (ev: MouseEvent) => setPos({ x: ev.clientX - offX, y: Math.max(0, ev.clientY - offY) });
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const tabStyle = (active: boolean): CSSProperties => ({
    width: '100%',
    textAlign: 'left',
    padding: '10px 14px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    color: '#fff',
    background: active ? 'rgba(59,130,246,0.85)' : 'transparent',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: WIDTH,
        height: HEIGHT,
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: 'calc(100vh - 24px)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.25)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        color: '#fff',
      }}
    >
      <div
        onMouseDown={startDrag}
        style={{
          height: 40,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px 0 16px',
          background: 'rgba(17,20,27,0.95)',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 14 }}>Settings</span>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          style={{
            width: 28,
            height: 28,
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            color: '#fff',
            fontSize: 16,
            background: 'transparent',
          }}
        >
          ×
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', background: 'rgba(24,26,32,0.96)' }}>
        <div
          style={{
            width: 170,
            flexShrink: 0,
            padding: 12,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            borderRight: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={tabStyle(tab === t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0, padding: 20, overflow: 'auto' }}>
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
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: '#fff',
                    fontSize: 14,
                    background: 'rgba(239,68,68,0.8)',
                  }}
                >
                  Reset
                </button>
              </Row>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                Settings are saved in this browser and restored the next time you open the page.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
