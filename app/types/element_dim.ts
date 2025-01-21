
export interface CustomColumn {
    name: string;
    length: number;
    comment: string;
}

export interface DimensionConfig {
    id: number;
    display_name: string;
    description: string;
    table_name: string;
    app_id: number;
    status: number;
    dimension_type: string;
    created_at: string;
    updated_at: string;
    creator_id: number;
    updater_id: number;
    custom_columns?: CustomColumn[];
}

export interface DimensionConfigRequest {
    display_name: string;
    description: string;
    table_name: string;
    parent_id: number;
    dimension_type?: string;
    custom_columns?: CustomColumn[];
}

export interface DimensionItem {
    id: number;
    name: string;
    code: string;
    parent_id: number;
    level: number;
    node_id: string;
    status: number;
    sort: number;
    custom_data?: Record<string, string>;
    children?: DimensionItem[];
}