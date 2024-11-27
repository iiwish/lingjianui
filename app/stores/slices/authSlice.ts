import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { UserInfo, LoginParams, LoginResult, Permission } from '../../types/api';
import { AuthService } from '../../services/auth';

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
};

// 设置cookie的辅助函数
const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

// 删除cookie的辅助函数
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

// 获取权限列表
export const fetchPermissions = createAsyncThunk<string[]>(
  'auth/fetchPermissions',
  async (_, { getState }) => {
    const response = await AuthService.getPermissions();
    if (response.code !== 200) {
      throw new Error(response.message);
    }
    // 提取权限code列表
    return response.data.map(permission => permission.code);
  }
);

// 获取用户信息
export const fetchUserInfo = createAsyncThunk<UserInfo>(
  'auth/fetchUserInfo',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (!state.auth.token) {
        console.error('No token available');
        return rejectWithValue('No token available');
      }

      // 获取用户信息
      const response = await AuthService.getCurrentUser();
      if (response.code !== 200) {
        return rejectWithValue(response.message);
      }

      // 获取权限列表
      const permissions = await dispatch(fetchPermissions()).unwrap();
      
      // 合并用户信息和权限列表
      return {
        ...response.data,
        permissions
      };
    } catch (error) {
      console.error('fetchUserInfo error:', error);
      throw error;
    }
  }
);

// 登录
export const login = createAsyncThunk<LoginResult, LoginParams>(
  'auth/login',
  async (loginParams: LoginParams, { dispatch }) => {
    const response = await AuthService.login(loginParams);
    if (response.code !== 200) {
      throw new Error(response.message);
    }
    
    // 设置token
    const result = response.data;
    dispatch(setToken({
      token: result.access_token,
      refreshToken: result.refresh_token
    }));
    
    // 设置cookie
    setCookie('token', result.access_token);
    setCookie('refreshToken', result.refresh_token);
    
    // 获取用户信息和权限
    await dispatch(fetchUserInfo()).unwrap();
    
    return result;
  }
);

// 刷新token
export const refreshTokenAction = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, dispatch }) => {
    const state = getState() as { auth: AuthState };
    const refreshToken = state.auth.refreshToken;
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await AuthService.refreshToken(refreshToken);
    if (response.code === 200) {
      const { access_token, refresh_token } = response.data;
      
      // 更新cookie
      setCookie('token', access_token);
      setCookie('refreshToken', refresh_token);
      
      return { token: access_token, refreshToken: refresh_token };
    }
    
    throw new Error('Failed to refresh token');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state: AuthState) => {
      // 调用登出API
      void AuthService.logout();
      // 清除状态
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      // 清除cookie
      deleteCookie('token');
      deleteCookie('refreshToken');
    },
    setToken: (state: AuthState, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      // 更新cookie
      setCookie('token', action.payload.token);
      setCookie('refreshToken', action.payload.refreshToken);
    },
    clearError: (state: AuthState) => {
      state.error = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
      // 登录
      .addCase(login.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state: AuthState, action: PayloadAction<LoginResult>) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.error = null;
      })
      .addCase(login.rejected, (state: AuthState, action) => {
        state.loading = false;
        state.error = action.payload as string || '登录失败';
      })
      // 获取用户信息
      .addCase(fetchUserInfo.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state: AuthState, action: PayloadAction<UserInfo>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state: AuthState, action: { error: { message?: string } }) => {
        state.loading = false;
        state.error = action.error.message || '获取用户信息失败';
      })
      // 获取权限列表
      .addCase(fetchPermissions.fulfilled, (state: AuthState, action: PayloadAction<string[]>) => {
        if (state.user) {
          state.user.permissions = action.payload;
        }
      })
      // 刷新token
      .addCase(refreshTokenAction.fulfilled, (state: AuthState, action: PayloadAction<{ token: string; refreshToken: string }>) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(refreshTokenAction.rejected, (state: AuthState) => {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.error = '刷新token失败';
      });
  },
});

export const { logout, setToken, clearError } = authSlice.actions;
export default authSlice.reducer;
