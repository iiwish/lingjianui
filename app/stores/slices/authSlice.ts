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

// 异步登录action
export const login = createAsyncThunk<LoginResult, LoginParams>(
  'auth/login',
  async (loginParams: LoginParams) => {
    return await AuthService.login(loginParams);
  }
);

// 异步获取用户信息action
export const fetchUserInfo = createAsyncThunk<UserInfo>(
  'auth/fetchUserInfo',
  async () => {
    return await AuthService.getCurrentUser();
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
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state: AuthState, action: { error: { message?: string } }) => {
        state.loading = false;
        state.error = action.error.message || '登录失败';
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
