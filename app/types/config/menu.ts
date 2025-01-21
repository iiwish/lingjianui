export interface MenuConfig {
  id: number;
  table_name: string;
  display_name: string;
  description: string;
  dimension_type: string;
  app_id: number;
  status: number;
  created_at: string;
  updated_at: string;
  creator_id: number;
  updater_id: number;
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
