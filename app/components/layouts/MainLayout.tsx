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
import { useHasPermission } from '~/utils/permission';
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
  
    if (isAppDetailPage) {
      setMenuType('app');
    } else {
      setMenuType('system');
    }
  }, [appId, currentApp, isAppDetailPage]);

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

  // 添加权限检查
  const canSystemManage = useHasPermission('menu:system_manage');
  const canUserManage = useHasPermission('menu:user_manage');
  const canRoleManage = useHasPermission('menu:role_manage');
  const canPermissionManage = useHasPermission('menu:permission_manage');

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
    // 根据权限显示"系统设置"菜单
    ...(
      canSystemManage ? [{
        key: 'settings',
        icon: <SettingOutlined />,
        label: '系统设置',
        children: [
          // 根据权限显示"用户管理"菜单
          ...(
            canUserManage ? [{
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
            }] : []
          ),
          // 根据权限显示"角色管理"菜单
          ...(
            canRoleManage ? [{
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
            }] : []
          ),
          // 根据权限显示"权限管理"菜单
          ...(
            canPermissionManage ? [{
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
            }] : []
          ),
        ],
      }] : []
    ),
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
          {/* {isAppDetailPage && (
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
          )} */}
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
          zIndex: 2,
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
          height: 'calc(100vh - 64px)', // 减去 header 高度
          display: 'flex',
          flexDirection: 'column',
        }}>
          {location.pathname === '/dashboard' ? (
            children // 直接渲染AppList
          ) : (
            <>
              <div style={{
                background: '#fafafa',
                borderBottom: '1px solid #f0f0f0',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}>
                <Tabs
                  activeKey={activeKey}
                  type="editable-card"
                  hideAdd  // 添加此行
                  onChange={handleTabChange}
                  onEdit={handleTabEdit}
                  items={tabs.map((tab) => ({
                    key: tab.key,
                    label: tab.title,
                    closable: tab.closable,
                    children: null // 不在这里渲染内容
                  }))}
                  tabBarStyle={{
                    margin: 0,
                    padding: '4px 4px 0',
                  }}
                  size="small"
                  renderTabBar={(props, DefaultTabBar) => (
                    <DefaultTabBar {...props} style={{ marginBottom: 0 }} />
                  )}
                />
              </div>
              <div style={{ 
                flex: 1,
                overflow: 'auto',
                // padding: '16px',
              }}>
                {tabs.find(tab => tab.key === activeKey) ? children : null}
              </div>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
