import http from '~/utils/http';
import { ApiResponse, IDResponse } from '~/types/common';
import { Menu, CreateMenuItemRequest, UpdateMenuItemRequest } from '~/types/element/menu';

const baseUrl = '/menu';

export const MenuService = {
  /**
   * 获取菜单详情
   */
  getMenus: async (id: string, type?: string, parent_id?: string, level?: number) => {
    if (!type) {
      type = 'descendants';
    }
    const response = await http.get<ApiResponse<Menu[]>>(`${baseUrl}/${id}`, {
      params: {
        type,
        parent_id,
        level
      }
    });
    return response.data;
  },


  /**
   * 创建系统菜单
   */
  createSysMenuItem: async (params: CreateMenuItemRequest) => {
    const response = await http.post<IDResponse>(baseUrl, params);
    return response.data;
  },

  /**
     * 创建菜单
     */
  createMenuItem: async (menu_id: string, params: CreateMenuItemRequest) => {
    const response = await http.post<IDResponse>(`${baseUrl}/${menu_id}`, params);
    return response.data;
  },


  /**
   * 更新菜单
   * @param id 菜单ID
   * @param params 更新参数
   */
  updateMenuItem: async (menu_id: string, id: string, params: UpdateMenuItemRequest) => {
    const response = await http.put<IDResponse>(`${baseUrl}/${menu_id}/${id}`, params);
    return response.data;
  },

  /**
   * 更新菜单排序
   * @param id 菜单ID
   * @param params 更新参数
   * @param params.parent 父级ID
   * @param params.sort 排序值
   * @returns
   * @memberof MenuService
   */
  updateMenuItemSort: async (menu_id: string, id: string, params: { parent?: string; sort?: number }) => {
    const response = await http.put<IDResponse>(`${baseUrl}/${menu_id}/${id}/sort`, null, {
      params
    });
    return response.data;
  },

  /**
   * 删除菜单
   */ 
  deleteMenuItem: async (menu_id: string,id: string) => {
    const response = await http.delete<IDResponse>(`${baseUrl}/${menu_id}/${id}`);
    return response.data;
  }
};
