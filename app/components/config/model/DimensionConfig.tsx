import React, { useEffect, useState } from 'react';
import { Form, Select, Button, Space, Card, TreeSelect } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { ModelConfigItemDim } from '~/types/element_model';
import type { TreeSelectNode } from './types';
import { getDimensionConfig,CustomColumn } from '~/services/element';


const { Option } = Select;

interface DimensionConfigProps {
  fields: any[];
  dimensions: any[];
  tables: TreeSelectNode[];
  value?: ModelConfigItemDim[];
  onChange?: (value: ModelConfigItemDim[]) => void;
  disabled?: boolean;
}

const DimensionConfig: React.FC<DimensionConfigProps> = ({
  fields,
  tables,
  value = [],
  onChange,
  disabled = false,
}) => {
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);

  useEffect(() => {
    const fetchDimensionConfig = async (dimId: number) => {
      try {
        const response = await getDimensionConfig(dimId.toString());
        setCustomColumns(response.data.custom_columns || []);
      } catch (error) {
        console.error('Failed to fetch dimension config:', error);
        setCustomColumns([]);
      }
    };

    if (value.length > 0) {
      const lastDim = value[value.length - 1];
      fetchDimensionConfig(lastDim.dim_id);
    }
  }, [value]);

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
                  allowClear
                >
                  {fields
                    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
                    .map((field) => (
                      <Option key={field.name} value={field.name}>
                        {field.comment || field.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                label="关联维度"
                required
                tooltip="选择要关联的维度"
              >
                <TreeSelect
                  onChange={(value) => {
                    if (value) {
                      const selectedDim = tables.find(t => t.data?.id.toString() === value);
                      handleDimensionChange(index, 'dim_id', selectedDim?.data?.source_id);
                    }
                  }}
                  style={{ width: '100%' }}
                  placeholder="请选择维度"
                  disabled={disabled}
                  allowClear
                  treeDefaultExpandAll
                  treeData={tables.map(table => ({
                    title: table.title,
                    value: table.value,
                    key: table.key,
                    selectable: table.data?.menu_type === 3,
                    disabled: table.data?.menu_type !== 3,
                    children: table.children?.map(child => ({
                      title: child.title,
                      value: child.value,
                      key: child.key,
                      selectable: child.data?.menu_type === 3,
                      disabled: child.data?.menu_type !== 3,
                    })) || []
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="维度字段"
                required
                tooltip="选择维度表中用于关联的字段"
              >
                <Select
                  key={dimension.dim_id} // 添加key强制重新渲染
                  value={dimension.dim_field}
                  defaultValue={"code"}
                  onChange={(value) => handleDimensionChange(index, 'dim_field', value)}
                  style={{ width: '100%' }}
                  placeholder="请选择维度字段"
                  disabled={disabled}
                  allowClear
                >
                  {/* 固定字段 */}
                  <Option value="node_id">节点ID</Option>
                  <Option value="parent_id">父节点ID</Option>
                  <Option value="name">名称</Option>
                  <Option value="code">编码</Option>
                  <Option value="description">描述</Option>
                  
                  {/* 自定义字段 */}
                  {customColumns.map((column) => (
                    <Option key={column.name} value={column.name}>
                      {column.comment || column.name}
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
