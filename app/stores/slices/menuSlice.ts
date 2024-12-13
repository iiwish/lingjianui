import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Menu } from '~/types/menu';
import { MenuService } from '~/services/menu';

interface MenuState {
  menus: Menu[];
  currentMenuGroup: Menu | null;
  loading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  menus: [],
  currentMenuGroup: null,
  loading: false,
  error: null,
};

// 获取菜单配置列表
export const fetchMenus = createAsyncThunk(
  'menu/fetchMenus',
  async (appId: number) => {
    const response = await MenuService.getMenus(appId.toString());
    return response;
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenus: (state, action: PayloadAction<Menu[]>) => {
      state.menus = action.payload;
      // 设置默认的当前菜单组为第一个菜单
      if (action.payload.length > 0 && !state.currentMenuGroup) {
        state.currentMenuGroup = action.payload[0];
      }
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
      state.menus = [];
      state.currentMenuGroup = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(fetchMenus.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchMenus.fulfilled, (state, action) => {
      state.loading = false;
      state.menus = action.payload.data.items;
    })
    .addCase(fetchMenus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || '获取菜单配置列表失败';
    });
  },
});

export const { 
  setMenus, 
  setCurrentMenuGroup, 
  setLoading, 
  setError,
  clearMenus 
} = menuSlice.actions;

export default menuSlice.reducer;
