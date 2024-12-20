import React, { useState } from 'react';
import { Button, Table, Modal, Form, Input, Select, Space, message } from 'antd';
import { updateTableIndexes } from '~/services/element';
import { INDEX_MONTHODS } from './constants';
import type { TabComponentProps, IndexConfig } from './types';

const { Option } = Select;

const IndexInfo: React.FC<TabComponentProps> = ({ elementId, config, onReload }) => {
  const [form] = Form.useForm();
  const [editingIndex, setEditingIndex] = useState<IndexConfig | null>(null);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
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
        form.resetFields();
        onReload();
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      message.error('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleDelete = async (index: IndexConfig) => {
    try {
      if (!config) return;
      const newIndexes = config.indexes.filter(i => i.name !== index.name);
      const res = await updateTableIndexes(elementId, newIndexes);
      if (res.code === 200) {
        message.success('删除成功');
        onReload();
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      message.error('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const columns = [
    {
      title: '索引名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => INDEX_MONTHODS.find(t => t.value === type)?.label || type,
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
            form.setFieldsValue(record);
          }}>编辑</a>
          <a onClick={() => handleDelete(record)}>删除</a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => {
          setEditingIndex(null);
          form.resetFields();
        }}>
          新增索引
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={config?.indexes}
        rowKey="name"
        pagination={false}
      />
      <Modal
        title={editingIndex ? '编辑索引' : '新增索引'}
        open={editingIndex !== null}
        onOk={handleSave}
        onCancel={() => {
          setEditingIndex(null);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="索引名"
            name="name"
            rules={[{ required: true, message: '请输入索引名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="方法"
            name="type"
            rules={[{ required: true, message: '请选择方法' }]}
          >
            <Select>
              {INDEX_MONTHODS.map(type => (
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
    </>
  );
};

export default IndexInfo;
