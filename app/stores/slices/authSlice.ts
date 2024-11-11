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

// 修改登录异步action
export const login = createAsyncThunk<LoginResult, LoginParams>(
  'auth/login',
  async (loginParams: LoginParams, { dispatch }) => { // 添加 dispatch 参数
    const response = await AuthService.login(loginParams);
    if (response.code !== 200) {
      throw new Error(response.message);
    }
    
    // 在登录成功后立即设置token，使用正确的字段名
    const result = response.data;
    dispatch(setToken({
      token: result.access_token,
      refreshToken: result.refresh_token
    }));
    
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
        return rejectWithValue('No token available');
      }

      const response = await AuthService.getCurrentUser();
      if (response.code !== 200) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
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
    },
    setToken: (state: AuthState, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
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
        state.error = null; // 确保清除任何错误状态
      })
      .addCase(login.rejected, (state: AuthState, action) => {
        state.loading = false;
        // 使用错误信息或默认消息
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
      });
  },
});

export const { logout, setToken, clearError } = authSlice.actions;
export default authSlice.reducer;
