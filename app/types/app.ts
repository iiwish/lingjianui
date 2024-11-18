export interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAppDto {
  name: string;
  description: string;
  icon: string;
  code: string; // 添加 code 属性
}

export interface UpdateAppDto {
  name?: string;
  description?: string;
  icon?: string;
}

export interface AppState {
  apps: App[];
  currentApp: App | null;
  loading: boolean;
  error: string | null;
}

// API响应类型
export interface AppResponse {
  code: number;
  data: App;
  message: string;
}

export interface AppsResponse {
  code: number;
  data: {
    items: App[];
    total: number;
  };
  message: string;
}
