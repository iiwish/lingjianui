import React from 'react';
import { Form, Select, Input, DatePicker, InputNumber, Space, Button, Row, Col } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableConfig } from '~/services/element';
import type { TableFunc } from './Table';

const queryTypes = [
  { label: '等于', value: 'eq' },
  { label: '不等于', value: 'ne' },
  { label: '大于', value: 'gt' },
  { label: '大于等于', value: 'gte' },
  { label: '小于', value: 'lt' },
  { label: '小于等于', value: 'lte' },
  { label: '模糊查询', value: 'like' },
  { label: '不包含', value: 'not_like' },
  { label: 'IN查询', value: 'in' },
  { label: 'NOT IN查询', value: 'not_in' },
  { label: '区间查询', value: 'between' },
  { label: '不在区间', value: 'not_between' },
];

interface FilterAreaProps {
  config: TableConfig;
  func: TableFunc;
  onSearch: (values: any) => void;
}

const FilterArea: React.FC<FilterAreaProps> = ({ config, func, onSearch }) => {
  const [form] = Form.useForm();

  const customFilterEnabled = func.custom_filter !== false;

  const initialConditions =
    func.queryCondition?.root?.conditions && Array.isArray(func.queryCondition.root.conditions)
      ? func.queryCondition.root.conditions
      : [];

  /**
   * 根据字段类型和查询类型渲染对应输入组件
   */
  const getInputComponent = (field: any, queryType: string) => {
    if (!field || !field.column_type) {
      return <Input />;
    }
    const type = field.column_type.toLowerCase();

    // 区间查询
    if (queryType === 'between' || queryType === 'not_between') {
      if (type.includes('timestamp') || type.includes('datetime')) {
        return (
          <Space>
            <DatePicker showTime />
            <DatePicker showTime />
          </Space>
        );
      }
      if (type.includes('date')) {
        return (
          <Space>
            <DatePicker />
            <DatePicker />
          </Space>
        );
      }
      if (type.includes('int') || type.includes('float') || type.includes('double') || type.includes('decimal')) {
        return (
          <Space>
            <InputNumber style={{ width: '100px' }} />
            <InputNumber style={{ width: '100px' }} />
          </Space>
        );
      }
      return (
        <Space>
          <Input style={{ width: '100px' }} />
          <Input style={{ width: '100px' }} />
        </Space>
      );
    }

    // 单值查询
    if (type.includes('timestamp') || type.includes('datetime')) {
      return <DatePicker showTime />;
    }
    if (type.includes('date')) {
      return <DatePicker />;
    }
    if (type.includes('int') || type.includes('float') || type.includes('double') || type.includes('decimal')) {
      return <InputNumber style={{ width: '100%' }} />;
    }
    if (type === 'boolean') {
      return (
        <Select>
          <Select.Option value={true}>是</Select.Option>
          <Select.Option value={false}>否</Select.Option>
        </Select>
      );
    }
    if (field.enum_values) {
      return (
        <Select>
          {field.enum_values.map((value: string) => (
            <Select.Option key={value} value={value}>
              {value}
            </Select.Option>
          ))}
        </Select>
      );
    }
    return <Input />;
  };

  /**
   * 点击“查询”按钮时，将表单的值整理为conditions并回调
   */
  const handleSearch = async () => {
    try {
      const values = await form.validateFields();
      const filters = values.filters || [];
      const conditions = filters.map((item: any) => {
        let value = item.value;
        const fieldConfig = config.fields.find((f) => f.name === item.col);

        // 时间、日期类型处理
        if (fieldConfig && (fieldConfig.column_type.includes('timestamp') || fieldConfig.column_type.includes('date'))) {
          if (item.type === 'between' || item.type === 'not_between') {
            value = value.map((v: any) => (v ? v.format('YYYY-MM-DD HH:mm:ss') : null));
          } else {
            value = value ? value.format('YYYY-MM-DD HH:mm:ss') : null;
          }
        }
        return {
          itemType: 'condition',
          col: item.col,
          type: item.type,
          value,
        };
      });

      onSearch({
        queryCondition: {
          root: { logic: 'AND', conditions },
          orderBy: [],
          groupBy: [],
        },
      });
    } catch (error) {
      console.error('查询失败:', error);
    }
  };

  /**
   * 判断是否有可显示的筛选
   */
  const hasAnyCondition = initialConditions.length > 0;

  if (!hasAnyCondition && !customFilterEnabled) {
    // 不允许自定义且没有任何条件，直接不显示筛选区域
    return null;
  }

  return (
    <Form
      form={form}
      layout="inline"
      style={{ marginBottom: 16 }}
      initialValues={{
        filters: initialConditions,
      }}
    >
      <Form.List name="filters">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => {
              const { name } = field;
              const col = form.getFieldValue(['filters', name, 'col']);
              const fieldConfig = config.fields.find((f) => f.name === col);

              return (
                <Space key={field.key} align="baseline" style={{ marginBottom: 8 }} wrap>
                  <Form.Item
                    name={[name, 'col']}
                    rules={[{ required: true, message: '请选择字段' }]}
                  >
                    <Select
                      placeholder="字段"
                      options={config.fields.map((f) => ({
                        label: f.comment || f.name,
                        value: f.name,
                      }))}
                      disabled={!customFilterEnabled}
                      style={{ width: 120 }}
                    />
                  </Form.Item>
                  <Form.Item
                    name={[name, 'type']}
                    rules={[{ required: true, message: '查询类型' }]}
                  >
                    <Select
                      placeholder="查询类型"
                      options={queryTypes}
                      disabled={!customFilterEnabled}
                      style={{ width: 120 }}
                    />
                  </Form.Item>
                  <Form.Item
                    name={[name, 'value']}
                    rules={[{ required: true, message: '请输入查询值' }]}
                  >
                    {fieldConfig
                      ? getInputComponent(fieldConfig, form.getFieldValue(['filters', name, 'type']))
                      : <Input disabled={!customFilterEnabled} style={{ width: 160 }} />}
                  </Form.Item>
                  {customFilterEnabled && (
                    <MinusCircleOutlined
                      onClick={() => remove(name)}
                      style={{ cursor: 'pointer', color: 'red' }}
                    />
                  )}
                </Space>
              );
            })}

            {/* 仅当允许自定义时才能添加筛选条件 */}
            {customFilterEnabled && (
              <Form.Item style={{ marginBottom: 8 }}>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  添加筛选条件
                </Button>
              </Form.Item>
            )}
          </>
        )}
      </Form.List>

      {/* 仅当conditions有内容时才显示“查询”、“重置”按钮 */}
      { (hasAnyCondition || customFilterEnabled) && (
        <Form.Item style={{ marginBottom: 8 }}>
          <Space>
            <Button type="primary" onClick={handleSearch} disabled={!hasAnyCondition && !customFilterEnabled}>
              查询
            </Button>
            <Button onClick={() => form.resetFields()} disabled={!hasAnyCondition && !customFilterEnabled}>
              重置
            </Button>
          </Space>
        </Form.Item>
      )}
    </Form>
  );
};

export default FilterArea;