import React from 'react';
import { Form, Select, Button, Space, Card } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { ModelConfigItemDim } from '~/types/element_model';

const { Option } = Select;

interface DimensionConfigProps {
  fields: any[];
  dimensions: any[];
  value?: ModelConfigItemDim[];
  onChange?: (value: ModelConfigItemDim[]) => void;
  disabled?: boolean;
}

const DimensionConfig: React.FC<DimensionConfigProps> = ({
  fields,
  dimensions,
  value = [],
  onChange,
  disabled = false,
}) => {
  const handleAddDimension = () => {
    const newDimensions = [
      ...value,
      {
        dim_id: 0,
        item_id: 0,
        dim_field: '',
        table_field: '',
        type: 'children',
      } as ModelConfigItemDim,
    ];
    onChange?.(newDimensions);
  };

  const handleRemoveDimension = (index: number) => {
    const newDimensions = [...value];
    newDimensions.splice(index, 1);
    onChange?.(newDimensions);
  };

  const handleDimensionChange = (index: number, field: string, newValue: any) => {
    const newDimensions = [...value];
    newDimensions[index] = {
      ...newDimensions[index],
      [field]: newValue,
    };
    onChange?.(newDimensions);
  };

  return (
    <Card size="small" title="维度配置" bordered={false}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {value.map((dimension, index) => (
          <Card
            key={index}
            size="small"
            type="inner"
            title={`维度 ${index + 1}`}
            extra={
              <Button
                type="text"
                icon={<MinusCircleOutlined />}
                onClick={() => handleRemoveDimension(index)}
                disabled={disabled}
              />
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                label="维度"
                required
                tooltip="选择要关联的维度"
              >
                <Select
                  value={dimension.dim_id}
                  onChange={(value) => handleDimensionChange(index, 'dim_id', value)}
                  style={{ width: '100%' }}
                  placeholder="请选择维度"
                  disabled={disabled}
                >
                  {dimensions.map((dim) => (
                    <Option key={dim.id} value={dim.id}>
                      {dim.display_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="维度字段"
                required
                tooltip="选择维度表中用于关联的字段"
              >
                <Select
                  value={dimension.dim_field}
                  onChange={(value) => handleDimensionChange(index, 'dim_field', value)}
                  style={{ width: '100%' }}
                  placeholder="请选择维度字段"
                  disabled={disabled}
                >
                  {dimension.dim_id && dimensions
                    .find((d) => d.id === dimension.dim_id)
                    ?.fields.map((field: any) => (
                      <Option key={field.name} value={field.name}>
                        {field.comment || field.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="表格字段"
                required
                tooltip="选择当前表中用于关联的字段"
              >
                <Select
                  value={dimension.table_field}
                  onChange={(value) => handleDimensionChange(index, 'table_field', value)}
                  style={{ width: '100%' }}
                  placeholder="请选择表格字段"
                  disabled={disabled}
                >
                  {fields.map((field) => (
                    <Option key={field.name} value={field.name}>
                      {field.comment || field.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="关联类型"
                required
                tooltip="选择维度关联的范围类型"
              >
                <Select
                  value={dimension.type}
                  onChange={(value) => handleDimensionChange(index, 'type', value)}
                  style={{ width: '100%' }}
                  disabled={disabled}
                >
                  <Option value="children">子节点</Option>
                  <Option value="descendants">所有后代</Option>
                  <Option value="leaves">叶子节点</Option>
                </Select>
              </Form.Item>
            </Space>
          </Card>
        ))}

        <Button
          type="dashed"
          onClick={handleAddDimension}
          block
          icon={<PlusOutlined />}
          disabled={disabled}
        >
          添加维度配置
        </Button>
      </Space>
    </Card>
  );
};

export default DimensionConfig;
