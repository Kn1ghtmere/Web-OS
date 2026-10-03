import { useState } from "react";


interface DialItem {
    id: string;
    label: string;
    icon: string;
}

interface DialDockProps {
    items: DialItem[];
    iconSize: number;
    onItemClick:(id: string) => void;

}

const STEP = (35 * Math.PI) / 180;

export default function DialDock({ items, iconSize, onItemClick}: DialDockProps) {

    const [active, setActive] = useState(0);
    const [hovered, setHovered] = useState(false);

    const n = items.length;
    const radius = hovered ? 150 : 90;

    const handleWheel = (e: React.WheelEvent) => {
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

            return (
                <img
                key={item.id}
                src={item.icon}
                alt={item.label}
                draggable={false}
                onClick={() => (offset === 0 ? onItemClick(item.id) : setActive(i))}
                className={`absolute max-w-none left-0 top-0 cursor-pointer object-contain transition-all duration-200 ${
                visible ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                style={{
                    width: iconSize,
                    height: iconSize,
                    transform: `translate(${x- iconSize /2}px, ${y - iconSize /2}px)`,
                }}
                />
            );
        })}

        </div>
    );
}
