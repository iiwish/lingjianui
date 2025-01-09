import React, { useState } from 'react';
import { Form, Select, Button, Space, Card } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { ModelConfigItemRel } from '~/types/element_model';
import FieldSelectorModal from './FieldSelectorModal';

const { Option } = Select;

interface RelationConfigProps {
  fields: any[];
  parentFields?: any[];
  value?: ModelConfigItemRel;
  onChange?: (value: ModelConfigItemRel) => void;
  disabled?: boolean;
}

const RelationConfig: React.FC<RelationConfigProps> = ({
  fields,
  parentFields = [],
  value,
  onChange,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleModalOk = (selected: { left?: string; right?: string }) => {
    if (editingIndex !== null) {
      // 编辑现有字段
      const newFields = [...(value?.fields || [])];
      newFields[editingIndex] = {
        fromField: selected.right || '',
        toField: selected.left || '',
      };
      onChange?.({ ...value, fields: newFields } as ModelConfigItemRel);
    } else {
      // 添加新字段
      const newFields = [
        ...(value?.fields || []),
        {
          fromField: selected.right || '',
          toField: selected.left || '',
        },
      ];
      onChange?.({ ...value, fields: newFields } as ModelConfigItemRel);
    }
    setModalVisible(false);
  };
  const handleAddField = () => {
    const newFields = [...(value?.fields || []), { fromField: '', toField: '' }];
    onChange?.({ ...value, fields: newFields } as ModelConfigItemRel);
  };

  const handleRemoveField = (index: number) => {
    const newFields = [...(value?.fields || [])];
    newFields.splice(index, 1);
    onChange?.({ ...value, fields: newFields } as ModelConfigItemRel);
  };

  return (
    <Card size="small" title="关联关系配置" bordered={false}>
      <Form.Item
        label="关联类型"
        required
        tooltip="选择与父节点的关联类型"
      >
        <Select
          value={value?.type}
          onChange={(type) => onChange?.({ ...value, fields: value?.fields || [], type } as ModelConfigItemRel)}
          style={{ width: '100%' }}
          disabled={disabled}
        >
          <Option value="1:1">一对一</Option>
          <Option value="1:n">一对多</Option>
        </Select>
      </Form.Item>

      <Form.Item 
        label="关联字段"
        tooltip="配置本表字段与父表字段的映射关系"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {value?.fields?.map((field, index) => (
            <Space key={index} align="baseline" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Select
                value={field.fromField}
                onChange={(fromField) => {
                  const newFields = [...(value?.fields || [])];
                  newFields[index] = { ...field, fromField };
                  onChange?.({ ...value, fields: newFields } as ModelConfigItemRel);
                }}
                style={{ width: 200 }}
                placeholder="当前表字段"
                disabled={disabled}
              >
                {fields.map(f => (
                  <Option key={f.name} value={f.name}>
                    {f.comment || f.name}
                  </Option>
                ))}
              </Select>
              <Select
                value={field.toField}
                onChange={(toField) => {
                  const newFields = [...(value?.fields || [])];
                  newFields[index] = { ...field, toField };
                  onChange?.({ ...value, fields: newFields } as ModelConfigItemRel);
                }}
                style={{ width: 200 }}
                placeholder="父表字段"
                disabled={disabled}
              >
                {parentFields.map(f => (
                  <Option key={f.name} value={f.name}>
                    {f.comment || f.name}
                  </Option>
                ))}
              </Select>
              <Button
                type="text"
                icon={<MinusCircleOutlined />}
                onClick={() => handleRemoveField(index)}
                disabled={disabled}
              />
            </Space>
          ))}
          <Button
            type="dashed"
            onClick={handleAddField}
            block
            icon={<PlusOutlined />}
            disabled={disabled}
          >
            添加字段映射
          </Button>
        </Space>
      </Form.Item>

      <FieldSelectorModal
        visible={modalVisible}
        leftFields={parentFields}
        rightFields={fields}
        selectedFields={{
          left: editingIndex !== null ? value?.fields[editingIndex]?.toField : undefined,
          right: editingIndex !== null ? value?.fields[editingIndex]?.fromField : undefined,
        }}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
      />
    </Card>
  );
};

export default RelationConfig;
