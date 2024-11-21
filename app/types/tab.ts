export interface Tab {
  key: string;  // 路由路径作为key
  title: string;  // 显示的标题
  closable?: boolean;  // 是否可关闭
}

export interface TabState {
  tabs: Tab[];  // 当前打开的tabs
  activeKey: string;  // 当前激活的tab key
}
