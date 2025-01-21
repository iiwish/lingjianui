import { get, put, post, del } from '~/utils/http';
import { TableData, QueryCondition, CreateTableItemsRequest,UpdateTableItemsRequest } from '~/types/element/table';
import { ApiResponse, IDResponse } from '~/types/common';

const baseURL = '/table';
// 获取表格数据
export const getTableData = async (
    tableId: string,
    page: number,
    page_size: number,
    queryCondition?: QueryCondition
): Promise<ApiResponse<TableData>> => {
    return post(`${baseURL}/${tableId}/query`, {
        page,
        page_size,
        query: queryCondition
    });
};

// 创建数据表记录
export const createTableItems = async (tableId: string, request: CreateTableItemsRequest): Promise<ApiResponse<null>> => {
    return post(`${baseURL}/${tableId}`, request);
};

// 更新数据表记录
export const updateTableItems = async (tableId: string, request: UpdateTableItemsRequest): Promise<ApiResponse<null>> => {
    return put(`${baseURL}/${tableId}`, request);
};

// 批量删除数据表记录
export const deleteTableItems = async (tableId: string, request: CreateTableItemsRequest): Promise<ApiResponse<null>> => {
    return del(`${baseURL}/${tableId}`, request);
};