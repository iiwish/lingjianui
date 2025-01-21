import http from '~/utils/http';
import type { App, CreateAppDto, UpdateAppDto, AppResponse, AppsResponse } from '~/types/app';

const BASE_URL = '/apps';

export const AppService = {
  /**
   * 获取应用列表
   */
  getApps: async () => {
    const response = await http.get<AppsResponse>(BASE_URL);
    return response.data;
  },

  /**
   * 获取应用详情
   */
  getApp: async (id: string) => {
    const response = await http.get<AppResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * 创建应用
   */
  createApp: async (data: CreateAppDto) => {
    const response = await http.post<AppResponse>(BASE_URL, data);
    return response.data;
  },

  /**
   * 更新应用
   */
  updateApp: async (id: string, data: UpdateAppDto) => {
    const response = await http.put<AppResponse>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * 删除应用
   */
  deleteApp: async (id: string) => {
    const response = await http.delete<AppResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * 设置默认应用
   */
  setDefaultApp: async (id: string) => {
    const response = await http.post<AppResponse>(`${BASE_URL}/${id}/default`);
    return response.data;
  },

  /**
   * 获取默认应用
   */
  getDefaultApp: async () => {
    const response = await http.get<AppResponse>(`${BASE_URL}/default`);
    return response.data;
  },
};
