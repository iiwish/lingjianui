import { get, post } from '../utils/http';
import type { 
  AppInfo, 
  AppTemplate, 
  PaginatedData 
} from '../types/api';

/**
 * 应用相关API服务
 */
export const AppService = {
  /**
   * 获取用户的应用列表
   * @param userId 用户ID
   */
  getUserApps(userId: number): Promise<AppInfo[]> {
    return get<AppInfo[]>(`/apps/users/${userId}`);
  },

  /**
   * 获取用户的默认应用
   * @param userId 用户ID
   */
  getUserDefaultApp(userId: number): Promise<AppInfo> {
    return get<AppInfo>(`/apps/users/${userId}/default`);
  },

  /**
   * 创建新应用
   * @param data 应用信息
   */
  createApp(data: {
    name: string;
    code: string;
    description?: string;
  }): Promise<AppInfo> {
    return post<AppInfo>('/apps', data);
  },

  /**
   * 为用户分配应用
   * @param appId 应用ID
   * @param userId 用户ID
   * @param isDefault 是否设为默认应用
   */
  assignAppToUser(appId: number, userId: number, isDefault: boolean): Promise<void> {
    return post<void>(`/apps/${appId}/users/${userId}`, { isDefault });
  },

  /**
   * 获取应用模板列表
   */
  getTemplates(): Promise<AppTemplate[]> {
    return get<AppTemplate[]>('/apps/templates');
  },

  /**
   * 创建应用模板
   * @param data 模板信息
   */
  createTemplate(data: {
    name: string;
    description?: string;
    configuration: string;
    price?: number;
  }): Promise<AppTemplate> {
    return post<AppTemplate>('/apps/templates', data);
  },

  /**
   * 发布应用模板
   * @param templateId 模板ID
   */
  publishTemplate(templateId: number): Promise<void> {
    return post<void>(`/apps/templates/${templateId}/publish`);
  },

  /**
   * 基于模板创建应用
   * @param templateId 模板ID
   * @param data 应用信息
   */
  createFromTemplate(
    templateId: number,
    data: {
      name: string;
      code: string;
    }
  ): Promise<AppInfo> {
    return post<AppInfo>(`/apps/templates/${templateId}/create`, data);
  }
};
