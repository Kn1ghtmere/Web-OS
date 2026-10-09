import { useState, useEffect } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { ArrowUp,ChevronLeft,ChevronRight,FilePlus,FileText,
  Folder,FolderPlus,
  House,Pencil,Trash2,
  X,
} from 'lucide-react';

interface Item {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parent: string | null;
  content: string;
  modified: number;
}

interface Action {
  kind: 'folder' | 'file' | 'rename';
  value: string;
}

const STORAGE_KEY = 'webos-files';

const now = Date.now();

const defaults: Item[] = [
  { id: 'root', name: 'Home', type: 'folder', parent: null, content: '', modified: now },
  { id: 'docs', name: 'Documents', type: 'folder', parent: 'root', content: '', modified: now },
  { id: 'downloads', name: 'Downloads', type: 'folder', parent: 'root', content: '', modified: now },
  { id: 'pictures', name: 'Pictures', type: 'folder', parent: 'root', content: '', modified: now },
  { id: 'music', name: 'Music', type: 'folder', parent: 'root', content: '', modified: now },
  {
    id: 'welcome',
    name: 'welcome.txt',
    type: 'file',
    parent: 'root',
    content: 'Welcome to Files.\n\nMake folders, make text files, double click a file to edit it.',
    modified: now,
  },
];

const loadItems = (): Item[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaults;
  } catch {
    return defaults;
  }
};

const makeId = () => 'i' + Date.now() + Math.random().toString(36).slice(2, 6);

const sizeText = (n: number) => (n < 1024 ? n + ' B' : (n / 1024).toFixed(1) + ' KB');

const dateText = (t: number) => new Date(t).toLocaleDateString([], { day: 'numeric', month: 'short' });

const tool =
  'flex cursor-pointer items-center rounded-md p-1.5 hover:bg-[#3d3d3d] disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent';

interface FileManagerProps {
  zIndex: number;
  onFocus: ()=> void;
  onClose: ()=> void;
}

export default function FileManager({ zIndex, onFocus, onClose }: FileManagerProps) {
  const [items, setItems] =useState<Item[]>(loadItems);
  const [current, setCurrent]= useState('root');
  const [back, setBack]= useState<string[]>([]);
  const [fwd, setFwd]= useState<string[]>([]);


  const [selected, setSelected] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [error, setError] = useState('');
  const [pos, setPos] = useState({
    x: Math.max(12, window.innerWidth / 2 - 430),
    y: Math.max(12, window.innerHeight / 2 - 290),
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      return;
    }

  }, [items]);

  const folder = items.find((i) => i.id === current);
  const openFile = items.find((i) => i.id === openId);



  const list = items
    .filter((i) => i.parent === current)


    .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1));

  const places = items
    .filter((i) => i.id === 'root' || (i.parent === 'root' && i.type === 'folder'))
    .sort((a, b) => (a.id === 'root' ? -1 : b.id === 'root' ? 1 : a.name.localeCompare(b.name)));

  const chain: Item[] = [];
  let walk = folder;
  while (walk) {
    chain.unshift(walk);
    const parentId: string | null = walk.parent;
    walk = parentId ? items.find((i) => i.id === parentId) : undefined;
  }

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

  const resetView = () => {
    setSelected(null);
    setOpenId(null);
    setAction(null);
    setError('');
  };

  const goTo = (id: string) => {
    if (id === current) {
      resetView();
      return;
    }   setBack([...back, current]);
    setFwd([]);
    setCurrent(id);


    resetView();
  };

  const goBack = () => {
    if (back.length === 0) return;
    setFwd([current, ...fwd]);

    setCurrent(back[back.length - 1]);
    setBack(back.slice(0, -1));
    resetView();
  };

  const goForward = () => {
    if (fwd.length === 0) return;


    setBack([...back, current]);
    setCurrent(fwd[0]);
    setFwd(fwd.slice(1));
    resetView();
  };

  const goUp = () => {
    if (folder && folder.parent) goTo(folder.parent);
  };

  const openItem = (item: Item) => {
    if (item.type === 'folder') goTo(item.id);
    else {
      setOpenId(item.id);
      setAction(null);
    }
  };

  const startAction = (kind: Action['kind']) => {
    const item = items.find((i) => i.id === selected);


    setAction({ kind, value: kind === 'rename' && item ? item.name : '' });
    setError('');
  };

  const submit = () => {
    if (!action) return;
    const name = action.value.trim();
    if (!name) {
      setError('Type a name first');
      return;
    }
    if (name.includes('/')) {

      setError("A name can't have a /");
      return;
    }

    const finalName = action.kind === 'file' && !name.includes('.') ? name + '.txt' : name;
    const renaming = action.kind === 'rename' ? selected : null;


    const taken = items.some(
      (i) => i.parent === current && i.id !== renaming && i.name.toLowerCase() === finalName.toLowerCase()
    );
    if (taken) {
      setError('Something with that name is already here');
      return;
    }

    if (action.kind === 'rename') {
      setItems(items.map((i) => (i.id === selected ? { ...i, name: finalName, modified: Date.now() } : i)));
    } else {
      const item: Item = {
        id: makeId(),
        name: finalName,
        type: action.kind,
        parent: current,

        content: '',
        modified: Date.now(),
      };
      setItems([...items, item]);
      setSelected(item.id);
    }
    setAction(null);
    setError('');
  };

  const deleteSelected = () => {
    const item = items.find((i) => i.id === selected);
    if (!item) return;
    if (!confirm('Delete "' + item.name + '"?')) return;

    const gone = new Set<string>([item.id]);
    let grew = true;
    while (grew) {
      grew = false;
      items.forEach((i) => {

        if (i.parent && gone.has(i.parent) && !gone.has(i.id)) {
          gone.add(i.id);
          grew = true;
        }
      });
    }

    setItems(items.filter((i) => !gone.has(i.id)));
    setSelected(null);
  };

  const editContent = (text: string) => {
    setItems(items.map((i) => (i.id === openId ? { ...i, content: text, modified: Date.now() } : i)));
  };

  return (
    <div
      onMouseDown={onFocus}
      className="absolute flex h-[540px] w-[860px] max-w-[calc(100vw_-_24px)] flex-col overflow-hidden rounded-xl border border-[#1b1b1b] bg-[#242424] text-white shadow-xl"
      style={{ left: pos.x, top: pos.y, zIndex }}
    >
      <div
        onMouseDown={startDrag}
        className="flex h-10 shrink-0 select-none items-center justify-between bg-[#303030] pl-4 pr-2 text-sm"
      >
        <span>Files</span>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-[#c01c28]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1 border-b border-[#1b1b1b] bg-[#2a2a2a] px-2 py-1.5">
        <button onClick={goBack} disabled={back.length === 0} className={tool} title="Back">
          <ChevronLeft size={18} />
        </button>


        <button onClick={goForward} disabled={fwd.length === 0} className={tool} title="Forward">
          <ChevronRight size={18} />
        </button>


        <button onClick={goUp} disabled={!folder || !folder.parent} className={tool} title="Up">
          <ArrowUp size={18} />
        </button>


        <div className="mx-2 flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden rounded-md bg-[#1e1e1e] px-2 py-1 text-sm">
          {chain.map((c, i) => (
            <span key={c.id} className="flex items-center gap-0.5 whitespace-nowrap">
              {i > 0 && <ChevronRight size={12} className="text-gray-600" />}
              <button
                onClick={() => goTo(c.id)}


                className="cursor-pointer rounded px-1 hover:bg-[#3d3d3d]"
              >
                {c.name}
              </button>

            </span>
          ))}
        </div>

        <button onClick={() => startAction('folder')} className={tool} title="New folder">
          <FolderPlus size={18} />
        </button>
        <button onClick={() => startAction('file')} className={tool} title="New text file">
          <FilePlus size={18} />
        </button>
        <button onClick={() => startAction('rename')} disabled={!selected} className={tool} title="Rename">
          <Pencil size={16} />
        </button>
        <button
          onClick={deleteSelected}
          disabled={!selected}
          className={`${tool} hover:text-[#ff7b72]`}
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {action && (
        <div className="flex shrink-0 items-center gap-2 border-b border-[#1b1b1b] bg-[#2a2a2a] px-3 py-2 text-sm">
          <span className="text-gray-400">
            {action.kind === 'rename' ? 'Rename to' : action.kind === 'folder' ? 'Folder name' : 'File name'}
          </span>
          <input
            autoFocus
            value={action.value}
            onChange={(e) => setAction({ ...action, value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
              if (e.key === 'Escape') setAction(null);
            }}
            className="w-56 rounded-md border border-[#3d3d3d] bg-[#1e1e1e] px-2.5 py-1 outline-none"
          />
          <button
            onClick={submit}
            className="cursor-pointer rounded-md bg-[#3584e4] px-3 py-1 hover:bg-[#4a94ee]"
          >
            OK
          </button>
          <button
            onClick={() => setAction(null)}
            className="cursor-pointer rounded-md bg-[#3d3d3d] px-3 py-1 hover:bg-[#4a4a4a]"
          >
            Cancel
          </button>
          {error && <span className="text-xs text-[#ff7b72]">{error}</span>}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div className="w-44 shrink-0 overflow-auto border-r border-[#1b1b1b] bg-[#2a2a2a] p-2">
          {places.map((p) => (
            <button
              key={p.id}
              onClick={() => goTo(p.id)}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${
                p.id === current ? 'bg-[#3d3d3d]' : 'hover:bg-[#333]'
              }`}
            >
              {p.id === 'root' ? <House size={16} /> : <Folder size={16} />}
              <span className="truncate">{p.name}</span>
            </button>

          ))}
        </div>



        {openFile ? (
          <div className="flex min-w-0 flex-1 flex-col bg-[#1e1e1e]">
            <div className="flex items-center justify-between border-b border-[#2e2e2e] px-4 py-2 text-sm">
              <span className="truncate font-semibold">{openFile.name}</span>
              <button
                onClick={() => setOpenId(null)}
                className="cursor-pointer rounded-md bg-[#3d3d3d] px-3 py-1 text-xs hover:bg-[#4a4a4a]"
              >
      Close file
              </button>
            </div>
            <textarea
              value={openFile.content}
              onChange={(e) => editContent(e.target.value)}
              placeholder="Empty file"
              className="flex-1 resize-none bg-transparent px-4 py-3 font-mono text-sm leading-relaxed outline-none placeholder:text-gray-600"
            />
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col" onClick={() => setSelected(null)}>
            <div className="flex items-center border-b border-[#2e2e2e] px-4 py-1.5 text-xs text-gray-500">
              <span className="flex-1">Name</span>
              <span className="w-20 text-right">Size</span>
              <span className="w-24 text-right">Modified</span>
            </div>


            <div className="flex-1 overflow-auto">
              {list.length === 0 && (
                <div className="py-10 text-center text-sm text-gray-500">This folder is empty</div>
              )}

              {list.map((item) => (
                <div
               
               
                key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();

                    setSelected(item.id);
                  }}
                  onDoubleClick={() => openItem(item)}
                  className={`flex cursor-pointer items-center border-b border-[#2a2a2a] px-4 py-2 text-sm ${
                    item.id === selected ? 'bg-[#2b3f5c]' : 'hover:bg-[#2c2c2c]'
                  }`}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    {item.type === 'folder' ? (
                      <Folder size={16} className="shrink-0 text-[#78aeed]" />
                    ) : (
                      <FileText size={16} className="shrink-0 text-gray-400" />
                    )}
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="w-20 text-right text-xs text-gray-400">
                    {item.type === 'file' ? sizeText(item.content.length) : ''}
                  </span>
                  <span className="w-24 text-right text-xs text-gray-400">{dateText(item.modified)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#1b1b1b] px-4 py-1 text-xs text-gray-500">
              {list.length} 
              {list.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



