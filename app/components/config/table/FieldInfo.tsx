import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber, Switch, Select, Space, message,Row,Col } from 'antd';
import { updateTableFields } from '~/services/element';
import { FIELD_TYPES } from './constants';
import type { TabComponentProps, FieldConfig } from './types';

const { Option } = Select;

// 工具函数
const parseDataType = (fullType: string) => {
  const match = fullType.match(/^(\w+)(?:\((\d+)(?:,(\d+))?\))?(\s+unsigned)?$/);
  if (!match) return { type: fullType };
  
  return {
    type: match[1],
    length: match[2],
    scale: match[3],
    unsigned: !!match[4]
  };
};

const buildDataType = (type: string, length?: string | number, scale?: string | number, unsigned = false) => {
  let result = type;
  if (length) {
    result += scale ? `(${length},${scale})` : `(${length})`;
  }
  if (unsigned) {
    result += ' unsigned';
  }
  return result;
};

// 数字类型列表
const NUMBER_TYPES = ['int', 'bigint', 'tinyint', 'smallint', 'mediumint'];
// 浮点类型列表
const FLOAT_TYPES = ['float', 'double', 'decimal'];

const FieldInfo: React.FC<TabComponentProps> = ({ elementId, config, onReload }) => {
  const [form] = Form.useForm();
  const [editingField, setEditingField] = useState<FieldConfig | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');

  // 监听类型变化
  useEffect(() => {
    if (!selectedType) return;
    
    // 清除不相关的字段值
    const isNumberType = NUMBER_TYPES.includes(selectedType);
    if (!isNumberType) {
      form.setFieldsValue({
        unsigned: false,
        auto_increment: false
      });
    }
  }, [selectedType, form]);

  // 处理编辑字段
  const handleEdit = (field: FieldConfig) => {
    const parsed = parseDataType(field.column_type);
    setSelectedType(parsed.type);
    setEditingField(field);
    form.setFieldsValue({
      ...field,
      type: parsed.type,
      length: parsed.length,
      scale: parsed.scale,
      unsigned: parsed.unsigned
    });
  };

  // 处理保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!config) return;
      
      // 构建column_type
      const column_type = buildDataType(
        values.type,
        values.length,
        values.scale,
        values.unsigned
      );

      let newFields = [...config.fields];
      const fieldData = {
        ...values,
        column_type,
        sort: editingField?.sort || newFields.length + 1
      };

      // 移除临时字段
      delete fieldData.type;
      delete fieldData.length;
      delete fieldData.scale;
      delete fieldData.unsigned;

      if (editingField) {
        const index = newFields.findIndex(f => f.name === editingField.name);
        if (index > -1) {
          newFields[index] = fieldData;
        }
      } else {
        newFields.push(fieldData);
      }

      const res = await updateTableFields(elementId, newFields);
      if (res.code === 200) {
        message.success('保存成功');
        setEditingField(null);
        form.resetFields();
        onReload();
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      message.error('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleDelete = async (field: FieldConfig) => {
    try {
      if (!config) return;
      const newFields = config.fields.filter(f => f.name !== field.name);
      const res = await updateTableFields(elementId, newFields);
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
      dataIndex: 'column_type',
      key: 'column_type',
      render: (type: string) => {
        const parsed = parseDataType(type);
        return `${parsed.type}${parsed.length ? `(${parsed.length}${parsed.scale ? `,${parsed.scale}` : ''})` : ''}${parsed.unsigned ? ' unsigned' : ''}`;
      }
    },
    {
      title: '主键',
      dataIndex: 'primary_key',
      key: 'primary_key',
      render: (value: boolean) => value ? '是' : '',
    },
    {
      title: '不为空',
      dataIndex: 'not_null',
      key: 'not_null',
      render: (value: boolean) => value ? '是' : '',
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
          <a onClick={() => handleEdit(record)}>编辑</a>
          <a onClick={() => handleDelete(record)}>删除</a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => {
          setEditingField(null);
          form.resetFields();
        }}>
          新增字段
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={config?.fields}
        rowKey="name"
        pagination={false}
      />
      <Modal
        title={editingField ? '编辑字段' : '新增字段'}
        open={editingField !== null}
        onOk={handleSave}
        onCancel={() => {
          setEditingField(null);
          setSelectedType('');
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          {/* 基本字段保持不变 */}
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
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="类型"
                name="type"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select onChange={(value) => setSelectedType(value)}>
                  {FIELD_TYPES.map(type => (
                    <Option key={type.value} value={type.value}>{type.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col>
              <Form.Item label="长度" name="length">
                <InputNumber min={0} />
              </Form.Item>
            </Col>
            {FLOAT_TYPES.includes(selectedType) && (
              <Col>
                <Form.Item label="小数位" name="scale">
                  <InputNumber min={0} />
                </Form.Item>
              </Col>
            )}
          </Row>
          <Row>
            <Col span={6}>
              <Form.Item
                label="主键"
                name="primary_key"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="不为空"
                name="not_null"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            {NUMBER_TYPES.includes(selectedType) && (
              <>
                <Col span={6}>
                  <Form.Item
                    label="自增"
                    name="auto_increment"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="无符号"
                    name="unsigned"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>

          <Form.Item
            label="默认值"
            name="default"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default FieldInfo;
