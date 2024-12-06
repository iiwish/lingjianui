import React, { useState, useEffect } from 'react';
import { Layout, Menu as AntMenu, Button, Avatar, Dropdown, Tabs, Select } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  FolderOutlined,
  TableOutlined,
  ContainerOutlined,
  MenuOutlined,
  DatabaseOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from '@remix-run/react';
import { useAppDispatch, useAppSelector } from '~/stores';
import { logout } from '~/stores/slices/authSlice';
import { addTab, removeTab, setActiveTab } from '~/stores/slices/tabSlice';
import { setMenus, setCurrentMenuGroup, setLoading, setError } from '~/stores/slices/menuSlice';
import { MenuService } from '~/services/menu';
import type { Menu as AppMenu, MenuItem } from '~/types/menu';
import type { Tab } from '~/types/tab';
import SidebarFooter from '~/components/common/SidebarFooter';
import UserProfileModal from '~/components/user/UserProfileModal';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

interface MainLayoutProps {
  children: React.ReactNode;
}

const iconMap: { [key: string]: React.ReactNode } = {
  'folder': <FolderOutlined />,
  'table': <TableOutlined />,
  'model': <ContainerOutlined />,
  'menu': <MenuOutlined />,
  'dim': <DatabaseOutlined />,
  'form': <FormOutlined />,
};

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentApp } = useAppSelector((state) => state.app);
  const { tabs, activeKey } = useAppSelector((state) => state.tab);
  const { menus, currentMenuGroup, loading } = useAppSelector((state) => state.menu);

  // 修改判断逻辑,只要路径包含/dashboard/就认为是应用页面
  const isAppPage = location.pathname.includes('/dashboard/');
  const appId = isAppPage ? location.pathname.split('/')[2] : null;

  // 加载菜单数据
  useEffect(() => {
    if (appId && currentApp) {
      dispatch(setLoading(true));
      MenuService.getMenus(appId)
        .then(response => {
          if (response.code === 200) {
            const menuData = response.data.items;
            dispatch(setMenus(menuData));
            // 如果没有当前菜单组,设置第一个为默认
            if (menuData.length > 0 && !currentMenuGroup) {
              dispatch(setCurrentMenuGroup(menuData[0]));
            }
          }
        })
        .catch(err => {
          console.error('Failed to load app menus:', err);
          dispatch(setError(err.message));
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    }
  }, [appId, currentApp]);

  // 生成菜单路径
  const generateMenuPath = (menu: AppMenu): string => {
    if (menu.menu_type === '1') {
      // 目录类型,直接使用path
      return `/dashboard/${appId}/${menu.path}`;
    }
    
  return `/dashboard/${appId}/element/${menu.menu_type}/${menu.source_id}`;
  };

  // 递归构建菜单项
  const buildMenuItems = (menus: AppMenu[]): MenuItem[] => {
    return menus.map(menu => {
      const icon = iconMap[menu.icon?.toLowerCase()] || null;
      
      
      const menuItem: MenuItem = {
        key: menu.path, // 使用完整路径作为key
        icon: icon,
        label: menu.menu_name,
        children: menu.children && menu.children.length > 0 
          ? buildMenuItems(menu.children) 
          : undefined,
        // 如果是菜单类型,则可以点击
        onClick: menu.menu_type !== '1' ? () => {
          const menuPath = generateMenuPath(menu);
          navigate(menuPath);
          dispatch(addTab({
            key: menuPath,
            title: menu.menu_name,
            closable: true
          }));
          dispatch(setActiveTab(menuPath));
        } : undefined,
      };
      return menuItem;
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => setProfileModalVisible(true),
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
  ];

  // 处理菜单组切换
  const handleMenuGroupChange = (menuId: string) => {
    const selectedMenu = menus.find(menu => menu.id === Number(menuId));
    if (selectedMenu) {
      dispatch(setCurrentMenuGroup(selectedMenu));
      // 当切换菜单组时，移除应用列表tab
      const newTabs = tabs.filter(tab => tab.key !== '/dashboard');
      newTabs.forEach(tab => dispatch(removeTab(tab.key)));
    }
  };

  // 根据当前选择显示的菜单
  const menuItems = isAppPage 
    ? (currentMenuGroup ? buildMenuItems(currentMenuGroup.children || []) : [])
    : systemMenuItems;

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
          <div style={{ 
            flex: 1, 
            overflow: 'auto'
          }}>
            {isAppPage && (
              <div style={{ padding: '8px' }}>
                <Select
                  style={{ width: '100%' }}
                  value={currentMenuGroup?.menu_name}
                  onChange={handleMenuGroupChange}
                  loading={loading}
                >
                  {menus.map(menu => (
                    <Option key={menu.id} value={menu.id}>
                      {menu.menu_name}
                    </Option>
                  ))}
                </Select>
              </div>
            )}
            <AntMenu
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
            {isAppPage && (
              <Button
                type="text"
                icon={<HomeOutlined />}
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
                  hideAdd
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
                />
              </div>
              <div style={{ 
                flex: 1,
                overflow: 'auto',
                padding: '16px'
              }}>
                {tabs.find(tab => tab.key === activeKey) ? children : null}
              </div>
            </>
          )}
        </Content>
      </Layout>

      <UserProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
    </Layout>
  );
}
