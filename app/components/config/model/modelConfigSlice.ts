// 从 @reduxjs/toolkit 导入 createSlice 和 PayloadAction
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { s } from 'node_modules/vite/dist/node/types.d-aGj9QkWt';
// 导入 ModelConfigItem 类型
import type { ModelData, ModelItem, ModelConfigItem, MenuTreeNode } from '~/components/config/model/modelConfigTypes';
// 导入 CustomColumn 类型
import { CustomColumn } from '~/types/config/dim';
import { FieldConfig } from '~/types/config/table';

// 定义初始状态
const initialState: ModelData = {
  id: 0,
  parent_id: 0,
  model_code: '',
  display_name: '',
  description: '',
  status: 0,
  configuration: {
    source_id: 0,
    name: '',
    relationships: {
      type: '1:1',
      fields: []
    },
    dimensions: [],
    childrens: []
  },
  // active_id: 0,
  active_data: undefined,
  dimensions: undefined,
  table_menu_tree: undefined,
  dim_menu_tree: undefined
};

// 创建 modelConfigSlice
const modelConfigSlice = createSlice({
  name: 'modelConfig', // 切片的名称
  initialState, // 初始状态
  reducers: {
    setModelData: (state, action: PayloadAction<ModelData>) => {
      Object.assign(state, action.payload);
    },
    // 设置ID的 reducer
    setId: (state, action: PayloadAction<number>) => {
      state.id = action.payload;
    },
    // 设置父级ID的 reducer
    setParentId: (state, action: PayloadAction<string>) => {
      state.parent_id = Number(action.payload);
    },
    // 设置维度字段的 reducer
    setDimensionFields: (state, action: PayloadAction<{dimId: number; fields: CustomColumn[]}>) => {
      if (state.dimensions === undefined) {
        state.dimensions = {};
      }
      state.dimensions[action.payload.dimId] = action.payload.fields;
    },
    // 设置激活数据的 reducer
    setActiveData: (state, action: PayloadAction<{id: number, data?: ModelItem}>) => {
      const { id, data } = action.payload;
      // 直接查找并更新引用
      if (state.configuration.source_id === id) {
        state.active_data = state.configuration;
      } else if (state.configuration.childrens) {
        const findInChildren = (children: ModelItem[]): ModelItem | undefined => {
          for (const child of children) {
            if (child.source_id === id) {
              state.active_data = child;
              return child;
            }
            if (child.childrens) {
              const found = findInChildren(child.childrens);
              if (found) return found;
            }
          }
          return undefined;
        };
        findInChildren(state.configuration.childrens);
      }

      // 如果提供了新数据，直接更新
      if (data && state.active_data) {
        Object.assign(state.active_data, data);
      }
    },
    // 设置表菜单树的 reducer
    setTableMenuTree: (state, action: PayloadAction<MenuTreeNode[]>) => {
      state.table_menu_tree = action.payload;
    },
    // 设置维度菜单树的 reducer
    setDimMenuTree: (state, action: PayloadAction<MenuTreeNode[]>) => {
      state.dim_menu_tree = action.payload;
    },

    // 更新活跃数据的 reducer
    addChildNode: (state, action: PayloadAction<void>) => {
      if (state.active_data) {
        state.active_data.childrens = [...(state.active_data.childrens || []), {
          source_id: 0,
          relationships: {
            type: '1:1',
            fields: [],
          },
          dimensions: [],
          childrens: [],
        }];
      }
    },
    // 删除活跃数据的 reducer
    deleteActiveNode: (state, action: PayloadAction<void>) => {
      if (state.active_data) {
        state.active_data = undefined;
      }
    },
    // 更新数据源
    setSourceTable: (state, action: PayloadAction<{source_id:number,table_name: string, table_fields: FieldConfig[]}>) => {
      const { source_id, table_name, table_fields } = action.payload;
      if (state.active_data){
        state.active_data.source_id = source_id;
        state.active_data.name = table_name;
        state.active_data.table_fields = table_fields;
      }
    },
    // 更新关联数据表字段
    setRelType: (state, action: PayloadAction<'1:1' | '1:n'>) => {
      if (state.active_data) {
        if (state.active_data.relationships === undefined) {
          state.active_data.relationships = {
            type: '1:1',
            fields: []
          };
        }
        state.active_data.relationships.type = action.payload;
      }
    },
    setRelFromField: (state, action: PayloadAction<{index: number, field: string}>) => {
      if (state.active_data && state.active_data.relationships) {
        if (state.active_data.relationships.fields === undefined) {
          state.active_data.relationships.fields = [];
        }
        state.active_data.relationships.fields[action.payload.index].fromField = action.payload.field;
      }
    },
    setRelToField: (state, action: PayloadAction<{index: number, field: string}>) => {
      if (state.active_data && state.active_data.relationships) {
        if (state.active_data.relationships.fields === undefined) {
          state.active_data.relationships.fields = [];
        }
        state.active_data.relationships.fields[action.payload.index].toField = action.payload.field;
      }
    },

    // 更新维度数据
    setDimType: (state, action: PayloadAction<{index: number, type: 'children' | 'descendants' | 'leaves'}>) => {
      if (state.active_data) {
        if (state.active_data.dimensions === undefined) {
          state.active_data.dimensions = [];
        }
        state.active_data.dimensions[action.payload.index].type = action.payload.type;
      }
    },
    setDimId: (state, action: PayloadAction<{index: number, dim_id: number}>) => {
      if (state.active_data) {
        if (state.active_data.dimensions === undefined) {
          state.active_data.dimensions = [];
        }
        state.active_data.dimensions[action.payload.index].dim_id = action.payload.dim_id;
      }
    },
    setDimField: (state, action: PayloadAction<{index: number, field: string}>) => {
      if (state.active_data) {
        if (state.active_data.dimensions === undefined) {
          state.active_data.dimensions = [];
        }
        state.active_data.dimensions[action.payload.index].dim_field = action.payload.field;
      }
    },
    setDimTableField: (state, action: PayloadAction<{index: number, field: string}>) => {
      if (state.active_data) {
        if (state.active_data.dimensions === undefined) {
          state.active_data.dimensions = [];
        }
        state.active_data.dimensions[action.payload.index].table_field = action.payload.field;
      }
    },

    // 重置状态的 reducer
    resetState: (state) => {
      state.id = 0;
      state.parent_id = 0;
      state.model_code = '';
      state.display_name = '';
      state.description = '';
      state.status = 0;
      state.configuration = {
        source_id: 0,
        name: '',
        relationships: {
          type: '1:1',
          fields: []
        },
        dimensions: [],
        childrens: []
      };
      state.active_data = undefined;
      state.dimensions = undefined;
      state.table_menu_tree = undefined;
      state.dim_menu_tree = undefined;
    }
  }
});

// 导出 actions 和 reducer
export const { setModelData, setId, setParentId, setDimensionFields, setActiveData, setTableMenuTree, setDimMenuTree, addChildNode, deleteActiveNode, setSourceTable, setRelType, setRelFromField, setRelToField, setDimType, setDimId, setDimField, setDimTableField, resetState } = modelConfigSlice.actions;

export default modelConfigSlice.reducer;
