import { Play, Pause, SkipBack, SkipForward} from 'lucide-react'

interface MusicWidgetProps {
    title?: string;
    artist?: string;
    playing: boolean;
    time: number;
    duration: number;
    onToggle: () => void;
    onPrev: () => void;
    onNext: () => void;
    onOpen: () => void;
}

export default function MusicWidget({ title, artist, playing, time, duration, onToggle, onPrev, onNext, onOpen}: MusicWidgetsProps) {
    
    const pct = duration ? (time / duration) * 100 : 0;


    return (
        <div className="absolute right-4 top-4 z-[5] w-[240px] rounded-2xl border border-white/25 bg-[rgba(24,26,32,0.75)] p-3 text-white shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-[16px]"
        >
            <button
            onClick={onOpen}
            className="block w-full cursor-pointer truncate border-none bg-transparent p-0 text-left text-sm text-white"
            >
                {title ?? 'Nothing playing'}
            </button>
            <div className="truncate text-xs text-white/55">{artist ?? 'Music'}</div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-[#3584e4]" style={{ width: `${pct}%`}} />
            </div>

            <div className="mt-3 flex items-center justify-center gap-4">
                <button onClick={onPrev} className="cursor-pointer rounded-full p-2 hover:bg-white/10">
                <SkipBack size={18}/>
                </button>
                <button onClick={onToggle} className="cursor-pointer rounded-full bg-[#3584e4] p-2.5 hover:bg-[#4a94ee]">
                    {playing ? <Pause size={18} /> : <Play size={18} /> }
                </button>

                <button onClick={onNext} className="cursor-pointer rounded-full p-2 hover:bg-white/10">
                <SkipForward size={18} />
                </button>
                </div>

            
        </div>
    );
}