import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { UserInfo, LoginParams, LoginResult } from '../../types/api';
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

// 修改登录异步action
export const login = createAsyncThunk<LoginResult, LoginParams>(
  'auth/login',
  async (loginParams: LoginParams, { dispatch }) => {
    const response = await AuthService.login(loginParams);
    if (response.code !== 200) {
      throw new Error(response.message);
    }
    
    // 在登录成功后立即设置token
    const result = response.data;
    dispatch(setToken({
      token: result.access_token,
      refreshToken: result.refresh_token
    }));
    
    // 设置cookie
    setCookie('token', result.access_token);
    setCookie('refreshToken', result.refresh_token);
    
    // 立即获取用户信息
    await dispatch(fetchUserInfo()).unwrap();
    
    return result;
  }
);

// 修改获取用户信息action
export const fetchUserInfo = createAsyncThunk<UserInfo>(
  'auth/fetchUserInfo',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (!state.auth.token) {
        console.error('No token available');
        return rejectWithValue('No token available');
      }

      console.log('Fetching user info with token:', state.auth.token);
      const response = await AuthService.getCurrentUser();
      console.log('User info response:', response);

      if (response.code !== 200) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      console.error('fetchUserInfo error:', error);
      throw error;
    }
  }
);

// 刷新token的异步action
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
      console.log('Token updated in Redux:', action.payload.token);
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
