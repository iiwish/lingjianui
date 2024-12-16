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
      console.log('removeTab', index);
      if (index > -1) {
        console.log('removeTab', action.payload);
        // 检查tabs是否为null或undefined
        if (state.tabs) {
          // 打印tabs内容
          console.log('tabs before splice', JSON.stringify(state.tabs));
          state.tabs.splice(index, 1);
          console.log('tabs after splice', JSON.stringify(state.tabs));
          // 如果关闭的是当前激活的tab,切换到前一个tab
          if (action.payload === state.activeKey) {
            if (state.tabs.length > 0) {
              const newIndex = index === 0 ? 0 : index - 1;
              state.activeKey = state.tabs[newIndex].key;
              console.log('new activeKey', state.activeKey);
            } else {
              state.activeKey = '';
              console.log('no tabs left, activeKey set to empty');
            }
          }
        } else {
          console.log('state.tabs is null or undefined');
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
