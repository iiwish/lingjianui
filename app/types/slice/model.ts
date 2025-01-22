import { ModelConfigItemRel } from '~/types/config/model';

// 模型配置项维度
export interface ModelItemDim {
    dim_id: number;      // 维度ID
    item_id: number;     // 维度项ID
    dim_field: string;   // 维度字段
    table_field: string; // 表格字段
    type: 'children' | 'descendants' | 'leaves'; // 维度类型

    dim_custom_field?:string[] // 自定义字段
}

// 模型配置项
export interface ModelItem {
    source_id: number;                    // 菜单来源ID (source_id)
    name?: string;                       // 节点显示名称
    relationships?: ModelConfigItemRel;  // 关联关系
    dimensions?: ModelItemDim[];   // 维度配置
    childrens?: ModelItem[];      // 子配置项
    
    table_field?: string; // 表格字段
}

// 创建模型请求
export interface ModelData {
    id: number;
    model_code: string;
    display_name: string;
    description: string;
    status: number;
    parent_id: number;
    configuration: ModelItem;
}