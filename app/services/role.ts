import { get, post, put, del } from '~/utils/http';
import type { ApiResponse } from '~/types/api';

export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  parent_id: number;
  created_at: string;
}

export interface CreateRoleRequest {
  name: string;
  code: string;
  description?: string;
  parent_id?: number;
}

export interface UpdateRolePermissionsRequest {
  op: 'add' | 'remove';
  value: number[];
}

export const RoleService = {
  // 获取角色列表
  getRoles: () => {
    return get<Role[]>('/roles');
  },

  // 创建角色
  createRole: (data: CreateRoleRequest) => {
    return post<Role>('/roles', data);
  },

  // 更新角色
  updateRole: (id: number, data: Partial<Role>) => {
    return put<Role>(`/roles/${id}`, data);
  },

  // 删除角色
  deleteRole: (id: number) => {
    return del<void>(`/roles/${id}`);
  },

  // 获取角色权限
  getRolePermissions: (roleId: number) => {
    return get<number[]>(`/roles/${roleId}/permissions`);
  },

  // 更新角色权限
  updateRolePermissions: (roleId: number, data: UpdateRolePermissionsRequest[]) => {
    return put<void>(`/roles/${roleId}/permissions`, data);
  }
};
