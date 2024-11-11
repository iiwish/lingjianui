import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig,
  AxiosResponse, 
  AxiosError,
  AxiosRequestConfig 
} from 'axios';
import { store } from '../stores';
import { logout } from '../stores/slices/authSlice';
import type { ApiResponse } from '../types/api';
import { c } from 'node_modules/vite/dist/node/types.d-aGj9QkWt';

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    let token = state.auth.token;
    
    // 如果 Redux store 中没有 token，尝试从 localStorage 获取
    if (!token && typeof window !== 'undefined') {
      const persistedString = localStorage.getItem('persist:auth');
      if (persistedString) {
        try {
          const persistedAuth = JSON.parse(persistedString);
          token = JSON.parse(persistedAuth.token);
        } catch (e) {
          console.error('Failed to parse persisted auth:', e);
        }
      }
    }
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      // 添加调试日志
      console.log('Request headers:', config.headers);
      console.log('Token being used:', token);
    } else {
      console.warn('No token available for request');
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截��
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const { response } = error;
    
    // 处理401未授权的情况
    if (response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/login';
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }
    
    // 如果有后端返回的错误信息，直接抛出
    if (response?.data) {
      throw response.data;  // 直接抛出整个响应数据对象
    }
    
    // 网络错误等其他情况
    return Promise.reject(new Error('网络请求失败'));
  }
);

// 封装GET请求
export const get = async <T>(
  url: string, 
  params?: Record<string, unknown>,
  config?: Omit<AxiosRequestConfig, 'params'>
): Promise<ApiResponse<T>> => {  // 修改返回类型
  const response = await http.get<ApiResponse<T>>(url, { ...config, params });
  return response.data;  // 返回完整响应
};

// 封装POST请求
export const post = async <T>(
  url: string, 
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await http.post<ApiResponse<T>>(url, data, config);
  return response.data; // 返回完整的响应数据
};

// 封装PUT请求
export const put = async <T>(
  url: string, 
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await http.put<ApiResponse<T>>(url, data, config);
  return response.data.data;
};

// 封装DELETE请求
export const del = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await http.delete<ApiResponse<T>>(url, config);
  return response.data.data;
};

// 导出实例
export default http;
