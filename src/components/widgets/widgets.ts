export type WidgetType = 'music' | 'todo-recent' | 'todo-task';

export interface WidgetInstance {
    id: string;
    type: WidgetType;
    x: number;
    y: number;
    taskId?: number;
}

const STORAGE_KEY = 'webos-widgets';

export function loadWidgets(): WidgetInstance[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveWidgets(widgets: WidgetInstance[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    } catch {
        return;
    }
}