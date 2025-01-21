import { ApiResponse } from '~/types/common';

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
  idToCode: { [key: string]: string }; // id到code的映射
  codeToId: { [key: string]: string }; // code到id的映射
}

export type AppResponse = ApiResponse<App>;

export type AppsResponse = ApiResponse<{
  items: App[];
  total: number;
}>;
