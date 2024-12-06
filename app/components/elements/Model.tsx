import React, { useEffect, useState } from 'react';
import { Form, Input, Select, InputNumber, Switch, Row, Col, Spin, message } from 'antd';
import { useParams } from '@remix-run/react';
import {
  getModelConfig,
  getModelData,
  type ModelConfig,
  type ModelConfiguration
} from '~/services/element';

export default function Model() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ModelConfig | null>(null);
  const [configuration, setConfiguration] = useState<ModelConfiguration | null>(null);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [form] = Form.useForm();

  // 根据字段类型返回对应的表单组件
  const getFieldComponent = (field: ModelConfiguration['fields'][0]) => {
    switch (field.type) {
      case 'string':
        return <Input placeholder={`请输入${field.label}`} />;
      case 'number':
        return <InputNumber style={{ width: '100%' }} placeholder={`请输入${field.label}`} />;
      case 'boolean':
        return <Switch />;
      case 'select':
        return (
          <Select placeholder={`请选择${field.label}`}>
            {field.options?.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        );
      default:
        return <Input placeholder={`请输入${field.label}`} />;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // 获取模型配置
        const configRes = await getModelConfig(id);
        if (configRes.code === 200 && configRes.data) {
          setConfig(configRes.data);
          
          // 解析configuration字段
          try {
            const configData = JSON.parse(configRes.data.configuration);
            setConfiguration(configData);
          } catch (e) {
            console.error('解析configuration字段失败:', e);
            message.error('解析模型配置失败');
            return;
          }
        } else {
          message.error('获取模型配置失败');
          return;
        }

        // 获取模型数据
        const dataRes = await getModelData(id);
        if (dataRes.code === 200 && Array.isArray(dataRes.data)) {
          setData(dataRes.data);
          // 如果有数据,设置表单初始值
          if (dataRes.data.length > 0) {
            form.setFieldsValue(dataRes.data[0]);
          }
        } else {
          message.error('获取模型数据失败');
        }
      } catch (error) {
        console.error('加载模型数据失败:', error);
        message.error('加载模型数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, form]);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {config && (
        <div style={{ marginBottom: '24px' }}>
          <h2>{config.display_name}</h2>
          {config.description && <p>{config.description}</p>}
        </div>
      )}
      
      {configuration && (
        <Form
          form={form}
          layout="vertical"
          disabled={true} // 只读模式
        >
          <Row gutter={configuration.layout?.gutter || 24}>
            {configuration.fields.map(field => (
              <Col 
                key={field.name}
                span={24 / (configuration.layout?.columns || 1)}
              >
                <Form.Item
                  label={field.label}
                  name={field.name}
                  required={field.required}
                >
                  {getFieldComponent(field)}
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      )}
    </div>
  );
}
