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

// 改密码请求参数
export interface ChangePasswordParams {
  old_password: string; // 修改为下划线命名
  new_password: string; // 修改为下划线命名
}

// 用户信息
export interface UserInfo {
  id: number;
  username: string;
  nickname?: string; // 添加可选的nickname字段
  email: string;
  phone: string;
  status: number;
  type: string;
  permissions?: string[]; // 存储权限code列表
}

// 权限信息
export interface Permission {
  id: number;
  name: string;
  code: string;
  type: string;
  method?: string;
  path?: string;
  menu_id?: number;
  status: number;
  description?: string;
}
