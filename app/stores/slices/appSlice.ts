import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AppInfo, AppTemplate, PaginatedData } from '../../types/api';

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
export const fetchAppList = createAsyncThunk<PaginatedData<AppInfo>>(
  'app/fetchList',
  async () => {
    // TODO: 实现获取应用列表API调用
    const mockResponse: PaginatedData<AppInfo> = {
      list: [
        {
          id: 1,
          code: 'app1',
          name: '示例应用1',
          description: '这是一个示例应用',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    };
    return mockResponse;
  }
);

// 获取应用模板列表
export const fetchTemplates = createAsyncThunk<AppTemplate[]>(
  'app/fetchTemplates',
  async () => {
    // TODO: 实现获取应用模板列表API调用
    const mockResponse: AppTemplate[] = [
      {
        id: 1,
        name: '空白模板',
        description: '从零开始创建应用',
        configuration: '{}',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    return mockResponse;
  }
);

// 创建新应用
export const createApp = createAsyncThunk<AppInfo, { name: string; code: string; description?: string }>(
  'app/create',
  async (appData) => {
    // TODO: 实现创建应用API调用
    const mockResponse: AppInfo = {
      id: Date.now(),
      ...appData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return mockResponse;
  }
);

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentApp: (state, action: PayloadAction<AppInfo>) => {
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
        state.appList = action.payload.list;
        state.total = action.payload.total;
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
