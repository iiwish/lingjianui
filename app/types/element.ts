import type { Menu } from './menu';

export interface ElementProps {
  elementId: string;
  elementType: string;
  appCode: string;
  menuItem?: Menu;
}
