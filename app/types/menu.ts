export interface Menu {
  id: number;
  node_id: string;
  parent_id: number;
  menu_name: string;
  menu_code: string;
  menu_type: number;
  icon_path: string;
  source_id: number;
  level: number;
  sort: number;
  status: number;
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

export interface IDResponse {
  code: number;
  data: {
    id?: number;
  }
  message: string;
}

export interface CreateMenuRequest {
  parent_id: number;
  menu_name: string;  
  table_name: string;
  description: string;
}

export interface UpdateMenuRequest {
  menu_name: string;
  table_name: string;
  description: string;
}

export interface CreateMenuItemRequest {
  parent_id: number;
  menu_name: string;
  menu_code: string;
  menu_type: number;
  icon_path: string;
  source_id: number;
  status: number;
  description: string;
}

export interface UpdateMenuItemRequest {
  id: number;
  menu_name: string;
  menu_code: string;
  menu_type: number;
  icon_path: string;
  source_id: number;
  status: number;
  description: string;
}