import { get, post, put, del } from '../../utils/http';
import type { 
  ConfigQuery, 
  TableConfigResponse, 
  TableConfigParams,
  RollbackParams
} from './types';
import type { TableConfig } from '../../types/api';

/**
 * 数据表配置服务
 */
export const TableConfigService = {
  /**
   * 获取数据表配置列表
   * @param query 查询参数
   */
  getList(query: ConfigQuery): Promise<TableConfigResponse> {
    return get<TableConfigResponse>('/config/tables', query);
  },

  /**
   * 获取数据表配置详情
   * @param id 配置ID
   */
  getDetail(id: number): Promise<TableConfig> {
    return get<TableConfig>(`/config/tables/${id}`);
  },

  /**
   * 创建数据表配置
   * @param data 配置信息
   */
  create(data: TableConfigParams): Promise<TableConfig> {
    return post<TableConfig>('/config/tables', data);
  },

  /**
   * 更新数据表配置
   * @param id 配置ID
   * @param data 配置信息
   */
  update(id: number, data: Partial<TableConfigParams>): Promise<TableConfig> {
    return put<TableConfig>(`/config/tables/${id}`, data);
  },

  /**
   * 删除数据表配置
   * @param id 配置ID
   */
  delete(id: number): Promise<void> {
    return del<void>(`/config/tables/${id}`);
  },

  /**
   * 获取数据表配置版本历史
   * @param id 配置ID
   */
  getVersions(id: number): Promise<TableConfig[]> {
    return get<TableConfig[]>(`/config/tables/${id}/versions`);
  },

  /**
   * 回滚数据表配置到指定版本
   * @param params 回滚参数
   */
  rollback(params: RollbackParams): Promise<void> {
    const { configId, version } = params;
    return post<void>(`/config/tables/${configId}/rollback`, { version });
  }
};
