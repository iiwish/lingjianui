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
        console.log('Adding new tab:', action.payload);
        state.tabs.push(action.payload);
      }
      // 只有当activeKey不同时才更新
      if (state.activeKey !== action.payload.key) {
        console.log('Setting activeKey in addTab:', action.payload.key);
        state.activeKey = action.payload.key;
      }
    },
    removeTab: (state, action: PayloadAction<string>) => {
      const targetKey = action.payload;
      console.log('Removing tab:', targetKey);
      console.log('Current tabs:', JSON.stringify(state.tabs));
      console.log('Current activeKey:', state.activeKey);

      const targetIndex = state.tabs.findIndex(tab => tab.key === targetKey);
      if (targetIndex === -1) {
        console.log('Tab not found:', targetKey);
        return;
      }

      // 如果关闭的是当前激活的tab，需要先设置新的activeKey
      if (targetKey === state.activeKey) {
        // 如果还有其他tab
        if (state.tabs.length > 1) {
          // 优先选择前一个tab
          if (targetIndex > 0) {
            state.activeKey = state.tabs[targetIndex - 1].key;
          } else {
            // 如果关闭的是第一个tab，选择下一个tab
            state.activeKey = state.tabs[1].key;
          }
          console.log('New activeKey:', state.activeKey);
        } else {
          // 如果没有其他tab了，设置为空或默认值
          state.activeKey = '/dashboard';
          console.log('No tabs left, setting activeKey to /dashboard');
        }
      }

      // 移除tab
      state.tabs.splice(targetIndex, 1);
      console.log('Tabs after removal:', JSON.stringify(state.tabs));
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      // 只有当activeKey不同时才更新
      if (state.activeKey !== action.payload) {
        console.log('Setting activeKey:', action.payload);
        state.activeKey = action.payload;
      }
    },
    resetTabs: (state) => {
      console.log('Resetting tabs');
      state.tabs = [];
      state.activeKey = '';
    }
  }
});

export const { addTab, removeTab, setActiveTab, resetTabs } = tabSlice.actions;
export default tabSlice.reducer;
