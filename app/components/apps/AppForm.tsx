
import React from 'react';
import { Form, Input } from 'antd';

interface AppFormProps {
  form: any;
  initialValues?: any;
  onFinish: (values: any) => void;
}

const AppForm: React.FC<AppFormProps> = ({ form, initialValues, onFinish }) => (
  <Form
    form={form}
    layout="vertical"
    initialValues={initialValues}
    onFinish={onFinish}
  >
    <Form.Item
      name="name"
      label="应用名称"
      rules={[
        { required: true, message: '请输入应用名称' },
        { max: 50, message: '应用名称不能超过50个字符' },
      ]}
    >
      <Input placeholder="请输入应用名称" />
    </Form.Item>
    <Form.Item
      name="code"
      label="应用编码"
      rules={[
        { required: true, message: '请输入应用编码' },
        { max: 50, message: '应用编码不能超过50个字符' },
        {
          pattern: /^[a-zA-Z][a-zA-Z0-9_]+$/,
          message: '字母开头，长度大于2，允许字母、数字和下划线',
        },
      ]}
    >
      <Input placeholder="请输入应用编码" />
    </Form.Item>
    <Form.Item
      name="description"
      label="应用描述"
      rules={[{ max: 200, message: '应用描述不能超过200个字符' }]}
    >
      <Input.TextArea placeholder="请输入应用描述" rows={4} />
    </Form.Item>
  </Form>
);

export default AppForm;