import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space } from 'antd';
import { EditOutlined, DeleteOutlined} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { UserService, type User, type CreateUserRequest } from '~/services/user';

interface UserListProps {
  appId: string;
}

export default function UserList({ appId }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isEdit, setIsEdit] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsEdit(false);
    setCurrentUserId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = async (id: number) => {
    try {
      const response = await UserService.getUser(id);
      form.setFieldsValue(response.data);
      setIsEdit(true);
      setCurrentUserId(id);
      setModalVisible(true);
    } catch (error) {
      message.error('获取用户信息失败');
    }
  }

  const handleDelete = async (id: number) => {
    // 弹窗确认
    Modal.confirm({
      title: '删除用户',
      content: '确认删除该用户吗？',
      onOk: async () => {
        try {
          await UserService.deleteUser(id);
          message.success('删除用户成功');
          fetchUsers();
        } catch (error) {
          message.error('删除用户失败');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    if (isEdit && currentUserId !== null) {
      // 编辑用户
      try {
        await UserService.updateUser(currentUserId, values);
        message.success('编辑用户成功');
        setModalVisible(false);
        form.resetFields();
        fetchUsers();
      } catch (error) {
        message.error('编辑用户失败');
      }
    } else {
      // 创建用户
      try {
        await UserService.createUser(values);
        message.success('创建用户成功');
        setModalVisible(false);
        form.resetFields();
        fetchUsers();
      } catch (error) {
        message.error('创建用户失败');
      }
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
    },
    // {
    //   title: '状态',
    //   dataIndex: 'status',
    //   key: 'status',
    //   render: (status: number) => (
    //     <span>{status === 1 ? '启用' : '禁用'}</span>
    //   ),
    // },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link"
            onClick={() => handleEdit(record.id)}
            icon={<EditOutlined />}
          ></Button>
          <Button 
            type="link" 
            onClick={() => handleDelete(record.id)}
            icon={<DeleteOutlined />}
          >
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, [appId]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          onClick={handleCreate}
        >
          新建用户
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        size="small"
      />

      <Modal
        title={isEdit ? '编辑用户' : '新建用户'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          labelCol={{ span: 4 }}
          size = "small"
          onFinish={handleSubmit}
          layout="horizontal"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: !isEdit, message: '请输入密码' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="nickname"
            label="昵称"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
