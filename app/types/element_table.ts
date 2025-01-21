
// 数据表配置信息
export interface TableConfig {
    table_name: string;
    display_name: string;
    description: string;
    func?: string;
    fields: FieldConfig[];
    indexes: IndexConfig[];
}

export interface FieldConfig {
    name: string;
    comment: string;
    column_type: string;
    sort: number;
    primary_key?: boolean;
    auto_increment?: boolean;
    not_null?: boolean;
    default?: string;
}

export interface IndexConfig {
    name: string;
    type: string;
    fields: string[];
}

// 数据表数据
export interface TableData {
    items: Array<{ [key: string]: any }>;
    page: number;
    pageSize: number;
    total: number;
}