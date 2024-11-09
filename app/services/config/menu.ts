import { get, post, put, del } from '../../utils/http';
import type { 
  ConfigQuery, 
  MenuConfigResponse, 
  MenuConfigParams,
  RollbackParams
} from './types';
import type { MenuConfig } from '../../types/api';

/**
 * 菜单配置服务
 */
export const MenuConfigService = {
  /**
   * 获取菜单配置列表
   * @param query 查询参数
   */
  getList(query: ConfigQuery): Promise<MenuConfigResponse> {
    return get<MenuConfigResponse>('/config/menus', query);
  },

  /**
   * 获取菜单配置详情
   * @param id 配置ID
   */
  getDetail(id: number): Promise<MenuConfig> {
    return get<MenuConfig>(`/config/menus/${id}`);
  },

  /**
   * 创建菜单配置
   * @param data 配置信息
   */
  create(data: MenuConfigParams): Promise<MenuConfig> {
    return post<MenuConfig>('/config/menus', data);
  },

  /**
   * 更新菜单配置
   * @param id 配置ID
   * @param data 配置信息
   */
  update(id: number, data: Partial<MenuConfigParams>): Promise<MenuConfig> {
    return put<MenuConfig>(`/config/menus/${id}`, data);
  },

  /**
   * 删除菜单配置
   * @param id 配置ID
   */
  delete(id: number): Promise<void> {
    return del<void>(`/config/menus/${id}`);
  },

  /**
   * 获取菜单配置版本历史
   * @param id 配置ID
   */
  getVersions(id: number): Promise<MenuConfig[]> {
    return get<MenuConfig[]>(`/config/menus/${id}/versions`);
  },

  /**
   * 回滚菜单配置到指定版本
   * @param params 回滚参数
   */
  rollback(params: RollbackParams): Promise<void> {
    const { configId, version } = params;
    return post<void>(`/config/menus/${configId}/rollback`, { version });
  }
};

// 导出配置服务集合
export * from './table';
export * from './dimension';
export * from './model';
export * from './form';
export * from './types';
