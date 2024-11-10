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
    const token = state.auth.token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const { data } = response;
    if (data.code !== 200) {
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const { response } = error;
    
    if (response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/login';
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }
    
    const errorMessage = response?.data?.message || error.message || '网络请求失败';
    return Promise.reject(new Error(errorMessage));
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
