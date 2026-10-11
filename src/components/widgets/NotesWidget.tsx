import { useState, useEffect} from 'react';
import { FileText } from 'lucide-react';


interface Note {
    id:number;
    title: string;
    body: string;
    updated: number;
    color?:string;
}

interface NotesWidgetProps {
    onOpen: () => void;
}

const STORAGE_KEY = 'webos-notes';

function loadNotes(): Note[] {
    try  {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return[];
    }
}

export default function NotesWidget({ onOpen }: NotesWidgetProps) {
    const [notes, setNotes] = useState<Note[]>(loadNotes);

    useEffect(() => {
        const refreshNotes = () => setNotes (loadNotes());
        
        window.addEventListener('storage', refreshNotes);
        window.addEventListener('focus', refreshNotes);
        window.addEventListener('webos-notes-changed', refreshNotes);

        return () => {
            window.removeEventListener('storage' , refreshNotes);
            window.removeEventListener('focus', refreshNotes);
            window.removeEventListener('webos-notes-changed', refreshNotes);
        };
    },[]);

    const shown = [...notes]
    .sort((a, b) => b.updated - a.updated)
    .slice(0,3);

    return (
        <div className="w-[240px] rounded-2xl border border-white/25 bg-[rgba(24,26,32,0.75)] p-3 text-white shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-[16px]">
            <button
            onClick={onOpen}
            className="mb-1 flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-xs text-white/55"
            >
                <FileText size={14} />
                Notes
            </button>
            {shown.length === 0 && (
                <div className="py-1 text-sm text-white/50">No notes yet</div>
            )}

            {shown.map((note) => (
                <div
                key={note.id}
                className="px-1 py-2">
                    <div className="truncate text-sm font-semibold">
                        {note.title.trim() || 'Untitled'}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-white/45">
                    {note.body.trim()  || 'Empty note' }
                    </div>
                </div>
            ))}
        </div>
    );
}