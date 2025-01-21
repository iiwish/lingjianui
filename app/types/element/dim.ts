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