import React, { useState, useEffect, type ReactNode } from 'react';
import { Layout, Menu, Spin, Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from '@remix-run/react';
import { useAppDispatch, useAppSelector } from '~/stores';
import { logout } from '~/stores/slices/authSlice';
import { fetchMenus } from '~/stores/slices/menuSlice'; // 更新导入路径
import type { Menu as MenuType } from '~/types/menu'; // 更新导入路径

const { Header, Sider, Content } = Layout;

interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  children?: MenuItem[];
}

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { currentApp } = useAppSelector((state) => state.app);
  const { menus, loading } = useAppSelector((state) => state.menu); // 更新state路径

  // 加载菜单数据
  useEffect(() => {
    if (currentApp?.id) {
      void dispatch(fetchMenus(Number(currentApp.id)));
    }
  }, [dispatch, currentApp?.id]);

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }): void => {
    navigate(key);
  };

  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }: { key: string }): void => {
    if (key === 'logout') {
      dispatch(logout());
      navigate('/login');
    } else if (key === 'profile') {
      navigate('/profile');
    }
  };

  // 转换菜单数据为Antd Menu项
  const transformMenus = (menus: MenuType[]): MenuItem[] => {
    const menuMap = new Map<number, MenuType>();
    const rootMenus: MenuType[] = [];

    // 构建菜单映射
    menus.forEach(menu => {
      menuMap.set(menu.id, menu);
      if (!menu.parent_id) {
        rootMenus.push(menu);
      }
    });

    // 递归构建菜单树
    const buildMenuTree = (menuItem: MenuType): MenuItem => {
      const children = menus.filter(m => m.parent_id === menuItem.id);
      
      if (children.length === 0) {
        return {
          key: menuItem.path,
          icon: menuItem.icon ? React.createElement(AppstoreOutlined) : null,
          label: menuItem.menu_name,
        };
      }

      return {
        key: menuItem.path,
        icon: menuItem.icon ? React.createElement(AppstoreOutlined) : null,
        label: menuItem.menu_name,
        children: children.map(child => buildMenuTree(child)),
      };
    };

    return rootMenus.map(menu => buildMenuTree(menu));
  };

  // 用户下拉菜单
  const userMenu: MenuProps = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人信息',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
      },
    ],
    onClick: handleUserMenuClick,
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ 
          height: '64px', 
          padding: '16px', 
          color: '#fff',
          textAlign: 'center',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}>
          {currentApp?.name || '灵简平台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={transformMenus(menus)}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: '16px', cursor: 'pointer' }
            }
          )}
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: '8px' }}>{user?.username}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ 
          margin: '24px 16px', 
          padding: '24px', 
          background: '#fff', 
          minHeight: 280 
        }}>
          <Spin spinning={loading}>
            {children}
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
}