import React, { useEffect, useState } from 'react';
import { Menu as AntMenu, Spin, message } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate } from '@remix-run/react';
import {
  FolderOutlined,
  TableOutlined,
  DeploymentUnitOutlined,
  MenuOutlined,
  PartitionOutlined,
  SnippetsOutlined,
} from '@ant-design/icons';
import { 
  getMenuConfig, 
  getMenuData,
  type MenuConfig,
  type MenuItem as ElementMenuItem 
} from '~/services/element';
import type { ElementProps } from '~/types/element';
import { useAppDispatch } from '~/stores';
import { addTab, setActiveTab } from '~/stores/slices/tabSlice';

type AntMenuItem = Required<MenuProps>['items'][number];

// 图标映射
const iconMap: { [key: string]: React.ReactNode } = {
  'folder': <FolderOutlined />,
  'table': <TableOutlined />,
  'model': <DeploymentUnitOutlined />,
  'menu': <MenuOutlined />,
  'dim': <PartitionOutlined />,
  'form': <SnippetsOutlined />,
};

// 菜单类型到路由类型的映射
const menuTypeToRouteType: { [key: string]: string } = {
  'table': '2',
  'dim': '3',
  'menu': '4',
  'model': '5',
  'form': '6',
};

const Menu: React.FC<ElementProps> = ({ elementId, appId }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<MenuConfig | null>(null);
  const [menuItems, setMenuItems] = useState<AntMenuItem[]>([]);
  const [menuData, setMenuData] = useState<ElementMenuItem[]>([]);

  // 将菜单数据转换为antd Menu组件需要的格式
  const transformToMenuItems = (items: ElementMenuItem[]): AntMenuItem[] => {
    return items.map(item => ({
      key: item.id.toString(),
      icon: item.icon ? iconMap[item.icon.toLowerCase()] : null,
      label: item.menu_name,
      children: item.children ? transformToMenuItems(item.children) : undefined,
      type: undefined // 必需字段,用于区分菜单项类型
    }));
  };

  // 根据菜单项key查找原始菜单数据
  const findMenuItem = (items: ElementMenuItem[], key: string): ElementMenuItem | null => {
    for (const item of items) {
      if (item.id.toString() === key) {
        return item;
      }
      if (item.children) {
        const found = findMenuItem(item.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  // 处理菜单项点击
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const menuItem = findMenuItem(menuData, key);
    if (!menuItem) return;

    // 如果是文件夹类型,不做任何处理(让它展开/折叠)
    if (menuItem.menu_type === 'folder') return;

    // 获取路由类型
    const routeType = menuTypeToRouteType[menuItem.menu_type];
    if (!routeType) {
      message.error('不支持的菜单类型');
      return;
    }

    // 构建路由路径
    const path = `/dashboard/${appId}/element/${routeType}/${menuItem.id}`;

    // 添加并激活tab
    dispatch(addTab({
      key: path,
      title: menuItem.menu_name,
      closable: true
    }));
    dispatch(setActiveTab(path));

    // 导航到对应路由
    navigate(path);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!elementId || !appId) return;

      try {
        setLoading(true);

        // 获取菜单配置
        const configRes = await getMenuConfig(appId, elementId);
        if (configRes.code === 200 && configRes.data) {
          setConfig(configRes.data);
        } else {
          message.error('获取菜单配置失败');
          return;
        }

        // 获取菜单数据
        const dataRes = await getMenuData(appId, elementId);
        if (dataRes.code === 200 && Array.isArray(dataRes.data)) {
          setMenuData(dataRes.data);
          const items = transformToMenuItems(dataRes.data);
          setMenuItems(items);
        } else {
          message.error('获取菜单数据失败');
        }
      } catch (error) {
        console.error('加载菜单数据失败:', error);
        message.error('加载菜单数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [elementId, appId]);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {config && (
        <div style={{ marginBottom: '16px' }}>
          <h2>{config.menu_name}</h2>
          {config.menu_code && <p>菜单代码: {config.menu_code}</p>}
        </div>
      )}
      <AntMenu
        mode="inline"
        items={menuItems}
        defaultOpenKeys={menuItems.map(item => item?.key?.toString() || '')}
        onClick={handleMenuClick}
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default Menu;
