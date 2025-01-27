// 导入类型定义
import type { Menu as AppMenu } from '~/types/element/menu';

// 基础类型定义
namespace Base {
  // 配置项关系字段接口
  export interface ConfigItemRelField {
    fromField: string; // 来源字段
    toField: string; // 目标字段
  }

  // 配置项关系接口
  export interface ConfigItemRel {
    type: '1:1' | '1:n'; // 关系类型：一对一或一对多
    fields: ConfigItemRelField[]; // 关系字段数组
  }

  // 配置项维度接口
  export interface ConfigItemDim {
    dim_id: number; // 维度ID
    item_id: number; // 项目ID
    dim_field: string; // 维度字段
    table_field: string; // 表字段
    type: 'children' | 'descendants' | 'leaves'; // 维度类型
  }

  // 配置项接口
  export interface ConfigItem {
    source_id: number; // 来源ID
    name?: string; // 名称（可选）
    relationships?: ConfigItemRel; // 关系（可选）
    dimensions?: ConfigItemDim[]; // 维度数组（可选）
    childrens?: ConfigItem[]; // 子项数组（可选）
  }
}

// API相关类型
namespace API {
  // 模型响应接口
  export interface ModelResponse {
    id: number; // 模型ID
    model_code: string; // 模型代码
    display_name: string; // 显示名称
    description: string; // 描述
    status: number; // 状态
    configuration: Base.ConfigItem; // 配置项
  }

  // 创建请求接口，继承自ModelResponse，但不包括id
  export interface CreateRequest extends Omit<ModelResponse, 'id'> {
    parent_id: number; // 父ID
  }

  // 更新请求接口，继承自ModelResponse
  export interface UpdateRequest extends ModelResponse {}
}

// UI相关类型
namespace UI {
  // 模型维度接口，继承自Base.ConfigItemDim
  export interface ModelDim extends Base.ConfigItemDim {
    dim_custom_field?: string[]; // 自定义字段数组（可选）
  }

  // 模型项接口，继承自Base.ConfigItem
  export interface ModelItem extends Base.ConfigItem {
    table_field?: string; // 表字段（可选）
    dimensions?: ModelDim[]; // 维度数组（可选）
    childrens?: ModelItem[]; // 子项数组（可选）
  }

  // 菜单树节点接口
  export interface MenuTreeNode {
    key: string; // 键
    value: string; // 值
    title: string; // 标题
    children?: MenuTreeNode[]; // 子节点数组（可选）
    selectable?: boolean; // 是否可选择（可选）
    disabled?: boolean; // 是否禁用（可选）
    data?: AppMenu; // 菜单数据（可选）
  }

  // 模型树属性接口
  export interface ModelTreeProps {
    loading: boolean; // 是否加载中
    modelData: ModelItem | null; // 模型数据
    selectedNode: { path: string[]; node: ModelItem } | null; // 选中的节点
    tables: MenuTreeNode[]; // 表数组
    onAddRootNode: () => void; // 添加根节点的回调函数
    onAddChildNode: () => void; // 添加子节点的回调函数
    onDeleteNode: () => void; // 删除节点的回调函数
    onNodeSelect: (node: ModelItem, path: string[]) => void; // 节点选择的回调函数
  }
}

// 导出类型别名
export type ModelConfigItemRelField = Base.ConfigItemRelField;
export type ModelConfigItemRel = Base.ConfigItemRel;
export type ModelConfigItemDim = Base.ConfigItemDim;
export type ModelConfigItem = Base.ConfigItem;

export type ModelResponse = API.ModelResponse;
export type CreateModelRequest = API.CreateRequest;
export type UpdateModelRequest = API.UpdateRequest;

export type ModelItem = UI.ModelItem;
export type ModelItemDim = UI.ModelDim;
export type MenuTreeNode = UI.MenuTreeNode;
export type ModelTreeProps = UI.ModelTreeProps;

// 保持与原有ModelData接口兼容
export interface ModelData extends API.ModelResponse {
  parent_id: number; // 父ID
  configuration: UI.ModelItem; // 配置项
}