import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DimensionConfig } from '~/types/config/dim';

interface DimensionConfigState {
  config: DimensionConfig | null;
  isModified: boolean;
  modifiedConfig: Partial<DimensionConfig> | null;
  parentId: string | null;
}

const initialState: DimensionConfigState = {
  config: null,
  isModified: false,
  modifiedConfig: null,
  parentId: null
};

const dimensionConfigSlice = createSlice({
  name: 'dimensionConfig',
  initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<DimensionConfig>) => {
      state.config = action.payload;
      state.isModified = false;
      state.modifiedConfig = null;
    },
    updateConfig: (state, action: PayloadAction<Partial<DimensionConfig>>) => {
      state.modifiedConfig = {
        ...state.modifiedConfig,
        ...action.payload
      };
      state.isModified = true;
    },
    resetModifiedState: (state) => {
      state.isModified = false;
      state.modifiedConfig = null;
    },
    setParentId: (state, action: PayloadAction<string>) => {
      state.parentId = action.payload;
    }
  }
});

export const {
  setConfig,
  updateConfig,
  resetModifiedState,
  setParentId
} = dimensionConfigSlice.actions;

export default dimensionConfigSlice.reducer;
