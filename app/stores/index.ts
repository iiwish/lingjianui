import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from '~/stores/storage';
import authReducer from '~/stores/slices/authSlice';
import appReducer from '~/stores/slices/appSlice';
import tabReducer from '~/stores/slices/tabSlice';
import menuReducer from '~/stores/slices/menuSlice';
import tableConfigReducer from '~/stores/slices/config/tableConfigSlice';
import dimensionConfigReducer from '~/stores/slices/config/dimensionConfigSlice';
import modelConfigReducer from '~/components/config/model/modelConfigSlice';

// 配置 auth 持久化
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'refreshToken', 'user'], // 只持久化这些字段
  version: 1,
};

// 创建持久化的 reducer
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// 创建 store
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    app: appReducer,
    tab: tabReducer,
    menu: menuReducer,
    tableConfig: tableConfigReducer,
    dimensionConfig: dimensionConfigReducer,
    modelConfig: modelConfigReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略redux-persist的action
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // 忽略redux-persist的state
        ignoredPaths: ['auth._persist'],
      },
    }),
});

// 创建 persistor
export const persistor = persistStore(store);

// 从store本身推断出RootState和AppDispatch类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 在整个应用中使用，而不是简单的useDispatch和useSelector
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
