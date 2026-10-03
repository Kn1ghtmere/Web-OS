import calcIcon from '../../assets/icons/calc.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import fileManagerIcon from '../../assets/icons/file-manager.svg';
import musicIcon from '../../assets/icons/gnome-music.svg';
import todoIcon from '../../assets/icons/gnome-todo.svg';
import settingsIcon from '../../assets/icons/settings-icon.svg';
import terminalIcon from '../../assets/icons/terminal.svg';

export interface DockItem {
  id: string;
  label: string;
  icon: string;
}

export const dockItems: DockItem[] = [
  { id: 'file-manager', label: 'Files', icon: fileManagerIcon },
  { id: 'terminal', label: 'Terminal', icon: terminalIcon },
  { id: 'todo', label: 'To-Do', icon: todoIcon },
  { id: 'music', label: 'Music', icon: musicIcon },
  { id: 'calc', label: 'Calculator', icon: calcIcon },
  { id: 'calendar', label: 'Calendar', icon: calendarIcon },
  { id: 'settings', label: 'Settings', icon: settingsIcon },
];