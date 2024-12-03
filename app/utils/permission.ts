import { useSelector } from 'react-redux';
import { RootState } from '~/stores';
import type { ReactNode } from 'react';
import { createElement } from 'react';

// 权限检查hook
// 这个hook用于检查用户是否拥有特定权限
export const useHasPermission = (permission: string) => {
  // 打印redux中的permissions
  // console.log(useSelector((state: RootState) => state.auth.user?.permissions || [])); 
  // 从Redux状态中获取用户的权限列表
  const permissions = useSelector((state: RootState) => state.auth.user?.permissions || []);
  // 检查用户权限列表中是否包含指定的权限
  return permissions.includes(permission);
};

// 权限检查组件属性
// 定义权限检查组件的属性接口
export interface AuthorizedProps {
  permission: string; // 需要检查的权限
  children: ReactNode; // 有权限时渲染的子组件
  fallback?: ReactNode; // 没有权限时渲染的备用组件
}

// 权限检查组件
// 这个组件用于根据权限渲染不同的内容
export const Authorized = (props: AuthorizedProps) => {
  // 使用useHasPermission hook检查用户是否拥有指定权限
  const hasPermission = useHasPermission(props.permission);
  // 根据权限渲染子组件或备用组件
  return createElement(
    'div',
    null,
    hasPermission ? props.children : props.fallback
  );
};

// 多权限检查hook
// 这个hook用于检查用户是否拥有多个权限
export const useHasPermissions = (permissions: string[], mode: 'every' | 'some' = 'every') => {
  // 从Redux状态中获取用户的权限列表
  const userPermissions = useSelector((state: RootState) => state.auth.user?.permissions || []);
  // 根据模式检查用户权限列表中是否包含所有或部分指定的权限
  return mode === 'every' 
    ? permissions.every(p => userPermissions.includes(p))
    : permissions.some(p => userPermissions.includes(p));
};

// 多权限检查组件属性
// 定义多权限检查组件的属性接口
export interface MultiAuthorizedProps {
  permissions: string[]; // 需要检查的权限列表
  mode?: 'every' | 'some'; // 检查模式，'every'表示需要拥有所有权限，'some'表示只需拥有部分权限
  children: ReactNode; // 有权限时渲染的子组件
  fallback?: ReactNode; // 没有权限时渲染的备用组件
}

// 多权限检查组件
// 这个组件用于根据多个权限渲染不同的内容
export const MultiAuthorized = (props: MultiAuthorizedProps) => {
  // 使用useHasPermissions hook检查用户是否拥有指定的多个权限
  const hasPermissions = useHasPermissions(props.permissions, props.mode);
  // 根据权限渲染子组件或备用组件
  return createElement(
    'div',
    null,
    hasPermissions ? props.children : props.fallback
  );
};
