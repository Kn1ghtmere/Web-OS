import { useState, useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { Camera, Download, RotateCcw, X } from 'lucide-react';

const SHOTS = 4;

const filters = [
  { id: 'normal', label: 'normal', css: 'none' },
  { id: 'bw', label: 'b&w', css: 'grayscale(1) contrast(1.1)' },
  { id: 'warm', label: 'warm', css: 'sepia(0.5) saturate(1.4)' },
  { id: 'pink', label: 'pink', css: 'sepia(0.4) saturate(2) hue-rotate(300deg) brightness(1.05)' },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface CameraBoothProps {
  zIndex: number;
  onFocus: () => void;
  onClose: () => void;
}

export default function CameraBooth({ zIndex, onFocus, onClose }: CameraBoothProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stopped = useRef(false);

  const [ready, setReady] = useState(false);


  const [error, setError] = useState('');
  const [filterId, setFilterId] = useState('normal');
  const [photos, setPhotos] = useState<string[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [shooting, setShooting] = useState(false);
  const [flash, setFlash] = useState(false);

  const [pos, setPos] = useState({
    x: Math.max(12, window.innerWidth / 2 - 315),

    y: Math.max(12, window.innerHeight / 2 - 300),
  });

  const filter = filters.find((f) => f.id === filterId) ?? filters[0];

  useEffect(() => {
    stopped.current = false;
    let cancelled = false;
    let stream: MediaStream | null = null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('sowey this browser cannot use the camera here :( ');
     
      return;

    }

    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }



        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError("Can't open the camera. Allow camera access for this site and try again.");
      });

    return () => {
      cancelled = true; 
       stopped.current = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

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

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return '';

    const W = 640;
    const H = 480;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    let sw = vw;
    let sh = vh;
    let sx = 0;
    let sy = 0;
    if (vw / vh > W / H) {
      sw = vh * (W / H);
      sx = (vw - sw) / 2;
    } else {
      sh = vw / (W / H);
      sy = (vh - sh) / 2;
    }

    ctx.filter = filter.css;
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const startBooth = async () => {
    if (shooting || !ready) return;
    setShooting(true);
    setPhotos([]);
    const shots: string[] = [];

    for (let i = 0; i < SHOTS; i++) {
      for (let n = 3; n >= 1; n--) {
        setCount(n);
        await sleep(1000);
        if (stopped.current) return;
      }
      setCount(null);
      setFlash(true);
      shots.push(takePhoto());
      setPhotos([...shots]);
      await sleep(250);
      setFlash(false);
      await sleep(700);
      if (stopped.current) return;
    }

    setShooting(false);
  };

  const saveStrip = async () => {
    if (photos.length === 0) return;

    const imgs = await Promise.all(
      photos.map(
        (src) =>
          new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
          })
      )
    );

    const pw = 300;
    const ph = 225;
    const pad = 22;

    const gap = 14;
    const foot = 74;

    const canvas = document.createElement('canvas');
    canvas.width = pw + pad * 2;
    canvas.height = pad + imgs.length * ph + (imgs.length - 1) * gap + foot;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffc2d9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    imgs.forEach((img, i) => {
      const y = pad + i * (ph + gap);
      ctx.drawImage(img, pad, y, pw, ph);
      ctx.strokeStyle = '#5c1f3a';
      ctx.lineWidth = 4;
      ctx.strokeRect(pad, y, pw, ph);
    });

    const footY = canvas.height - foot + 30;
    ctx.fillStyle = '#5c1f3a';
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
    ctx.fillText('photo booth ♡', canvas.width / 2, footY);
    ctx.font = '15px "Trebuchet MS", sans-serif';
    ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, footY + 24);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'photo-booth.png';
    a.click();
  };

  const clearPhotos = () => {
    setPhotos([]);





  };

  return (
    <div
      onMouseDown={onFocus}
      className="absolute w-[630px] max-w-[calc(100vw_-_24px)] overflow-hidden rounded-[22px_26px_20px_24px] border-[3px] border-[#5c1f3a] bg-[#fff4f8] text-[#5c1f3a] shadow-[6px_6px_0_#5c1f3a]"
      style={{ left: pos.x, top: pos.y, zIndex }}
    >
      <div
        onMouseDown={startDrag}
        className="flex h-10 select-none items-center justify-between border-b-[3px] border-[#5c1f3a] bg-[#ff80b0] pl-4 pr-2 font-semibold"
      >
        <span>photo booth ♡</span>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-[#ffd3e4]"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex">
        <div className="w-[440px] p-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border-[3px] border-[#5c1f3a] bg-[#5c1f3a]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover [transform:scaleX(-1)]"
              style={{ filter: filter.css }}
            />

            {!ready && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#ffe0ec] text-sm">
                waking up the camera...
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#ffe0ec] p-6 text-center text-sm">
                {error}
              </div>
            )}

            {shooting && (
              <div className="absolute left-2 top-2 rounded-full border-2 border-[#5c1f3a] bg-[#fff4f8] px-3 py-0.5 text-xs font-semibold">
                shot {Math.min(photos.length + 1, SHOTS)} of {SHOTS}
              </div>
            )}

            {count !== null && (
              <div className="absolute inset-0 flex items-center justify-center text-9xl font-bold text-white [text-shadow:4px_4px_0_#5c1f3a]">
                {count}
              </div>
            )}

            <div
              className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-200 ${
                flash ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                disabled={shooting}
                onClick={() => setFilterId(f.id)}
                className={`cursor-pointer rounded-full border-2 border-[#5c1f3a] px-3 py-0.5 text-sm disabled:cursor-default disabled:opacity-60 ${
                  f.id === filterId ? 'bg-[#ff80b0]' : 'bg-white hover:bg-[#ffd3e4]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={startBooth}
            disabled={shooting || !ready}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[18px_22px_16px_24px] border-[3px] border-[#5c1f3a] bg-[#ff80b0] py-2.5 text-lg font-semibold shadow-[3px_3px_0_#5c1f3a] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-default disabled:opacity-60"
          >
            <Camera size={20} />
            {shooting ? 'smile!' : 'take 4 photos'}
          </button>
        </div>

        <div className="flex w-[190px] flex-col items-center gap-3 border-l-[3px] border-[#5c1f3a] bg-[#ffe0ec] p-3">
          <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-[#5c1f3a] bg-[#ffc2d9] p-2.5">
            {Array.from({ length: SHOTS }, (_, i) => (
              <div
                key={i}
                className="h-[82px] w-[110px] overflow-hidden rounded border-2 border-dashed border-[#5c1f3a]/50 bg-white/60"
              >
                {photos[i] && <img src={photos[i]} alt="" className="h-full w-full object-cover" />}
              </div>
            ))}
          </div>

          <button
            onClick={saveStrip}
            disabled={photos.length === 0 || shooting}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 border-[#5c1f3a] bg-[#fff6c9] py-1.5 text-sm font-semibold hover:bg-[#ffef8a] disabled:cursor-default disabled:opacity-50 disabled:hover:bg-[#fff6c9]"
          >
            <Download size={16} />
            save strip
          </button>
          <button
            onClick={clearPhotos}
            disabled={photos.length === 0 || shooting}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 border-[#5c1f3a] bg-white py-1.5 text-sm hover:bg-[#ffd3e4] disabled:cursor-default disabled:opacity-50 disabled:hover:bg-white"
          >
            <RotateCcw size={16} />
            clear
          </button>
        </div>
      </div>
    </div>
  );
}


