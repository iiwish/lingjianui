import React, { useEffect } from 'react';
import { Form, Select, Radio, Space, Card, Row, Col, Switch, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { TableTabComponentProps } from '~/types/config/table';
import { useAppDispatch } from '~/stores';
import { setFuncModified } from '~/stores/slices/config/tableConfigSlice';

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

const ConditionGroupEditor: React.FC<{
  namePath: (string | number)[];
  config: any;
}> = ({ namePath, config }) => {
  return (
    <Card size="small" style={{ marginBottom: 8, border: '1px solid #ddd' }}>
      <Row gutter={16} align="middle" style={{ marginBottom: 8 }}>
        <Col flex="0 0 auto">
          <Form.Item label="逻辑" name={[...namePath, 'logic']} noStyle>
            <Radio.Group>
              <Radio value="AND">AND</Radio>
              <Radio value="OR">OR</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col flex="1 1 auto" style={{ textAlign: 'right' }}>
          <Form.List name={[...namePath, 'conditions']}>
            {(fields, { add }) => (
              <Space>
                <Button
                  size="small"
                  onClick={() => add({ itemType: 'condition' })}
                  icon={<PlusOutlined />}
                >
                  单条条件
                </Button>
                <Button
                  size="small"
                  onClick={() => add({ itemType: 'group', logic: 'AND', conditions: [] })}
                  icon={<PlusOutlined />}
                >
                  子条件组
                </Button>
              </Space>
            )}
          </Form.List>
        </Col>
      </Row>

      <Form.List name={[...namePath, 'conditions']}>
        {(fields, { remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <Card
                size="small"
                key={key}
                style={{ marginBottom: 8 }}
                bodyStyle={{ padding: 8, position: 'relative' }}
              >
                <Form.Item name={[name, 'itemType']} initialValue="condition" style={{ marginBottom: 8 }}>
                  <Radio.Group>
                    <Radio value="condition">单条条件</Radio>
                    <Radio value="group">子条件组</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldValue }) => {
                    const itemType = getFieldValue([...namePath, 'conditions', name, 'itemType']);
                    if (itemType === 'group') {
                      return (
                        <ConditionGroupEditor
                          namePath={[...namePath, 'conditions', name]}
                          config={config}
                        />
                      );
                    }
                    return (
                      <Row gutter={16}>
                        <Col span={10}>
                          <Form.Item
                            name={[name, 'col']}
                            rules={[{ required: true, message: '请选择筛选列' }]}
                          >
                            <Select
                              placeholder="选择筛选列"
                              options={config?.fields.map((field: any) => ({
                                label: field.comment || field.name,
                                value: field.name,
                              }))}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item
                            name={[name, 'type']}
                            rules={[{ required: true, message: '请选择查询类型' }]}
                          >
                            <Select placeholder="选择查询类型" options={queryTypes} />
                          </Form.Item>
                        </Col>
                      </Row>
                    );
                  }}
                </Form.Item>
                <MinusCircleOutlined
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                  onClick={() => remove(name)}
                />
              </Card>
            ))}
          </>
        )}
      </Form.List>
    </Card>
  );
};

const FuncConfig: React.FC<TableTabComponentProps> = ({ config }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (config.func) {
      try {
        const funcData = JSON.parse(config.func);
        if (!funcData.queryCondition) {
          funcData.queryCondition = {
            root: { logic: 'AND', conditions: [] },
            orderBy: [],
            groupBy: []
          };
        }
        form.setFieldsValue(funcData);
      } catch (e) {
        console.error('解析func字段失败:', e);
      }
    }
  }, [config, form]);

  const handleValuesChange = async () => {
    try {
      const values = await form.validateFields();
      if (!values.queryCondition) {
        values.queryCondition = {
          root: { logic: 'AND', conditions: [] },
          orderBy: [],
          groupBy: []
        };
      }
      const funcStr = JSON.stringify(values);
      dispatch(setFuncModified({ isModified: true, data: funcStr }));
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  return (
    <Form 
      form={form} 
      layout="vertical"
      onValuesChange={handleValuesChange}
    >
      <Form.Item label="查询条件">
        <ConditionGroupEditor namePath={['queryCondition', 'root']} config={config} />
      </Form.Item>

      <Form.Item label="允许自定义筛选" name="custom_filter" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item label="查询列" name="query_cols">
        <Select
          mode="multiple"
          placeholder="选择查询列"
          options={config?.fields.map((field: any) => ({
            label: field.comment || field.name,
            value: field.name,
          }))}
        />
      </Form.Item>

      <Form.Item label="隐藏列" name="hide_cols">
        <Select
          mode="multiple"
          placeholder="选择隐藏列"
          options={config?.fields.map((field: any) => ({
            label: field.comment || field.name,
            value: field.name,
          }))}
        />
      </Form.Item>
    </Form>
  );
};

export default FuncConfig;
