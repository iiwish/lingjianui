import { get, put, post, del } from '~/utils/http';
import { FieldConfig, IndexConfig, TableConfig, TableData } from '~/types/element_table';

interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

// 创建数据表记录请求参数
type CreateTableItemsRequest = Array<Record<string, any>>;

interface UpdateTableItemsRequest {
    primary_key_columns: string[]; // 主键列名列表
    items: Array<Record<string, any>>; // 要更新的数据表记录
}


// 获取表格配置
export const getTableConfig = async (tableId: string): Promise<ApiResponse<TableConfig>> => {
    return get(`/config/tables/${tableId}`);
};

// 创建表格响应
interface OneID {
    id: string; // 表格ID
}

interface QueryCondition {
    root: {
        logic: 'AND' | 'OR';
        conditions: Array<{
            field: string;
            operator: string;
            value: any;
        } | QueryCondition>;
    };
    order_by?: Array<{
        field: string;
        desc: boolean;
    }>;
    group_by?: string[];
}

// 创建表格
export const createTableConfig = async (config: TableConfig): Promise<ApiResponse<OneID>> => {
    return post('/config/tables', config);
};

// 统一更新表格配置
export interface TableUpdateRequest {
    table_name?: string;
    display_name?: string;
    description?: string;
    func?: string;
    fields?: Array<{
        field: FieldConfig;
        oldFieldName?: string;
        updateType: 'add' | 'drop' | 'modify';
    }>;
    indexes?: Array<{
        index: IndexConfig;
        oldIndexName?: string;
        updateType: 'add' | 'drop' | 'modify';
    }>;
}

export const updateTableConfig = async (tableId: string, config: TableUpdateRequest): Promise<ApiResponse<null>> => {
    return put(`/config/tables/${tableId}`, config);
};

// 获取表格数据
export const getTableData = async (
    tableId: string,
    page: number,
    page_size: number,
    queryCondition?: QueryCondition
): Promise<ApiResponse<TableData>> => {
    return post(`/table/${tableId}/query`, {
        page,
        page_size,
        query: queryCondition
    });
};

// 创建数据表记录
export const createTableItems = async (tableId: string, request: CreateTableItemsRequest): Promise<ApiResponse<null>> => {
    return post(`/table/${tableId}`, request);
};

// 更新数据表记录
export const updateTableItems = async (tableId: string, request: UpdateTableItemsRequest): Promise<ApiResponse<null>> => {
    return put(`/table/${tableId}`, request);
};

// 批量删除数据表记录
export const deleteTableItems = async (tableId: string, request: CreateTableItemsRequest): Promise<ApiResponse<null>> => {
    return del(`/table/${tableId}`, request);
};