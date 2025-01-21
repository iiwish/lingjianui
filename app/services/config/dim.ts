import { get, put, post, del } from '~/utils/http';
import { DimensionConfig, DimensionConfigRequest } from '~/types/config/dim';
import { ApiResponse, IDResponse } from '~/types/common';

const baseUrl = '/config/dimensions';

export const createDimensionConfig = async (config: DimensionConfigRequest): Promise<IDResponse> => {
  return post(baseUrl, config);
};

// 获取维度配置
export const getDimensionConfig = async (dimId: string): Promise<ApiResponse<DimensionConfig>> => {
  return get(`${baseUrl}/${dimId}`);
};

// 更新维度配置
export const updateDimensionConfig = async (dimId: string, config: Omit<DimensionConfigRequest, 'parent_id'>): Promise<ApiResponse<null>> => {
  return put(`${baseUrl}/${dimId}`, config);
};

// 删除维度配置
export const deleteDimensionConfig = async (dimId: string): Promise<ApiResponse<null>> => {
  return del(`${baseUrl}/${dimId}`);
};