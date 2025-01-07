import React, { useEffect, useState } from 'react';
import { Layout, Tree, Input, Form, Button, message, Spin, Modal, Select, Space, App } from 'antd';
import { SettingOutlined, PlusOutlined } from '@ant-design/icons';
import type { TreeProps } from 'antd/es/tree';
import { Authorized } from '~/utils/permission';
import type { ModelResponse, ModelConfigItem, ModelConfigItemRel, ModelConfigItemDim } from '~/types/element_model';
import { getModel, createModel, updateModel, deleteModel } from '~/services/element_model';
import { MenuService } from '~/services/element_menu';
import { getTableConfig } from '~/services/element';
import type { TableConfig } from '~/services/element';

const { Header, Sider, Content } = Layout;
const { Search } = Input;
const { Option } = Select;

interface Props {
  elementId: string;
  appCode: string;
}

interface DataNode {
  key: string;
  title: string;
  children?: DataNode[];
  data?: ModelConfigItem;
}

const ModelConfig: React.FC<Props> = ({ elementId, appCode }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<ModelConfigItem | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [configVisible, setConfigVisible] = useState(false);
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [dimensions, setDimensions] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);

  useEffect(() => {
    loadModelData();
    loadSystemMenus();
  }, [elementId]);

  // 加载模型数据
  const loadModelData = async () => {
    try {
      setLoading(true);
      const res = await getModel(elementId);
      if (res.code === 200 && res.data) {
        const data = convertToTreeData([res.data.configuration]);
        setTreeData(data);
      }
    } catch (error) {
      console.error('加载模型数据失败:', error);
      message.error('加载模型数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 将模型数据转换为树形结构
  const convertToTreeData = (items: ModelConfigItem[]): DataNode[] => {
    return items.map((item, index) => ({
      key: `${index}`,
      title: `表格 ${item.table_id}`,
      children: item.childrens ? convertToTreeData(item.childrens) : undefined,
      data: item
    }));
  };

  // 加载表格字段
  const loadTableFields = async (tableId: number) => {
    try {
      const res = await getTableConfig(tableId.toString());
      if (res.code === 200 && res.data) {
        setFields(res.data.fields);
      }
    } catch (error) {
      console.error('加载表格字段失败:', error);
      message.error('加载表格字段失败');
    }
  };

  // 加载系统菜单
  const loadSystemMenus = async () => {
    try {
      const sysRes = await MenuService.getSystemMenuId();
      if (sysRes.code === 200 && sysRes.data) {
        const treeRes = await MenuService.getMenus(sysRes.data.id.toString(), 'descendants');
        if (treeRes.code === 200 && treeRes.data) {
          // 过滤出表格类型的菜单
          const tableTables = treeRes.data.filter(item => item.menu_type === 2);
          // 获取这些表格的配置信息
          const tableConfigs = await Promise.all(
            tableTables.map(table => getTableConfig(table.source_id.toString()))
          );
          setTables(tableConfigs.map(res => res.data).filter(Boolean));
        }
      }
    } catch (error) {
      console.error('加载系统菜单失败:', error);
      message.error('加载系统菜单失败');
    }
  };

  // 处理表格选择
  const handleTableSelect = async (value: string) => {
    await loadTableFields(parseInt(value));
    form.setFieldsValue({
      table_id: parseInt(value)
    });
  };

  // 添加子节点
  const handleAddChild = () => {
    if (!selectedNode) {
      message.error('请先选择一个节点');
      return;
    }

    const newNode: ModelConfigItem = {
      table_id: 0,
      relationships: {
        type: '1:1',
        fields: []
      },
      dimensions: []
    };

    const updatedTreeData = updateTreeNode(treeData, selectedKeys[0].toString(), {
      ...selectedNode,
      childrens: [...(selectedNode.childrens || []), newNode]
    });

    setTreeData(updatedTreeData);
  };

  // 处理保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const modelData = {
        ...values,
        relationships: {
          type: values.rel_type,
          fields: values.rel_fields.map((field: string) => {
            const [fromField, toField] = field.split(',');
            return { fromField, toField };
          })
        },
        dimensions: values.dimensions?.map((dim: any) => ({
          dim_id: dim.dim_id,
          item_id: dim.item_id,
          dim_field: dim.dim_field,
          table_field: dim.table_field,
          type: dim.type
        }))
      };

      if (selectedNode) {
        // 更新现有节点
        const updatedTreeData = updateTreeNode(treeData, selectedKeys[0].toString(), modelData);
        setTreeData(updatedTreeData);
        
        // 确保有根节点数据
        if (!updatedTreeData[0]?.data) {
          message.error('模型配置数据无效');
          return;
        }
        
        // 构造完整的模型配置
        const modelConfig = {
          id: parseInt(elementId),
          model_name: 'model',
          display_name: 'Model',
          description: '',
          status: 1,
          configuration: updatedTreeData[0].data
        };
        
        await updateModel(elementId, modelConfig);
        message.success('保存成功');
      }
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  // 更新树节点
  const updateTreeNode = (data: DataNode[], key: string, newData: any): DataNode[] => {
    return data.map(node => {
      if (node.key === key) {
        return {
          ...node,
          data: {
            ...node.data,
            ...newData
          }
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeNode(node.children, key, newData)
        };
      }
      return node;
    });
  };

  // 处理节点选择
  const onSelect = (keys: React.Key[], info: any) => {
    if (keys.length > 0) {
      const node = info.node.data;
      setSelectedNode(node);
      setSelectedKeys(keys);
      
      // 设置表单值
      form.setFieldsValue({
        table_id: node.table_id,
        rel_type: node.relationships?.type,
        rel_fields: node.relationships?.fields?.map(
          (field: any) => `${field.fromField},${field.toField}`
        ),
        dimensions: node.dimensions
      });

      // 加载表格字段
      loadTableFields(node.table_id);
    } else {
      setSelectedNode(null);
      setSelectedKeys([]);
      form.resetFields();
    }
  };

  return (
    <App>
      <Layout>
        <Header style={{ display: 'flex', justifyContent: 'flex-end', background: '#fff' }}>
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
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: 8 }}>
                <Button
                  onClick={handleAddChild}
                  icon={<PlusOutlined />}
                  disabled={!selectedNode}
                >
                  添加子节点
                </Button>
              </div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <Spin />
                </div>
              ) : (
                <Tree
                  treeData={treeData}
                  expandedKeys={expandedKeys}
                  autoExpandParent={autoExpandParent}
                  selectedKeys={selectedKeys}
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
                name="table_id"
                label="关联表格"
                rules={[{ required: true, message: '请选择关联表格' }]}
              >
                <Select
                  placeholder="请选择关联表格"
                  onChange={handleTableSelect}
                >
                  {tables.map((table, index) => (
                    <Option key={index} value={index}>
                      {table.display_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="rel_type"
                label="关联类型"
                rules={[{ required: true, message: '请选择关联类型' }]}
              >
                <Select placeholder="请选择关联类型">
                  <Option value="1:1">一对一</Option>
                  <Option value="1:n">一对多</Option>
                </Select>
              </Form.Item>

              <Form.List name="rel_fields">
                {(formFields, { add, remove }) => (
                  <>
                    {formFields.map((field, index) => (
                      <Space key={field.key} align="baseline">
                        <Form.Item
                          {...field}
                          rules={[{ required: true, message: '请选择关联字段' }]}
                        >
                          <Select style={{ width: 200 }} placeholder="请选择关联字段">
                            {fields.map(tableField => (
                              <Option key={tableField.name} value={`${tableField.name},${tableField.name}`}>
                                {tableField.comment || tableField.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Button onClick={() => remove(index)}>删除</Button>
                      </Space>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block>
                        添加关联字段
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Form.List name="dimensions">
                {(formFields, { add, remove }) => (
                  <>
                    {formFields.map((field, index) => (
                      <Space key={field.key} align="baseline">
                        <Form.Item
                          {...field}
                          name={[field.name, 'dim_id']}
                          rules={[{ required: true, message: '请选择维度' }]}
                        >
                          <Select style={{ width: 120 }} placeholder="选择维度">
                            {dimensions.map(dim => (
                              <Option key={dim.id} value={dim.id}>
                                {dim.display_name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'type']}
                          rules={[{ required: true, message: '请选择类型' }]}
                        >
                          <Select style={{ width: 120 }} placeholder="选择类型">
                            <Option value="children">子节点</Option>
                            <Option value="descendants">所有后代</Option>
                            <Option value="leaves">叶子节点</Option>
                          </Select>
                        </Form.Item>
                        <Button onClick={() => remove(index)}>删除</Button>
                      </Space>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block>
                        添加维度关联
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                <Button type="primary" htmlType="submit">
                  保存
                </Button>
              </Form.Item>
            </Form>
          </Content>
        </Layout>
      </Layout>
    </App>
  );
};

export default ModelConfig;
