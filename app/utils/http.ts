import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig,
  AxiosResponse, 
  AxiosError,
  AxiosRequestConfig 
} from 'axios';
import { store } from '../stores';
import { logout, setToken } from '../stores/slices/authSlice';
import type { ApiResponse } from '../types/common';
import { AuthService } from '../services/auth';
import { message } from 'antd';

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 是否正在刷新token
let isRefreshing = false;
// 等待token刷新的请求队列
let requests: Array<(token: string) => void> = [];

// 清理所有状态并跳转到登录页
const handleLogout = () => {
  isRefreshing = false;
  requests = [];
  store.dispatch(logout());
  window.location.replace('/login');
};

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    let token = state.auth.token;
    let appId = state.app.currentApp?.id || '0';
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['App-ID'] = appId;
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
    return response;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const { response, config } = error;
    
    // 处理403无权限错误
    if (response?.status === 403) {
      message.error(response.data?.message || '无权限访问');
      return Promise.reject(error);
    }

    // 处理404未找到错误
    if (response?.status === 404) {
      message.error('请求的资源不存在');
      return Promise.reject(error);
    }

    // 处理500服务器错误
    if (response?.status === 500) {
      message.error('服务器内部错误');
      return Promise.reject(error);
    }

    // 处理400参数错误
    if (response?.status === 400) {
      message.error(response.data?.message || '请求参数错误');
      return Promise.reject(error);
    }

    // 处理401未登录错误
    if (response?.status === 401 && config) {
      // 如果已经在刷新token，加入等待队列
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          requests.push((token: string) => {
            config.headers.Authorization = `Bearer ${token}`;
            resolve(http(config));
          });

          // 设置超时，避免请求一直等待
          setTimeout(() => {
            reject(new Error('刷新token超时'));
            handleLogout();
          }, 5000);
        });
      }

      const state = store.getState();
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        handleLogout();
        return Promise.reject(new Error('登录已过期，请重新登录'));
      }

      isRefreshing = true;

      try {
        const refreshResponse = await AuthService.refreshToken(refreshToken);
        
        if (refreshResponse.code === 200) {
          const { access_token, refresh_token } = refreshResponse.data;
          
          // 更新store中的token
          store.dispatch(setToken({
            token: access_token,
            refreshToken: refresh_token
          }));

          // 重试队列中的请求
          requests.forEach(cb => cb(access_token));
          requests = [];
          isRefreshing = false;

          // 重试当前请求
          config.headers.Authorization = `Bearer ${access_token}`;
          return http(config);
        } else {
          handleLogout();
          return Promise.reject(new Error('登录已过期，请重新登录'));
        }
      } catch (refreshError) {
        handleLogout();
        return Promise.reject(new Error('登录已过期，请重新登录'));
      } finally {
        isRefreshing = false;
      }
    }
    
    // 如果有后端返回的错误信息，直接抛出
    if (response?.data) {
      throw response.data;
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
): Promise<ApiResponse<T>> => {
  const response = await http.get<ApiResponse<T>>(url, { ...config, params });
  return response.data;
};

// 封装POST请求
export const post = async <T>(
  url: string, 
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await http.post<ApiResponse<T>>(url, data, config);
  return response.data;
};

// 封装PUT请求
export const put = async <T>(
  url: string, 
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await http.put<ApiResponse<T>>(url, data, config);
  return response.data;
};

// 封装DELETE请求
export const del = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await http.delete<ApiResponse<T>>(url, {
    ...config,
    data: data
  });
  return response.data;
};

// 导出实例
export default http;
