
import { useState, useEffect } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

interface Note {
  id: number;
  title: string;
  body: string;
  updated: number;

  color?: string;
}
const STORAGE_KEY = 'webos-notes';
const colors = [
  { name: 'Dark', value: '#1e1e1e' },
  { name: 'Pink', value: '#840b7c' },
  { name: 'Purple', value: '#9c67d2' },
  { name: 'Green', value: '#8d1111' },
  {name:"Grey",value:'#9f9595'}
];

const loadNotes = (): Note[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};



const shortDate = (t: number) =>
  new Date(t).toLocaleDateString([], { day: 'numeric', month: 'short' });

interface NotesProps {
  zIndex: number;
  onFocus: () => void;
  onClose: () => void;
}

export default function Notes({ zIndex, onFocus, onClose }: NotesProps) {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [activeId, setActiveId] = useState<number | null>(() => loadNotes()[0]?.id ?? null);
  const [pos, setPos] = useState({

    x: Math.max(12, window.innerWidth / 2 - 380),
    y: Math.max(12, window.innerHeight / 2 - 280),
  });
 useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      return;
    }
  }, [notes]);



  const active = notes.find((n) => n.id === activeId);
  const activeColor = active?.color ?? colors[0].value;

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

  const newNote = () => {
    const note: Note = {
      id: Date.now(),
      title: '',   body: '',   updated: Date.now(),
      color: colors[0].value,
    };
    setNotes((prev) => [note, ...prev]);
    setActiveId(note.id);
  };

  const update = (patch: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeId ? { ...n, ...patch, updated: Date.now() } : n
      )
    );
  };

  const deleteNote = () => {
    if (!active) return;
    if (!confirm('Delete this note :( ?')) return;
    const left = notes.filter((n) => n.id !== active.id);
    setNotes(left);
    setActiveId(left[0]?.id ?? null);
  };



  return (
    <div
      onMouseDown={onFocus}
      className="absolute flex h-[500px] w-[760px] max-w-[calc(100vw_-_24px)] flex-col overflow-hidden rounded-xl border border-[#1b1b1b] bg-[#242424] text-white shadow-xl"
      style={{ left: pos.x, top: pos.y, zIndex }}  >
      <div
        onMouseDown={startDrag}
        className="flex h-10 shrink-0 select-none items-center justify-between bg-[#303030] pl-4 pr-2 text-sm"
      >
   <span>Notes</span>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-[#c01c28]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        
        <div className="flex w-60 shrink-0 flex-col border-r border-[#1b1b1b] bg-[#2a2a2a]">
          <div className="p-3">
            <button
              onClick={newNote}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#3584e4] py-2 text-sm hover:bg-[#4a94ee]"
            >
              <Plus size={16} />
              New note
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {notes.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                no notes yet :(
              </div>
            )}

            {notes.map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveId(n.id)}
                className={`block w-full cursor-pointer border-b border-[#333] px-4 py-3 text-left ${
                  n.id === activeId ? 'bg-[#2b3f5c]' : 'hover:bg-[#303030]'
                }`}
  >
                    <div className="truncate text-sm font-semibold">
                  {n.title || 'Untitled'}
                </div>
                <div className="mt-0.5 truncate text-xs text-gray-400">
                  {n.body.trim() || 'Empty note'}
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  {shortDate(n.updated)}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div
          className="flex min-w-0 flex-1 flex-col"
          style={{ backgroundColor: activeColor }}
        >
          {active ? (
            <>
         
              <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
                <div className="flex items-center gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => update({ color: color.value })}
                      title={color.name}
                      aria-label={`${color.name} background`}
                      className={`h-4 w-4 cursor-pointer rounded-full border transition-transform hover:scale-110 ${
                        activeColor === color.value
                          ? 'border-white ring-2 ring-white/50 ring-offset-2 ring-offset-[#303030]'
                          : 'border-white/30'
                      }`}
                      style={{ backgroundColor: color.value }}
                           />
                  ))}
                </div>

                <button
                  onClick={deleteNote}
                  title="Delete note"
                  className="cursor-pointer rounded-md p-2 text-gray-400 hover:bg-white/10 hover:text-[#ff7b72]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
   
              <input
                value={active.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Title"
                className="mx-5 mt-3 min-w-0 bg-transparent text-xl font-bold outline-none placeholder:text-gray-400/60"
              />

              <textarea value={active.body}  onChange={(e) => update({ body: e.target.value })}
                placeholder="Start writing..."
                className="flex-1 resize-none bg-transparent px-5 py-4 text-sm leading-relaxed outline-none placeholder:text-gray-400/60"   />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              Start writing about your day or someone TwT 
            </div>
          )}
        </div>
      </div>
    </div>
  );
}









