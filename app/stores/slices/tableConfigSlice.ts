import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TableConfig } from '~/services/element';

interface TableConfigState {
  config: TableConfig | null;
  isBasicInfoModified: boolean;
  isFieldsModified: boolean; 
  isIndexesModified: boolean;
  isFuncModified: boolean;
  modifiedBasicInfo: any;
  modifiedFields: any[];
  modifiedIndexes: any[];
  modifiedFunc: string;
}

const initialState: TableConfigState = {
  config: null,
  isBasicInfoModified: false,
  isFieldsModified: false,
  isIndexesModified: false,
  isFuncModified: false,
  modifiedBasicInfo: null,
  modifiedFields: [],
  modifiedIndexes: [],
  modifiedFunc: ''
};

const tableConfigSlice = createSlice({
  name: 'tableConfig',
  initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<TableConfig | null>) => {
      state.config = action.payload;
    },
    setBasicInfoModified: (state, action: PayloadAction<{isModified: boolean; data?: any}>) => {
      state.isBasicInfoModified = action.payload.isModified;
      if (action.payload.data) {
        state.modifiedBasicInfo = action.payload.data;
      }
    },
    setFieldsModified: (state, action: PayloadAction<{isModified: boolean; data?: any[]}>) => {
      state.isFieldsModified = action.payload.isModified;
      if (action.payload.data) {
        state.modifiedFields = action.payload.data;
      }
    },
    setIndexesModified: (state, action: PayloadAction<{isModified: boolean; data?: any[]}>) => {
      state.isIndexesModified = action.payload.isModified;
      if (action.payload.data) {
        state.modifiedIndexes = action.payload.data;
      }
    },
    setFuncModified: (state, action: PayloadAction<{isModified: boolean; data?: string}>) => {
      state.isFuncModified = action.payload.isModified;
      if (action.payload.data) {
        state.modifiedFunc = action.payload.data;
      }
    },
    resetModifiedState: (state) => {
      state.isBasicInfoModified = false;
      state.isFieldsModified = false;
      state.isIndexesModified = false;
      state.isFuncModified = false;
      state.modifiedBasicInfo = null;
      state.modifiedFields = [];
      state.modifiedIndexes = [];
      state.modifiedFunc = '';
    }
  }
});

export const {
  setConfig,
  setBasicInfoModified,
  setFieldsModified,
  setIndexesModified,
  setFuncModified,
  resetModifiedState
} = tableConfigSlice.actions;

export default tableConfigSlice.reducer;
