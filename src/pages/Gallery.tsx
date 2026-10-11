import { useState, useEffect } from 'react';
import type { MouseEvent as ReactMouseEvent, SyntheticEvent } from 'react';
import { FiImage, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Photo {
  id: string;
  title: string;
  url: string;
}

interface OpenImageViewer {
  windowId: string;
  photoId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

interface GalleryProps {
  onClose: () => void;
  zIndex: number;
  onFocus: () => void;
}

const WIDTH = 640;
const HEIGHT = 480;

// Pulls all images recursively from src/assets/gallery/ and subfolders
const imageModules = import.meta.glob('../assets/gallery/**/*.{png,jpg,jpeg,webp,svg}', { eager: true });

const photos: Photo[] = Object.entries(imageModules).map(([path, mod]: [string, any], index) => {
  const fileName = path.split('/').pop() || `Photo ${index + 1}`;
  const title = fileName.replace(/\.[^/.]+$/, '').replace(/-/g, ' ');
  return {
    id: `photo-${index}-${fileName}`,
    title: title.charAt(0).toUpperCase() + title.slice(1),
    url: mod.default,
  };
});

export default function Gallery({ onClose, zIndex, onFocus }: GalleryProps) {
  const [pos, setPos] = useState(() => ({
    x: Math.max(12, (window.innerWidth - WIDTH) / 2),
    y: Math.max(12, (window.innerHeight - HEIGHT) / 2 - 30),
  }));
  const [openImages, setOpenImages] = useState<OpenImageViewer[]>([]);
  const [maxZ, setMaxZ] = useState(zIndex);

  const getNextZ = () => {
    const newZ = Math.max(maxZ, zIndex) + 1;
    setMaxZ(newZ);
    return newZ;
  };

  const startDrag = (e: ReactMouseEvent) => {
    onFocus();
    const offX = e.clientX - pos.x;
    const offY = e.clientY - pos.y;
    const move = (ev: MouseEvent) =>
      setPos({ x: ev.clientX - offX, y: Math.max(0, ev.clientY - offY) });
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const handleOpenPhoto = (photo: Photo) => {
    onFocus();
    // Check if this photo is already open in any window
    const existing = openImages.find((img) => img.photoId === photo.id);
    if (existing) {
      bringWindowToFront(existing.windowId);
      return;
    }

    const newZ = getNextZ();
    setOpenImages((prev) => [
      ...prev,
      {
        windowId: `window-${Date.now()}-${Math.random()}`,
        photoId: photo.id,
        x: Math.max(20, (window.innerWidth - 500) / 2 + (prev.length * 20)),
        y: Math.max(20, (window.innerHeight - 400) / 2 + (prev.length * 20)),
        width: 500,
        height: 400,
        zIndex: newZ,
      },
    ]);
  };

  const bringWindowToFront = (windowId: string) => {
    const newZ = getNextZ();
    setOpenImages((prev) =>
      prev.map((img) => (img.windowId === windowId ? { ...img, zIndex: newZ } : img))
    );
  };

  const closeImageWindow = (windowId: string) => {
    setOpenImages((prev) => prev.filter((img) => img.windowId !== windowId));
  };

  const changePhotoInWindow = (windowId: string, photoId: string) => {
    setOpenImages((prev) =>
      prev.map((img) => (img.windowId === windowId ? { ...img, photoId } : img))
    );
  };

  return (
    <>
      {/* Main Gallery Window */}
      <div
        onMouseDown={onFocus}
        className="absolute flex flex-col overflow-hidden rounded-2xl border border-white/25 bg-[#121215] text-white shadow-2xl"
        style={{ left: pos.x, top: pos.y, width: WIDTH, height: HEIGHT, zIndex }}
      >
        <div
          onMouseDown={startDrag}
          className="flex h-10 shrink-0 select-none items-center justify-between px-4 bg-[#1a1a20] border-b border-white/10 cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="h-3 w-3 rounded-full bg-red-500 hover:opacity-80 cursor-pointer" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-1.5">
            <FiImage size={13} className="text-white/50" />
            <span className="text-xs font-mono text-white/70 font-medium">Gallery ({photos.length} items)</span>
          </div>
          <div className="w-12" />
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-[#121215]">
          {photos.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-white/40">
              <FiImage size={36} className="mb-2 opacity-50" />
              <p className="text-xs font-mono">No images found in src/assets/gallery/</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => handleOpenPhoto(photo)}
                  className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#16161c] transition-transform hover:scale-[1.02]"
                >
                  <img src={photo.url} alt={photo.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-[#121215]/95 p-2 opacity-0 transition-opacity group-hover:opacity-100 border-t border-white/10">
                    <span className="text-[11px] font-medium text-white truncate block">{photo.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Spawned Popup Image Windows */}
      {openImages.map((imgWin) => (
        <ImageWindow
          key={imgWin.windowId}
          imageWindow={imgWin}
          photos={photos}
          onClose={() => closeImageWindow(imgWin.windowId)}
          onFocus={() => bringWindowToFront(imgWin.windowId)}
          onSelectPhoto={(photoId) => changePhotoInWindow(imgWin.windowId, photoId)}
        />
      ))}
    </>
  );
}

// Sub-component for individual popped-out image windows
function ImageWindow({
  imageWindow,
  photos,
  onClose,
  onFocus,
  onSelectPhoto,
}: {
  imageWindow: OpenImageViewer;
  photos: Photo[];
  onClose: () => void;
  onFocus: () => void;
  onSelectPhoto: (photoId: string) => void;
}) {
  const [pos, setPos] = useState({ x: imageWindow.x, y: imageWindow.y });
  const [size, setSize] = useState({ width: imageWindow.width, height: imageWindow.height });

  const currentIndex = photos.findIndex((p) => p.id === imageWindow.photoId);
  const currentPhoto = photos[currentIndex] || photos[0];

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;

    const maxW = window.innerWidth * 0.8;
    const maxH = window.innerHeight * 0.8;

    let w = Math.min(Math.max(natW + 32, 320), maxW);
    let h = Math.min(Math.max(natH + 72, 240), maxH);

    setSize({ width: w, height: h });
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (photos.length <= 1) return;
    const newIndex = (currentIndex - 1 + photos.length) % photos.length;
    onSelectPhoto(photos[newIndex].id);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (photos.length <= 1) return;
    const newIndex = (currentIndex + 1) % photos.length;
    onSelectPhoto(photos[newIndex].id);
  };

  // Keyboard navigation (Left/Right arrows) when window is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, photos]);

  const startDrag = (e: ReactMouseEvent) => {
    onFocus();
    const offX = e.clientX - pos.x;
    const offY = e.clientY - pos.y;
    const move = (ev: MouseEvent) =>
      setPos({ x: ev.clientX - offX, y: Math.max(0, ev.clientY - offY) });
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (!currentPhoto) return null;

  return (
    <div
      onMouseDown={onFocus}
      className="absolute flex flex-col overflow-hidden rounded-2xl border border-white/25 bg-[#121215] text-white shadow-2xl group/window"
      style={{ left: pos.x, top: pos.y, width: size.width, height: size.height, zIndex: imageWindow.zIndex }}
    >
      <div
        onMouseDown={startDrag}
        className="flex h-10 shrink-0 select-none items-center justify-between px-4 bg-[#1a1a20] border-b border-white/10 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="h-3 w-3 rounded-full bg-red-500 hover:opacity-80 cursor-pointer" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>

        <div className="flex items-center gap-1.5">
          <FiImage size={13} className="text-white/50" />
          <span className="text-xs font-mono text-white/70 font-medium truncate max-w-[220px]">
            {currentPhoto.title} ({currentIndex + 1}/{photos.length})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            title="Previous Photo (Left Arrow)"
            className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
          >
            <FiChevronLeft size={14} />
          </button>
          <button
            onClick={handleNext}
            title="Next Photo (Right Arrow)"
            className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
          >
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center p-4 overflow-hidden bg-[#16161c]">
        <img
          src={currentPhoto.url}
          alt={currentPhoto.title}
          onLoad={handleImageLoad}
          className="max-h-full max-w-full object-contain rounded-lg shadow-lg select-none"
        />

        {/* Hover Navigation Overlay Buttons */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 opacity-0 group-hover/window:opacity-100 transition-opacity cursor-pointer"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 opacity-0 group-hover/window:opacity-100 transition-opacity cursor-pointer"
            >
              <FiChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}