import React, { useEffect, useState } from 'react';
import ElementCreateModal from './common/ElementCreateModal';
import { Table, Button, message, Breadcrumb, Space, Modal, App } from 'antd';
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
  ArrowLeftOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from '@remix-run/react';
import { useAppDispatch, useAppSelector } from '~/stores';
import { addTab, setActiveTab, updateFolderState } from '~/stores/slices/tabSlice';
import { MenuService } from '~/services/menu';
import type { Menu as AppMenu } from '~/types/menu';
import type { BreadcrumbItem } from '~/types/tab';
import { Authorized } from '~/utils/permission';
import { menuTypeToRouteType } from '~/constants/elementType';
import MenuEditModal from './common/MenuEditModal';

interface Props {
  elementId: string;
  appCode: string;
  initialState?: {
    breadcrumbs: Array<{
      id: number;
      name: string;
      menu_type: number;
    }>;
  };
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

const Folder: React.FC<Props> = ({ elementId, appCode, initialState }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AppMenu[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEditMenu, setCurrentEditMenu] = useState<AppMenu | null>(null);

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
      // 加载指定文件夹的子菜单
      const response = await MenuService.getMenus(
        elementId,
        'children', // 只获取直接子级
        folderId?.toString() || '0' // 使用当前文件夹ID作为parent_id
      );
      if (response.code === 200 && response.data) {
        // API直接返回菜单列表
        setData(response.data);
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
    const initializeState = async () => {
      // 默认面包屑
      const defaultBreadcrumbs = [{ 
        id: 0, 
        name: '目录', 
        menu_type: 1 
      }];

      if (tabState) {
        // 如果有保存的状态,恢复它
        setBreadcrumbs(tabState.breadcrumbs);
        setCurrentFolder(tabState.currentFolder);
        await loadFolderData(tabState.currentFolder);
      } else if (initialState?.breadcrumbs) {
        // 使用初始状态
        setBreadcrumbs(initialState.breadcrumbs);
        setCurrentFolder(null);
        await loadFolderData(null);
      } else {
        // 使用默认状态
        setBreadcrumbs(defaultBreadcrumbs);
        updateTabState(defaultBreadcrumbs, null);
        await loadFolderData(null);
      }
    };

    initializeState();
  }, [elementId, appCode, initialState]);

  // 确保面包屑始终包含根目录
  useEffect(() => {
    if (breadcrumbs.length === 0) {
      const rootBreadcrumb = { 
        id: Number(elementId), 
        name: '目录', 
        menu_type: 1 
      };
      setBreadcrumbs([rootBreadcrumb]);
      updateTabState([rootBreadcrumb], null);
    }
  }, [breadcrumbs, elementId]);

  // 处理双击事件
  const handleDoubleClick = (record: AppMenu) => {
    if (record.menu_type === 1) {
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
    const path = `/dashboard/${appCode}/element/${menuTypeToRouteType[record.menu_type]}/${record.source_id}`;

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
    // 如果点击的是根目录（第一个面包屑），则设置为 null
    const newCurrentFolder = index === 0 ? null : Number(item.id);
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
    if (record.menu_type === 1 || record.menu_type === 4) {
      setCurrentEditMenu(record);
      setEditModalVisible(true);
      return;
    }

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

  // 处理删除按钮点击
  const handleDelete = (record: AppMenu) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个菜单吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await MenuService.deleteMenuItem(record.id.toString());
          if (response.code === 200) {
            message.success('删除成功');
            loadFolderData(currentFolder);
          } else {
            message.error('删除失败');
          }
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        }
      }
    });
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
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Authorized>
      )
    }
  ];

  return (
    <App>
    <div style={{ padding: '0px' }}>
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
          <Button 
            type="primary"
            onClick={() => setCreateModalVisible(true)}
          >
            新建元素
          </Button>
        </Authorized>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        size="small"
        rowKey="id"
        expandable={{ expandIcon: () => null }}
        onRow={(record) => ({
          onDoubleClick: () => handleDoubleClick(record)
        })}
      />
      <ElementCreateModal
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        appCode={appCode}
        parentId={currentFolder?.toString() || elementId}
        onSuccess={() => loadFolderData(currentFolder)}
      />
    </div>
    <MenuEditModal
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setCurrentEditMenu(null);
        }}
        menu={currentEditMenu}
        onSuccess={() => {
          loadFolderData(currentFolder);
        }}
      />
    </App>
  );
};

export default Folder;
