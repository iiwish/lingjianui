import React from 'react';
import { Modal, Form, Input } from 'antd';
import { MenuService } from '~/services/element/menu';
import type { Menu as AppMenu } from '~/types/element/menu';

interface Props {
  open: boolean;
  onCancel: () => void;
  menu: AppMenu | null;
  onSuccess: () => void;
  elementId: string;
}

const MenuEditModal: React.FC<Props> = ({
  open,
  onCancel,
  menu,
  onSuccess,
  elementId
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && menu) {
      form.setFieldsValue({
        menu_name: menu.menu_name,
        menu_code: menu.menu_code,
        description: menu.description || '',
      });
    }
  }, [open, menu]);

  const handleSubmit = async (values: any) => {
    if (!menu) return;
    
    try {
      setLoading(true);
      const response = await MenuService.updateMenuItem(elementId,menu.id.toString(), {
        ...menu,
        menu_name: values.menu_name,
        menu_code: values.menu_code,
        description: values.description || '',
      });
      
      if (response.code === 200) {
        onSuccess();
        onCancel();
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (!menu) return '编辑';
    switch (menu.menu_type) {
      case 1:
        return '编辑文件夹';
      case 4:
        return '编辑菜单信息';
      default:
        return '编辑';
    }
  };

  return (
    <Modal
      title={getTitle()}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="menu_name"
          label="名称"
          rules={[{ required: true, message: '请输入名称' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="menu_code"
          label="编码"
          rules={[{ required: true, message: '请输入编码' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MenuEditModal;
