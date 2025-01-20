import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ModelConfigItem } from '~/types/element_model';
import type { CustomColumn } from '~/services/element';

interface DimensionFields {
  [dimId: number]: CustomColumn[];
}

interface ModelConfigState {
  parentId: string | null;
  config: ModelConfigItem | null;
  dimensionFields: DimensionFields;
}

const initialState: ModelConfigState = {
  parentId: null,
  config: null,
  dimensionFields: {}
};

const modelConfigSlice = createSlice({
  name: 'modelConfig',
  initialState,
  reducers: {
    setParentId: (state, action: PayloadAction<string>) => {
      state.parentId = action.payload;
    },
    setConfig: (state, action: PayloadAction<ModelConfigItem>) => {
      state.config = action.payload;
    },
    setDimensionFields: (state, action: PayloadAction<{dimId: number; fields: CustomColumn[]}>) => {
      state.dimensionFields[action.payload.dimId] = action.payload.fields;
    },
    resetState: (state) => {
      state.parentId = null;
      state.config = null;
      state.dimensionFields = {};
    }
  }
});

export const { setParentId, setConfig, setDimensionFields, resetState } = modelConfigSlice.actions;
export default modelConfigSlice.reducer;
