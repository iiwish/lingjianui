import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Switch, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PermissionService, type Permission, type CreatePermissionRequest } from '~/services/permission';

interface PermissionListProps {
  appId: string;
}

type PermissionFormData = CreatePermissionRequest;

const PERMISSION_TYPES = [
  { label: '菜单权限', value: 'menu' },
  { label: '接口权限', value: 'api' },
  { label: '按钮权限', value: 'button' },
  { label: '数据权限', value: 'data' }
];

const HTTP_METHODS = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' }
];

export default function PermissionList({ appId }: PermissionListProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [form] = Form.useForm<PermissionFormData>();

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await PermissionService.getPermissions();
      setPermissions(response.data || []);
    } catch (error) {
      message.error('获取权限列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: PermissionFormData) => {
    try {
      if (editingPermission) {
        await PermissionService.updatePermission(editingPermission.id, values);
        message.success('更新权限成功');
      } else {
        await PermissionService.createPermission(values);
        message.success('创建权限成功');
      }
      setModalVisible(false);
      setEditingPermission(null);
      form.resetFields();
      fetchPermissions();
    } catch (error) {
      message.error(editingPermission ? '更新权限失败' : '创建权限失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await PermissionService.deletePermission(id);
      message.success('删除权限成功');
      fetchPermissions();
    } catch (error) {
      message.error('删除权限失败');
    }
  };

  const handleStatusChange = async (checked: boolean, record: Permission) => {
    try {
      await PermissionService.updatePermission(record.id, {
        status: checked ? 1 : 0
      });
      message.success('更新状态成功');
      fetchPermissions();
    } catch (error) {
      message.error('更新状态失败');
    }
  };

  const columns: ColumnsType<Permission> = [
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '权限编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '权限类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const item = PERMISSION_TYPES.find(t => t.value === type);
        return item ? item.label : type;
      },
      filters: PERMISSION_TYPES.map(type => ({
        text: type.label,
        value: type.value
      })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '请求方法',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => method || '-',
    },
    {
      title: '请求路径',
      dataIndex: 'path',
      key: 'path',
      render: (path: string) => path || '-',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number, record) => (
        <Switch
          checked={status === 1}
          onChange={(checked) => handleStatusChange(checked, record)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => {
              setEditingPermission(record);
              form.setFieldsValue({
                name: record.name,
                code: record.code,
                type: record.type,
                method: record.method,
                path: record.path,
                description: record.description
              });
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchPermissions();
  }, [appId]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          onClick={() => {
            setEditingPermission(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          新建权限
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={permissions}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingPermission ? '编辑权限' : '新建权限'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          setEditingPermission(null);
          form.resetFields();
        }}
        width={600}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="权限名称"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="权限编码"
            rules={[{ required: true, message: '请输入权限编码' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="权限类型"
            rules={[{ required: true, message: '请选择权限类型' }]}
          >
            <Select
              options={PERMISSION_TYPES}
              onChange={(value) => {
                form.setFieldsValue({
                  method: undefined,
                  path: undefined
                });
              }}
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              if (type === 'api') {
                return (
                  <>
                    <Form.Item
                      name="method"
                      label="请求方法"
                      rules={[{ required: true, message: '请选择请求方法' }]}
                    >
                      <Select options={HTTP_METHODS} />
                    </Form.Item>
                    <Form.Item
                      name="path"
                      label="请求路径"
                      rules={[{ required: true, message: '请输入请求路径' }]}
                    >
                      <Input />
                    </Form.Item>
                  </>
                );
              }
              return null;
            }}
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
