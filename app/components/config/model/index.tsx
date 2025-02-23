import React, { useState, useEffect } from 'react';
import { Layout, Button, Spin, App, Form, Input } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import type { ModelConfigItem } from '~/components/config/model/modelConfigTypes';
import { useAppSelector } from '~/stores';
import { useModelData } from './hooks/useModelData';
import { useModelOperations } from './hooks/useModelOperations';
import { useTableData } from './hooks/useTableData';
import ModelTree from './components/ModelTree';
import { ElementProps } from '~/types/common'
import ModelConfigPanel from './components/ModelConfigPanel';

const { Header, Sider, Content } = Layout;

const ModelConfig: React.FC<ElementProps> = ({ elementId, parentId: urlParentId }) => {
  const storeParentId = String(useAppSelector(state => state.modelConfig.parent_id));
  const parentId = urlParentId || storeParentId;
  const [form] = Form.useForm();
  const [configData, setConfigData] = useState<ModelConfigItem | null>(null);
  const [selectedNode, setSelectedNode] = useState<{
    path: string[];
    node: ModelConfigItem;
  } | null>(null);
  const [dimensions] = useState<any[]>([]); // 维度数据，根据需要加载

  const { tables, nodeStates, parentFields, loadTableFields, loadParentFields } = useTableData();

  // 使用自定义hooks
  const { loading, modelData, handleSave } = useModelData({
    elementId,
    parentId
  });

  useEffect(() => {
    if (modelData?.configuration) {
      setConfigData(modelData.configuration);
      
      // 如果有source_id，加载根节点的表格字段
      if (modelData.configuration.source_id) {
        loadTableFields(modelData.configuration.source_id, '');
      }

      // 递归加载所有子节点的表格字段
      const loadChildrenFields = (children: ModelConfigItem[], parentPath: string[] = []) => {
        children.forEach((child, index) => {
          if (child.source_id) {
            const path = [...parentPath, child.source_id.toString()];
            loadTableFields(child.source_id, path.join('-'));
          }
          if (child.childrens?.length) {
            loadChildrenFields(child.childrens, [...parentPath, child.source_id.toString()]);
          }
        });
      };

      if (modelData.configuration.childrens?.length) {
        loadChildrenFields(modelData.configuration.childrens);
      }
    }
    
    // 如果不是新建模式，则设置表单的值
    if (elementId !== 'new' && modelData) {
      form.setFieldsValue({
        display_name: modelData.display_name,
        model_code: modelData.model_code,
        description: modelData.description,
      });
    }
  }, [modelData, elementId, form, loadTableFields]);

  const {
    handleAddChildNode,
    handleDeleteNode,
    handleNodeUpdate
  } = useModelOperations(
    configData,
    setConfigData,
    selectedNode,
    setSelectedNode
  );

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
      const parentNode = configData?.childrens?.find(child => child.source_id.toString() === path[path.length - 1]);
      if (!parentNode && configData?.source_id) {
        // 如果当前节点是根节点的子节点，使用configData作为父节点
        loadParentFields(configData);
      } else if (parentNode) {
        loadParentFields(parentNode);
      }
    } else if (configData?.source_id) {
      // 如果当前节点是根节点，尝试加载父表字段
      loadParentFields(configData);
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
                modelData={configData}
                selectedNode={selectedNode}
                tables={tables}
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
