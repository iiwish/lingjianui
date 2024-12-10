import type { Menu } from './menu';

export interface ElementProps {
  elementId: string;
  elementType: string;
  appId: string;
  menuItem?: Menu;
}
