import type { Menu, MenuResponse, IDResponse, CreateMenuRequest, UpdateMenuRequest, CreateMenuItemRequest, UpdateMenuItemRequest, MenuConfigResponse } from '~/types/menu';
import http from '~/utils/http';

const CONFIG_URL = '/config/menus';
const ELEMENT_URL = '/menu';

export const MenuService = {
  /**
   * 获取菜单列表
   */
  getMenuList: async () => {
    const response = await http.get<MenuConfigResponse>(`${CONFIG_URL}`);
    return response.data;
  },

  /**
   * 获取系统菜单id
   */
  getSystemMenuId: async () => {
    const response = await http.get<IDResponse>(`${CONFIG_URL}/sysid`);
    return response.data;
  },

  /**
   * 创建菜单
   */
  createMenu: async (params: CreateMenuRequest) => {
    const response = await http.post<IDResponse>(`${CONFIG_URL}`, params);
    return response.data;
  },

  /**
   * 更新菜单
   */
  updateMenu: async (params: UpdateMenuRequest) => {
    const response = await http.put<IDResponse>(`${CONFIG_URL}`, params);
    return response.data;
  },

  /**
   * 删除菜单
   */
  deleteMenu: async (id: string) => {
    const response = await http.delete<IDResponse>(`${CONFIG_URL}/${id}`);
    return response.data;
  },

  /**
   * 获取菜单详情
   */
  getMenus: async (id: string, type?: string, parent_id?: string, level?: number) => {
    if (!type) {
      type = 'descendants';
    }
    const response = await http.get<MenuResponse>(`${ELEMENT_URL}/${id}`, {
      params: {
        type,
        parent_id,
        level
      }
    });
    return response.data;
  },


  /**
   * 创建菜单
   */
  createMenuItem: async (params: CreateMenuItemRequest) => {
    const response = await http.post<IDResponse>(ELEMENT_URL, params);
    return response.data;
  },

  /**
   * 更新菜单
   * @param id 菜单ID
   * @param params 更新参数
   */
  updateMenuItem: async (id: string, params: UpdateMenuItemRequest) => {
    const response = await http.put<IDResponse>(`${ELEMENT_URL}/${id}`, params);
    return response.data;
  },

  /**
   * 删除菜单
   */ 
  deleteMenuItem: async (id: string) => {
    const response = await http.delete<IDResponse>(`${ELEMENT_URL}/${id}`);
    return response.data;
  }
};
