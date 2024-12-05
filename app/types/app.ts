export interface App {
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  created_at: string;
  creator_id: number;
  updated_at: string;
  updater_id: number;
  icon?: string;
}

export interface CreateAppDto {
  name: string;
  code: string;
  description: string;
  icon?: string;
}

export interface UpdateAppDto {
  name?: string;
  description?: string;
  code?: string;
  status?: number;
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
