import { get, post, put, del } from '~/utils/http';
import type { ApiResponse } from '~/types/common';
import type { CreateModelRequest, UpdateModelRequest, ModelResponse } from '~/components/config/model/modelConfigTypes';

const baseUrl = '/config/models';

// 获取模型详情
export const getModel = async (id: string): Promise<ApiResponse<ModelResponse>> => {
  return get(`${baseUrl}/${id}`);
};

// 创建模型
export const createModel = async (data: CreateModelRequest): Promise<ApiResponse<any>> => {
  return post(baseUrl, data);
};

// 更新模型
export const updateModel = async (id: string, data: UpdateModelRequest): Promise<ApiResponse<any>> => {
  return put(`${baseUrl}/${id}`, data);
};

// 删除模型
export const deleteModel = async (id: string): Promise<ApiResponse<any>> => {
  return del(`${baseUrl}/${id}`);
};
