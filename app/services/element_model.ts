import type { CreateModelRequest, UpdateModelRequest, ModelResponse } from '~/types/element_model';
import { get, post, put, del } from '~/utils/http';
import type { ApiResponse } from '~/services/element';

// 获取模型详情
export const getModel = async (id: string): Promise<ApiResponse<ModelResponse>> => {
  return get(`/config/models/${id}`);
};

// 创建模型
export const createModel = async (data: CreateModelRequest): Promise<ApiResponse<any>> => {
  return post('/config/models', data);
};

// 更新模型
export const updateModel = async (id: string, data: UpdateModelRequest): Promise<ApiResponse<any>> => {
  return put(`/config/models/${id}`, data);
};

// 删除模型
export const deleteModel = async (id: string): Promise<ApiResponse<any>> => {
  return del(`/config/models/${id}`);
};
