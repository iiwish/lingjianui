import React from 'react';
import { Form, Input } from 'antd';
import type { TableTabComponentProps } from '~/types/config/table';
import { useAppSelector, useAppDispatch } from '~/stores';
import { setBasicInfoModified } from '~/stores/slices/config/tableConfigSlice';

interface Props extends TableTabComponentProps {
  isNew?: boolean;
  parentId?: string;
}

const BasicInfo: React.FC<Props> = ({ elementId, appCode, config, isNew, parentId }) => {
  const { currentApp } = useAppSelector(state => state.app);
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const prefix = appCode !== "sys" ? `app_${appCode}_` : '';

  // 分割表名和前缀
  const splitTableName = (fullName: string) => {
    if (appCode === "sys") return fullName;
    const prefixRegex = new RegExp(`^app_${appCode}_`);
    return fullName.replace(prefixRegex, '');
  };

  React.useEffect(() => {
    form.setFieldsValue({
      table_name: splitTableName(config.table_name || ''),
      display_name: config.display_name,
      description: config.description,
    });
  }, [config, appCode]);

  const handleValuesChange = () => {
    const values = form.getFieldsValue();
    const tableName = appCode !== "sys" ? `${prefix}${values.table_name}` : values.table_name;
    
    if (isNew) {
      const submitValues = {
        ...config,
        ...values,
        table_name: tableName,
        parent_id: Number(parentId)
      };
      dispatch(setBasicInfoModified({ isModified: true, data: submitValues }));
    } else {
      const submitValues = {
        ...values,
        table_name: tableName,
      };
      dispatch(setBasicInfoModified({ isModified: true, data: submitValues }));
    }
  };

  return (
    <Form 
      form={form} 
      layout="vertical"
      onValuesChange={handleValuesChange}
    >
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
    </Form>
  );
};

export default BasicInfo;
