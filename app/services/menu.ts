import type { Menu, MenuResponse, MenusResponse, CreateMenuRequest } from '~/types/menu';
import http from '~/utils/http';

const BASE_URL = '/config/menus';

export const MenuService = {
  /**
   * 获取菜单列表
   */
  getMenus: async (appId: string) => {
    const response = await http.get<MenusResponse>(BASE_URL, {
      params: {
        type: 'descendants'
      }
    });
    return response.data;
  },

  /**
   * 获取菜单详情
   */
  getMenu: async (id: string, appId: string) => {
    const response = await http.get<MenuResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * 创建菜单
   */
  createMenu: async (params: CreateMenuRequest) => {
    const response = await http.post<MenuResponse>(BASE_URL, params);
    return response.data;
  },

  /**
   * 更新菜单
   * @param id 菜单ID
   * @param params 更新参数
   */
  updateMenu: async (id: string, params: Partial<Menu>) => {
    const response = await http.put<MenuResponse>(`${BASE_URL}/${id}`, params);
    return response.data;
  },

  /**
   * 删除菜单
   */ 
  deleteMenu: async (id: string) => {
    const response = await http.delete<MenuResponse>(`${BASE_URL}/${id}`);
    return response.data;
  }
};
