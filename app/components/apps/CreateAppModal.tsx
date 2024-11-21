import React from 'react';
import { Modal, Form, Input } from 'antd';

interface CreateAppModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
}

export default function CreateAppModal({ visible, onClose, onSubmit }: CreateAppModalProps) {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    console.log('Form values:', values);
    onSubmit(values);
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止事件冒泡
    e.stopPropagation(); // 阻止事件冒泡
    console.log('Modal OK clicked');
    form.submit();
  };

  return (
    <Modal
      title="创建新应用"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        onFinish={handleFinish}
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
            { max: 50, message: '应用编码不能超过50个字符' },
            { 
              pattern: /^[a-zA-Z0-9_-]+$/, 
              message: '应用编码只能包含英文、数字、下划线和连字符' 
            }
          ]}
        >
          <Input placeholder="请输入应用编码" />
        </Form.Item>

        <Form.Item
          name="description"
          label="应用描述"
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
