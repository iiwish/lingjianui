import React from 'react';
import { Form, Select, Button, Space, Card, TreeSelect } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setDimensionFields } from '~/components/config/model/modelConfigSlice';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { ModelConfigItemDim, MenuTreeNode } from '~/components/config/model/modelConfigTypes';
import { getDimensionConfig } from '~/services/config/dim';
import { CustomColumn } from '~/types/config/dim';
import { FieldConfig } from '~/types/config/table';
import { RootState } from '~/stores';

const { Option } = Select;

// 常量定义
const DIMENSION_TYPES = [
  { value: 'children', label: '子节点' },
  { value: 'descendants', label: '所有后代' },
  { value: 'leaves', label: '叶子节点' },
] as const;

const FIXED_DIMENSION_FIELDS = [
  { value: 'node_id', label: '节点ID' },
  { value: 'parent_id', label: '父节点ID' },
  { value: 'name', label: '名称' },
  { value: 'code', label: '编码' },
  { value: 'description', label: '描述' },
] as const;

interface DimensionConfigProps {
  fields: FieldConfig[];
  dimensions: ModelConfigItemDim[];
  tables: MenuTreeNode[];
  value?: ModelConfigItemDim[];
  onChange?: (value: ModelConfigItemDim[]) => void;
  disabled?: boolean;
}

// TreeSelect数据结构类型
interface TreeSelectNode {
  title: string;
  value: string;
  key: string;
  selectable: boolean;
  disabled: boolean;
  children?: TreeSelectNode[];
}

// 递归查找表格
const findNodeInTree = (tables: MenuTreeNode[], value: string): MenuTreeNode | undefined => {
  for (const table of tables) {
    if (table.key === value) {
      return table;
    }
    if (table.children) {
      const found = findNodeInTree(table.children, value);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

// 递归转换树结构
const transformTreeData = (tables: MenuTreeNode[]): TreeSelectNode[] => {
  return tables.map(table => ({
    title: table.title,
    value: table.value,
    key: table.key,
    selectable: table.data?.menu_type === 3,
    disabled: table.data?.menu_type !== 3,
    children: table.children ? transformTreeData(table.children) : undefined,
  }));
};

const DimensionConfig: React.FC<DimensionConfigProps> = ({
  fields,
  tables,
  value = [],
  onChange,
  disabled = false,
}) => {
  const dispatch = useDispatch();
  const dimensionFields = useSelector((state: RootState) => state.modelConfig.dimensions || {});

  const fetchDimensionConfig = async (dimId: number) => {
    try {
      const response = await getDimensionConfig(dimId.toString());
      dispatch(setDimensionFields({
        dimId,
        fields: response.data.custom_columns || []
      }));
    } catch (error) {
      console.error('Failed to fetch dimension config:', error);
      dispatch(setDimensionFields({
        dimId,
        fields: []
      }));
    }
  };

  const handleAddDimension = () => {
    const newDimensions = [
      ...value,
      {
        dim_id: 0,
        item_id: 0,
        dim_field: '',
        table_field: '',
        type: 'children' as const,
      },
    ];
    onChange?.(newDimensions);
  };

  const handleRemoveDimension = (index: number) => {
    const newDimensions = [...value];
    newDimensions.splice(index, 1);
    onChange?.(newDimensions);
  };

  const handleDimensionChange = (index: number, field: keyof ModelConfigItemDim, newValue: any) => {
    const newDimensions = [...value];
    const oldDimId = newDimensions[index].dim_id;
    newDimensions[index] = {
      ...newDimensions[index],
      [field]: newValue,
    };
    
    if (field === 'dim_id' && newValue !== oldDimId) {
      fetchDimensionConfig(newValue);
    }
    
    onChange?.(newDimensions);
  };

  return (
    <Card size="small" title="维度配置" bordered={false}>
      <Space direction="vertical" size="middle" style={{ width: '100%', display: 'flex' }}>
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
                      const selectedDim = findNodeInTree(tables, value);
                      handleDimensionChange(index, 'dim_id', selectedDim?.data?.source_id);
                    }
                  }}
                  style={{ width: '100%' }}
                  placeholder="请选择维度"
                  disabled={disabled}
                  allowClear
                  treeDefaultExpandAll
                  treeData={transformTreeData(tables)}
                />
              </Form.Item>

              <Form.Item
                label="维度字段"
                required
                tooltip="选择维度表中用于关联的字段"
              >
                <Select
                  key={dimension.dim_id}
                  value={dimension.dim_field}
                  defaultValue="code"
                  onChange={(value) => handleDimensionChange(index, 'dim_field', value)}
                  style={{ width: '100%' }}
                  placeholder="请选择维度字段"
                  disabled={disabled}
                  allowClear
                >
                  {FIXED_DIMENSION_FIELDS.map(({ value, label }) => (
                    <Option key={value} value={value}>{label}</Option>
                  ))}
                  
                  {(dimensionFields[dimension.dim_id] || []).map((column: CustomColumn) => (
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
                  {DIMENSION_TYPES.map(({ value, label }) => (
                    <Option key={value} value={value}>{label}</Option>
                  ))}
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
