import { useState, useEffect, useRef } from 'react';

interface WaybarProps {
  openWindows: string[];
  active?: string;
  onSelect: (id: string) => void;
  onOpenAbout?: () => void;
  onOpenSettings?: () => void;
  onOpenTerminal?: () => void; 
}

export default function Waybar({
  onOpenAbout,
  onOpenSettings,
  onOpenTerminal,
}: WaybarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);


 useEffect(() => {
  function handleClickOutside(event : MouseEvent){
    if (menuRef.current && !menuRef.current.contains(event.target as Node)){
      setIsMenuOpen(false);
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);

}, []);

  return (
    <div className="absolute left-2 right-2 top-1 z-[900] grid h-9 grid-cols-3 items-center rounded-xl border border-white/15 bg-black/50 px-3 text-sm text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">

      <div className='relative flex items-center' ref={menuRef}>
        <button onClick={() => setIsMenuOpen((prev) =>!prev)}
          className='relative cursor-pointer font-mono pb-0.5 outline-none after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-pink-500 after:shadow-[0_0_10px_#ec4899] after:transition-all after:duration-300 hover:after:w-full'

          >WofOS</button>
         
        {isMenuOpen && (
          <div className="absolute left-0 top-7 w-40 rounded-xl border border-white/10 bg-[#121214]/90 p-1.5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-1 duration-150 z-[1000]">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onOpenAbout?.();
              }}
              className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-white/80 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            >
              About WofOS
            </button>


            <button onClick={() => {
              setIsMenuOpen(false);
              onOpenSettings?.();

            }}
            className='w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-white/80 transition-colors hover:bg-white/10 hover:text-white cursor-pointer'>
              Settings
            </button>

            <div className='my-1 h-[1px] bg-white/10'/>

            <button onClick={() => {
              setIsMenuOpen(false);
              onOpenTerminal?.();

            }}
            className='w-full rounded-lg px-2.5 py-2.5 text-left text-xs text-white/80 transition-colors hover:bg-white/10 hover:text-white cursor-pointer'

            >Terminal</button>
            </div>
        )}
        </div>
            

      


    
      <div className="flex items-center justify-center font-mono">
        {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </div>

      <div></div>

    </div>
  )
}