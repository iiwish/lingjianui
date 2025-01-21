import { get, put, post, del } from '~/utils/http';
import { DimensionItem } from '~/types/element/dim';
import { ApiResponse, IDResponse } from '~/types/common';

const baseURL = '/dimension';

// 获取维度树
export const getDimensionTree = async (dimId: string, params?: {
  id?: number;
  type?: 'children' | 'descendants' | 'leaves';
  level?: 0 | 1 | 2 | 3;
}): Promise<ApiResponse<DimensionItem[]>> => {
  return get(`${baseURL}/${dimId}`, { params });
};

// 更新维度节点
export const updateDimensionSort = async (dimId: string, id: string, params: {
  parent?: number;
  sort?: number;
}): Promise<ApiResponse<null>> => {
  return put(`${baseURL}/${dimId}/${id}/sort`, null, { params });
};

// 更新维度节点信息
export const updateDimensionItem = async (dimId: string, id: string, item: Partial<DimensionItem>): Promise<ApiResponse<DimensionItem>> => {
  return put(`${baseURL}/${dimId}/${id}`, item);
};

// 创建维度节点
export const createDimensionItem = async (dimId: string, item: Partial<DimensionItem>): Promise<IDResponse> => {
  return post(`${baseURL}/${dimId}`, item);
};

// 批量删除维度节点
export const deleteDimensionItems = async (dimId: string, ids: number[]): Promise<ApiResponse<null>> => {
  return del(`${baseURL}/${dimId}`, ids);
};
