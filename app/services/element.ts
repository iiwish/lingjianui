import { get,put,post,del } from '~/utils/http';

// 数据表配置信息
export interface TableConfig {
  table_name: string;
  display_name: string;
  description: string;
  func?: string;
  fields: FieldConfig[];
  indexes: IndexConfig[];
}

export interface FieldConfig {
  name: string;
  comment: string;
  column_type: string;
  sort: number;
  primary_key?: boolean;
  auto_increment?: boolean;
  not_null?: boolean;
  default?: string;
}

export interface IndexConfig {
  name: string;
  type: string;
  fields: string[];
}

// 数据表数据
interface TableData {
  items: Array<{ [key: string]: any }>;
  page: number;
  pageSize: number;
  total: number;
}

// 创建数据表记录请求参数
export type CreateTableItemsRequest = Array<Record<string, any>>;

// 更新数据表记录请求参数
export interface UpdateTableItemsRequest {
  primary_key_columns: string[]; // 主键列名列表
  items: Array<Record<string, any>>; // 要更新的数据表记录
}

export interface CustomColumn {
  name: string;
  length: number;
  comment: string;
}

export interface DimensionConfig {
  id: number;
  display_name: string;
  description: string;
  table_name: string;
  app_id: number;
  status: number;
  dimension_type: string;
  created_at: string;
  updated_at: string;
  creator_id: number;
  updater_id: number;
  custom_columns?: CustomColumn[];
}

export interface DimensionConfigRequest {
  display_name: string;
  description: string;
  table_name: string;
  parent_id: number;
  dimension_type?: string;
  custom_columns?: CustomColumn[];
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
  custom_data?: Record<string, string>;
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

export interface QueryCondition {
  root: {
    logic: 'AND' | 'OR';
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    } | QueryCondition>;
  };
  order_by?: Array<{
    field: string;
    desc: boolean;
  }>;
  group_by?: string[];
}

// 获取表格配置
export const getTableConfig = async (tableId: string): Promise<ApiResponse<TableConfig>> => {
  return get(`/config/tables/${tableId}`);
};

// 创建表格响应
interface OneID {
  id: string; // 表格ID
}

// 创建表格
export const createTableConfig = async (config: TableConfig): Promise<ApiResponse<OneID>> => {
  return post('/config/tables', config);
};

// 统一更新表格配置
export interface TableUpdateRequest {
  table_name?: string;
  display_name?: string;
  description?: string;
  func?: string;
  fields?: Array<{
    field: FieldConfig;
    oldFieldName?: string;
    updateType: 'add' | 'drop' | 'modify';
  }>;
  indexes?: Array<{
    index: IndexConfig;
    oldIndexName?: string;
    updateType: 'add' | 'drop' | 'modify';
  }>;
}

export const updateTableConfig = async (tableId: string, config: TableUpdateRequest): Promise<ApiResponse<null>> => {
  return put(`/config/tables/${tableId}`, config);
};

// 获取表格数据
export const getTableData = async (
  tableId: string, 
  page: number, 
  page_size: number,
  queryCondition?: QueryCondition
): Promise<ApiResponse<TableData>> => {
  return post(`/table/${tableId}/query`, {
    page,
    page_size,
    query: queryCondition
  });
};

// 创建数据表记录
export const createTableItems = async (tableId: string, request: CreateTableItemsRequest): Promise<ApiResponse<null>> => {
  return post(`/table/${tableId}`, request);
};

// 更新数据表记录
export const updateTableItems = async (tableId: string, request: UpdateTableItemsRequest): Promise<ApiResponse<null>> => {
  return put(`/table/${tableId}`, request);
};

// 批量删除数据表记录
export const deleteTableItems = async (tableId: string, request: CreateTableItemsRequest): Promise<ApiResponse<null>> => {
  return del(`/table/${tableId}`, request);
};

export const createDimensionConfig = async (config: DimensionConfigRequest): Promise<ApiResponse<OneID>> => {
  return post('/config/dimensions', config);
};

// 获取维度配置
export const getDimensionConfig = async (dimId: string): Promise<ApiResponse<DimensionConfig>> => {
  return get(`/config/dimensions/${dimId}`);
};

// 更新维度配置
export const updateDimensionConfig = async (dimId: string, config: Omit<DimensionConfigRequest, 'parent_id'>): Promise<ApiResponse<null>> => {
  return put(`/config/dimensions/${dimId}`, config);
};

// 删除维度配置
export const deleteDimensionConfig = async (dimId: string): Promise<ApiResponse<null>> => {
  return del(`/config/dimensions/${dimId}`);
};

// 获取维度树
export const getDimensionTree = async (dimId: string, params?: {
  id?: number;
  type?: 'children' | 'descendants' | 'leaves';
  level?: 0 | 1 | 2 | 3;
}): Promise<ApiResponse<DimensionItem[]>> => {
  return get(`/dimension/${dimId}`, { params });
};

// 更新维度节点
export const updateDimensionNode = async (dimId: string, id: string, params: {
  parent?: number;
  sort?: number;
}): Promise<ApiResponse<null>> => {
  return put(`/dimension/${dimId}/${id}`, null, { params });
};

// 更新维度节点信息
export const updateDimensionItem = async (dimId: string, id: string, item: Partial<DimensionItem>): Promise<ApiResponse<DimensionItem>> => {
  return put(`/dimension/${dimId}`, item);
};

interface IDList {
  ids: number[];
}
// 批量创建维度节点
export const createDimensionItems = async (dimId: string, items: Omit<DimensionItem, 'id' | 'children'>[]): Promise<ApiResponse<IDList>> => {
  return post(`/dimension/${dimId}`, items);
};

// 批量删除维度节点
export const deleteDimensionItems = async (dimId: string, ids: number[]): Promise<ApiResponse<null>> => {
  return del(`/dimension/${dimId}`, ids);
};

// 获取菜单配置
export const getMenuConfig = async (appId: string, menuId: string): Promise<ApiResponse<MenuConfig>> => {
  return get(`/config/menus/${menuId}`,);
};

// 获取菜单数据
export const getMenuData = async (appId: string, menuId: string): Promise<ApiResponse<MenuItem[]>> => {
  return get(`/config/menus/${menuId}`,);
};

// 获取模型配置
export const getModelConfig = async (appId: string, modelId: string): Promise<ApiResponse<ModelConfig>> => {
  return get(`/config/models/${modelId}`,);
};

// 获取模型数据
export const getModelData = async (appId: string, modelId: string): Promise<ApiResponse<Record<string, any>[]>> => {
  return get(`/config/models/${modelId}`,);
};

// 获取表单配置
export const getFormConfig = async (appId: string, formId: string): Promise<ApiResponse<FormConfig>> => {
  return get(`/config/forms/${formId}`,);
};

// 获取表单数据
export const getFormData = async (appId: string, formId: string): Promise<ApiResponse<Record<string, any>>> => {
  return get(`/config/forms/${formId}`,);
};
