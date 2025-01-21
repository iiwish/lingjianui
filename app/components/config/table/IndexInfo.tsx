import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, Select, Space } from 'antd';
import { INDEX_MONTHODS } from './constants';
import type { TableTabComponentProps, IndexConfig } from '~/types/config/table';
import { useAppDispatch } from '~/stores';
import { setIndexesModified } from '~/stores/slices/config/tableConfigSlice';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const IndexInfo: React.FC<TableTabComponentProps> = ({ config }) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [editingIndex, setEditingIndex] = useState<IndexConfig | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [indexes, setIndexes] = useState<IndexConfig[]>([]);

  useEffect(() => {
    if (config?.indexes) {
      setIndexes(config.indexes);
    }
  }, [config]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // 构建符合接口要求的数据格式
      const updateData = {
        updateType: editingIndex ? 'modify' : 'add',
        index: values,
        oldIndexName: editingIndex?.name
      };

      let newIndexes = [...indexes];
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

      setIndexes(newIndexes);
      dispatch(setIndexesModified({ 
        isModified: true, 
        data: [updateData]
      }));
      setEditingIndex(null);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleDelete = async (index: IndexConfig) => {
    const newIndexes = indexes.filter(i => i.name !== index.name);
    setIndexes(newIndexes);
    
    // 构建删除操作的数据格式
    const updateData = {
      updateType: 'drop',
      index: null,
      oldIndexName: index.name
    };

    dispatch(setIndexesModified({ 
      isModified: true, 
      data: [updateData]
    }));
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
          <Button 
            type="text" 
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
            setEditingIndex(record);
            form.setFieldsValue(record);
            setIsModalVisible(true);
          }}

          />
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />  
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
          setIsModalVisible(true);
        }}>
          新增索引
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={indexes}
        rowKey="name"
        pagination={false}
        size="small"
      />
      <Modal
        title={editingIndex ? '编辑索引' : '新增索引'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setEditingIndex(null);
          form.resetFields();
          setIsModalVisible(false);
        }}
      >
        <Form 
          form={form} 
          layout="vertical"
          preserve={false}
        >
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
