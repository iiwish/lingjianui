import React from 'react';
import { Form, Select, Button, message, Row, Col } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { updateTableFunc } from '~/services/element';
import type { TabComponentProps } from './types';

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

const FuncConfig: React.FC<TabComponentProps> = ({ elementId, config, onReload }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (config.func) {
      try {
        const funcData = JSON.parse(config.func);
        form.setFieldsValue(funcData);
      } catch (e) {
        console.error('解析func字段失败:', e);
      }
    }
  }, [config]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const funcStr = JSON.stringify(values);
      const res = await updateTableFunc(elementId, funcStr);
      console.log('保存结果:', res);
      if (res.code === 200) {
        message.success('保存成功');
        onReload();
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      message.error('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Form.List name="filter">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, fieldKey, ...restField }) => (
              <Row key={key} gutter={16}>
                <Col span={10}>
                  <Form.Item
                    {...restField}
                    name={[name, 'col']}
                    rules={[{ required: true, message: '请选择筛选列' }]}
                  >
                    <Select
                      placeholder="选择筛选列"
                      options={config?.fields.map(field => ({
                        label: field.comment || field.name,
                        value: field.name,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item
                    {...restField}
                    name={[name, 'type']}
                  >
                    <Select
                      placeholder="选择查询类型"
                      options={queryTypes}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Col>
              </Row>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                添加筛选条件
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
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
        <Button type="primary" onClick={handleSave}>
          保存
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FuncConfig;