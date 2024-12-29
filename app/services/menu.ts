import type { Menu, MenuResponse, MenusResponse, CreateMenuRequest } from '~/types/menu';
import http from '~/utils/http';

const BASE_URL = '/config/menus';

export const MenuService = {
  /**
   * 获取菜单列表
   */
  getMenus: async (type: string = 'descendants', parent_id?: string, level?: number) => {
    const response = await http.get<MenusResponse>(BASE_URL, {
      params: {
        type,
        parent_id,
        level
      }
    });
    return response.data;
  },

  /**
   * 获取菜单详情
   */
  getMenu: async (id: string) => {
    const response = await http.get<MenuResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * 获取系统菜单id
   */
  getSystemMenuId: async () => {
    const response = await http.get<MenuResponse>(`${BASE_URL}/sysid`);
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
