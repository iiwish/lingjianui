import React, { useEffect, useState } from 'react';
import { Layout, Button, message, Spin, Modal, App, Card, Form, Select } from 'antd';
import { PlusOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ModelResponse, ModelConfigItem } from '~/types/element_model';
import { getModel, createModel, updateModel } from '~/services/element_model';
import { getTableConfig } from '~/services/element';
import { useAppDispatch, useAppSelector } from '~/stores';
import { setParentId, setConfig } from '~/stores/slices/modelConfigSlice';
import TreeNode from './TreeNode';
import TableFields from './TableFields';
import RelationConfig from './RelationConfig';
import DimensionConfig from './DimensionConfig';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

interface Props {
  elementId: string;
  appCode: string;
  parentId?: string | null;
}

interface NodeState {
  [key: string]: {
    isExpanded: boolean;
    fields: any[];
  };
}

const ModelConfig: React.FC<Props> = ({ elementId, appCode, parentId }) => {
  const dispatch = useAppDispatch();
  const storeParentId = useAppSelector(state => state.modelConfig.parentId);
  const [loading, setLoading] = useState(false);
  const [modelData, setModelData] = useState<ModelConfigItem | null>(null);
  const [selectedNode, setSelectedNode] = useState<{
    path: string[];
    node: ModelConfigItem;
  } | null>(null);
  const [nodeStates, setNodeStates] = useState<NodeState>({});
  const [tables, setTables] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState<any[]>([]);
  const [parentFields, setParentFields] = useState<any[]>([]);

  useEffect(() => {
    if (parentId) {
      dispatch(setParentId(parentId));
    }
    loadTables();
    if (elementId !== 'new') {
      loadModelData();
    }
  }, [elementId, appCode, parentId]);

  const loadModelData = async () => {
    try {
      setLoading(true);
      const res = await getModel(elementId);
      if (res.code === 200 && res.data) {
        setModelData(res.data.configuration);
        dispatch(setConfig(res.data.configuration));
      }
    } catch (error) {
      console.error('加载模型数据失败:', error);
      message.error('加载模型数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async () => {
    try {
      // 加载表格列表和维度列表的逻辑
      // TODO: 实现实际的加载逻辑
    } catch (error) {
      console.error('加载表格失败:', error);
      message.error('加载表格失败');
    }
  };

  const loadTableFields = async (tableId: number, nodePath: string) => {
    try {
      const res = await getTableConfig(tableId.toString());
      if (res.code === 200 && res.data) {
        setNodeStates(prev => ({
          ...prev,
          [nodePath]: {
            isExpanded: false,
            fields: res.data.fields,
          },
        }));
      }
    } catch (error) {
      console.error('加载表格字段失败:', error);
      message.error('加载表格字段失败');
    }
  };

  const handleAddRootNode = () => {
    if (modelData) {
      message.error('根节点已存在');
      return;
    }
    setModelData({
      table_id: 0,
      relationships: undefined,
      dimensions: [],
      childrens: [],
    });
  };

  const handleAddChildNode = () => {
    if (!selectedNode) {
      message.error('请先选择一个节点');
      return;
    }

    const newNode: ModelConfigItem = {
      table_id: 0,
      relationships: {
        type: '1:1',
        fields: [],
      },
      dimensions: [],
      childrens: [],
    };

    const updateNodeAtPath = (
      node: ModelConfigItem,
      path: string[],
      depth: number
    ): ModelConfigItem => {
      if (depth === path.length) {
        return {
          ...node,
          childrens: [...(node.childrens || []), newNode],
        };
      }

      const index = parseInt(path[depth]);
      const newChildren = [...(node.childrens || [])];
      newChildren[index] = updateNodeAtPath(
        newChildren[index],
        path,
        depth + 1
      );

      return {
        ...node,
        childrens: newChildren,
      };
    };

    setModelData((prev) => {
      if (!prev) return newNode;
      return updateNodeAtPath(prev, selectedNode.path, 0);
    });
  };

  const handleDeleteNode = () => {
    if (!selectedNode) {
      message.error('请先选择一个节点');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该节点及其所有子节点吗？',
      onOk: () => {
        const deleteNodeAtPath = (
          node: ModelConfigItem,
          path: string[],
          depth: number
        ): ModelConfigItem | null => {
          if (depth === path.length - 1) {
            if (path[depth] === '0' && depth === 0) {
              return null; // 删除根节点
            }
            const newChildren = [...(node.childrens || [])];
            newChildren.splice(parseInt(path[depth]), 1);
            return {
              ...node,
              childrens: newChildren,
            };
          }

          const index = parseInt(path[depth]);
          const newChildren = [...(node.childrens || [])];
          const updatedChild = deleteNodeAtPath(
            newChildren[index],
            path,
            depth + 1
          );
          newChildren[index] = updatedChild!;

          return {
            ...node,
            childrens: newChildren,
          };
        };

        setModelData((prev) => {
          if (!prev) return null;
          return deleteNodeAtPath(prev, selectedNode.path, 0);
        });
        setSelectedNode(null);
      },
    });
  };

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
      if (parentNode?.table_id) {
        const res = await getTableConfig(parentNode.table_id.toString());
        if (res.code === 200 && res.data) {
          setParentFields(res.data.fields);
        }
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

  const handleNodeUpdate = (updatedNode: ModelConfigItem) => {
    if (!selectedNode) return;

    const updateNodeAtPath = (
      node: ModelConfigItem,
      path: string[],
      depth: number
    ): ModelConfigItem => {
      if (depth === path.length) {
        return {
          ...node,
          ...updatedNode,
        };
      }

      const index = parseInt(path[depth]);
      const newChildren = [...(node.childrens || [])];
      newChildren[index] = updateNodeAtPath(
        newChildren[index],
        path,
        depth + 1
      );

      return {
        ...node,
        childrens: newChildren,
      };
    };

    setModelData((prev) => {
      if (!prev) return updatedNode;
      return updateNodeAtPath(prev, selectedNode.path, 0);
    });
  };

  const handleSave = async () => {
    if (!modelData) {
      message.error('请先添加根节点');
      return;
    }

    try {
      const modelConfig = {
        id: elementId === 'new' ? 0 : parseInt(elementId),
        model_name: 'model',
        display_name: 'Model',
        description: '',
        status: 1,
        configuration: modelData,
        parent_id: storeParentId ? parseInt(storeParentId) : 0,
      };

      if (elementId === 'new') {
        await createModel(modelConfig);
      } else {
        await updateModel(elementId, modelConfig);
      }
      message.success('保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  const renderNode = (node: ModelConfigItem, path: string[]) => {
    const nodePath = path.join('-');
    const nodeState = nodeStates[nodePath] || { isExpanded: false, fields: [] };

    return (
      <div key={nodePath} style={{ marginBottom: 8 }}>
        <TreeNode
          node={node}
          fields={nodeState.fields}
          isExpanded={nodeState.isExpanded}
          onToggleExpand={() =>
            setNodeStates(prev => ({
              ...prev,
              [nodePath]: {
                ...prev[nodePath],
                isExpanded: !prev[nodePath]?.isExpanded,
              },
            }))
          }
          onSelect={() => handleNodeSelect(node, path)}
          isSelected={
            selectedNode?.path.join('-') === path.join('-')
          }
        />
        {node.childrens?.map((child, index) =>
          renderNode(child, [...path, index.toString()])
        )}
      </div>
    );
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
            onClick={handleSave}
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
            <div style={{ padding: '16px' }}>
              <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddRootNode}
                  disabled={!!modelData}
                >
                  添加根节点
                </Button>
                <Button
                  icon={<PlusOutlined />}
                  onClick={handleAddChildNode}
                  disabled={!selectedNode}
                >
                  添加子节点
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteNode}
                  disabled={!selectedNode}
                >
                  删除节点
                </Button>
              </div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 32 }}>
                  <Spin />
                </div>
              ) : (
                modelData && renderNode(modelData, ['0'])
              )}
            </div>
          </Sider>
          <Content style={{ padding: '16px', overflow: 'auto' }}>
            {selectedNode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Card size="small" title="表格配置" bordered={false}>
                  <Form.Item
                    label="关联表格"
                    required
                    tooltip="选择要关联的数据表"
                  >
                    <Select
                      value={selectedNode.node.table_id}
                      onChange={async (value: number) => {
                        handleNodeUpdate({
                          ...selectedNode.node,
                          table_id: value,
                        });
                        await loadTableFields(value, selectedNode.path.join('-'));
                      }}
                      style={{ width: '100%' }}
                    >
                      {tables.map((table) => (
                        <Select.Option key={table.id} value={table.id}>
                          {table.display_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {nodeStates[selectedNode.path.join('-')]?.fields && (
                    <TableFields
                      fields={nodeStates[selectedNode.path.join('-')].fields}
                    />
                  )}
                </Card>

                {selectedNode.path.length > 0 && (
                  <RelationConfig
                    fields={nodeStates[selectedNode.path.join('-')]?.fields || []}
                    parentFields={parentFields}
                    value={selectedNode.node.relationships}
                    onChange={(value) =>
                      handleNodeUpdate({
                        ...selectedNode.node,
                        relationships: value,
                      })
                    }
                  />
                )}

                <DimensionConfig
                  fields={nodeStates[selectedNode.path.join('-')]?.fields || []}
                  dimensions={dimensions}
                  value={selectedNode.node.dimensions}
                  onChange={(value) =>
                    handleNodeUpdate({
                      ...selectedNode.node,
                      dimensions: value,
                    })
                  }
                />
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                color: '#999',
                marginTop: 100 
              }}>
                请选择一个节点进行配置
              </div>
            )}
          </Content>
        </Layout>
      </Layout>
    </App>
  );
};

export default ModelConfig;
