// 模型配置项关联字段
export interface ModelConfigItemRelField {
  fromField: string; // 来源字段
  toField: string;   // 目标字段
}

// 模型配置项关联关系
export interface ModelConfigItemRel {
  type: '1:1' | '1:n';  // 关联类型
  fields: ModelConfigItemRelField[]; // 关联字段
}

// 模型配置项维度
export interface ModelConfigItemDim {
  dim_id: number;      // 维度ID
  item_id: number;     // 维度项ID
  dim_field: string;   // 维度字段
  table_field: string; // 表格字段
  type: 'children' | 'descendants' | 'leaves'; // 维度类型
}

// 模型配置项
export interface ModelConfigItem {
  table_id: number;                    // 菜单来源ID (source_id)
  name?: string;                       // 节点显示名称
  relationships?: ModelConfigItemRel;  // 关联关系
  dimensions?: ModelConfigItemDim[];   // 维度配置
  childrens?: ModelConfigItem[];      // 子配置项
}

// 模型响应
export interface ModelResponse {
  id: number;
  model_name: string;      // 模型名称
  display_name: string;    // 显示名称
  description: string;     // 描述
  status: number;         // 状态
  configuration: ModelConfigItem; // 配置信息
}

// 创建模型请求
export interface CreateModelRequest {
  model_name: string;
  display_name: string;
  description: string;
  status: number;
  parent_id: number;
  configuration: ModelConfigItem;
}

// 更新模型请求
export interface UpdateModelRequest {
  id: number;
  model_name: string;
  display_name: string;
  description: string;
  status: number;
  configuration: ModelConfigItem;
}
