import { get, post, put, del } from '~/utils/http';
import type { ApiResponse } from '~/types/api';

export interface Permission {
  id: number;
  name: string;
  code: string;
  description: string;
  type: string;
  method: string;
  path: string;
  menu_id: number;
  status: number;
  created_at: string;
}

export interface CreatePermissionRequest {
  name: string;
  code: string;
  description?: string;
  type: string;
  method?: string;
  path?: string;
  menu_id?: number;
}

export const PermissionService = {
  // 获取权限列表
  getPermissions: () => {
    return get<Permission[]>('/permissions');
  },

  // 创建权限
  createPermission: (data: CreatePermissionRequest) => {
    return post<Permission>('/permissions', data);
  },

  // 更新权限
  updatePermission: (id: number, data: Partial<Permission>) => {
    return put<Permission>(`/permissions/${id}`, data);
  },

  // 删除权限
  deletePermission: (id: number) => {
    return del<void>(`/permissions/${id}`);
  }
};
