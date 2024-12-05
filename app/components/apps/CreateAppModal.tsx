import React from 'react';
import { Modal, Form, Input } from 'antd';
import AppForm from './AppForm';

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
      <AppForm form={form} onFinish={handleFinish} />
    </Modal>
  );
}
