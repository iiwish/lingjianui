import { get, put, post, del } from '~/utils/http';
import { TableUpdateRequest, TableConfig } from '~/types/config/table';
import { ApiResponse, IDResponse } from '~/types/common';

const baseURL = '/config/tables';
// 获取表格配置
export const getTableConfig = async (tableId: string): Promise<ApiResponse<TableConfig>> => {
    return get(`${baseURL}/${tableId}`);
};

// 创建表格
export const createTableConfig = async (config: TableConfig): Promise<IDResponse> => {
    return post(baseURL, config);
};

// 统一更新表格配置
export const updateTableConfig = async (tableId: string, config: TableUpdateRequest): Promise<ApiResponse<null>> => {
    return put(`${baseURL}/${tableId}`, config);
};