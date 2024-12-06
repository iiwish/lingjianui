import React, { useEffect, useState } from 'react';
import { Menu as AntMenu, Spin, message } from 'antd';
import type { MenuProps } from 'antd';
import { useParams } from '@remix-run/react';
import {
  FolderOutlined,
  TableOutlined,
  ContainerOutlined,
  MenuOutlined,
  DatabaseOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { 
  getMenuConfig, 
  getMenuData,
  type MenuConfig,
  type MenuItem as ElementMenuItem 
} from '~/services/element';

type AntMenuItem = Required<MenuProps>['items'][number];

// 图标映射
const iconMap: { [key: string]: React.ReactNode } = {
  'folder': <FolderOutlined />,
  'table': <TableOutlined />,
  'model': <ContainerOutlined />,
  'menu': <MenuOutlined />,
  'dim': <DatabaseOutlined />,
  'form': <FormOutlined />,
};

export default function Menu() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<MenuConfig | null>(null);
  const [menuItems, setMenuItems] = useState<AntMenuItem[]>([]);

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

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // 获取菜单配置
        const configRes = await getMenuConfig(id);
        if (configRes.code === 200 && configRes.data) {
          setConfig(configRes.data);
        } else {
          message.error('获取菜单配置失败');
          return;
        }

        // 获取菜单数据
        const dataRes = await getMenuData(id);
        if (dataRes.code === 200 && Array.isArray(dataRes.data)) {
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
  }, [id]);

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
        style={{ width: '100%' }}
      />
    </div>
  );
}
