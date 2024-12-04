import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined} from '@ant-design/icons';
import { RoleService, type Role, type CreateRoleRequest } from '~/services/role';

interface RoleListProps {
  appId: string;
}

type RoleFormData = CreateRoleRequest;

export default function RoleList({ appId }: RoleListProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm<RoleFormData>();

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await RoleService.getRoles();
      setRoles(response.data || []);
    } catch (error) {
      message.error('获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: RoleFormData) => {
    try {
      if (editingRole) {
        await RoleService.updateRole(editingRole.id, values);
        message.success('更新角色成功');
      } else {
        await RoleService.createRole(values);
        message.success('创建角色成功');
      }
      setModalVisible(false);
      setEditingRole(null);
      form.resetFields();
      fetchRoles();
    } catch (error) {
      message.error(editingRole ? '更新角色失败' : '创建角色失败');
    }
  };

  const handleDelete = async (id: number) => {
    // 弹窗确认
    Modal.confirm({
      title: '删除角色',
      content: '确认删除该角色吗？',
      onOk: async () => {
        try {
          await RoleService.deleteRole(id);
          message.success('删除角色成功');
          fetchRoles();
        } catch (error) {
          message.error('删除角色失败');
        }
      },
    });
  };

  const handleStatusChange = async (checked: boolean, record: Role) => {
    try {
      await RoleService.updateRole(record.id, {
        status: checked ? 1 : 0
      });
      message.success('更新状态成功');
      fetchRoles();
    } catch (error) {
      message.error('更新状态失败');
    }
  };

  const columns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    // {
    //   title: '状态',
    //   dataIndex: 'status',
    //   key: 'status',
    //   render: (status: number, record) => (
    //     <Switch
    //       checked={status === 1}
    //       onChange={(checked) => handleStatusChange(checked, record)}
    //     />
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
            onClick={() => {
              setEditingRole(record);
              form.setFieldsValue({
                name: record.name,
                code: record.code,
                description: record.description
              });
              setModalVisible(true);
            }}
            icon={<EditOutlined />}
          >
          </Button>
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
    fetchRoles();
  }, [appId]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          onClick={() => {
            setEditingRole(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          新建角色
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={roles}
        loading={loading}
        rowKey="id"
        size="small"
      />

      <Modal
        title={editingRole ? '编辑角色' : '新建角色'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          setEditingRole(null);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色编码"
            rules={[{ required: true, message: '请输入角色编码' }]}
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
    </div>
  );
}
