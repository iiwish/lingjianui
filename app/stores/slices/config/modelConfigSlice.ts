// 从 @reduxjs/toolkit 导入 createSlice 和 PayloadAction
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// 导入 ModelConfigItem 类型
import type { ModelConfigItem } from '~/types/config/model';
// 导入 CustomColumn 类型
import { CustomColumn } from '~/types/config/dim';

// 定义 DimensionFields 接口，表示维度字段的映射关系
interface DimensionFields {
  [dimId: number]: CustomColumn[];
}

// 定义 ModelConfigState 接口，表示模型配置的状态
interface ModelConfigState {
  parentId: string | null; // 父级ID，可以为空
  config: ModelConfigItem | null; // 模型配置项，可以为空
  dimensionFields: DimensionFields; // 维度字段
}

// 定义初始状态
const initialState: ModelConfigState = {
  parentId: null,
  config: null,
  dimensionFields: {}
};

// 创建 modelConfigSlice
const modelConfigSlice = createSlice({
  name: 'modelConfig', // 切片的名称
  initialState, // 初始状态
  reducers: {
    // 设置父级ID的 reducer
    setParentId: (state, action: PayloadAction<string>) => {
      state.parentId = action.payload;
    },
    // 设置模型配置的 reducer
    setConfig: (state, action: PayloadAction<ModelConfigItem>) => {
      state.config = action.payload;
    },
    // 设置维度字段的 reducer
    setDimensionFields: (state, action: PayloadAction<{dimId: number; fields: CustomColumn[]}>) => {
      state.dimensionFields[action.payload.dimId] = action.payload.fields;
    },
    // 重置状态的 reducer
    resetState: (state) => {
      state.parentId = null;
      state.config = null;
      state.dimensionFields = {};
    }
  }
});

// 导出 actions 和 reducer
export const { setParentId, setConfig, setDimensionFields, resetState } = modelConfigSlice.actions;
export default modelConfigSlice.reducer;
