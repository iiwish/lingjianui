import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TableConfig } from '~/types/config/table';

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
  parentId: string | null;
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
  modifiedFunc: '',
  parentId: null
};

const tableConfigSlice = createSlice({
  name: 'tableConfig',
  initialState,
  reducers: {
    setParentId: (state, action: PayloadAction<string | null>) => {
      state.parentId = action.payload;
    },
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
      state.parentId = null;
    }
  }
});

export const {
  setConfig,
  setBasicInfoModified,
  setFieldsModified,
  setIndexesModified,
  setFuncModified,
  resetModifiedState,
  setParentId
} = tableConfigSlice.actions;

export default tableConfigSlice.reducer;
