import { useState, useRef, useEffect } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X } from 'lucide-react';

import homefree from '../assets/music/homefree.mp3';
import myownchapter from '../assets/music/myownchapter.mp3';
import threadLight from '../assets/music/threadLight.mp3';
import wander from '../assets/music/wander.mp3';

const songs = [
  { title: 'Homefree', src: homefree },
  { title: 'My Own Chapter', src: myownchapter },
  { title: 'Thread Light', src: threadLight },
  { title: 'Wander', src: wander },
];

const fmt = (s: number) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
};

interface MusicPlayerProps {
  zIndex: number;
  onFocus: () => void;
  onClose: () => void;
}

export default function MusicPlayer({ zIndex, onFocus, onClose }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [pos, setPos] = useState({
    x: Math.max(12, window.innerWidth / 2 - 70),
    y: Math.max(12, window.innerHeight / 2 - 250),
  });

  useEffect(() => {
    if (playing) audioRef.current?.play().catch(() => {});
    else audioRef.current?.pause();
  }, [playing, index]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

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

  const next = () => setIndex((index + 1) % songs.length);

  const prev = () => {
    if (time > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }
    setIndex((index - 1 + songs.length) % songs.length);
  };

  const pickSong = (i: number) => {
    setIndex(i);
    setPlaying(true);
  };

  const seek = (value: number) => {
    if (audioRef.current) audioRef.current.currentTime = value;
    setTime(value);
  };

  return (
    <div
      onMouseDown={onFocus}
      className="absolute w-[380px] overflow-hidden rounded-xl border border-[#1b1b1b] bg-[#242424] text-white shadow-xl"
      style={{ left: pos.x, top: pos.y, zIndex }}
    >
      <audio
        ref={audioRef}
        src={songs[index].src}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={next}
      />

      <div
        onMouseDown={startDrag}
        className="flex h-10 select-none items-center justify-between bg-[#303030] pl-4 pr-2 text-sm"
      >
        <span>Music</span>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-[#c01c28]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-5 pt-5 pb-4">
        <div className="mb-4 truncate text-lg">{songs[index].title}</div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-8">{fmt(time)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            onChange={(e) => seek(Number(e.target.value))}
            className="flex-1 accent-[#3584e4]"
          />
          <span className="w-8 text-right">{fmt(duration)}</span>
        </div>

        <div className="mt-3 flex items-center justify-center gap-4">
          <button onClick={prev} className="cursor-pointer rounded-full p-2 hover:bg-[#3d3d3d]">
            <SkipBack size={20} />
          </button>
          <button
            onClick={() => setPlaying(!playing)}
            className="cursor-pointer rounded-full bg-[#3584e4] p-3 hover:bg-[#4a94ee]"
          >
            {playing ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button onClick={next} className="cursor-pointer rounded-full p-2 hover:bg-[#3d3d3d]">
            <SkipForward size={20} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-gray-400">
          <Volume2 size={16} />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-28 accent-[#3584e4]"
          />
        </div>
      </div>

      <div className="border-t border-[#1b1b1b]">
        {songs.map((song, i) => (
          <button
            key={song.title}
            onClick={() => pickSong(i)}
            className={`block w-full cursor-pointer border-b border-[#2e2e2e] px-5 py-2.5 text-left text-sm ${
              i === index ? 'bg-[#2b3f5c] text-[#78aeed]' : 'hover:bg-[#2f2f2f]'
            }`}
          >
            {song.title}
          </button>
        ))}
      </div>
    </div>
  );
}