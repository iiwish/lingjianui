import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { updateTableConfig } from '~/services/element';
import type { TabComponentProps } from './types';

const BasicInfo: React.FC<TabComponentProps> = ({ elementId, appId, config, onReload }) => {
  const [form] = Form.useForm();
  const prefix = appId !== "1" ? `app${appId}_` : '';

  // 分割表名和前缀
  const splitTableName = (fullName: string) => {
    if (appId === "1") return fullName;
    const prefixRegex = new RegExp(`^app${appId}_`);
    return fullName.replace(prefixRegex, '');
  };

  React.useEffect(() => {
    form.setFieldsValue({
      table_name: splitTableName(config.table_name || ''),
      display_name: config.display_name,
      description: config.description,
    });
  }, [config, appId]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // 保存时加上前缀
      const submitValues = {
        ...values,
        table_name: appId !== "1" ? `${prefix}${values.table_name}` : values.table_name,
      };
      const res = await updateTableConfig(elementId, submitValues);
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
      <Form.Item
        label="表名"
        name="table_name"
        rules={[{ required: true, message: '请输入表名' }]}
      >
        <Input 
          addonBefore={prefix || null}
        />
      </Form.Item>
      <Form.Item
        label="显示名称"
        name="display_name"
        rules={[{ required: true, message: '请输入显示名称' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="备注" name="description">
        <Input.TextArea />
      </Form.Item>
      <Form.Item>
        <Button type="primary" onClick={handleSave}>
          保存
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BasicInfo;