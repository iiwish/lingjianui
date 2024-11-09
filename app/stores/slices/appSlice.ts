import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AppInfo, AppTemplate } from '../../types/api';
import { AppService } from '../../services';

interface AppState {
  currentApp: AppInfo | null;
  appList: AppInfo[];
  templates: AppTemplate[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: AppState = {
  currentApp: null,
  appList: [],
  templates: [],
  loading: false,
  error: null,
  total: 0,
};

// 获取应用列表
export const fetchAppList = createAsyncThunk(
  'app/fetchList',
  async (userId: number) => {
    const response = await AppService.getUserApps(userId);
    return response;
  }
);

// 获取应用模板列表
export const fetchTemplates = createAsyncThunk(
  'app/fetchTemplates',
  async () => {
    const response = await AppService.getTemplates();
    return response;
  }
);

// 创建新应用
export const createApp = createAsyncThunk(
  'app/create',
  async (data: { name: string; code: string; description?: string }) => {
    const response = await AppService.createApp(data);
    return response;
  }
);

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentApp: (state, action) => {
      state.currentApp = action.payload;
    },
    clearCurrentApp: (state) => {
      state.currentApp = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取应用列表
      .addCase(fetchAppList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppList.fulfilled, (state, action) => {
        state.loading = false;
        state.appList = action.payload;
      })
      .addCase(fetchAppList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取应用列表失败';
      })
      // 获取模板列表
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取模板列表失败';
      })
      // 创建应用
      .addCase(createApp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createApp.fulfilled, (state, action) => {
        state.loading = false;
        state.appList = [...state.appList, action.payload];
        state.total += 1;
      })
      .addCase(createApp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '创建应用失败';
      });
  },
});

export const { setCurrentApp, clearCurrentApp, clearError } = appSlice.actions;
export default appSlice.reducer;
