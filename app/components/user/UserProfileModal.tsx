import React, { useState } from 'react';
import { Modal, Form, Input, Tabs, message } from 'antd';
import { AuthService } from '~/services/auth';
import { useAppSelector, useAppDispatch } from '~/stores';
import { updateUserInfo } from '~/stores/slices/authSlice';
import { useEffect } from 'react';

interface UserProfileModalProps {
    visible: boolean;
    onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ visible, onClose }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const { user } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (visible && user) {
            profileForm.setFieldsValue({
                username: user.username,
                nickname: user.nickname,
                email: user.email,
                phone: user.phone,
            });
        }
    }, [visible, user]);

    const handleSubmit = async () => {
        try {
            if (activeTab === 'profile') {
                const values = await profileForm.validateFields();
                if (user?.id) {
                    const response = await AuthService.updateCurrentUser(values);
                    if (response.code === 200) {
                        message.success('个人信息更新成功');
                        // 更新 Redux store 中的用户信息
                        dispatch(updateUserInfo({
                            nickname: values.nickname,
                            email: values.email,
                            phone: values.phone,
                        }));
                        onClose();
                    } else {
                        message.error(response.message);
                    }
                }
            } else {
                const values = await passwordForm.validateFields();
                if (user?.id) {
                    const response = await AuthService.updatePassword(values);
                    if (response.code === 200) {
                        message.success('密码修改成功');
                        // 清空密码表单
                        passwordForm.resetFields();
                        onClose();
                    } else {
                        message.error(response.message);
                    }
                }
            }
        } catch (error) {
            console.error('Form validation failed:', error);
            message.error('操作失败');
        }
    };

    const items = [
        {
            key: 'profile',
            label: '基本信息',
            children: (
                <Form
                    form={profileForm}
                    layout="horizontal"
                    labelCol={{ span: 6 }}
                    initialValues={{
                        username: user?.username,
                        nickname: user?.nickname,
                        email: user?.email,
                        phone: user?.phone,
                    }}
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                    >
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        name="nickname"
                        label="昵称"
                    >
                        <Input placeholder="请输入昵称" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                            { type: 'email', message: '请输入有效的邮箱地址' },
                        ]}
                    >
                        <Input placeholder="请输入邮箱" />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="手机号"
                        rules={[
                            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
                        ]}
                    >
                        <Input placeholder="请输入手机号" />
                    </Form.Item>
                </Form>
            ),
        },
        {
            key: 'password',
            label: '修改密码',
            children: (
                <Form
                    form={passwordForm}
                    layout="horizontal"
                    labelCol={{ span: 6 }}
                >
                    <Form.Item
                        name="old_password"
                        label="当前密码"
                        rules={[{ required: true, message: '请输入当前密码' }]}
                    >
                        <Input.Password placeholder="请输入当前密码" />
                    </Form.Item>
                    <Form.Item
                        name="new_password"
                        label="新密码"
                        rules={[
                            { required: true, message: '请输入新密码' },
                            { min: 6, message: '密码长度不能小于6位' },
                            { max: 20, message: '密码长度不能超过20位' },
                            { pattern: /^[a-zA-Z0-9.-_]+$/, message: '密码只能包含字母、数字和.-_' },
                        ]}
                    >
                        <Input.Password placeholder="请输入新密码" />
                    </Form.Item>
                    <Form.Item
                        name="confirm_password"
                        label="确认新密码"
                        rules={[
                            { required: true, message: '请确认新密码' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('new_password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="请确认新密码" />
                    </Form.Item>
                </Form>
            ),
        },
    ];

    return (
        <Modal
            title="个人信息"
            open={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            width={500}
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={items}
            />
        </Modal>
    );
};

export default UserProfileModal;
