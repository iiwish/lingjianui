import React, { useEffect, useState } from 'react';
import { Tabs, Form, Input, Switch, InputNumber, Select, Button, Space, Table, message, Modal } from 'antd';
import type { TableConfig as ITableConfig, FieldConfig, IndexConfig } from '~/services/element';
import { getTableConfig, updateTableConfig, updateTableFields, updateTableIndexes, updateTableFunc } from '~/services/element';

const { Option } = Select;

interface Props {
  elementId: string;
  appId: string;
}

// 字段类型选项
const FIELD_TYPES = [
  { label: '字符串', value: 'varchar' },
  { label: '整数', value: 'int' },
  { label: '小数', value: 'decimal' },
  { label: '日期', value: 'date' },
  { label: '日期时间', value: 'datetime' },
  { label: '布尔', value: 'boolean' },
  { label: '文本', value: 'text' },
  { label: 'JSON', value: 'json' },
];

// 索引类型选项
const INDEX_TYPES = [
  { label: '普通索引', value: 'normal' },
  { label: '唯一索引', value: 'unique' },
  { label: '全文索引', value: 'fulltext' },
];

const TableConfig: React.FC<Props> = ({ elementId, appId }) => {
  const [config, setConfig] = useState<ITableConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState('1');
  const [form] = Form.useForm();
  const [fieldForm] = Form.useForm();
  const [indexForm] = Form.useForm();
  const [funcForm] = Form.useForm();
  const [editingField, setEditingField] = useState<FieldConfig | null>(null);
  const [editingIndex, setEditingIndex] = useState<IndexConfig | null>(null);

  useEffect(() => {
    loadConfig();
  }, [elementId]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await getTableConfig(elementId);
      if (res.code === 200 && res.data) {
        setConfig(res.data);
        form.setFieldsValue({
          table_name: res.data.table_name,
          display_name: res.data.display_name,
          description: res.data.description,
        });
        if (res.data.func) {
          try {
            const funcData = JSON.parse(res.data.func);
            funcForm.setFieldsValue(funcData);
          } catch (e) {
            console.error('解析func字段失败:', e);
          }
        }
      }
    } catch (error) {
      message.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBasic = async () => {
    try {
      const values = await form.validateFields();
      const res = await updateTableConfig(elementId, values);
      if (res.code === 200) {
        message.success('保存成功');
        loadConfig();
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      message.error('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleSaveField = async () => {
    try {
      const values = await fieldForm.validateFields();
      if (!config) return;
      
      let newFields = [...config.fields];
      if (editingField) {
        // 更新字段
        const index = newFields.findIndex(f => f.name === editingField.name);
        if (index > -1) {
          newFields[index] = { ...values, sort: editingField.sort };
        }
      } else {
        // 新增字段
        newFields.push({ ...values, sort: newFields.length });
      }

      const res = await updateTableFields(elementId, newFields);
      if (res.code === 200) {
        message.success('保存成功');
        setEditingField(null);
        fieldForm.resetFields();
        loadConfig();
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      message.error('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleDeleteField = async (field: FieldConfig) => {
    try {
      if (!config) return;
      const newFields = config.fields.filter(f => f.name !== field.name);
      const res = await updateTableFields(elementId, newFields);
      if (res.code === 200) {
        message.success('删除成功');
        loadConfig();
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      message.error('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleSaveIndex = async () => {
    try {
      const values = await indexForm.validateFields();
      if (!config) return;

      let newIndexes = [...config.indexes];
      if (editingIndex) {
        // 更新索引
        const index = newIndexes.findIndex(i => i.name === editingIndex.name);
        if (index > -1) {
          newIndexes[index] = values;
        }
      } else {
        // 新增索引
        newIndexes.push(values);
      }

      const res = await updateTableIndexes(elementId, newIndexes);
      if (res.code === 200) {
        message.success('保存成功');
        setEditingIndex(null);
        indexForm.resetFields();
        loadConfig();
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      message.error('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleDeleteIndex = async (index: IndexConfig) => {
    try {
      if (!config) return;
      const newIndexes = config.indexes.filter(i => i.name !== index.name);
      const res = await updateTableIndexes(elementId, newIndexes);
      if (res.code === 200) {
        message.success('删除成功');
        loadConfig();
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      message.error('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleSaveFunc = async () => {
    try {
      const values = await funcForm.validateFields();
      const funcStr = JSON.stringify(values);
      const res = await updateTableFunc(elementId, funcStr);
      if (res.code === 200) {
        message.success('保存成功');
        loadConfig();
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      message.error('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const fieldColumns = [
    {
      title: '字段名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '注释',
      dataIndex: 'comment',
      key: 'comment',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => FIELD_TYPES.find(t => t.value === type)?.label || type,
    },
    {
      title: '长度/精度',
      dataIndex: 'length',
      key: 'length',
    },
    {
      title: '小数位',
      dataIndex: 'decimal',
      key: 'decimal',
    },
    {
      title: '主键',
      dataIndex: 'primary_key',
      key: 'primary_key',
      render: (value: boolean) => value ? '是' : '否',
    },
    {
      title: '自增',
      dataIndex: 'auto_increment',
      key: 'auto_increment',
      render: (value: boolean) => value ? '是' : '否',
    },
    {
      title: '不为空',
      dataIndex: 'not_null',
      key: 'not_null',
      render: (value: boolean) => value ? '是' : '否',
    },
    {
      title: '默认值',
      dataIndex: 'default',
      key: 'default',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: FieldConfig) => (
        <Space size="middle">
          <a onClick={() => {
            setEditingField(record);
            fieldForm.setFieldsValue(record);
          }}>编辑</a>
          <a onClick={() => handleDeleteField(record)}>删除</a>
        </Space>
      ),
    },
  ];

  const indexColumns = [
    {
      title: '索引名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => INDEX_TYPES.find(t => t.value === type)?.label || type,
    },
    {
      title: '字段',
      dataIndex: 'fields',
      key: 'fields',
      render: (fields: string[]) => fields.join(', '),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: IndexConfig) => (
        <Space size="middle">
          <a onClick={() => {
            setEditingIndex(record);
            indexForm.setFieldsValue(record);
          }}>编辑</a>
          <a onClick={() => handleDeleteIndex(record)}>删除</a>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <Tabs.TabPane tab="基础信息" key="1">
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              label="表名"
              name="table_name"
              rules={[{ required: true, message: '请输入表名' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="显示名称"
              name="display_name"
              rules={[{ required: true, message: '请输入显示名称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="备注"
              name="description"
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleSaveBasic}>
                保存
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>

        <Tabs.TabPane tab="字段信息" key="2">
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={() => {
              setEditingField(null);
              fieldForm.resetFields();
            }}>
              新增字段
            </Button>
          </div>
          <Table
            columns={fieldColumns}
            dataSource={config?.fields}
            rowKey="name"
            pagination={false}
          />
          <Modal
            title={editingField ? '编辑字段' : '新增字段'}
            open={editingField !== null}
            onOk={handleSaveField}
            onCancel={() => {
              setEditingField(null);
              fieldForm.resetFields();
            }}
          >
            <Form form={fieldForm} layout="vertical">
              <Form.Item
                label="字段名"
                name="name"
                rules={[{ required: true, message: '请输入字段名' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="注释"
                name="comment"
                rules={[{ required: true, message: '请输入注释' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="类型"
                name="type"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select>
                  {FIELD_TYPES.map(type => (
                    <Option key={type.value} value={type.value}>{type.label}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="长度/精度"
                name="length"
              >
                <InputNumber min={0} />
              </Form.Item>
              <Form.Item
                label="小数位"
                name="decimal"
              >
                <InputNumber min={0} />
              </Form.Item>
              <Form.Item
                label="主键"
                name="primary_key"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="自增"
                name="auto_increment"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="不为空"
                name="not_null"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="默认值"
                name="default"
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>
        </Tabs.TabPane>

        <Tabs.TabPane tab="索引" key="3">
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={() => {
              setEditingIndex(null);
              indexForm.resetFields();
            }}>
              新增索引
            </Button>
          </div>
          <Table
            columns={indexColumns}
            dataSource={config?.indexes}
            rowKey="name"
            pagination={false}
          />
          <Modal
            title={editingIndex ? '编辑索引' : '新增索引'}
            open={editingIndex !== null}
            onOk={handleSaveIndex}
            onCancel={() => {
              setEditingIndex(null);
              indexForm.resetFields();
            }}
          >
            <Form form={indexForm} layout="vertical">
              <Form.Item
                label="索引名"
                name="name"
                rules={[{ required: true, message: '请输入索引名' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="类型"
                name="type"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select>
                  {INDEX_TYPES.map(type => (
                    <Option key={type.value} value={type.value}>{type.label}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="字段"
                name="fields"
                rules={[{ required: true, message: '请选择字段' }]}
              >
                <Select mode="multiple">
                  {config?.fields.map(field => (
                    <Option key={field.name} value={field.name}>
                      {field.comment || field.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Func配置" key="4">
          <Form
            form={funcForm}
            layout="vertical"
          >
            <Form.Item label="查询列" name={['query_cols']}>
              <Select
                mode="multiple"
                placeholder="选择查询列"
                options={config?.fields.map(field => ({
                  label: field.comment || field.name,
                  value: field.name,
                }))}
              />
            </Form.Item>
            <Form.Item label="隐藏列" name={['hide_cols']}>
              <Select
                mode="multiple"
                placeholder="选择隐藏列"
                options={config?.fields.map(field => ({
                  label: field.comment || field.name,
                  value: field.name,
                }))}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleSaveFunc}>
                保存
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default TableConfig;
