import { get, post } from '../utils/http';
import type { 
  LoginParams, 
  LoginResult, 
  UserInfo, 
  CaptchaResult 
} from '../types/api';

/**
 * 认证相关API服务
 */
export const AuthService = {
  /**
   * 获取验证码
   */
  getCaptcha(): Promise<CaptchaResult> {
    return get<CaptchaResult>('/auth/captcha');
  },

  /**
   * 用户登录
   * @param params 登录参数
   */
  login(params: LoginParams): Promise<LoginResult> {
    return post<LoginResult>('/auth/login', params);
  },

  /**
   * 用户登出
   */
  logout(): Promise<void> {
    return post<void>('/auth/logout');
  },

  /**
   * 刷新Token
   * @param refreshToken 刷新令牌
   */
  refreshToken(refreshToken: string): Promise<LoginResult> {
    return post<LoginResult>('/auth/refresh', undefined, {
      headers: {
        'X-Refresh-Token': refreshToken
      }
    });
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): Promise<UserInfo> {
    return get<UserInfo>('/auth/current-user');
  }
};
