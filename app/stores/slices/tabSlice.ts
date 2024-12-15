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
      state.activeKey = action.payload.key;
    },
    removeTab: (state, action: PayloadAction<string>) => {
      const index = state.tabs.findIndex(tab => tab.key === action.payload);
      if (index > -1) {
        state.tabs.splice(index, 1);
        // 如果关闭的是当前激活的tab,切换到前一个tab
        if (action.payload === state.activeKey) {
          if (state.tabs.length > 0) {
            const newIndex = index === 0 ? 0 : index - 1;
            state.activeKey = state.tabs[newIndex].key;
          } else {
            state.activeKey = '';
          }
        }
      }
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeKey = action.payload;
    },
    resetTabs: (state) => {
      state.tabs = [];
      state.activeKey = '';
    }
  }
});

export const { addTab, removeTab, setActiveTab, resetTabs } = tabSlice.actions;
export default tabSlice.reducer;
