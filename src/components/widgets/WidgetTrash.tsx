import { X } from 'lucide-react';

export const isOverTrash = (x: number, y: number) => 
    y > window.innerHeight - 96 && Math.abs(x - window.innerWidth / 2) < 90;

export default function WidgetTrash({visible, active}: {visible: boolean ; active: boolean}) {
    return (
        <div
        className="pointer-events-none fixed bottom-6 left-1/2 z-[1100] flex h-16 w-16 items-center justify-center rounded-full border border-white/30 text-white"
        style={{
            backgroundColor: active ? 'rgba(239,68,68,0.9)' : 'rgba(20,20,25,0.85)',
            opacity: visible ? 1 : 0 ,
            transform: `translate(-50%, ${visible ? 0 : 100}px) scale(${active ? 1.2 : 1})`,
            transition: 'transform 200ms ease-out, opacity 150ms ease-out, background-color 150ms',

        }}
        >
            <X size={28} />
        </div>
    );
}