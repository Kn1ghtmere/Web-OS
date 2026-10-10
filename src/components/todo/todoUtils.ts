export interface Task {
    id: number;
    text: string;
    deadline: string;
    done: boolean;
}

const STORAGE_KEY = 'webos-todos';
const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

export const dateKey = (d: Date) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());


export const loadTasks = (): Task[] => {
    try {
        const raw  = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const saveTasks = (tasks: Task[]) => {
    try {
        localStorage.setItem(STORAGE_KEY , JSON.stringify(tasks));
    } catch {
        return;
    }
};

export const dueLabel = (deadline: string, todayKey: string) => {
    if(!deadline) return 'No deadline';
    if (deadline === todayKey) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if(deadline === dateKey(tomorrow)) return 'Tomorrow';
    const [y, m, d] = deadline.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString([], {day: 'numeric', month: 'short'});
};

