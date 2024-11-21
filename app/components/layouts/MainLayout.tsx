import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Tabs, Radio } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from '@remix-run/react';
import { useAppDispatch, useAppSelector } from '~/stores';
import { logout } from '~/stores/slices/authSlice';
import { addTab, removeTab, setActiveTab } from '~/stores/slices/tabSlice';
import { MenuService } from '~/services/menu';
import type { Menu as AppMenu } from '~/types/menu';
import type { Tab } from '~/types/tab';
import SidebarFooter from '~/components/common/SidebarFooter';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [appMenus, setAppMenus] = useState<AppMenu[]>([]);
  const [menuType, setMenuType] = useState<'system' | 'app'>('system');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentApp } = useAppSelector((state) => state.app);
  const { tabs, activeKey } = useAppSelector((state) => state.tab);

  const isAppDetailPage = location.pathname.match(/^\/dashboard\/[\w-]+$/);
  const appId = isAppDetailPage ? location.pathname.split('/').pop() : null;

  useEffect(() => {
    // 如果是应用详情页,加载应用菜单
    if (appId && currentApp) {
      MenuService.getMenus(appId)
        .then(response => {
          if (response.code === 200) {
            setAppMenus(response.data.items || []);
            setMenuType('app');
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
      onClick: () => {
        navigate('/dashboard');
        dispatch(addTab({
          key: '/dashboard',
          title: '应用列表',
          closable: false
        }));
        dispatch(setActiveTab('/dashboard'));
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      children: [
        {
          key: 'users',
          label: '用户管理',
          onClick: () => {
            navigate('/dashboard/settings/users');
            dispatch(addTab({
              key: '/dashboard/settings/users',
              title: '用户管理',
              closable: true
            }));
            dispatch(setActiveTab('/dashboard/settings/users'));
          },
        },
        {
          key: 'roles',
          label: '角色管理',
          onClick: () => {
            navigate('/dashboard/settings/roles');
            dispatch(addTab({
              key: '/dashboard/settings/roles',
              title: '角色管理',
              closable: true
            }));
            dispatch(setActiveTab('/dashboard/settings/roles'));
          },
        },
        {
          key: 'permissions',
          label: '权限管理',
          onClick: () => {
            navigate('/dashboard/settings/permissions');
            dispatch(addTab({
              key: '/dashboard/settings/permissions',
              title: '权限管理',
              closable: true
            }));
            dispatch(setActiveTab('/dashboard/settings/permissions'));
          },
        },
      ],
    },
  ];

  // 将应用菜单转换为antd Menu格式
  const appMenuItems = appMenus.map(menu => ({
    key: menu.menuCode,
    icon: menu.icon ? <span>{menu.icon}</span> : null,
    label: menu.menuName,
    onClick: () => {
      if (menu.path) {
        navigate(menu.path);
        dispatch(addTab({
          key: menu.path,
          title: menu.menuName,
          closable: true
        }));
        dispatch(setActiveTab(menu.path));
      }
    },
  }));

  // 根据当前选择显示的菜单
  const menuItems = menuType === 'app' ? appMenuItems : systemMenuItems;

  // 处理tab切换
  const handleTabChange = (key: string) => {
    dispatch(setActiveTab(key));
    navigate(key);
  };

  // 处理tab关闭
  const handleTabEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove' && typeof targetKey === 'string') {
      dispatch(removeTab(targetKey));
      // 如果关闭的是当前标签,切换到最后一个标签
      if (targetKey === activeKey && tabs.length > 0) {
        const lastTab = tabs[tabs.length - 1];
        dispatch(setActiveTab(lastTab.key));
        navigate(lastTab.key);
      }
    }
  };

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
          {isAppDetailPage && (
            <div style={{ padding: '8px', textAlign: 'center' }}>
              <Radio.Group 
                value={menuType}
                onChange={e => setMenuType(e.target.value)}
                size="small"
                buttonStyle="solid"
                style={{ width: '100%' }}
              >
                <Radio.Button value="app" style={{ width: '50%' }}>应用菜单</Radio.Button>
                <Radio.Button value="system" style={{ width: '50%' }}>系统菜单</Radio.Button>
              </Radio.Group>
            </div>
          )}
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
                icon={<HomeOutlined />}
                onClick={() => navigate('/dashboard')}
              >
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
          margin: '0',
          background: '#fff',
          minHeight: 280,
          overflow: 'auto',
          height: 'calc(100vh - 64px)', // 减去 header 高度
        }}>
          {location.pathname === '/dashboard' ? (
            children // 直接渲染AppList
          ) : (
            <Tabs
              activeKey={activeKey}
              type="editable-card"
              onChange={handleTabChange}
              onEdit={handleTabEdit}
              items={tabs.map((tab) => ({
                key: tab.key,
                label: tab.title,
                closable: tab.closable,
                children: tab.key === activeKey ? children : null
              }))}
              style={{ height: '100%' }}
              tabBarStyle={{
                margin: 0,
                background: '#fafafa',
                padding: '4px 4px 0',
                borderBottom: '1px solid #f0f0f0'
              }}
              size="small"
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
