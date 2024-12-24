import React, { useState, useEffect } from 'react';
import { Layout, Menu as AntMenu, Button, Avatar, Dropdown, Tabs, Select, Result } from 'antd';
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

interface SystemMenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const iconMap: { [key: string]: React.ReactNode } = {
  'folder': <FolderOutlined />,
  'table': <TableOutlined />,
  'model': <ContainerOutlined />,
  'menu': <MenuOutlined />,
  'dim': <DatabaseOutlined />,
  'form': <FormOutlined />,
};

// 菜单类型到路由类型的映射
const menuTypeToRouteType: { [key: string]: string } = {
  'table': '2',
  'dim': '3',
  'menu': '4',
  'model': '5',
  'form': '6',
};

// 路由类型到菜单类型的映射
const routeTypeToMenuType: { [key: string]: string } = {
  '2': 'table',
  '3': 'dim',
  '4': 'menu',
  '5': 'model',
  '6': 'form',
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
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
      // 如果已经有菜单数据且appId没变，就不重新获取
      if (menus.length > 0 && menus[0]?.app_id === Number(appId)) {
        // 如果是element或config路由，只更新tab状态
        const pathParts = location.pathname.split('/');
        if (pathParts.includes('element') || pathParts.includes('config')) {
          const routeType = pathParts[3]; // element或config
          const type = pathParts[4];
          const id = pathParts[5];
          const menuType = routeTypeToMenuType[type];
          const menuPath = `/dashboard/${appId}/${routeType}/${type}/${id}`;

          // 在现有菜单中查找对应的菜单项
          const findMenuItem = (menus: AppMenu[]): AppMenu | null => {
            for (const menu of menus) {
              if (menu.source_id?.toString() === id && menu.menu_type === menuType) {
                return menu;
              }
              if (menu.children) {
                const found = findMenuItem(menu.children);
                if (found) return found;
              }
            }
            return null;
          };

          // 遍历所有菜单组查找
          for (const group of menus) {
            if (group.children) {
              const menuItem = findMenuItem(group.children);
              if (menuItem) {
                // 设置当前菜单组
                dispatch(setCurrentMenuGroup(group));
                // 添加tab
                dispatch(addTab({
                  key: menuPath,
                  title: menuItem.menu_name,
                  closable: true
                }));
                dispatch(setActiveTab(menuPath));
                break;
              }
            }
          }
        }
        return;
      }

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
            
            // 如果是element或config路由,自动打开对应的tab
            const pathParts = location.pathname.split('/');
            if (pathParts.includes('element') || pathParts.includes('config')) {
              const routeType = pathParts[3]; // element或config
              const type = pathParts[4];
              const id = pathParts[5];
              const menuPath = `/dashboard/${appId}/${routeType}/${type}/${id}`;
              
              // 在菜单数据中查找对应的菜单项
              const findMenuItem = (menus: AppMenu[]): AppMenu | null => {
                for (const menu of menus) {
                  if (menu.source_id?.toString() === id && menu.menu_type === type) {
                    return menu;
                  }
                  if (menu.children) {
                    const found = findMenuItem(menu.children);
                    if (found) return found;
                  }
                }
                return null;
              };
              
              // 遍历所有菜单组查找
              for (const group of menuData) {
                if (group.children) {
                  const menuItem = findMenuItem(group.children);
                  if (menuItem) {
                    // 设置当前菜单组
                    dispatch(setCurrentMenuGroup(group));
                    // 添加tab
                    dispatch(addTab({
                      key: menuPath,
                      title: menuItem.menu_name,
                      closable: true
                    }));
                    dispatch(setActiveTab(menuPath));
                    break;
                  }
                }
              }
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
  }, [appId, currentApp]); // 只在appId或currentApp变化时重新获取菜单

  // 生成菜单路径
  const generateMenuPath = (menu: AppMenu): string | null => {
    if (menu.menu_type === '1') {
      // 目录类型不生成路径
      return null;
    }
  // 根据menu_type决定使用element还是config路由
  const routeType = menu.menu_type === 'config' ? 'config' : 'element';
  return `/dashboard/${appId}/${routeType}/${menu.menu_type}/${menu.source_id}`;
  };

  // 递归构建菜单项
  const buildMenuItems = (menus: AppMenu[]): MenuItem[] => {
    return menus.map(menu => {
      const icon = iconMap[menu.icon?.toLowerCase()] || null;
      const menuPath = generateMenuPath(menu);
      
      const menuItem: MenuItem = {
        key: menuPath || menu.path, // 如果没有menuPath就用原始path作为key
        icon: icon,
        label: menu.menu_name,
        children: menu.children && menu.children.length > 0 
          ? buildMenuItems(menu.children) 
          : undefined,
        // 如果不是目录且有menuPath,则可以点击
        onClick: menu.menu_type !== '1' && menuPath ? () => {
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

  // 系统菜单 - 移除应用列表相关逻辑
  const systemMenuItems: SystemMenuItem[] = [];

  // 处理菜单组切换
  const handleMenuGroupChange = (menuId: string) => {
    const selectedMenu = menus.find(menu => menu.id === Number(menuId));
    if (selectedMenu) {
      dispatch(setCurrentMenuGroup(selectedMenu));
      
      // 如果是系统菜单,自动打开folder tab
      if (selectedMenu.menu_code === '_sys') {
        const path = `/dashboard/${appId}/element/1/${selectedMenu.id}`;
        dispatch(addTab({
          key: path,
          title: selectedMenu.menu_name,
          closable: true
        }));
        dispatch(setActiveTab(path));
        navigate(path);
      }
    }
  };

  // 根据当前选择显示的菜单
  const menuItems = isAppPage 
    ? (currentMenuGroup ? buildMenuItems(currentMenuGroup.children || []) : [])
    : systemMenuItems;

  // 处理tab切换
  const handleTabChange = (key: string) => {
    // 如果是应用列表tab,不做任何操作
    if (key === '/dashboard') return;
    
    dispatch(setActiveTab(key));
    navigate(key);
  };

  // 处理tab关闭
  const handleTabEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove' && typeof targetKey === 'string') {
      const targetIndex = tabs.findIndex(tab => tab.key === targetKey);
      dispatch(removeTab(targetKey));
  
      // 如果关闭的是当前标签
      if (targetKey === activeKey) {
        // 如果还有其他tab
        if (tabs.length > 1) {
          let newActiveKey;
          // 优先选择前一个tab
          if (targetIndex > 0) {
            newActiveKey = tabs[targetIndex - 1].key;
          } else {
            // 如果关闭的是第一个tab，选择下一个tab
            newActiveKey = tabs[1].key;
          }
          dispatch(setActiveTab(newActiveKey));
          navigate(newActiveKey);
        } else {
          // 如果没有其他tab了，设置为空或默认值
          const defaultKey = '/dashboard';
          dispatch(setActiveTab(defaultKey));
          navigate(defaultKey);
        }
      }
    }
  };

  // 检查当前路径是否为element或config路由
  const isElementRoute = (path: string) => {
    const parts = path.split('/');
    return parts.includes('element') || parts.includes('config');
  };

  // 检查当前路径是否为应用首页
  const isAppHome = (path: string) => {
    const parts = path.split('/');
    return parts.length === 3 && parts[1] === 'dashboard';
  };

  // 过滤掉应用列表tab
  const filteredTabs = tabs.filter(tab => tab.key !== '/dashboard');

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
                  items={filteredTabs.map((tab) => ({
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
                {tabs.find(tab => tab.key === activeKey) ? (
                  isAppHome(location.pathname) || isElementRoute(location.pathname) ? 
                    children : 
                    <Result
                      status="404"
                      title="404"
                      subTitle="对不起,您访问的页面不存在"
                    />
                ) : null}
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
};

export default MainLayout;
