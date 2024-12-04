import { get, post, put, del } from '~/utils/http';
import type { ApiResponse } from '~/types/api';

export interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  status: number;
  created_at: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
  phone?: string;
}

export const UserService = {
  // 获取用户列表
  getUsers: () => {
    return get<User[]>('/users');
  },

  // 获取用户详情
  getUser: (id: number) => {
    return get<User>(`/users/${id}`);
  },

  // 创建用户
  createUser: (data: CreateUserRequest) => {
    return post<User>('/users', data);
  },

  // 更新用户
  updateUser: (id: number, data: Partial<User>) => {
    return put<User>(`/users/${id}`, data);
  },

  // 删除用户
  deleteUser: (id: number) => {
    return del<void>(`/users/${id}`);
  },

  // 获取用户角色
  getUserRoles: (userId: number) => {
    return get<number[]>(`/users/${userId}/roles`);
  },

  // 更新用户角色
  updateUserRoles: (userId: number, roleIds: number[]) => {
    return put<void>(`/users/${userId}/roles`, roleIds);
  }
};
