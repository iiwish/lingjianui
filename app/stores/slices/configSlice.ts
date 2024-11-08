import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  TableConfig,
  DimensionConfig,
  DataModelConfig,
  FormConfig,
  MenuConfig,
  PaginatedData,
} from '../../types/api';

interface ConfigState {
  tables: TableConfig[];
  dimensions: DimensionConfig[];
  models: DataModelConfig[];
  forms: FormConfig[];
  menus: MenuConfig[];
  currentConfig: {
    table: TableConfig | null;
    dimension: DimensionConfig | null;
    model: DataModelConfig | null;
    form: FormConfig | null;
    menu: MenuConfig | null;
  };
  loading: boolean;
  error: string | null;
}

const initialState: ConfigState = {
  tables: [],
  dimensions: [],
  models: [],
  forms: [],
  menus: [],
  currentConfig: {
    table: null,
    dimension: null,
    model: null,
    form: null,
    menu: null,
  },
  loading: false,
  error: null,
};

// 获取数据表配置列表
export const fetchTables = createAsyncThunk<PaginatedData<TableConfig>, number>(
  'config/fetchTables',
  async (appId) => {
    // TODO: 实现获取数据表配置列表API调用
    const mockResponse: PaginatedData<TableConfig> = {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
    return mockResponse;
  }
);

// 获取维度配置列表
export const fetchDimensions = createAsyncThunk<PaginatedData<DimensionConfig>, number>(
  'config/fetchDimensions',
  async (appId) => {
    // TODO: 实现获取维度配置列表API调用
    const mockResponse: PaginatedData<DimensionConfig> = {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
    return mockResponse;
  }
);

// 获取数据模型配置列表
export const fetchModels = createAsyncThunk<PaginatedData<DataModelConfig>, number>(
  'config/fetchModels',
  async (appId) => {
    // TODO: 实现获取数据模型配置列表API调用
    const mockResponse: PaginatedData<DataModelConfig> = {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
    return mockResponse;
  }
);

// 获取表单配置列表
export const fetchForms = createAsyncThunk<PaginatedData<FormConfig>, number>(
  'config/fetchForms',
  async (appId) => {
    // TODO: 实现获取表单配置列表API调用
    const mockResponse: PaginatedData<FormConfig> = {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
    return mockResponse;
  }
);

// 获取菜单配置列表
export const fetchMenus = createAsyncThunk<PaginatedData<MenuConfig>, number>(
  'config/fetchMenus',
  async (appId) => {
    // TODO: 实现获取菜单配置列表API调用
    const mockResponse: PaginatedData<MenuConfig> = {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
    return mockResponse;
  }
);

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setCurrentTable: (state, action: PayloadAction<TableConfig>) => {
      state.currentConfig.table = action.payload;
    },
    setCurrentDimension: (state, action: PayloadAction<DimensionConfig>) => {
      state.currentConfig.dimension = action.payload;
    },
    setCurrentModel: (state, action: PayloadAction<DataModelConfig>) => {
      state.currentConfig.model = action.payload;
    },
    setCurrentForm: (state, action: PayloadAction<FormConfig>) => {
      state.currentConfig.form = action.payload;
    },
    setCurrentMenu: (state, action: PayloadAction<MenuConfig>) => {
      state.currentConfig.menu = action.payload;
    },
    clearCurrentConfig: (state) => {
      state.currentConfig = {
        table: null,
        dimension: null,
        model: null,
        form: null,
        menu: null,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取数据表配置列表
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = action.payload.list;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取数据表配置列表失败';
      })
      // 获取维度配置列表
      .addCase(fetchDimensions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDimensions.fulfilled, (state, action) => {
        state.loading = false;
        state.dimensions = action.payload.list;
      })
      .addCase(fetchDimensions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取维度配置列表失败';
      })
      // 获取数据模型配置列表
      .addCase(fetchModels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.loading = false;
        state.models = action.payload.list;
      })
      .addCase(fetchModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取数据模型配置列表失败';
      })
      // 获取表单配置列表
      .addCase(fetchForms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForms.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = action.payload.list;
      })
      .addCase(fetchForms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取表单配置列表失败';
      })
      // 获取菜单配置列表
      .addCase(fetchMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.menus = action.payload.list;
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取菜单配置列表失败';
      });
  },
});

export const {
  setCurrentTable,
  setCurrentDimension,
  setCurrentModel,
  setCurrentForm,
  setCurrentMenu,
  clearCurrentConfig,
  clearError,
} = configSlice.actions;

export default configSlice.reducer;
