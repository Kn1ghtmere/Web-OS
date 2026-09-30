import japan from '../../assets/backgrounds/japan.jpg';
import lain from '../../assets/backgrounds/lain.jpg';
import mountains from '../../assets/backgrounds/oled-mountains.jpg';
import balcony from '../../assets/backgrounds/Balcony-ja.png';
import pink_scenery from '../../assets/backgrounds/moewanders-the-frontier.jpg'
import gruvbox from "../../assets/backgrounds/gruvbox_witcher.png"
import yellow from "../../assets/backgrounds/yellow_kyoto.jpg"
import lain2 from "../../assets/backgrounds/lain2.jpg"
import bisbis from "../../assets/backgrounds/bisbiswas-gathering.jpg"
export interface Wallpaper {
   id: string;
   name: string;
   src: string;

}

export const wallpapers: Wallpaper[] = [
{ id: 'japan', name: 'Japan', src: japan },
  { id: 'lain', name: 'Lain', src: lain },
{ id: 'mountains', name: 'OLED Mountains', src: mountains },
  { id: 'balcony', name: 'Balcony', src: balcony },
  {id:'pink',name:"Pink Scenery",src:pink_scenery},
  {id:'gruvbox',name:"Gruvbox",src:gruvbox},
  {id:"yellow",name:"Yellow",src:yellow},
  {id:"lain 2",name:"one more lain",src:lain2},
  {id:"bisbis",name:"bis bis idk",src:bisbis}

];

export interface SettingsState {
  wallpaper: string;
  iconSize: number;
  magnification: boolean;
 magnificationAmount: number;
  showLabels: boolean;
  dockOpacity: number;
}

export const defaultSettings: SettingsState = {
  wallpaper: 'japan',
  iconSize: 56,
  magnification: true,
  magnificationAmount: 50,
  showLabels: true,
  dockOpacity: 20,
};
const STORAGE_KEY = 'webos-settings';
export function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
   
   
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
       return defaultSettings;
  }
}

export function saveSettings(settings: SettingsState) {
  try {


    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    return;
  }
}