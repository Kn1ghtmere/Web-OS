import { useEffect , useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AppWindow, CircleDot , Keyboard, LayoutGrid, PanelBottom, Pin , Settings, Sparkles} from 'lucide-react';


interface Step {
    icon: LucideIcon;
    title: string;
    points: string[];
}

const steps: Step[] = [
    {

    icon: Sparkles,
    title:'Welcome to LarpOS',
    points: [
        'A dekstop that lives in ur browser. This tour takes bout a minute',
        'Everything u change is saved and restored next time from local storage',
        'you can replay this walkthru any time from Settings>General'
    ],
    },
    {
        icon: AppWindow,
        title: 'Windows',
        points: [
            'Drag a window by its title bar to move it, click to bring to front',
            'some apps can be minimized thru the - some apps dont need em TwT',
        ],
    },
    {
        icon: PanelBottom,
        title: 'The Dock',
        points: [
            'Click an icon to open an app, or bring it forward (its like taskbar, uve surely used windwos right?..righ?)',
            'bright dot under icon means its open (u can see it anyway), and a lighter dot means its minimized',
            'the grid icon takes u to the wonderful app grid screen, with an extravagant search bar por favor',
            'There are two types of Docks, double click an Empty space in the dock and youll see'
        ],
    },
    {
        icon: CircleDot,
        title: 'The Dial Dock',
        points : [
            'ITS THE DIAL DOCKK, its the one i prefer cuz its cool, i as in Kn1ghtmere , cuz im the one whos writing ts , anyways goin off tracks there',
            'U can toggle it the same way by double clicking an empty space on it',
            'Hover ur mouse over it and scrolll , and ur apps will appear n stuff , i mean its pretty self explanatory',
            'i dunno why i needed a walkthru',
        ],
    },
    {
        icon: Keyboard,
        title: 'waybar and shortcuts(there aint many)',
        points: [
            'u can open ur windows and navigate from the waybar',
            'its the horizontal long thingy at the top ',
            'for quick switching between windows press ALT+1 or 2 or 3 to switch to watever number window u wanna switch to , savvy?',
            'ALT + T opens the terminal, its super usefull  cuz i added it',
        ],
    },
    {
        icon: Pin,
        title: 'Widgets',
        points: [
            'Pinsss , you can pin some stuff as a widget to the homescreen',
            'like the music player widget , but it dies when u close the player',
            'the todo list , there r two versions , a recent tasks list widget, and a specific task one , u can activate either one, or both who cares',
            'the notes app too , it shows recent notes',
            'if u start dragging a widget , a hungry cross appears from below the depths of the viewport',
            'u can feed him the widget, dont worry hes frendly , i think',
        ],
    },
    {
        icon: LayoutGrid,
        title: 'Apps u shuld try',
        points: [
            'Music app: u can play sum local songs , theres a web option for free media music , theres a 2.0 option for a thirdparty music player',
            'Camera-Booth: ITSS SO CUTEEE , its really funnn u shuld try itt',
            'Todo: really helpfull, u can write down who owes u money',
            'terminal: It has cool commands , and can launch apps too',
            'weather: it depends on wheather u wanna chek the weather up there',
            'all of the other apps r cool too , i jus cant put everything here now can i tho',
            'i can but i wont cuz im lazy , figure it out urself'
        ],
    },
    {
        icon: Settings,
        title: 'Personalization, web rice?',
        points: [
            'Settings has cool wallpapers, u can adjust many things so chek dat out',
            'ohh and since im a geneius u can export ur data , keep it with u and import it later , or on sum other device, cuz we don have an auth system xd',
            'if u make a mess , sometimes its good to start over , so theres a reset button in the settings',
        ],
    },

    
];

export default function Tutorial({onClose} : { onClose: () => void}) {
    const [i, setI] = useState(0);
    const last = i === steps.length -1;
    const step = steps[i];
    const Icon = step.icon;


    const next = () => (last ? onClose() : setI(i+1));
    const back = () => setI((n) => Math.max(0, n-1));


    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') back();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/55">
      <div className="w-[460px] max-w-[calc(100vw_-_24px)] rounded-2xl border border-white/25 bg-[rgba(24,26,32,0.97)] p-7 text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/[0.85]">
          <Icon size={26} />
        </div>

        <h2 className="mb-3 text-xl font-semibold">{step.title}</h2>

        <ul className="m-0 flex min-h-[170px] list-none flex-col gap-2.5 p-0 text-sm leading-relaxed text-white/75">
          {step.points.map((p) => (
            <li key={p} className="flex gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
              <span>{p}</span>
            </li>
          ))}
        </ul>



              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex gap-1.5">
                    {steps.map((_,n) => (
                    <button
                        key={n}
                        onClick={() => setI(n)}
                        aria-label={`Go to step ${n + 1}`}
                        className={`h-2 cursor-pointer rounded-full border-none p-0 transition-all ${
                            n === i ? 'w-5 bg-blue-400' : 'w-2 bg-white/25 hover:bg-white/40'}`}
                        />
                    
                        
                    ))}
                </div>

              
              <div className="flex items-center gap-2">
                {!last && (
                    <button 
                    onClick={onClose}
                    className="cursor-pointer rounded-lg border-none bg-transparent px-3 py-2 text-sm text-white/55 hover: text-white"
                    >
                        Skip
                    </button>
                )}
                {i > 0 && (
                    <button
                    onClick={back}
                    className="cursor-pointer rounded-lg border-none bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
                    >
                        Back
                    </button>
                )}
                <button
                onClick={next}
                className="cursor-pointer rounded-lg border-none bg-blue-500/[0.85] px-4 py-2 text-sm text-white hover:bg-blue-500"
                >
                    {last ? 'Get started' : 'Next'}
                </button>
              </div>


              </div>
          



            </div>
        </div>
    );
}
