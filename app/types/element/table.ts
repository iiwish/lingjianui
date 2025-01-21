// 数据表数据
export interface TableData {
    items: Array<{ [key: string]: any }>;
    page: number;
    pageSize: number;
    total: number;
}

// 查询条件
export interface QueryCondition {
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

// 创建数据表记录请求参数
export type CreateTableItemsRequest = Array<Record<string, any>>;

// 更新数据表记录请求参数
export interface UpdateTableItemsRequest {
    primary_key_columns: string[]; // 主键列名列表
    items: Array<Record<string, any>>; // 要更新的数据表记录
}