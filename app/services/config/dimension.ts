import { get, post, put, del } from '../../utils/http';
import type { 
  ConfigQuery, 
  DimensionConfigResponse, 
  DimensionConfigParams,
  RollbackParams
} from './types';
import type { DimensionConfig } from '../../types/api';

/**
 * 维度配置服务
 */
export const DimensionConfigService = {
  /**
   * 获取维度配置列表
   * @param query 查询参数
   */
  getList(query: ConfigQuery): Promise<DimensionConfigResponse> {
    return get<DimensionConfigResponse>('/config/dimensions', query);
  },

  /**
   * 获取维度配置详情
   * @param id 配置ID
   */
  getDetail(id: number): Promise<DimensionConfig> {
    return get<DimensionConfig>(`/config/dimensions/${id}`);
  },

  /**
   * 创建维度配置
   * @param data 配置信息
   */
  create(data: DimensionConfigParams): Promise<DimensionConfig> {
    return post<DimensionConfig>('/config/dimensions', data);
  },

  /**
   * 更新维度配置
   * @param id 配置ID
   * @param data 配置信息
   */
  update(id: number, data: Partial<DimensionConfigParams>): Promise<DimensionConfig> {
    return put<DimensionConfig>(`/config/dimensions/${id}`, data);
  },

  /**
   * 删除维度配置
   * @param id 配置ID
   */
  delete(id: number): Promise<void> {
    return del<void>(`/config/dimensions/${id}`);
  },

  /**
   * 获取维度配置版本历史
   * @param id 配置ID
   */
  getVersions(id: number): Promise<DimensionConfig[]> {
    return get<DimensionConfig[]>(`/config/dimensions/${id}/versions`);
  },

  /**
   * 回滚维度配置到指定版本
   * @param params 回滚参数
   */
  rollback(params: RollbackParams): Promise<void> {
    const { configId, version } = params;
    return post<void>(`/config/dimensions/${configId}/rollback`, { version });
  }
};
