import type { App, CreateAppDto, UpdateAppDto, AppResponse, AppsResponse } from '~/types/app';
import { get, post, put, del } from '~/utils/http';

const BASE_URL = '/apps';

export const appService = {
  /**
   * 获取应用列表
   */
  getApps: async () => {
    const response = await get<AppsResponse>(BASE_URL);
    return response.data;
  },

  /**
   * 获取应用详情
   */
  getApp: async (id: string) => {
    const response = await get<AppResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * 创建应用
   */
  createApp: async (data: CreateAppDto) => {
    const response = await post<AppResponse>(BASE_URL, data);
    return response.data;
  },

  /**
   * 更新应用
   */
  updateApp: async (id: string, data: UpdateAppDto) => {
    const response = await put<AppResponse>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * 删除应用
   */
  deleteApp: async (id: string) => {
    const response = await del<AppResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * 设置默认应用
   */
  setDefaultApp: async (id: string) => {
    const response = await post<AppResponse>(`${BASE_URL}/${id}/default`);
    return response.data;
  },

  /**
   * 获取默认应用
   */
  getDefaultApp: async () => {
    const response = await get<AppResponse>(`${BASE_URL}/default`);
    return response.data;
  },
};
