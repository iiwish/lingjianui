import React, { useEffect, useState } from 'react';
import { Form as AntForm, Input, InputNumber, Select, Switch, Button, Row, Col, Spin, message } from 'antd';
import type { SwitchProps, InputProps, InputNumberProps, SelectProps } from 'antd';
import type { TextAreaProps } from 'antd/es/input';
import {
  getFormConfig,
  getFormData,
  type FormConfig,
  type FormConfiguration
} from '~/services/element';
import type { ElementProps } from '~/types/element';

type FieldProps = {
  string: InputProps;
  number: InputNumberProps;
  boolean: SwitchProps;
  select: SelectProps;
  textarea: TextAreaProps;
};

const Form: React.FC<ElementProps> = ({ elementId, appId }) => {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [configuration, setConfiguration] = useState<FormConfiguration | null>(null);
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [form] = AntForm.useForm();

  // 根据字段类型返回对应的表单组件
  const getFieldComponent = (field: FormConfiguration['fields'][0]) => {
    const { type, props = {} } = field;

    // 移除不兼容的props
    const { options, ...restProps } = props;

    switch (type) {
      case 'string':
        return <Input {...(restProps as InputProps)} />;
      case 'number':
        return <InputNumber style={{ width: '100%' }} {...(restProps as InputNumberProps)} />;
      case 'boolean':
        return <Switch {...(restProps as SwitchProps)} />;
      case 'select':
        return (
          <Select {...(restProps as SelectProps)} options={options} />
        );
      case 'textarea':
        return <Input.TextArea {...(restProps as TextAreaProps)} />;
      default:
        return <Input {...(restProps as InputProps)} />;
    }
  };

  // 转换验证规则
  const transformRules = (field: FormConfiguration['fields'][0]) => {
    const rules = field.rules || [];
    return rules.map(rule => {
      const baseRule: Record<string, any> = {
        message: rule.message,
      };

      switch (rule.type) {
        case 'required':
          baseRule.required = true;
          break;
        case 'pattern':
          if (rule.pattern) {
            baseRule.pattern = new RegExp(rule.pattern);
          }
          break;
        case 'min':
          if (typeof rule.min === 'number') {
            baseRule.min = rule.min;
          }
          break;
        case 'max':
          if (typeof rule.max === 'number') {
            baseRule.max = rule.max;
          }
          break;
      }

      return baseRule;
    });
  };

  useEffect(() => {
    const loadData = async () => {
      if (!elementId || !appId) return;

      try {
        setLoading(true);

        // 获取表单配置
        const configRes = await getFormConfig(appId, elementId);
        if (configRes.code === 200 && configRes.data) {
          setConfig(configRes.data);
          
          // 解析configuration字段
          try {
            const configData = JSON.parse(configRes.data.configuration);
            setConfiguration(configData);
          } catch (e) {
            console.error('解析configuration字段失败:', e);
            message.error('解析表单配置失败');
            return;
          }
        } else {
          message.error('获取表单配置失败');
          return;
        }

        // 获取表单数据
        const dataRes = await getFormData(appId, elementId);
        if (dataRes.code === 200 && dataRes.data) {
          setData(dataRes.data);
          form.setFieldsValue(dataRes.data);
        }
      } catch (error) {
        console.error('加载表单数据失败:', error);
        message.error('加载表单数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [elementId, appId, form]);

  // 处理表单提交
  const handleSubmit = async (values: Record<string, any>) => {
    console.log('表单值:', values);
    message.success('提交成功');
  };

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
        <AntForm
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          {...configuration.layout}
        >
          <Row gutter={configuration.layout?.gutter || 24}>
            {configuration.fields.map(field => (
              <Col 
                key={field.name}
                span={24 / (configuration.layout?.columns || 1)}
              >
                <AntForm.Item
                  label={field.label}
                  name={field.name}
                  rules={transformRules(field)}
                >
                  {getFieldComponent(field)}
                </AntForm.Item>
              </Col>
            ))}
          </Row>

          {/* 操作按钮 */}
          <Row justify="end" style={{ marginTop: '24px' }}>
            {configuration.actions?.map((action, index) => (
              <Button
                key={index}
                type={action.type === 'submit' ? 'primary' : 'default'}
                htmlType={action.type === 'submit' ? 'submit' : 'button'}
                style={{ marginLeft: index > 0 ? '8px' : 0 }}
                {...action.props}
              >
                {action.label}
              </Button>
            ))}
          </Row>
        </AntForm>
      )}
    </div>
  );
};

export default Form;
