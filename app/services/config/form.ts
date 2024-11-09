import { get, post, put, del } from '../../utils/http';
import type { 
  ConfigQuery, 
  FormConfigResponse, 
  FormConfigParams,
  RollbackParams
} from './types';
import type { FormConfig } from '../../types/api';

/**
 * 表单配置服务
 */
export const FormConfigService = {
  /**
   * 获取表单配置列表
   * @param query 查询参数
   */
  getList(query: ConfigQuery): Promise<FormConfigResponse> {
    return get<FormConfigResponse>('/config/forms', query);
  },

  /**
   * 获取表单配置详情
   * @param id 配置ID
   */
  getDetail(id: number): Promise<FormConfig> {
    return get<FormConfig>(`/config/forms/${id}`);
  },

  /**
   * 创建表单配置
   * @param data 配置信息
   */
  create(data: FormConfigParams): Promise<FormConfig> {
    return post<FormConfig>('/config/forms', data);
  },

  /**
   * 更新表单配置
   * @param id 配置ID
   * @param data 配置信息
   */
  update(id: number, data: Partial<FormConfigParams>): Promise<FormConfig> {
    return put<FormConfig>(`/config/forms/${id}`, data);
  },

  /**
   * 删除表单配置
   * @param id 配置ID
   */
  delete(id: number): Promise<void> {
    return del<void>(`/config/forms/${id}`);
  },

  /**
   * 获取表单配置版本历史
   * @param id 配置ID
   */
  getVersions(id: number): Promise<FormConfig[]> {
    return get<FormConfig[]>(`/config/forms/${id}/versions`);
  },

  /**
   * 回滚表单配置到指定版本
   * @param params 回滚参数
   */
  rollback(params: RollbackParams): Promise<void> {
    const { configId, version } = params;
    return post<void>(`/config/forms/${configId}/rollback`, { version });
  }
};
