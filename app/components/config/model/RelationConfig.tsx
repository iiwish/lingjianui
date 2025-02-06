import React, { useState, useMemo } from 'react';
import { Form, Select, Button, Space, Card, Tooltip } from 'antd';
import { PlusOutlined, MinusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { ModelConfigItemRel, ModelConfigItemRelField } from '~/components/config/model/modelConfigTypes';
import { FieldConfig } from '~/types/config/table';
import FieldSelectorModal from './FieldSelectorModal';

const { Option } = Select;

// 常量定义
const RELATION_TYPES = [
  { value: '1:1', label: '一对一' },
  { value: '1:n', label: '一对多' },
] as const;

// 类型定义
interface RelationConfigProps {
  fields: FieldConfig[];
  parentFields?: FieldConfig[];
  value?: ModelConfigItemRel;
  onChange?: (value: ModelConfigItemRel) => void;
  disabled?: boolean;
}

interface SelectedFields {
  left?: string;
  right?: string;
}

interface Field {
  name: string;
  type: string;
  comment?: string;
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

  // 转换字段格式以适配FieldSelectorModal的要求
  const convertedFields = useMemo((): Field[] => 
    fields.map(field => ({
      name: field.name,
      type: field.column_type,
      comment: field.comment,
    })), [fields]
  );

  const convertedParentFields = useMemo((): Field[] => 
    parentFields.map(field => ({
      name: field.name,
      type: field.column_type,
      comment: field.comment,
    })), [parentFields]
  );

  const handleModalOk = (selected: SelectedFields) => {
    if (editingIndex !== null) {
      // 编辑现有字段
      const newFields = [...(value?.fields || [])];
      newFields[editingIndex] = {
        fromField: selected.right || '',
        toField: selected.left || '',
      };
      onChange?.({
        type: value?.type || '1:1',
        fields: newFields,
      });
    } else {
      // 添加新字段
      const newFields = [
        ...(value?.fields || []),
        {
          fromField: selected.right || '',
          toField: selected.left || '',
        },
      ];
      onChange?.({
        type: value?.type || '1:1',
        fields: newFields,
      });
    }
    setModalVisible(false);
  };

  const handleAddField = () => {
    const newFields = [...(value?.fields || []), { fromField: '', toField: '' }];
    onChange?.({
      type: value?.type || '1:1',
      fields: newFields,
    });
  };

  const handleRemoveField = (index: number) => {
    const newFields = [...(value?.fields || [])];
    newFields.splice(index, 1);
    onChange?.({
      type: value?.type || '1:1',
      fields: newFields,
    });
  };

  const handleTypeChange = (type: '1:1' | '1:n') => {
    onChange?.({
      type,
      fields: value?.fields || [],
    });
  };

  const handleFieldChange = (index: number, fieldType: 'fromField' | 'toField', fieldValue: string) => {
    const newFields = [...(value?.fields || [])];
    newFields[index] = { ...newFields[index], [fieldType]: fieldValue };
    onChange?.({
      type: value?.type || '1:1',
      fields: newFields,
    });
  };

  return (
    <Card size="small" title="关联关系配置" bordered={false}>
      <Form.Item
        label="关联类型"
        required
        tooltip="选择与父节点的关联类型"
        style={{ marginBottom: '24px' }}
      >
        <Select
          value={value?.type}
          onChange={handleTypeChange}
          style={{ width: '100%' }}
          disabled={disabled}
        >
          {RELATION_TYPES.map(({ value, label }) => (
            <Option key={value} value={value}>{label}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={
          <span>
            关联字段
            <Tooltip title="配置父表字段与当前表字段的映射关系。左侧选择父表字段，右侧选择当前表字段">
              <QuestionCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </span>
        }
        style={{ marginBottom: '24px' }}
        rules={[
          {
            validator: (_, fields: ModelConfigItemRelField[]) => {
              if (!fields?.length) {
                return Promise.reject(new Error('至少需要配置一个字段映射'));
              }
              const hasEmptyField = fields.some(field => !field.fromField || !field.toField);
              if (hasEmptyField) {
                return Promise.reject(new Error('所有字段映射必须完整'));
              }
              return Promise.resolve();
            }
          }
        ]}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%', display: 'flex' }}>
          {value?.fields?.map((field, index) => (
            <Space key={index} align="start" wrap style={{ width: '100%', gap: '16px', marginBottom: '16px' }}>
              <Select
                value={field.toField}
                onChange={(fieldValue) => handleFieldChange(index, 'toField', fieldValue)}
                style={{ width: 200, minWidth: 200 }}
                placeholder="选择父表字段"
                disabled={disabled}
              >
                {parentFields
                  .slice()
                  .sort((a, b) => (a.sort || 0) - (b.sort || 0))
                  .map(f => (
                    <Option key={f.name} value={f.name}>
                      {f.comment || f.name}
                    </Option>
                  ))}
              </Select>
              <span style={{ margin: '8px 16px' }}>→</span>
              <Select
                value={field.fromField}
                onChange={(fieldValue) => handleFieldChange(index, 'fromField', fieldValue)}
                style={{ width: 200, minWidth: 200 }}
                placeholder="选择当前表字段"
                disabled={disabled}
              >
                {fields
                  .slice()
                  .sort((a, b) => (a.sort || 0) - (b.sort || 0))
                  .map(f => (
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
        leftFields={convertedParentFields}
        rightFields={convertedFields}
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
