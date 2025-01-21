import { get, put, post, del } from '~/utils/http';
import { DimensionConfig, DimensionConfigRequest, DimensionItem } from '~/types/element_dim';

interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

interface OneID {
    id: string; // 表格ID
}


export const createDimensionConfig = async (config: DimensionConfigRequest): Promise<ApiResponse<OneID>> => {
  return post('/config/dimensions', config);
};

// 获取维度配置
export const getDimensionConfig = async (dimId: string): Promise<ApiResponse<DimensionConfig>> => {
  return get(`/config/dimensions/${dimId}`);
};

// 更新维度配置
export const updateDimensionConfig = async (dimId: string, config: Omit<DimensionConfigRequest, 'parent_id'>): Promise<ApiResponse<null>> => {
  return put(`/config/dimensions/${dimId}`, config);
};

// 删除维度配置
export const deleteDimensionConfig = async (dimId: string): Promise<ApiResponse<null>> => {
  return del(`/config/dimensions/${dimId}`);
};

// 获取维度树
export const getDimensionTree = async (dimId: string, params?: {
  id?: number;
  type?: 'children' | 'descendants' | 'leaves';
  level?: 0 | 1 | 2 | 3;
}): Promise<ApiResponse<DimensionItem[]>> => {
  return get(`/dimension/${dimId}`, { params });
};

// 更新维度节点
export const updateDimensionSort = async (dimId: string, id: string, params: {
  parent?: number;
  sort?: number;
}): Promise<ApiResponse<null>> => {
  return put(`/dimension/${dimId}/${id}/sort`, null, { params });
};

// 更新维度节点信息
export const updateDimensionItem = async (dimId: string, id: string, item: Partial<DimensionItem>): Promise<ApiResponse<DimensionItem>> => {
  return put(`/dimension/${dimId}/${id}`, item);
};

interface IDList {
  ids: number[];
}

// 创建维度节点
export const createDimensionItem = async (dimId: string, item: Partial<DimensionItem>): Promise<ApiResponse<OneID>> => {
  return post(`/dimension/${dimId}`, item);
};

// 批量删除维度节点
export const deleteDimensionItems = async (dimId: string, ids: number[]): Promise<ApiResponse<null>> => {
  return del(`/dimension/${dimId}`, ids);
};
