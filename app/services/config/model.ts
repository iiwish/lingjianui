import { get, post, put, del } from '../../utils/http';
import type { 
  ConfigQuery, 
  ModelConfigResponse, 
  ModelConfigParams,
  RollbackParams
} from './types';
import type { DataModelConfig } from '../../types/api';

/**
 * 数据模型配置服务
 */
export const ModelConfigService = {
  /**
   * 获取数据模型配置列表
   * @param query 查询参数
   */
  getList(query: ConfigQuery): Promise<ModelConfigResponse> {
    return get<ModelConfigResponse>('/config/models', query);
  },

  /**
   * 获取数据模型配置详情
   * @param id 配置ID
   */
  getDetail(id: number): Promise<DataModelConfig> {
    return get<DataModelConfig>(`/config/models/${id}`);
  },

  /**
   * 创建数据模型配置
   * @param data 配置信息
   */
  create(data: ModelConfigParams): Promise<DataModelConfig> {
    return post<DataModelConfig>('/config/models', data);
  },

  /**
   * 更新数据模型配置
   * @param id 配置ID
   * @param data 配置信息
   */
  update(id: number, data: Partial<ModelConfigParams>): Promise<DataModelConfig> {
    return put<DataModelConfig>(`/config/models/${id}`, data);
  },

  /**
   * 删除数据模型配置
   * @param id 配置ID
   */
  delete(id: number): Promise<void> {
    return del<void>(`/config/models/${id}`);
  },

  /**
   * 获取数据模型配置版本历史
   * @param id 配置ID
   */
  getVersions(id: number): Promise<DataModelConfig[]> {
    return get<DataModelConfig[]>(`/config/models/${id}/versions`);
  },

  /**
   * 回滚数据模型配置到指定版本
   * @param params 回滚参数
   */
  rollback(params: RollbackParams): Promise<void> {
    const { configId, version } = params;
    return post<void>(`/config/models/${configId}/rollback`, { version });
  }
};
