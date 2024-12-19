import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Tab, TabState } from '~/types/tab';

const initialState: TabState = {
  tabs: [],
  activeKey: ''
};

const tabSlice = createSlice({
  name: 'tab',
  initialState,
  reducers: {
    addTab: (state, action: PayloadAction<Tab>) => {
      // 如果tab不存在才添加
      const exists = state.tabs.find(tab => tab.key === action.payload.key);
      if (!exists) {
        state.tabs.push(action.payload);
      }
      // 只有当activeKey不同时才更新
      if (state.activeKey !== action.payload.key) {
        state.activeKey = action.payload.key;
      }
    },
    removeTab: (state, action: PayloadAction<string>) => {
      const targetKey = action.payload;

      const targetIndex = state.tabs.findIndex(tab => tab.key === targetKey);
      if (targetIndex === -1) {
        return;
      }

      // 移除tab
      state.tabs.splice(targetIndex, 1);
      // console.log('Tabs after removal:', JSON.stringify(state.tabs));
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      // 只有当activeKey不同时才更新
      if (state.activeKey !== action.payload) {
        state.activeKey = action.payload;
      }
    }
  }
});

export const { addTab, removeTab, setActiveTab } = tabSlice.actions;
export default tabSlice.reducer;
