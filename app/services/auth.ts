import { get, post } from '../utils/http';
import type { 
  LoginParams, 
  LoginResult, 
  UserInfo, 
  CaptchaResult,
  ApiResponse  // 添加 ApiResponse 导入
} from '../types/api';

/**
 * 认证相关API服务
 */
export const AuthService = {
  /**
   * 获取验证码
   */
  getCaptcha(): Promise<ApiResponse<CaptchaResult>> {  // 修改返回类型
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
  logout(): Promise<ApiResponse<void>> {  // 修改返回类型
    return post<void>('/auth/logout');
  },

  /**
   * 刷新Token
   * @param refreshToken 刷新令牌
   */
  refreshToken(refreshToken: string): Promise<ApiResponse<LoginResult>> {  // 修改返回类型
    return post<LoginResult>('/auth/refresh', undefined, {
      headers: {
        'X-Refresh-Token': refreshToken
      }
    });
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): Promise<ApiResponse<UserInfo>> {  // 修改返回类型
    return get<UserInfo>('/auth/userinfo').then(response => {
      console.log('getCurrentUser response:', response); // 添加调试日志
      return response;
    }).catch(error => {
      console.error('getCurrentUser error:', error); // 添加错误日志
      throw error;
    });
  }
};
