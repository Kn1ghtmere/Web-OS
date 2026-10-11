import { useState, useEffect, useRef } from "react";
import {
  FiTerminal,
  FiSettings,
  FiInfo,
  FiFolder,
  FiGlobe,
  FiEdit3,
  FiWifi,
  FiVolume2,
  FiVolumeX,
  FiBluetooth,
  FiBellOff,
  FiX,
  FiLayers,
} from 'react-icons/fi';


interface WaybarProps {
  openWindows :string[];
  active?: string;
  onSelect : (id:string) => void;
  onCloseWindow? : (id :string) => void;
  onOpenAbout? : () =>void;
  onOpenSettings?: () => void;
  onOpenTerminal?:() => void;

}

const getWindowIcon = (id: string) => {
  const lower = id.toLowerCase();
  if (lower.includes('term')) return <FiTerminal size={13} className="text-emerald-400" />;
  if (lower.includes('sett')) return <FiSettings size={13} className="text-blue-400" />;
  if (lower.includes('about')) return <FiInfo size={13} className="text-pink-400" />;
  if (lower.includes('file') || lower.includes('fold')) return <FiFolder size={13} className="text-amber-400" />;
  if (lower.includes('web') || lower.includes('browser')) return <FiGlobe size={13} className="text-cyan-400" />;
  if (lower.includes('note') || lower.includes('text')) return <FiEdit3 size={13} className="text-rose-400" />;
  return <FiLayers size={13} className="text-white/60" />;
};

export default function Waybar({
  openWindows,
  active,
  onSelect,
  onCloseWindow,
  onOpenAbout,
  onOpenSettings,
  onOpenTerminal,

}: WaybarProps){
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isDnd, setIsDnd] = useState(false);
  const [isBluetooth, setIsBluetooth] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const [now] = useState(new Date());


  useEffect(() =>{
    function handleClickOutside(event : MouseEvent){
      if (menuRef.current && !menuRef.current.contains(event.target as Node)){
        setIsMenuOpen(false);

      }
      if(trayRef.current && !trayRef.current.contains(event.target as Node)){
        setIsTrayOpen(false);

      }


      
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);

  },[]);



  return (
    <>

    <div className="absolute left-2 right-2 top-1.5 z-[900] grid h-10 grid-cols-[auto_1fr_auto] items-center rounded-xl border border-white/15 bg-slate-950/60 px-3 text-sm text-white shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl">

    <div className="relative flex items-center" ref={menuRef}>
      <button onClick={() => setIsMenuOpen((prev) => !prev)} className={`group flex items-center gap-2 rounded-lg px-2.5 py-1 font-mono text-xs font-semibold transition-all cursor-pointer ${isMenuOpen ? 'bg-pink-500/20 text-pink-300 ring-1 ring-pink-500/40'
        : 'text-white/90 hover:bg-white/10 hover:text-white'

      }`}
      >
        <span className="h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899] animate-pulse"/>

        <span>LarpOS</span>
      </button>

     
        {isMenuOpen && (
          <div className="absolute left-0 top-9 w-48 rounded-xl border border-white/15 bg-[#121216]/95 p-1.5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-[1000]">
            <div className="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-white/40">
              Applications
            </div>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                onOpenTerminal?.();
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FiTerminal size={14} className="text-emerald-400" />
                <span>Terminal</span>
              </div>
              <span className="text-[10px] font-mono text-white/30">Alt+T</span>
            </button>

          

            <button
              onClick={() => {
                setIsMenuOpen(false);
                onOpenSettings?.();
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FiSettings size={14} className="text-blue-400" />
                <span>Settings</span>
              </div>
            </button>

            <div className="my-1 h-[1px] bg-white/10"/>


            <button onClick={() =>{
              setIsMenuOpen(false);
              onOpenAbout?.();

            }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            >

              <FiInfo size={14} className="text-pink-400"/>
              <span>About LarpOS</span>
            </button>




        </div>
      )}
    </div>


    <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar px-4 ">
      {openWindows.length === 0 ? (
        <span className=" text-[11px] font-mono text-white/20 italic select-none">No active windows</span>

      ): (
        openWindows.map((id, i) => {
          const isActive = active === id;

          return(
            <div key={id}
            onClick={() =>onSelect(id)}
            className={`group flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white/15 border-white/30 text-white font-medium shadow-inner ring-1 ring-white/20'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {getWindowIcon(id)}
                <span className="capitalize">{id}</span>

                 {onCloseWindow && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseWindow(id);
                    }}
                    className="ml-0.5 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
                    title="Close Window"
                  >
                    <FiX size={11} />
                  {i < 9 && <span className="mr-1.5 text-white/40">{i + 1}</span>}
                  {id}
                  </button>
        )}
            </div>


          )
        
        

        })
      )}
    </div>

    <div className="relative flex items-center gap-2"ref={trayRef}>
      <div onClick={() => setIsTrayOpen((prev) =>!prev)}
        className={`flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 transition-all cursor-pointer hover:bg-white/10 ${
          isTrayOpen ? 'bg-white/15 ring-1 ring-white/20' : ''

        } `}>

          <div className="flex items-center gap-2 text-white/70">
          {isDnd && <FiBellOff size={13} className="text-amber-400"/>}
          <FiWifi size={13} className="text-emerald-400"/>


          <button onClick={(e) => {
            e.stopPropagation()
            setIsMuted(!isMuted);

          }}
          className="hover:text-white cursor-pointer"

          >

            {isMuted || volume === 0 ? (
              <FiVolumeX size={13} className="text-rose-400"/>
            ) : (
              <FiVolume2 size={13} />
            )}

          </button>



          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-white/60 hidden sm:inline">
            {now.toLocaleDateString('en-US', {weekday :'short', month:'short', day:'numeric'})}</span>
            <span className="font-semibold text-white">
              {now.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}

            </span>
          </div>
          </div>
          </div>

          {isTrayOpen && (
            <div className="absolute right-0 top-10 w-64 rounded-xl border border-white/15  bg-[#121216]/95 p-3 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-[1000]">
              <div className="mb-3 text-[11px] font-mono font-bold uppercase tracking-wider text-white/40">
              Control Center</div>



              <div className="mb-3 rounded-lg border border-white/10 bg-white/5 p-2.5">
              <div className="mb-1.5 flex items-center justify-between text-xs text-white/80 font-mono">
              <span className="flex items-center gap-1.5">
 {isMuted ? <FiVolumeX className="text-rose-400" /> : <FiVolume2 />} Volume
 </span>
                 <span>{isMuted ? 'Muted' : `${volume}%`}</span>

              </div>
 <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {/* Quick Toggle Buttons Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsBluetooth(!isBluetooth)}
                className={`flex items-center gap-2 rounded-lg border p-2 text-xs font-mono transition-colors cursor-pointer ${
                  isBluetooth
                    ? 'border-blue-500/40 bg-blue-500/20 text-blue-300'
                    : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <FiBluetooth size={14} />
                <span>Bluetooth</span>
              </button>

              <button
                onClick={() => setIsDnd(!isDnd)}
                className={`flex items-center gap-2 rounded-lg border p-2 text-xs font-mono transition-colors cursor-pointer ${
                  isDnd
                    ? 'border-amber-500/40 bg-amber-500/20 text-amber-300'
                    : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <FiBellOff size={14} />
                <span>Do Not Disturb</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
    </>
  );
}