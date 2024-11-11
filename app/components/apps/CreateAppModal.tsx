import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useAppDispatch } from '~/stores';
import { appService } from '~/services/app';
import { addApp } from '~/stores/slices/appSlice';
import type { CreateAppDto } from '~/types/app';

interface CreateAppModalProps {
  visible: boolean;
  onClose: () => void;
}

const EMOJI_LIST = ['📊', '📈', '📱', '💼', '👥', '📦', '🔧', '📝', '📅', '📚'];

export default function CreateAppModal({ visible, onClose }: CreateAppModalProps) {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // 随机选择一个emoji作为图标
      const icon = EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];
      const data: CreateAppDto = {
        ...values,
        icon,
      };
      
      const response = await appService.createApp(data);
      dispatch(addApp(response.data));
      message.success('应用创建成功');
      form.resetFields();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('创建应用失败');
      }
    }
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
