import { Check } from 'lucide-react';
import { dateKey, dueLabel } from '../todo/todoUtils';
import type { Task } from '../todo/todoUtils';

interface TodoWidgetProps {
  mode: 'recent' | 'task';
  tasks: Task[];
  taskId?: number;
  onToggle: (id: number) => void;
  onOpen: () => void;
}

export default function TodoWidget({ mode, tasks, taskId, onToggle, onOpen }: TodoWidgetProps) {
  const todayKey = dateKey(new Date());

  const shown =
    mode === 'recent'
      ? tasks.filter((t) => !t.done).sort((a, b) => b.id - a.id).slice(0, 4)
      : tasks.filter((t) => t.id === taskId);

  return (
    <div className="w-[240px] rounded-2xl border border-white/25 bg-[rgba(24,26,32,0.75)] p-3 text-white shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-[16px]">
      <button
        onClick={onOpen}
        className="mb-1 block cursor-pointer border-none bg-transparent p-0 text-xs text-white/55"
      >
        {mode === 'recent' ? 'Recent tasks' : 'Task'}
      </button>

      {shown.length === 0 && <div className="py-1 text-sm text-white/50">All done</div>}

      {shown.map((t) => {
        const overdue = !t.done && t.deadline !== '' && t.deadline < todayKey;

        return (
          <div key={t.id} className="flex items-center gap-2.5 py-1.5">
            <button
              onClick={() => onToggle(t.id)}
              className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border ${
                t.done ? 'border-[#3584e4] bg-[#3584e4]' : 'border-gray-400 hover:border-white'
              }`}
            >
              {t.done && <Check size={12} />}
            </button>
            <div className="min-w-0 flex-1">
              <div className={`truncate text-sm ${t.done ? 'text-white/40 line-through' : ''}`}>{t.text}</div>
              <div className={`text-xs ${overdue ? 'text-[#ff7b72]' : 'text-white/45'}`}>
                {dueLabel(t.deadline, todayKey)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}