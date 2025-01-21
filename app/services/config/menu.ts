import http from '~/utils/http';
import { ApiResponse, IDResponse } from '~/types/common';
import type { CreateMenuRequest, UpdateMenuRequest,MenuConfig } from '~/types/config/menu';

const baseUrl = '/config/menus';

export const MenuConfigService = {
    /**
   * 获取菜单列表
   */
  getMenuList: async () => {
    const response = await http.get<ApiResponse<MenuConfig[]>>(`${baseUrl}`);
    return response.data;
  },

  /**
   * 获取菜单详情
   * @param id 菜单ID
   */
  getMenuConfigByID: async (id: string) => {
    const response = await http.get<ApiResponse<MenuConfig>>(`${baseUrl}/${id}`);
    return response.data;
  },

  /**
   * 获取系统菜单id
   */
  getSystemMenuId: async () => {
    const response = await http.get<IDResponse>(`${baseUrl}/sysid`);
    return response.data;
  },

  /**
   * 创建菜单
   */
  createMenu: async (params: CreateMenuRequest) => {
    const response = await http.post<IDResponse>(`${baseUrl}`, params);
    return response.data;
  },

  /**
   * 更新菜单
   */
  updateMenu: async (params: UpdateMenuRequest) => {
    const response = await http.put<IDResponse>(`${baseUrl}`, params);
    return response.data;
  },

  /**
   * 删除菜单
   */
  deleteMenu: async (id: string) => {
    const response = await http.delete<IDResponse>(`${baseUrl}/${id}`);
    return response.data;
  },
};