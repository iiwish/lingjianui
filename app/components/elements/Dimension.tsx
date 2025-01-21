import React, { useEffect, useState, useMemo } from 'react';
import { Layout, Tree, Input, Form, Button, message, Spin, Modal } from 'antd';
import { SettingOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TreeProps } from 'antd/es/tree';

interface DataNode {
  key: string;
  title: string | React.ReactNode;
  children?: DataNode[];
  data?: DimensionItem;
}
import { Authorized } from '~/utils/permission';
import DimensionConfig from '../config/DimensionConfig';
import {
  getDimensionTree,
  updateDimensionSort,
  updateDimensionItem,
  createDimensionItem,
  deleteDimensionItems
} from '~/services/element/dim';
import { getDimensionConfig } from '~/services/config/dim';
import { DimensionConfig as IDimensionConfig, CustomColumn } from '~/types/config/dim';
import { DimensionItem } from '~/types/element/dim';

import { PlusOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Search } = Input;

interface Props {
  elementId: string;
  appCode: string;
}

const Dimension: React.FC<Props> = ({ elementId, appCode }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dimensionConfig, setDimensionConfig] = useState<IDimensionConfig | null>(null);
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<DimensionItem | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [configVisible, setConfigVisible] = useState(false);
  const [tempNode, setTempNode] = useState<DimensionItem | null>(null);

  useEffect(() => {
    loadDimensionConfig();
    loadTreeData();
  }, [elementId]);

  // 加载维度配置
  const loadDimensionConfig = async () => {
    try {
      const res = await getDimensionConfig(elementId);
      if (res.code === 200 && res.data) {
        setDimensionConfig(res.data);
      }
    } catch (error) {
      console.error('加载维度配置失败:', error);
      message.error('加载维度配置失败');
    }
  };

  // 递归查找节点
  const findNodeById = (items: DimensionItem[], id: number): DimensionItem | undefined => {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.children) {
        const found = findNodeById(item.children, id);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  };

  const loadTreeData = async () => {
    try {
      setLoading(true);
      const res = await getDimensionTree(elementId);
      if (res.code === 200 && res.data) {
        const data = convertToTreeData(res.data);
        setTreeData(data);

        // 获取需要展开的节点
        let keysToExpand = new Set<string>();
        
        // 默认展开第一级
        res.data
          .filter(item => item.level === 1)
          .forEach(item => keysToExpand.add(item.id.toString()));

        // 如果当前有选中的节点,保持选中状态并更新节点数据
        if (selectedNode) {
          const updatedNode = findNodeById(res.data, selectedNode.id);
          if (updatedNode) {
            // 更新选中状态
            setSelectedNode(updatedNode);
            form.setFieldsValue({
              ...updatedNode,
              custom_data: updatedNode.custom_data || {}
            });
            setSelectedKeys([updatedNode.id.toString()]);

            // 展开到选中节点的路径
            let currentNode = updatedNode;
            while (currentNode.parent_id !== 0) {
              const parentNode = findNodeById(res.data, currentNode.parent_id);
              if (parentNode) {
                keysToExpand.add(parentNode.id.toString());
                currentNode = parentNode;
              } else {
                break;
              }
            }
          }
        }

        setExpandedKeys(Array.from(keysToExpand));
        setAutoExpandParent(true);
      }
    } catch (error) {
      console.error('加载维度树失败:', error);
      message.error('加载维度树失败');
    } finally {
      setLoading(false);
    }
  };

  const convertToTreeData = (items: DimensionItem[]): DataNode[] => {
    return items.map(item => ({
      key: item.id.toString(),
      title: item.name,
      children: item.children ? convertToTreeData(item.children) : undefined,
      data: item
    }));
  };

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const onSearch = (value: string) => {
    setSearchValue(value);
    if (!value) {
      loadTreeData();
      return;
    }

    const loop = (data: DataNode[]): DataNode[] =>
      data.map(item => {
        const strTitle = item.title as string;
        const index = strTitle.toLowerCase().indexOf(value.toLowerCase());
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + value.length);
        const title =
          index > -1 ? (
            <span>
              {beforeStr}
              <span style={{ color: '#f50' }}>{strTitle.slice(index, index + value.length)}</span>
              {afterStr}
            </span>
          ) : (
            <span>{strTitle}</span>
          );

        const newItem = {
          ...item,
          title,
        };

        if (item.children && item.children.length > 0) {
          newItem.children = loop(item.children);
        }

        return newItem;
      });

    setTreeData(loop(treeData));
  };

  // 递归查找节点
  const findNodeByKey = (data: DataNode[], key: string): DataNode | null => {
    for (const n of data) {
      if (n.key === key) return n;
      if (n.children) {
        const found = findNodeByKey(n.children, key);
        if (found) return found;
      }
    }
    return null;
  };
  
  const onDrop: TreeProps['onDrop'] = async (info) => {
    const dropKey = info.node.key as string;
    const dragKey = info.dragNode.key as string;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
  
    // 在修改数组之前计算新的位置信息
    const calculateNewPosition = () => {
      const dragNode = findNodeByKey(treeData, dragKey);
      const dropNode = findNodeByKey(treeData, dropKey);
      
      if (!dragNode || !dropNode) {
        throw new Error('Node not found');
      }

      // 获取目标节点的父节点信息
      const getParentNode = (nodes: DataNode[], key: string): { parent: DataNode | null, siblings: DataNode[] } => {
        for (const node of nodes) {
          if (node.children) {
            for (const child of node.children) {
              if (child.key === key) {
                return { parent: node, siblings: node.children };
              }
            }
            const result = getParentNode(node.children, key);
            if (result.parent) {
              return result;
            }
          }
        }
        return { parent: null, siblings: nodes }; // 如果是根节点
      };

      const { parent: dropParent, siblings: dropSiblings } = getParentNode(treeData, dropKey);
      
      let parentId: number;
      let sort: number;

      if (!info.dropToGap) {
        // 放在目标节点内部
        parentId = parseInt(dropKey);
        sort = 1; // 作为第一个子节点
      } else {
        // 放在节点前后
        parentId = dropParent ? parseInt(dropParent.key) : 0;
        
        if (
          dropParent 
          && parseInt(dropParent.key) === parseInt(dragNode.data?.parent_id?.toString() || '0')
          && dropPosition === 1
          && (dragNode.data?.sort ?? 1) < (dropNode.data?.sort ?? 1)
        ) {
          // 同一父节点，从前往后移动时，让 sort 等于目标节点本身的 sort
          sort = dropNode.data?.sort ?? 1;
        } else if (dropPosition === -1) {
          // 放在目标节点前面
          if (dropNode.data?.sort === 1 || !dropNode.data?.sort) {
            // 如果目标节点是第一个,或者没有sort值
            sort = 1;
          } else {
            // 否则使用目标节点的sort-1
            sort = dropNode.data.sort - 1;
          }
        } else {
          // 放在目标节点后面
          sort = dropNode.data?.sort ? dropNode.data.sort + 1: 1;
        }
      }

      // 如果sort为1,说明是移动到第一个位置,需要更新同级节点的sort值
      if (sort === 1) {
        // 获取同级节点并按sort排序
        const siblings = dropSiblings
          .filter(node => node.key !== dragKey) // 排除被拖拽的节点
          .sort((a, b) => (a.data?.sort || 0) - (b.data?.sort || 0));

        // 更新所有同级节点的sort值
        for (let i = 0; i < siblings.length; i++) {
          const sibling = siblings[i];
          if (sibling.data) {
            sibling.data.sort = i + 2; // 从2开始,因为1已经被移动的节点占用
          }
        }
      }

      return { parentId, sort };
    };

    const { parentId, sort } = calculateNewPosition();

    // 更新树结构
    const loop = (
      data: DataNode[],
      key: string,
      callback: (node: DataNode, i: number, data: DataNode[]) => void,
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children!, key, callback);
        }
      }
    };

    const data = [...treeData];
    let dragObj: DataNode | undefined;
    
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!dragObj) {
      return;
    }

    if (!info.dropToGap) {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.push(dragObj!);
      });
    } else {
      let targetArray: DataNode[] | undefined;
      let targetIndex: number | undefined;
      
      loop(data, dropKey, (_item, index, arr) => {
        targetArray = arr;
        targetIndex = index;
      });

      if (targetArray && typeof targetIndex === 'number') {
        if (dropPosition === -1) {
          targetArray.splice(targetIndex, 0, dragObj);
        } else {
          targetArray.splice(targetIndex + 1, 0, dragObj);
        }
      }
    }

    try {
      await updateDimensionSort(elementId, dragKey, {
        parent: parentId,
        sort: sort
      });
      message.success('移动成功');
      loadTreeData();
    } catch (error) {
      console.error('移动节点失败:', error);
      message.error('移动节点失败');
    }
  };

  const onSelect = (keys: React.Key[], info: any) => {
    // 如果有未保存的临时节点,先清除
    if (tempNode && keys[0] !== tempNode.id.toString()) {
      const newTreeData = treeData.filter(node => node.key !== tempNode.id.toString());
      setTreeData(newTreeData);
      setTempNode(null);
    }

    if (keys.length > 0) {
      const node = info.node.data;
      setSelectedNode(node);
      setSelectedKeys([node.id.toString()]);
      form.setFieldsValue({
        ...node,
        custom_data: node.custom_data || {}
      });
    } else {
      setSelectedNode(null);
      setSelectedKeys([]);
      form.resetFields();
    }
  };

  const handleSave = async () => {
    if (!selectedNode) return;

    try {
      const values = await form.validateFields();
      
      if (tempNode && selectedNode.id === tempNode.id) {
        // 如果是保存临时节点,调用创建接口
        const res = await createDimensionItem(elementId, {
          ...values,
          parent_id: tempNode.parent_id,
          level: tempNode.level,
          sort: tempNode.sort,
          custom_data: values.custom_data || {}
        });
        if (res.code !== 200) {
          throw new Error(res.message || '保存失败');
        }

        const newId = res.data.id;
        // 保存成功后,使用表单值创建新节点数据
        const newNode = {
          ...values,
          id: newId,
          parent_id: tempNode.parent_id,
          level: tempNode.level,
          sort: tempNode.sort,
          custom_data: values.custom_data || {}
        };

        // 先设置选中状态
        setSelectedNode(newNode);
        setSelectedKeys([newId.toString()]);
        form.setFieldsValue(newNode);

        // 清除临时节点
        setTempNode(null);
        
        message.success('保存成功');
        // 重新加载数据
        await loadTreeData();
        return;
      } else {
        // 否则调用更新接口
        await updateDimensionItem(elementId, selectedNode.id.toString(), {
          ...values,
          custom_data: values.custom_data || {}
        });
      }
      
      message.success('保存成功');
      loadTreeData();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  const createTempDimensionItem = (rawParentId: string) => {
    // 如果已有临时节点,先清除
    if (tempNode) {
      const newTreeData = treeData.filter(node => node.key !== tempNode.id.toString());
      setTreeData(newTreeData);
      setTempNode(null);
    }

    // 处理父节点ID
    const parentId = rawParentId === '0' || !rawParentId ? 0 : parseInt(rawParentId);
    
    // 获取父节点的level
    const parentNode = treeData.find(node => node.key === rawParentId)?.data;
    const parentLevel = parentNode ? parentNode.level : 0;

    // 创建临时节点
    const newNode: DimensionItem = {
      id: -Date.now(), // 使用负数作为临时ID
      name: '新建维度',
      code: '',
      parent_id: parentId,
      level: parentLevel + 1,
      node_id: '',
      status: 1,
      sort: 0,
      custom_data: {}
    };

    setTempNode(newNode);
    setSelectedNode(newNode);
    setSelectedKeys([newNode.id.toString()]);
    form.setFieldsValue({
      ...newNode,
      name: '新建维度',
      code: '',
      custom_data: {}
    });

    // 添加到树中
    const newTreeData = [...treeData];
    const newTreeNode = {
      key: newNode.id.toString(),
      title: newNode.name,
      data: newNode
    };

    if (parentId === 0) {
      // 添加到根节点
      newTreeData.push(newTreeNode);
    } else {
      // 添加到父节点的children中
      const loop = (data: DataNode[]): boolean => {
        for (let i = 0; i < data.length; i++) {
          const node = data[i];
          if (node.key === rawParentId) {
            if (!node.children) {
              node.children = [];
            }
            node.children.push(newTreeNode);
            return true;
          }
          if (node.children) {
            if (loop(node.children)) {
              return true;
            }
          }
        }
        return false;
      };
      loop(newTreeData);
    }
    setTreeData(newTreeData);

    // 展开父节点
    if (parentId !== 0 && !expandedKeys.includes(rawParentId)) {
      setExpandedKeys([...expandedKeys, rawParentId]);
    }
  };

  const handleDelete = async () => {
    if (!selectedNode) return;

    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该维度吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteDimensionItems(elementId, [selectedNode.id]);
          message.success('删除成功');
          setSelectedNode(null);
          form.resetFields();
          loadTreeData();
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        }
      }
    });
  };

  return (
    <Layout >
      <Header style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '0px', background: '#fff' }}> 
        <Authorized permission="btn:element_manage">
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => setConfigVisible(true)}
          >
            配置
          </Button>
        </Authorized>
      </Header>
      <Layout>
        <Sider width={300} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
          <div style={{ padding: '0px 16px 16px 16px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: 8 }}>
              <Search
                placeholder="搜索维度"
                allowClear
                onChange={e => onSearch(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button
                onClick={() => {
                  createTempDimensionItem(selectedNode?.id.toString() || '0'); 
                }}
                icon={<PlusOutlined />}
              >
              </Button>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <Spin />
              </div>
            ) : (
              <Tree
                draggable
                blockNode
                showLine={{ showLeafIcon: false }}
                treeData={treeData}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                selectedKeys={selectedKeys}
                onExpand={onExpand}
                onDrop={onDrop}
                onSelect={onSelect}
              />
            )}
          </div>
        </Sider>
        <Content style={{ padding: '16px' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            disabled={selectedNode === null}
          >
            <Form.Item
              name="name"
              label="名称"
              rules={[{ required: true, message: '请输入名称' }]}
            >
              <Input placeholder="请输入名称" />
            </Form.Item>
            <Form.Item
              name="code"
              label="编码"
              rules={[{ required: true, message: '请输入编码' }]}
            >
              <Input placeholder="请输入编码" />
            </Form.Item>
            {/* 动态生成自定义列表单项 */}
            {Array.isArray(dimensionConfig?.custom_columns) && dimensionConfig.custom_columns.map((column: CustomColumn) => (
              <Form.Item
                key={column.name}
                name={['custom_data', column.name]}
                label={column.comment}
              >
                <Input placeholder={`请输入${column.comment}`} maxLength={column.length} />
              </Form.Item>
            ))}
            <Form.Item style={{ textAlign: 'right', gap: 8, marginBottom: 0 }}>
              <Button 
                danger
                onClick={handleDelete}
                disabled={selectedNode === null || (tempNode != null && selectedNode.id === tempNode.id)}
                style={{ marginRight: 8 }}
              >
                删除
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                disabled={selectedNode === null}
              >
                保存
              </Button>
            </Form.Item>
          </Form>
        </Content>
      </Layout>
        <DimensionConfig
          elementId={elementId}
          appCode={appCode}
          visible={configVisible}
          onCancel={() => setConfigVisible(false)}
          onSuccess={() => {
            loadDimensionConfig();
            loadTreeData();
          }}
        />
    </Layout>
  );
};

export default Dimension;
