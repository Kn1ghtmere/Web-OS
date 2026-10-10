import { X } from 'lucide-react';

export const isOverTrash = (x: number, y: number) => 
    y > window.innerHeight - 140 && Math.abs(x - window.innerWidth / 2) < 90;

export default function WidgetTrash({visible, active}:  {visible: boolean; active: boolean}) {
    return (
        <div 
        className={`pointer-events-none fixed bottom-6 left-1/2 z-[1100] flex h-[72px] w-[72px] -translate-x-1/2 item-center justify-center border border-white/30 text-white shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-[16px] transition-all duration-200 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-[140px] opacity-0'}
            $ {active ? 'scale-125 bg-[rgba(239,68,68,0.85)]' : bg-black/50'}`}
        >
         <X size={32} />
        </div>
    );
}