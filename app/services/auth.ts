import { get, post } from '../utils/http';
import type { 
  LoginParams, 
  LoginResult, 
  UserInfo, 
  CaptchaResult,
  Permission,
  ApiResponse
} from '../types/api';

/**
 * 认证相关API服务
 */
export const AuthService = {
  /**
   * 获取验证码
   */
  getCaptcha(): Promise<ApiResponse<CaptchaResult>> {
    return get<CaptchaResult>('/auth/captcha');
  },

  /**
   * 用户登录
   * @param params 登录参数
   */
  login(params: LoginParams): Promise<ApiResponse<LoginResult>> {
    return post<LoginResult>('/auth/login', params);
  },

  /**
   * 用户登出
   */
  logout(): Promise<ApiResponse<void>> {
    return post<void>('/auth/logout');
  },

  /**
   * 刷新Token
   * @param refreshToken 刷新令牌
   */
  refreshToken(refreshToken: string): Promise<ApiResponse<LoginResult>> {
    return post<LoginResult>('/auth/refresh', undefined, {
      headers: {
        'X-Refresh-Token': refreshToken
      }
    });
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): Promise<ApiResponse<UserInfo>> {
    return get<UserInfo>('/user/profile').then(response => {
      console.log('getCurrentUser response:', response);
      return response;
    }).catch(error => {
      console.error('getCurrentUser error:', error);
      throw error;
    });
  },

  /**
   * 获取权限列表
   */
  getPermissions(): Promise<ApiResponse<Permission[]>> {
    return get<Permission[]>('/permissions').then(response => {
      console.log('getPermissions response:', response);
      return response;
    }).catch(error => {
      console.error('getPermissions error:', error);
      throw error;
    });
  }
};
