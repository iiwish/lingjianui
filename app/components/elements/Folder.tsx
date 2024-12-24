import React, { useEffect, useState } from 'react';
import { Table, Button, message, Breadcrumb, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  FolderOpenTwoTone,
  TableOutlined,
  DeploymentUnitOutlined,
  MenuOutlined,
  PartitionOutlined,
  SnippetsOutlined,
  EditOutlined,
  FileOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from '@remix-run/react';
import { useAppDispatch, useAppSelector } from '~/stores';
import { addTab, setActiveTab, updateFolderState } from '~/stores/slices/tabSlice';
import { MenuService } from '~/services/menu';
import type { Menu as AppMenu } from '~/types/menu';
import type { BreadcrumbItem } from '~/types/tab';
import { Authorized } from '~/utils/permission';
import { menuTypeToRouteType } from '~/constants/elementType';

interface Props {
  elementId: string;
  appCode: string;
}

// 图标映射
const iconMap: { [key: string]: React.ReactNode } = {
  'folder': <FolderOpenTwoTone />,
  'table': <TableOutlined />,
  'model': <DeploymentUnitOutlined />,
  'menu': <MenuOutlined />,
  'dim': <PartitionOutlined />,
  'form': <SnippetsOutlined />,
};

const Folder: React.FC<Props> = ({ elementId, appCode }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AppMenu[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);

  // 获取当前tab的key和状态
  const tabKey = `/dashboard/${appCode}/element/folder/${elementId}`;
  const tabState = useAppSelector(state => state.tab.tabStates[tabKey]);

  // 更新store中的状态
  const updateTabState = (newBreadcrumbs: BreadcrumbItem[], newCurrentFolder: number | null) => {
    dispatch(updateFolderState({
      key: tabKey,
      state: {
        breadcrumbs: newBreadcrumbs,
        currentFolder: newCurrentFolder
      }
    }));
  };

  // 加载指定文件夹的数据
  const loadFolderData = async (folderId: number | null) => {
    try {
      setLoading(true);
      const response = await MenuService.getMenus(appCode);
      if (response.code === 200) {
        // 找到当前菜单组
        const currentGroup = response.data.items.find(menu => menu.id === Number(elementId));
        if (!currentGroup) return;

        // 如果没有指定文件夹ID,显示根目录
        if (!folderId) {
          // 过滤掉children字段
          setData((currentGroup.children || []).map(item => {
            const { children, ...rest } = item;
            return rest;
          }));
          const newBreadcrumbs = [{ id: currentGroup.id, name: 'sys', menu_type: '1' }];
          setBreadcrumbs(newBreadcrumbs);
          updateTabState(newBreadcrumbs, null);
          return;
        }

        // 查找指定的文件夹
        const findFolder = (items: AppMenu[]): AppMenu | null => {
          for (const item of items) {
            if (item.id === folderId) return item;
            if (item.children) {
              const found = findFolder(item.children);
              if (found) return found;
            }
          }
          return null;
        };

        const folder = findFolder(currentGroup.children || []);
        if (folder && folder.children) {
          // 过滤掉children字段
          setData((folder.children || []).map(item => {
            const { children, ...rest } = item;
            return rest;
          }));
        }
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

  // 初始加载
  useEffect(() => {
    if (tabState) {
      // 如果有保存的状态,恢复它
      setBreadcrumbs(tabState.breadcrumbs);
      setCurrentFolder(tabState.currentFolder);
      loadFolderData(tabState.currentFolder);
    } else {
      // 否则加载根目录
      loadFolderData(null);
    }
  }, [elementId, appCode]);

  // 处理双击事件
  const handleDoubleClick = (record: AppMenu) => {
    if (record.menu_type === '1') {
      // 更新面包屑
      const newBreadcrumbs = [...breadcrumbs, {
        id: record.id,
        name: record.menu_name,
        menu_type: record.menu_type
      }];
      setBreadcrumbs(newBreadcrumbs);
      // 更新当前文件夹
      setCurrentFolder(record.id);
      // 更新store中的状态
      updateTabState(newBreadcrumbs, record.id);
      // 加载文件夹数据
      loadFolderData(record.id);
      return;
    }

    // 构建路由路径
    const routeType = record.menu_type === 'config' ? 'config' : 'element';
    const path = `/dashboard/${appCode}/${routeType}/${menuTypeToRouteType[record.menu_type]}/${record.source_id}`;

    // 添加并激活tab
    dispatch(addTab({
      key: path,
      title: record.menu_name,
      closable: true
    }));
    dispatch(setActiveTab(path));

    // 导航到对应路由
    navigate(path);
  };

  // 处理面包屑点击
  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    // 找到点击项的索引
    const index = breadcrumbs.findIndex(i => i.id === item.id);
    if (index === -1) return;

    // 更新面包屑
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    // 更新当前文件夹
    const newCurrentFolder = item.id === breadcrumbs[0].id ? null : item.id;
    setCurrentFolder(newCurrentFolder);
    // 更新store中的状态
    updateTabState(newBreadcrumbs, newCurrentFolder);
    // 加载文件夹数据
    loadFolderData(newCurrentFolder);
  };

  // 处理返回上一级
  const handleBack = () => {
    if (breadcrumbs.length <= 1) return;
    const prevItem = breadcrumbs[breadcrumbs.length - 2];
    handleBreadcrumbClick(prevItem);
  };

  // 处理编辑按钮点击
  const handleEdit = (record: AppMenu) => {
    // 构建配置路由路径
    const path = `/dashboard/${appCode}/config/${menuTypeToRouteType[record.menu_type]}/${record.source_id}`;

    // 添加并激活tab
    dispatch(addTab({
      key: path,
      title: `${record.menu_name}配置`,
      closable: true
    }));
    dispatch(setActiveTab(path));

    // 导航到对应路由
    navigate(path);
  };

  const columns: ColumnsType<AppMenu> = [
    {
      title: '名称',
      dataIndex: 'menu_name',
      key: 'menu_name',
      render: (text: string, record: AppMenu) => (
        <span>
          {iconMap[menuTypeToRouteType[record.menu_type]] || <FileOutlined />}
          <span style={{ marginLeft: 8 }}>
            {text}
            <span style={{ marginLeft: 4, color: '#999' }}>
              ({record.menu_code})
            </span>
          </span>
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Authorized permission="btn:element_manage">
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Authorized>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          disabled={breadcrumbs.length <= 1}
        />
        <Breadcrumb 
          style={{ flex: 1 }}
          items={breadcrumbs.map(item => ({
            title: <a onClick={() => handleBreadcrumbClick(item)}>{item.name}</a>
          }))}
        />
        <Authorized permission="btn:element_manage">
          <Button type="primary">新建元素</Button>
        </Authorized>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        size="small"
        expandable={{ expandIcon: () => null }}
        onRow={(record) => ({
          onDoubleClick: () => handleDoubleClick(record)
        })}
      />
    </div>
  );
};

export default Folder;
