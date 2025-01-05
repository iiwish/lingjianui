import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Menu, MenuConfig } from '~/types/menu';
import { MenuService } from '~/services/menu';

interface MenuState {
  menuList: MenuConfig[];
  menus: Menu[];
  currentMenuConfig: MenuConfig | null;
  currentMenuGroup: Menu | null;
  loading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  menuList: [],
  menus: [],
  currentMenuConfig: null,
  currentMenuGroup: null,
  loading: false,
  error: null,
};

// 获取菜单配置列表
export const fetchMenuList = createAsyncThunk(
  'menu/fetchMenuList',
  async () => {
    const response = await MenuService.getMenuList();
    return response;
  }
);

// 获取菜单详情
export const fetchMenus = createAsyncThunk(
  'menu/fetchMenus',
  async (menuId: string) => {
    const response = await MenuService.getMenus(menuId);
    return response;
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenuList: (state, action: PayloadAction<MenuConfig[]>) => {
      state.menuList = action.payload;
      // 设置默认的当前菜单配置为第一个菜单
      if (action.payload.length > 0 && !state.currentMenuConfig) {
        state.currentMenuConfig = action.payload[0];
      }
    },
    setCurrentMenuConfig: (state, action: PayloadAction<MenuConfig>) => {
      state.currentMenuConfig = action.payload;
    },
    setMenus: (state, action: PayloadAction<Menu>) => {
      state.menus = action.payload.children || [];
      state.currentMenuGroup = action.payload;
    },
    setCurrentMenuGroup: (state, action: PayloadAction<Menu>) => {
      state.currentMenuGroup = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearMenus: (state) => {
      state.menuList = [];
      state.menus = [];
      state.currentMenuConfig = null;
      state.currentMenuGroup = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(fetchMenuList.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchMenuList.fulfilled, (state, action) => {
      state.loading = false;
      // 只处理menu config数据
      state.menuList = action.payload.data.map(config => ({
        id: config.id,
        table_name: config.table_name,
        display_name: config.display_name,
        description: '',
        dimension_type: '',
        app_id: 0,
        status: config.status,
        created_at: config.created_at,
        updated_at: config.updated_at,
        creator_id: config.creator_id,
        updater_id: config.updater_id
      }));
      if (action.payload.data.length > 0 && !state.currentMenuConfig) {
        state.currentMenuConfig = state.menuList[0];
      }
    })
    .addCase(fetchMenuList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || '获取菜单配置列表失败';
    })
    .addCase(fetchMenus.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchMenus.fulfilled, (state, action) => {
      state.loading = false;
      const menuData = action.payload.data;
      // API返回的是一个数组形式的菜单树
      if (Array.isArray(menuData)) {
        state.menus = menuData;
        // 如果有数据，设置第一个顶级菜单为当前菜单组
        if (menuData.length > 0) {
          state.currentMenuGroup = menuData[0];
        }
      } else {
        console.error('Invalid menu data format:', menuData);
        state.menus = [];
        state.currentMenuGroup = null;
      }
    })
    .addCase(fetchMenus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || '获取菜单详情失败';
    });
  },
});

export const { 
  setMenuList,
  setCurrentMenuConfig,
  setMenus, 
  setCurrentMenuGroup, 
  setLoading, 
  setError,
  clearMenus 
} = menuSlice.actions;

export default menuSlice.reducer;
