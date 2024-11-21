import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from '@remix-run/react';
import { useAppDispatch, useAppSelector } from '~/stores';
import { logout } from '~/stores/slices/authSlice';
import { MenuService } from '~/services/menu';
import type { Menu as AppMenu } from '~/types/menu';
import SidebarFooter from '~/components/common/SidebarFooter';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [appMenus, setAppMenus] = useState<AppMenu[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentApp } = useAppSelector((state) => state.app);

  const isAppDetailPage = location.pathname.match(/^\/dashboard\/[\w-]+$/);
  const appId = isAppDetailPage ? location.pathname.split('/').pop() : null;

  useEffect(() => {
    // 如果是应用详情页,加载应用菜单
    if (appId && currentApp) {
      MenuService.getMenus(appId)
        .then(response => {
          if (response.code === 200) {
            setAppMenus(response.data.items || []);
          }
        })
        .catch(err => {
          console.error('Failed to load app menus:', err);
        });
    }
  }, [appId, currentApp]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  // 系统菜单
  const systemMenuItems = [
    {
      key: 'apps',
      icon: <AppstoreOutlined />,
      label: '应用列表',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      children: [
        {
          key: 'users',
          label: '用户管理',
          onClick: () => navigate('/dashboard/settings/users'),
        },
        {
          key: 'roles',
          label: '角色管理',
          onClick: () => navigate('/dashboard/settings/roles'),
        },
        {
          key: 'permissions',
          label: '权限管理',
          onClick: () => navigate('/dashboard/settings/permissions'),
        },
      ],
    },
  ];

  // 将应用菜单转换为antd Menu格式
  const appMenuItems = appMenus.map(menu => ({
    key: menu.menuCode,
    icon: menu.icon ? <span>{menu.icon}</span> : null,
    label: menu.menuName,
    onClick: () => menu.path && navigate(menu.path),
  }));

  // 根据当前页面选择显示的菜单
  const menuItems = isAppDetailPage ? appMenuItems : systemMenuItems;

  return (
    <Layout style={{ minHeight: '100vh', height: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          height: '64px', 
          padding: '16px', 
          color: '#fff',
          textAlign: 'center',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          background: '#001529'
        }}>
          {collapsed ? '灵简' : '灵简低代码平台'}
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: 'calc(100vh - 64px)',
          position: 'relative'
        }}>
          <div style={{ 
            flex: 1, 
            overflow: 'auto'
          }}>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
            />
          </div>
          <div style={{
            position: 'sticky',
            bottom: 0,
            background: '#001529',
            zIndex: 1
          }}>
            <SidebarFooter />
          </div>
        </div>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header style={{ 
          padding: 0, 
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            {isAppDetailPage && (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/dashboard')}
              >
                返回应用列表
              </Button>
            )}
          </div>
          <div style={{ marginRight: '24px' }}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
                <span>{user?.nickname || user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ 
          margin: '24px 16px',
          padding: 24,
          background: '#fff',
          minHeight: 280,
          borderRadius: '8px',
          overflow: 'auto',
          height: 'calc(100vh - 112px)', // 减去 header 高度和 margin
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
