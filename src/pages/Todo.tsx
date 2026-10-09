import { useState, useEffect } from 'react';
import type { MouseEvent as ReactMouseEvent} from 'react';
import { Check , Minus , Plus , Trash2, X} from 'lucide-react';

interface Task {
    id: number;
    text: string;
    deadline: string;
    done: boolean;
}

const STORAGE_KEY = 'webos-todos';
const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

const dateKey = (d: Date) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());


const loadTasks = (): Task[] => {
    try {
        const raw  = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const dueLabel = (deadline: string, todayKey: string) => {
    if(!deadline) return 'No deadline';
    if (deadline === todayKey) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if(deadline === dateKey(tomorrow)) return 'Tomorrow';
    const [y, m, d] = deadline.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString([], {day: 'numeric', month: 'short'});
};


interface TodoProps {
    zIndex: number;
    onFocus: () => void;
    onMinimize: () => void;
    onClose: () => void;
    
}

export default function Todo({ zIndex, onFocus, onMinimize, onClose}: TodoProps) {
    const [tasks, setTasks] = useState<Task[]>(loadTasks);
    const [text, setText] = useState('');
    const [deadline, setDeadline] = useState('');
    const [pos, setPos] = useState({
        x: Math.max(12, window.innerWidth / 2 - 210),
        y: Math.max(12, window.innerHeight / 2 -250),
    });

    useEffect (() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch {
            return;
        }
    }, [tasks]);


    const todayKey = dateKey(new Date());

    const sorted = [...tasks].sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1 ;
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
    });

    const startDrag = (e: ReactMouseEvent) => {
        const offX = e.clientX - pos.x;
        const offY = e.clientY - pos.y;

        const move = (ev: MouseEvent) => {
            setPos ({
                x: ev.clientX - offX, y: Math.max(0,ev.clientY - offY)
            });
        };
        
        const up = () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
        };

        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
    };

    const addTask = () => {
        const t = text.trim();
        if(!t) return;
        setTasks((prev) => [...prev, {id: Date.now(), text: t, deadline, done: false }]);

        setText('');
        setDeadline('');
        

    };


    

        const toggle = (id: number) => 
            setTasks((prev) => prev.map((t) => (t.id === id ? {...t, done: !t.done} : t)));

        const remove = (id: number) => setTasks ((prev) => prev.filter((t) => t.id !== id));

        return (
            <div
            onMouseDown={onFocus}
            className="absolute flex h-[500px] w-[420px] max-w-[calc(100vw_-_24px)] flex-col overflow-hidden rounded-xl border border-[#1b1b1b] bg-[#242424] text-white shadow-xl"
            style={{left: pos.x, top: pos.y, zIndex}}
            >
            <div 
            onMouseDown={startDrag}
            className="flex h-10 shrink-0 select-none items-center justify-between bg-[#303030] pl-4 pr-2 text-sm"
            >
            <span>TO-DO</span>
            <div className="flex items-center gap-1">
            <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onMinimize}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-[#3d3d3d]"
            >
            <Minus size={16} />
            </button>
            <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-[#c01c28]"
            >
                <X size={16}/>
            </button>
            </div>
            </div>
            <div className="flex shrink-0 gap-2 border-b border-[#1b1b1b] p-3"
            >
            <input 
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a task"
            className="min-w-0 flex-1 rounded-md border border-[#3d3d3d] bg-[#1e1e1e] px-2.5 py-1.5 text-sm outline-none placeholder:text-gray-600"
            />
            <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-[130px] rounded-md border border-[#3d3d3d] bg-[#1e1e1e] px-2 py-1.5 text-sm outline-none [color-scheme:dark]"
            />
            <button
            onClick={addTask}
            className="flex cursor-pointer items-center rounded-md bg-[#3584e4] px-2.5 hover:bg-[#4a94ee]"
            >
            <Plus size={16}/>
            </button>
            </div>


            <div className="flex-1 overflow-y-auto [color-scheme:dark]">
            {sorted.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-gray-500">Nothing To Do</div>
        )}

        {sorted.map((t) => {
            const overdue = !t.done && t.deadline !== '' && t.deadline < todayKey;

            return (
                <div key={t.id} className="flex items-center gap-3 border-b border-[#333] px-4 py-2.5"
                >
                    <button
                    onClick={() => toggle(t.id)}
                    aria-label={t.done ? 'Mark as not done' : 'Mark as done'}
                    className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border ${
                        t.done ? 'border-[#3584e4] bg-[#3584e4]' : 'border-gray-500 hover:border-white'
                    }`}
                    >
                        {t.done && <Check size={12}/>}
                    </button>

                    <div className="min-w-0 flex-1">
                        <div className={`break-words text-sm ${t.done ? 'text-gray-500 line-through' : ''}`}
                        >
                            {t.text}
                        </div>
                        <div className={`text-xs ${overdue ? 'text-[#ff7b72]' : 'text-gray-500'}`}
                        >
                        {overdue ? 'Overdue . ' : ''}
                        {dueLabel(t.deadline,todayKey)}
                    </div>
                </div>

                <button
                onClick={() => remove(t.id)}
                title="Delete task"
                className="cursor-pointer text-gray-500 hover:text-[#ff7b72]"
                >
                    <Trash2 size={14}/>
                </button>
                </div>
                        );
                    })}
                    </div>
                    </div>
                );
            }





