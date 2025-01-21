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

// 数据表配置信息
export interface TableConfig {
    table_name: string;
    display_name: string;
    description: string;
    func?: string;
    fields: FieldConfig[];
    indexes: IndexConfig[];
}

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

export interface Props {
    elementId: string;
    appCode: string;
}

export interface TableTabComponentProps extends Props {
    config: TableConfig;
    onReload: () => void;
}
