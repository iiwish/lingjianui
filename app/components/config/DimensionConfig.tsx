import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Spin, Result, message } from 'antd';
import { useAppDispatch, useAppSelector } from '~/stores';
import { setConfig, resetModifiedState, setParentId } from '~/stores/slices/dimensionConfigSlice';
import {
  getDimensionConfig,
  createDimensionConfig,
  updateDimensionConfig,
  DimensionConfig as IDimensionConfig
} from '~/services/element';

interface Props {
  elementId: string;
  appCode: string;
  parentId?: string | null;
  visible: boolean;
  onCancel: () => void;
  onSuccess?: (path: string) => void;
}

const DimensionConfig: React.FC<Props> = ({ elementId, appCode, parentId, visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { isModified, modifiedConfig, parentId: storeParentId } = useAppSelector(state => state.dimensionConfig);

  const isNew = elementId === 'new';

  // 空的初始配置
  const emptyConfig: Partial<IDimensionConfig> = {
    table_name: '',
    display_name: '',
    description: '',
    status: 1
  };

  useEffect(() => {
    if (parentId) {
      dispatch(setParentId(parentId));
    }

    if (visible) {
      if (isNew) {
        form.setFieldsValue(emptyConfig);
      } else {
        loadConfig();
      }
    }
  }, [elementId, appCode, isNew, parentId, visible]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDimensionConfig(elementId);
      if (res.code === 200 && res.data) {
        message.success('创建成功');
        // todo navigate加上之后有一堆报错，先不加了
        // if (res.data?.id) {
        //   navigate(`/dashboard/${appCode}/config/dim/${res.data.id}`);
        // }
      } else {
        throw new Error(res.message || '加载配置失败');
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      setError(error instanceof Error ? error.message : '加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (isNew) {
        const configToCreate = {
          ...values,
          parent_id: storeParentId ? parseInt(storeParentId) : undefined,
        };

        const res = await createDimensionConfig(configToCreate);
        if (res.code === 200) {
          message.success('创建成功');
          onCancel();
          if (res.data?.id && onSuccess) {
            onSuccess(`/dashboard/${appCode}/config/dimension/${res.data.id}`);
          }
        } else {
          throw new Error(res.message || '创建失败');
        }
      } else {
        const res = await updateDimensionConfig(elementId, {
          ...values,
          app_id: parseInt(appCode)
        });
        if (res.code === 200) {
          message.success('保存成功');
          dispatch(resetModifiedState());
          onCancel();
          loadConfig();
        } else {
          throw new Error(res.message || '保存失败');
        }
      }
    } catch (error: any) {
      if (error.response?.data) {
        message.error('保存失败: ' + (error.response.data.message || '未知错误'));
      } else {
        message.error('保存失败: ' + (error.message || '未知错误'));
      }
    }
  };

  const modalContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      );
    }

    if (error) {
      return (
        <Result
          status="error"
          title="加载失败"
          subTitle={error}
          extra={[
            <Button key="retry" type="primary" onClick={loadConfig}>
              重试
            </Button>
          ]}
        />
      );
    }

    return (
      <Form
        form={form}
        layout="vertical"
        initialValues={emptyConfig}
      >
        <Form.Item
          name="table_name"
          label="数据表名"
          rules={[
            { required: true, message: '请输入数据表名' },
            { pattern: /^[A-Za-z][A-Za-z0-9_]*$/, message: '只允许大小写字母、数字和下划线，并且必须以字母开头' }
          ]}
        >
          <Input placeholder="请输入数据表名" />
        </Form.Item>

        <Form.Item
          name="display_name"
          label="显示名称"
          rules={[{ required: true, message: '请输入显示名称' }]}
        >
          <Input placeholder="请输入显示名称" />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea rows={4} placeholder="请输入描述" />
        </Form.Item>
      </Form>
    );
  };

  return (
    <Modal
      title={isNew ? '新建维度' : '编辑维度'}
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          保存
        </Button>
      ]}
    >
      {modalContent()}
    </Modal>
  );
};

export default DimensionConfig;
