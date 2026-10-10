import { useState } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { isOverTrash } from './WidgetTrash';


interface WidgetFrameProps {
    x: number;
    y: number;
    onMove: (x: number, y: number) => void;
    onDragChange: ( dragging: boolean , overTrash: boolean) => void;
    onRemove: () => void;
    children: ReactNode;
}

export default function WidgetFrame({x, y, onMove, onDragChange, onRemove, children} : WidgetFrameProps) {
    const [pos, setPos] = useState({x, y});
    
    
    const startDrag = (e: ReactMouseEvent) => {
        if((e.target as HTMLElement).closest('button, input')) return;

        const sx = e.clientX;
        const sy = e.clientY;
        const offX = e.clientX - pos.x;
        const offY = e.clientY - pos.y;
        let cur = pos;
        let moved = false;


        const move = (ev: MouseEvent) => {
            if(!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
            moved = true;
            cur = { x: Math.max(0, ev.clientX - offX), y: Math.max(0, ev.clientY - offY)};
            setPos(cur);
            onDragChange(true, isOverTrash(ev.clientX, ev.clientY));
        };


        const up = (ev: MouseEvent) => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
            if (!moved) return;
            onDragChange(false,false);
            if (isOverTrash(ev.clientX, ev.clientY)) onRemove();
            else onMove(cur.x , cur.y);
        };

        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
    };


    return (
        <div
        onMouseDown={startDrag}
        className="absolute z-[5] cursor-grab select-none active:cursor-grabbing"
        style={{left: pos.x, top: pos.y}}
        >
            {children}
        </div>
    );


}