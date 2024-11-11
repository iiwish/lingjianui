// 更新API响应类型定义
export interface ApiResponse<T = unknown> {
  code: number;  // 修改为数字类型，值为200表示成功
  message: string;
  data: T;
}

// 分页请求参数
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

// 分页响应数据
export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 登录请求参数
export interface LoginParams {
  username: string;
  password: string;
  captcha_id: string;  // 修改为下划线命名
  captcha_val: string; // 修改为下划线命名
}

// 登录响应数据
export interface LoginResult {
  access_token: string;  // 改为下划线命名
  refresh_token: string; // 改为下划线命名
  expires_in: number;    // 改为下划线命名
}

// 验证码响应数据
export interface CaptchaResult {
  captcha_id: string;
  captcha_img: string;
}

// 用户信息
export interface UserInfo {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  roles: string[];
  permissions: string[];
}

// 应用信息
export interface AppInfo {
  id: number;
  code: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 应用模板信息
export interface AppTemplate {
  id: number;
  name: string;
  description?: string;
  configuration: string;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

// 配置基础接口
interface BaseConfig {
  id: number;
  appId: number;
  code: string;
  name: string;
  status: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// 数据表配置
export interface TableConfig extends BaseConfig {
  mysqlTableName: string;
  description?: string;
  fields: TableField[];
  indexes?: TableIndex[];
}

// 表字段配置
export interface TableField {
  name: string;
  type: string;
  length?: number;
  default?: string | number | boolean | null;
  comment?: string;
  isPrimary?: boolean;
  isAutoInc?: boolean;
  isUnique?: boolean;
  nullable?: boolean;
  uniqueGroup?: string;
}

// 表索引配置
export interface TableIndex {
  name: string;
  type: 'NORMAL' | 'UNIQUE' | 'FULLTEXT';
  columns: string[];
}

// 维度配置
export interface DimensionConfig extends BaseConfig {
  mysqlTableName: string;
  type: 'time' | 'enum' | 'range';
  configuration: {
    nodeIdField?: string;
    parentIdField?: string;
    nameField?: string;
    codeField?: string;
    levelField?: string;
    orderField?: string;
  };
}

// 数据模型配置
export interface DataModelConfig extends BaseConfig {
  tableId: number;
  fields: ModelField[];
  dimensions?: ModelDimension[];
  metrics?: ModelMetric[];
}

// 模型字段
export interface ModelField {
  name: string;
  displayName: string;
  tableField: string;
  type: string;
}

// 模型维度
export interface ModelDimension {
  dimensionId: number;
  joinField: string;
  displayField: string;
}

// 模型指标
export interface ModelMetric {
  name: string;
  displayName: string;
  type: string;
  expression: string;
}

// 表单配置
export interface FormConfig extends BaseConfig {
  tableId: number;
  type: 'create' | 'edit' | 'view';
  fields: FormField[];
  layout: FormLayout;
  rules?: FormRule[];
  events?: FormEvent[];
}

// 表单字段
export interface FormField {
  id: string;
  field: string;
  label: string;
  type: string;
  required?: boolean;
  properties?: Record<string, string | number | boolean>;
}

// 表单布局
export interface FormLayout {
  type: 'grid' | 'flex';
  columns: FormColumn[];
}

// 表单列
export interface FormColumn {
  span: number;
  elements: string[];
}

// 表单规则
export interface FormRule {
  field: string;
  type: string;
  required?: boolean;
  message?: string;
  pattern?: string;
  min?: number;
  max?: number;
  trigger?: string;
}

// 表单事件
export interface FormEvent {
  type: string;
  action: string;
  content: string;
  parameters?: Record<string, string | number | boolean>;
}

// 菜单配置
export interface MenuConfig extends BaseConfig {
  parentId: number;
  path: string;
  component: string;
  icon?: string;
  sort?: number;
}

// 定时任务
export interface ScheduledTask {
  id: number;
  appId: number;
  name: string;
  type: string;
  cron: string;
  content: Record<string, string | number | boolean>;
  timeout?: number;
  retryTimes?: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

// 元素触发器
export interface ElementTrigger {
  id: number;
  appId: number;
  elementId: number;
  elementType: string;
  type: string;
  triggerPoint: string;
  content: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}
