import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { App, AppState } from '~/types/app';

const initialState: AppState = {
  apps: [],
  currentApp: null,
  loading: false,
  error: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setApps: (state, action: PayloadAction<App[]>) => {
      state.apps = action.payload;
      state.error = null;
    },
    setCurrentApp: (state, action: PayloadAction<App | null>) => {
      state.currentApp = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addApp: (state, action: PayloadAction<App>) => {
      state.apps.push(action.payload);
      state.error = null;
    },
    updateApp: (state, action: PayloadAction<App>) => {
      const index = state.apps.findIndex(app => app.id === action.payload.id);
      if (index !== -1) {
        state.apps[index] = action.payload;
      }
      if (state.currentApp?.id === action.payload.id) {
        state.currentApp = action.payload;
      }
      state.error = null;
    },
    removeApp: (state, action: PayloadAction<string>) => {
      state.apps = state.apps.filter(app => app.id !== action.payload);
      if (state.currentApp?.id === action.payload) {
        state.currentApp = null;
      }
      state.error = null;
    },
  },
});

export const {
  setApps,
  setCurrentApp,
  setLoading,
  setError,
  addApp,
  updateApp,
  removeApp,
} = appSlice.actions;

export default appSlice.reducer;
