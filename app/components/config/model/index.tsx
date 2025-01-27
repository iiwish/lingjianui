import React, { useState } from 'react';
import { Layout, Button, Spin, App, Form, Input } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import type { ModelConfigItem } from '~/components/config/model/types';
import { useAppSelector } from '~/stores';
import { useModelData } from './hooks/useModelData';
import { useModelOperations } from './hooks/useModelOperations';
import { useTableData } from './hooks/useTableData';
import ModelTree from './components/ModelTree';
import ModelConfigPanel from './components/ModelConfigPanel';

const { Header, Sider, Content } = Layout;

interface Props {
  elementId: string;
  appCode: string;
  parentId?: string | null;
}

const ModelConfig: React.FC<Props> = ({ elementId, appCode, parentId: urlParentId }) => {
  const storeParentId = useAppSelector(state => state.modelConfig.parentId);
  const parentId = urlParentId || storeParentId;
  const [form] = Form.useForm();
  const [selectedNode, setSelectedNode] = useState<{
    path: string[];
    node: ModelConfigItem;
  } | null>(null);
  const [dimensions] = useState<any[]>([]); // 维度数据，根据需要加载

  // 使用自定义hooks
  const { loading, modelData, setModelData, handleSave } = useModelData({ 
    elementId, 
    parentId 
  });

  const { 
    handleAddRootNode, 
    handleAddChildNode, 
    handleDeleteNode, 
    handleNodeUpdate 
  } = useModelOperations(
    modelData,
    setModelData,
    selectedNode,
    setSelectedNode
  );

  const { tables, nodeStates, parentFields, loadTableFields, loadParentFields } = useTableData();

  const handleNodeSelect = (node: ModelConfigItem, path: string[]) => {
    setSelectedNode({ node, path });
    // 加载当前节点的字段
    if (node.source_id) {
      const nodePath = path.join('-');
      if (!nodeStates[nodePath]?.fields) {
        loadTableFields(node.source_id, nodePath);
      }
    }
    // 加载父节点的字段
    if (path.length > 0) {
      const parentPath = path.slice(0, -1);
      const parentNode = modelData?.childrens?.find(child => child.source_id.toString() === path[path.length - 1]);
      if (!parentNode && modelData?.source_id) {
        // 如果当前节点是根节点的子节点，使用modelData作为父节点
        loadParentFields(modelData);
      } else if (parentNode) {
        loadParentFields(parentNode);
      }
    } else if (modelData?.source_id) {
      // 如果当前节点是根节点，尝试加载父表字段
      loadParentFields(modelData);
    }
  };

  return (
    <App>
      <Layout style={{ height: '100vh' }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <Form
            form={form}
            layout="inline"
            style={{ flex: 1, marginRight: 16 }}
          >
            <Form.Item
              name="display_name"
              label="名称"
              rules={[{ required: true, message: '请输入名称' }]}
            >
              <Input placeholder="请输入名称" />
            </Form.Item>

            <Form.Item
              name="model_code"
              label="编码"
              rules={[
                { required: true, message: '请输入模型编码' },
                {
                  pattern: /^[a-zA-Z0-9_-]+$/,
                  message: '只允许字母、数字、下划线和横线',
                },
              ]}
            >
              <Input placeholder="请输入模型编码" />
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
              rules={[{ required: false, message: '请输入描述' }]}
            >
              <Input placeholder="请输入描述" />
            </Form.Item>
          </Form>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => {
              form.validateFields().then(values => {
                handleSave(storeParentId, values);
              });
            }}
          >
            保存
          </Button>
        </Header>
        <Layout>
          <Sider 
            width={320} 
            theme="light"
            style={{ 
              borderRight: '1px solid #f0f0f0',
              overflow: 'auto',
            }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <Spin />
              </div>
            ) : (
              <ModelTree
                loading={loading}
                modelData={modelData}
                selectedNode={selectedNode}
                tables={tables}
                onAddRootNode={handleAddRootNode}
                onAddChildNode={handleAddChildNode}
                onDeleteNode={handleDeleteNode}
                onNodeSelect={handleNodeSelect}
              />
            )}
          </Sider>
          <Content style={{ padding: '16px', overflow: 'auto' }}>
            <ModelConfigPanel
              selectedNode={selectedNode}
              tables={tables}
              nodeStates={nodeStates}
              parentFields={parentFields}
              dimensions={dimensions}
              onNodeUpdate={handleNodeUpdate}
              onLoadTableFields={loadTableFields}
            />
          </Content>
        </Layout>
      </Layout>
    </App>
  );
};

export default ModelConfig;
