export interface Tab {
  key: string;  // 路由路径作为key
  title: string;  // 显示的标题
  closable?: boolean;  // 是否可关闭
}

export interface BreadcrumbItem {
  id: number;
  name: string;
  menu_type: number;
}

export interface FolderTabState {
  currentFolder: number | null;
  breadcrumbs: BreadcrumbItem[];
}

export interface TabState {
  tabs: Tab[];  // 当前打开的tabs
  activeKey: string;  // 当前激活的tab key
  tabStates: {
    [key: string]: FolderTabState;  // 每个tab的状态
  };
}
