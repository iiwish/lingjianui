import { useState, useEffect } from 'react';
import { message } from 'antd';
import { MenuService } from '~/services/element_menu';
import { getTableConfig } from '~/services/element';
import type { Menu as AppMenu } from '~/types/menu';

interface TreeSelectNode {
  key: string;
  value: string;
  title: string;
  children?: TreeSelectNode[];
  selectable?: boolean;
  disabled?: boolean;
  data?: AppMenu;
}

interface NodeState {
  [key: string]: {
    isExpanded: boolean;
    fields: any[];
  };
}

// 将菜单数据转换为TreeSelect需要的格式
const convertToTreeData = (items: AppMenu[]): TreeSelectNode[] => {
  return items.map((item) => ({
    key: item.id.toString(),
    value: item.id.toString(),
    title: item.menu_name,
    children: item.children ? convertToTreeData(item.children) : undefined,
    selectable: item.menu_type === 2, // 只有表格类型可选
    disabled: item.menu_type !== 2, // 非表格类型禁用
    data: item,
  }));
};

export const useTableData = () => {
  const [tables, setTables] = useState<TreeSelectNode[]>([]);
  const [nodeStates, setNodeStates] = useState<NodeState>({});
  const [parentFields, setParentFields] = useState<any[]>([]);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      // 获取系统菜单id
      const sysRes = await MenuService.getSystemMenuId();
      if (sysRes.code === 200 && sysRes.data) {
        // 获取系统菜单树
        const treeRes = await MenuService.getMenus(sysRes.data.id.toString(), 'descendants');
        if (treeRes.code === 200 && treeRes.data) {
          const treeData = convertToTreeData(treeRes.data);
          setTables(treeData);
        }
      }
    } catch (error) {
      console.error('加载表格失败:', error);
      message.error('加载表格失败');
    }
  };

  const loadTableFields = async (tableId: number, nodePath: string) => {
    if (tableId === 0) {
      setNodeStates(prev => ({
        ...prev,
        [nodePath]: {
          isExpanded: false,
          fields: [],
        },
      }));
      return;
    }
    try {
      const res = await getTableConfig(tableId.toString());
      if (res.code === 200 && res.data) {
        // 保持之前的展开状态，如果是新节点则默认展开
        const prevExpanded = nodeStates[nodePath]?.isExpanded ?? true;
        setNodeStates(prev => ({
          ...prev,
          [nodePath]: {
            isExpanded: prevExpanded,
            fields: res.data.fields,
          },
        }));
      }
    } catch (error) {
      console.error('加载表格字段失败:', error);
      message.error('加载表格字段失败');
    }
  };

  const loadParentFields = async (parentNode: any) => {
    if (parentNode?.table_id) {
      try {
        const res = await getTableConfig(parentNode.table_id.toString());
        if (res.code === 200 && res.data) {
          setParentFields(res.data.fields);
        }
      } catch (error) {
        console.error('加载父表字段失败:', error);
        message.error('加载父表字段失败');
      }
    }
  };

  const toggleNodeExpand = (nodePath: string) => {
    setNodeStates(prev => ({
      ...prev,
      [nodePath]: {
        ...prev[nodePath],
        isExpanded: !prev[nodePath]?.isExpanded,
      },
    }));
  };

  return {
    tables,
    nodeStates,
    parentFields,
    loadTableFields,
    loadParentFields,
    toggleNodeExpand,
  };
};
