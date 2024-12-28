import React, { useEffect, useState } from 'react';
import { Layout, Tree, Input, Form, Button, message, Spin } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { Authorized } from '~/utils/permission';
import DimensionConfig from '../config/DimensionConfig';
import {
  getDimensionTree,
  updateDimensionNode,
  updateDimensionItem,
  DimensionItem
} from '~/services/element';

const { Sider, Content } = Layout;
const { Search } = Input;

interface Props {
  elementId: string;
  appCode: string;
}

const Dimension: React.FC<Props> = ({ elementId, appCode }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [selectedNode, setSelectedNode] = useState<DimensionItem | null>(null);
  const [configVisible, setConfigVisible] = useState(false);

  useEffect(() => {
    loadTreeData();
  }, [elementId]);

  const loadTreeData = async () => {
    try {
      setLoading(true);
      const res = await getDimensionTree(elementId);
      if (res.code === 200 && res.data) {
        const data = convertToTreeData(res.data);
        setTreeData(data);
        // 默认展开第一级
        const firstLevelKeys = res.data
          .filter(item => item.level === 1)
          .map(item => item.id.toString());
        setExpandedKeys(firstLevelKeys);
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

        if (item.children) {
          return {
            ...item,
            title,
            children: loop(item.children),
          };
        }

        return {
          ...item,
          title,
        };
      });

    setTreeData(loop(treeData));
  };

  const onDrop: TreeProps['onDrop'] = async (info) => {
    const dropKey = info.node.key as string;
    const dragKey = info.dragNode.key as string;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    try {
      // 更新节点位置
      await updateDimensionNode(elementId, dragKey, {
        parent: parseInt(dropKey),
        sort: dropPosition
      });
      message.success('移动成功');
      loadTreeData();
    } catch (error) {
      console.error('移动节点失败:', error);
      message.error('移动节点失败');
    }
  };

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0) {
      setSelectedNode(info.node.data);
      form.setFieldsValue(info.node.data);
    } else {
      setSelectedNode(null);
      form.resetFields();
    }
  };

  const handleSave = async () => {
    if (!selectedNode) return;

    try {
      const values = await form.validateFields();
      await updateDimensionItem(elementId, selectedNode.id.toString(), values);
      message.success('保存成功');
      loadTreeData();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  return (
    <>
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
    <Authorized permission="btn:element_manage">
      <Button
        type="primary"
        icon={<SettingOutlined />}
        onClick={() => setConfigVisible(true)}
      >
        配置
      </Button>
    </Authorized>
  </div>
    <Layout style={{ height: 'calc(100% - 50px)' }}>
      <Sider width={300} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '0px 16px 16px 16px' }}>
          <Search
            placeholder="搜索维度"
            allowClear
            onChange={e => onSearch(e.target.value)}
            style={{ marginBottom: 8 }}
          />
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
          disabled={!selectedNode}
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
          <Form.Item name="custom1" label="自定义字段1">
            <Input placeholder="请输入自定义字段1" />
          </Form.Item>
          <Form.Item name="custom2" label="自定义字段2">
            <Input placeholder="请输入自定义字段2" />
          </Form.Item>
          <Form.Item name="custom3" label="自定义字段3">
            <Input placeholder="请输入自定义字段3" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Input placeholder="请输入状态" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" disabled={!selectedNode}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Content>
      <DimensionConfig
        elementId={elementId}
        appCode={appCode}
        visible={configVisible}
        onCancel={() => setConfigVisible(false)}
      />
    </Layout>
    </>
  );
};

export default Dimension;
