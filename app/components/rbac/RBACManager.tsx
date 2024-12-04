import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import UserList from './UserList';
import RoleList from './RoleList';
import PermissionList from './PermissionList';

interface RBACManagerProps {
  appId: string;
}

export default function RBACManager({ appId }: RBACManagerProps) {
  const items: TabsProps['items'] = [
    {
      key: 'users',
      label: '用户管理',
      children: <UserList appId={appId} />,
    },
    {
      key: 'roles',
      label: '角色管理',
      children: <RoleList appId={appId} />,
    },
    {
      key: 'permissions',
      label: '权限管理',
      children: <PermissionList appId={appId} />,
    },

  ];

  return (
    <Tabs
      defaultActiveKey="users"
      items={items}
      type="card"
      style={{ padding: 0 }}
    />
  );
}
