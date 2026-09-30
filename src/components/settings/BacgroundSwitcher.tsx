import { wallpapers } from './SettingsConfig';

interface BackgroundSwitcherProps {
  value: string;
  onChange: (id: string) => void;
}

export default function BackgroundSwitcher({ value, onChange }: BackgroundSwitcherProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {wallpapers.map((wallpaper) => {
        const active = wallpaper.id === value;
        return (
          <button
            key={wallpaper.id}
            onClick={() => onChange(wallpaper.id)}
            style={{
              position: 'relative',
              padding: 0,
              overflow: 'hidden',
              cursor: 'pointer',
              background: 'none',
              borderRadius: 12,
              border: active ? '2px solid #3b82f6' : '2px solid transparent',
            }}
          >
            <img
              src={wallpaper.src}
              alt={wallpaper.name}
              draggable={false}
              style={{ display: 'block', width: '100%', height: 110, objectFit: 'cover' }}
            />
            <span
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                padding: '14px 10px 6px',
                fontSize: 12,
                textAlign: 'left',
                color: '#fff',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
              }}
            >
              {wallpaper.name}
              {active ? ' ✓' : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}
