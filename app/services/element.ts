import { get } from '~/utils/http';

export interface TableConfig {
  id: number;
  table_name: string;
  display_name: string;
  description: string;
  func?: string;
  app_id: number;
  status: number;
  created_at: string;
  updated_at: string;
  creator_id: number;
  updater_id: number;
}

export interface DimensionConfig {
  id: number;
  display_name: string;
  description: string;
  table_name: string;
  app_id: number;
  status: number;
  created_at: string;
  updated_at: string;
  creator_id: number;
  updater_id: number;
}

export interface DimensionItem {
  id: number;
  name: string;
  code: string;
  parent_id: number;
  level: number;
  node_id: string;
  status: number;
  sort: number;
  children?: DimensionItem[];
}

export interface MenuConfig {
  id: number;
  menu_name: string;
  menu_code: string;
  menu_type: string;
  icon: string;
  path: string;
  parent_id: number;
  level: number;
  sort: number;
  status: number;
  app_id: number;
  created_at: string;
  updated_at: string;
  creator_id: number;
  updater_id: number;
}

export interface MenuItem {
  id: number;
  menu_name: string;
  menu_code: string;
  menu_type: string;
  icon: string;
  path: string;
  parent_id: number;
  level: number;
  sort: number;
  children?: MenuItem[];
}

export interface ModelConfig {
  id: number;
  model_name: string;
  display_name: string;
  description: string;
  configuration: string;
  version: number;
  app_id: number;
  status: number;
  created_at: string;
  updated_at: string;
  creator_id: number;
  updater_id: number;
}

export interface ModelConfiguration {
  fields: Array<{
    name: string;
    type: string;
    label: string;
    required?: boolean;
    options?: Array<{
      label: string;
      value: string | number;
    }>;
  }>;
  layout?: {
    columns?: number;
    gutter?: number;
  };
}

export interface FormConfig {
  id: number;
  form_name: string;
  form_type: string;
  display_name: string;
  description: string;
  configuration: string;
  model_id: number;
  version: number;
  app_id: number;
  status: number;
  created_at: string;
  updated_at: string;
  creator_id: number;
  updater_id: number;
}

export interface FormConfiguration {
  fields: Array<{
    name: string;
    type: string;
    label: string;
    required?: boolean;
    rules?: Array<{
      type: string;
      message: string;
      pattern?: string;
      min?: number;
      max?: number;
    }>;
    props?: {
      placeholder?: string;
      maxLength?: number;
      min?: number;
      max?: number;
      step?: number;
      options?: Array<{
        label: string;
        value: string | number;
      }>;
    };
  }>;
  layout?: {
    columns?: number;
    gutter?: number;
    labelCol?: { span: number };
    wrapperCol?: { span: number };
  };
  actions?: Array<{
    type: string;
    label: string;
    props?: Record<string, any>;
  }>;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 获取表格配置
export const getTableConfig = async (appId: string, tableId: string): Promise<ApiResponse<TableConfig>> => {
  return get(`/config/tables/${tableId}`, { headers: { 'App-ID': appId } });
};

// 获取表格数据
export const getTableData = async (appId: string, tableId: string): Promise<ApiResponse<Record<string, any>[]>> => {
  return get(`/config/tables/${tableId}/items`, { headers: { 'App-ID': appId } });
};

// 获取维度配置
export const getDimensionConfig = async (appId: string, dimId: string): Promise<ApiResponse<DimensionConfig>> => {
  return get(`/config/dimensions/${dimId}`, { headers: { 'App-ID': appId } });
};

// 获取维度数据
export const getDimensionData = async (appId: string, dimId: string): Promise<ApiResponse<DimensionItem[]>> => {
  return get(`/config/dimensions/${dimId}/items`, { headers: { 'App-ID': appId } });
};

// 获取菜单配置
export const getMenuConfig = async (appId: string, menuId: string): Promise<ApiResponse<MenuConfig>> => {
  return get(`/config/menus/${menuId}`, { headers: { 'App-ID': appId } });
};

// 获取菜单数据
export const getMenuData = async (appId: string, menuId: string): Promise<ApiResponse<MenuItem[]>> => {
  return get(`/config/menus/${menuId}`, { headers: { 'App-ID': appId } });
};

// 获取模型配置
export const getModelConfig = async (appId: string, modelId: string): Promise<ApiResponse<ModelConfig>> => {
  return get(`/config/models/${modelId}`, { headers: { 'App-ID': appId } });
};

// 获取模型数据
export const getModelData = async (appId: string, modelId: string): Promise<ApiResponse<Record<string, any>[]>> => {
  return get(`/config/models/${modelId}`, { headers: { 'App-ID': appId } });
};

// 获取表单配置
export const getFormConfig = async (appId: string, formId: string): Promise<ApiResponse<FormConfig>> => {
  return get(`/config/forms/${formId}`, { headers: { 'App-ID': appId } });
};

// 获取表单数据
export const getFormData = async (appId: string, formId: string): Promise<ApiResponse<Record<string, any>>> => {
  return get(`/config/forms/${formId}`, { headers: { 'App-ID': appId } });
};
