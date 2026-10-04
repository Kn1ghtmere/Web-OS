import { useState } from "react";
import { useRef } from "react";

interface DialItem {
    id: string;
    label: string;
    icon: string;
}

interface DialDockProps {
    items: DialItem[];
    iconSize: number;
    onItemClick:(id: string) => void;
    showLabels: boolean;
    minimizedIds: string[];
    openIds: string[];

}
const STEP = (35 * Math.PI) / 180;

export default function DialDock({ items, iconSize, onItemClick, showLabels, openIds, minimizedIds}: DialDockProps) {

    const [active, setActive] = useState(0);
    const [hovered, setHovered] = useState(false);
    const lastStep = useRef(0)


    const n = items.length;
    const radius = hovered ? 150 : 90;

   const handleWheel = (e: React.WheelEvent) => {
    const now = performance.now();
    if (Math.abs(e.deltaY) < 4 || now - lastStep.current < 110) return;
    lastStep.current = now;
    const dir = e.deltaY > 0 ? 1 : -1;
    setActive((prev) => (prev + dir + n) % n);
};

    return (
        <div

        onWheel={handleWheel}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="fixed right-0 top-1/2 z-[1000] h-0 w-0"
        >
            {}
         <div
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-[16px] transition-all duration-200"
        style={{ width: radius * 2 + iconSize, height: radius * 2 + iconSize }}
      />

        {items.map((item, i) => {
            let offset = i - active;
            if(offset > n / 2) offset -= n;
            if(offset < -n / 2) offset += n;

            const visible = offset === 0 || (hovered && Math.abs(offset) === 1);
            const angle = offset * STEP;
            const x = -radius * Math.cos(angle);
            const y = -radius * Math.sin(angle);

            const isOpen = openIds.includes(item.id);
            const isMin = minimizedIds.includes(item.id);

            return (
                <div
                key={item.id}
                onClick={() => (offset === 0 ? onItemClick(item.id) : setActive(i))}
                className={`absolute left-0 top-0 cursor-pointer ${
                    visible ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                style={{
                    width: iconSize,
                    height: iconSize,
                    transform: `translate(${x - iconSize / 2}px, ${y - iconSize / 2}px)`,
                    transition:'transform 260ms cubic-bezier(0.34, 1.56, 0.64 ,1), opacity 150ms ease-out',
                }}
                >
                    {showLabels && visible && (
                        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-[rgba(20,20,25,0.85)] px-[10px] py-1 text-xs text-white">
                            {item.label}
                        </span>

                    )}

                    <img
                    src={item.icon}
                    alt={item.label}
                    draggable={false}
                    className="block max-w-none object-contain"
                    style={{ width: iconSize, height: iconSize}}
                    />

                    {isOpen && (
                        <span className={`absolute bottom-[-9px] left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full ${isMin ? 'bg-white/40' : 'bg-white'}`}
                        />
                    )}
                </div>
            );
        })}
        </div>
    );
}
