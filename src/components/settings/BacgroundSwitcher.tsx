
import { wallpapers } from './SettingsConfig';

interface BackgroundSwitcherProps {
  value: string;
  onChange: (id: string) => void;
}

export default function BackgroundSwitcher({ value, onChange }: BackgroundSwitcherProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {wallpapers.map((wallpaper) => {
        const active = wallpaper.id === value;

        return (
          <button
            key={wallpaper.id}
            onClick={() => onChange(wallpaper.id)}
            className={`relative cursor-pointer overflow-hidden rounded-xl border-2 bg-transparent p-0 ${
              active ? 'border-[#3b82f6]' : 'border-transparent'
            }`}
          >
            <img
              src={wallpaper.src}
              alt={wallpaper.name}
              draggable={false}
              className="block h-[110px] w-full object-cover"
            />

            <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(0,0,0,0.75)] to-transparent px-[10px] pb-[6px] pt-[14px] text-left text-xs text-white">
              {wallpaper.name}
              {active ? ' ✓' : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}
