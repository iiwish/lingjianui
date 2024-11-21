import type { Menu, MenuResponse, MenusResponse } from '~/types/menu';
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
      },
      headers: {
        'App-ID': appId
      }
    });
    return response.data;
  },

  /**
   * 获取菜单详情
   */
  getMenu: async (id: string, appId: string) => {
    const response = await http.get<MenuResponse>(`${BASE_URL}/${id}`, {
      headers: {
        'App-ID': appId
      }
    });
    return response.data;
  },
};
