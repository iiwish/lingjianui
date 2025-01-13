import React, { useState } from 'react';
import { Layout, Button, Spin, App } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import type { ModelConfigItem } from '~/types/element_model';
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

const ModelConfig: React.FC<Props> = ({ elementId, appCode, parentId }) => {
  const storeParentId = useAppSelector(state => state.modelConfig.parentId);
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

  const {
    tables,
    nodeStates,
    parentFields,
    loadTableFields,
    loadParentFields,
    toggleNodeExpand,
  } = useTableData();

  const handleNodeSelect = async (node: ModelConfigItem, path: string[]) => {
    setSelectedNode({ node, path });
    
    // 加载父节点的字段
    if (path.length > 0) {
      const parentPath = path.slice(0, -1);
      let parentNode: ModelConfigItem | null = modelData;
      for (const index of parentPath) {
        const nextNode = parentNode?.childrens?.[parseInt(index)];
        if (!nextNode) {
          parentNode = null;
          break;
        }
        parentNode = nextNode;
      }
      if (parentNode) {
        await loadParentFields(parentNode);
      }
    }

    // 加载当前节点的字段
    if (node.table_id) {
      const nodePath = path.join('-');
      if (!nodeStates[nodePath]?.fields) {
        await loadTableFields(node.table_id, nodePath);
      }
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
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => handleSave(storeParentId)}
            style={{ marginLeft: 8 }}
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
                nodeStates={nodeStates}
                tables={tables}
                onAddRootNode={handleAddRootNode}
                onAddChildNode={handleAddChildNode}
                onDeleteNode={handleDeleteNode}
                onNodeSelect={handleNodeSelect}
                onToggleExpand={toggleNodeExpand}
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
