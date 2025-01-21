import type { Menu as AppMenu } from '~/types/element/menu';

export interface TreeSelectNode {
  key: string;
  value: string;
  title: string;
  children?: TreeSelectNode[];
  selectable?: boolean;
  disabled?: boolean;
  data?: AppMenu;
}

export interface NodeState {
  [key: string]: {
    isExpanded: boolean;
    fields: any[];
  };
}
