import type {
  TableConfig,
  DimensionConfig,
  DataModelConfig,
  FormConfig,
  MenuConfig,
  PaginatedData
} from '../../types/api';

// 配置查询参数
export interface ConfigQuery extends Record<string, unknown> {
  appId: number;
  page?: number;
  pageSize?: number;
}

// 配置版本查询参数
export interface VersionQuery extends Record<string, unknown> {
  configId: number;
  page?: number;
  pageSize?: number;
}

// 配置回滚参数
export interface RollbackParams {
  configId: number;
  version: number;
}

// 配置服务响应类型
export type TableConfigResponse = PaginatedData<TableConfig>;
export type DimensionConfigResponse = PaginatedData<DimensionConfig>;
export type ModelConfigResponse = PaginatedData<DataModelConfig>;
export type FormConfigResponse = PaginatedData<FormConfig>;
export type MenuConfigResponse = PaginatedData<MenuConfig>;

// 配置基础请求参数
export interface BaseConfigParams extends Record<string, unknown> {
  appId: number;
  code: string;
  name: string;
}

// 表配置请求参数
export interface TableConfigParams extends BaseConfigParams {
  mysqlTableName: string;
  description?: string;
  fields: TableConfig['fields'];
  indexes?: TableConfig['indexes'];
}

// 维度配置请求参数
export interface DimensionConfigParams extends BaseConfigParams {
  mysqlTableName: string;
  type: DimensionConfig['type'];
  configuration: DimensionConfig['configuration'];
}

// 数据模型配置请求参数
export interface ModelConfigParams extends BaseConfigParams {
  tableId: number;
  fields: DataModelConfig['fields'];
  dimensions?: DataModelConfig['dimensions'];
  metrics?: DataModelConfig['metrics'];
}

// 表单配置请求参数
export interface FormConfigParams extends BaseConfigParams {
  tableId: number;
  type: FormConfig['type'];
  fields: FormConfig['fields'];
  layout: FormConfig['layout'];
  rules?: FormConfig['rules'];
  events?: FormConfig['events'];
}

// 菜单配置请求参数
export interface MenuConfigParams extends BaseConfigParams {
  parentId?: number;
  path: string;
  component: string;
  icon?: string;
  sort?: number;
}
