export interface Menu {
  id: number;
  app_id: number;
  menu_name: string;
  menu_code: string;
  menu_type: string;
  icon: string;
  path: string;
  source_id: string;
  parent_id: number;
  level: number;
  sort: number;
  status: number;
  node_id: string;
  configuration?: string; // 添加配置字段
  created_at?: string;
  updated_at?: string;
  creator_id: number;
  updater_id: number;
  children?: Menu[];
}

export interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  children?: MenuItem[];
  onClick?: () => void;
}

export interface MenuResponse {
  code: number;
  data: Menu;
  message: string;
}

export interface MenusResponse {
  code: number;
  data: {
    items: Menu[];
    total: number;
  };
  message: string;
}

export interface CreateMenuRequest {
  app_id: string;
  menu_name: string;
  menu_code: string;
  menu_type: string;
  parent_id: number;
  status: number;
  icon?: string;
  path?: string;
  source_id?: string;
  level?: number;
  sort?: number;
  node_id?: string;
  configuration?: string;
}
