import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ModelConfigItem } from '~/types/element_model';

interface ModelConfigState {
  parentId: string | null;
  config: ModelConfigItem | null;
}

const initialState: ModelConfigState = {
  parentId: null,
  config: null
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
    resetState: (state) => {
      state.parentId = null;
      state.config = null;
    }
  }
});

export const { setParentId, setConfig, resetState } = modelConfigSlice.actions;
export default modelConfigSlice.reducer;
