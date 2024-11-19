import React from 'react';
import { Modal, Form, Input } from 'antd';

interface CreateAppModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
}

export default function CreateAppModal({ visible, onClose, onSubmit }: CreateAppModalProps) {
  const [form] = Form.useForm();

  return (
    <Modal
      title="创建新应用"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        onFinish={onSubmit}
      >
        <Form.Item
          name="name"
          label="应用名称"
          rules={[
            { required: true, message: '请输入应用名称' },
            { max: 50, message: '应用名称不能超过50个字符' }
          ]}
        >
          <Input placeholder="请输入应用名称" />
        </Form.Item>

        <Form.Item
          name="code"
            label="应用编码"
            rules={[
              { required: true, message: '请输入应用编码' },
              { max: 50, message: '应用编码不能超过50个字符' }
            ]}
            >
            <Input placeholder="请输入应用编码" />
            </Form.Item>
            

        <Form.Item
          name="description"
          label="应用描述"
          rules={[
            { required: true, message: '请输入应用描述' },
            { max: 200, message: '应用描述不能超过200个字符' }
          ]}
        >
          <Input.TextArea 
            placeholder="请输入应用描述" 
            rows={4}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
