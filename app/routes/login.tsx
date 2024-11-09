import React, { useEffect } from 'react';
import { Form, Input, Button, Card, App } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from '@remix-run/react';
import { useAppDispatch, useAppSelector } from '~/stores';
import { login, fetchUserInfo } from '~/stores/slices/authSlice';
import type { LoginParams } from '~/types/api';
import { AuthService } from '~/services';

export default function LoginPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  // 获取验证码
  const [captcha, setCaptcha] = React.useState<{
    captchaId: string;
    captchaImg: string;
  }>({ captchaId: '', captchaImg: '' });

  // 刷新验证码
  const refreshCaptcha = async () => {
    try {
      const result = await AuthService.getCaptcha();
      setCaptcha(result);
    } catch (err) {
      // 使用App.message替代message
      App.useApp().message.error('获取验证码失败');
    }
  };

  // 初始化获取验证码
  useEffect(() => {
    refreshCaptcha();
  }, []);

  // 处理登录错误
  useEffect(() => {
    if (error) {
      App.useApp().message.error(error);
    }
  }, [error]);

  // 处理表单提交
  const handleSubmit = async (values: LoginParams) => {
    try {
      // 登录
      await dispatch(login(values)).unwrap();
      // 获取用户信息
      await dispatch(fetchUserInfo()).unwrap();
      // 跳转到首页
      navigate('/');
    } catch (err) {
      // 登录失败刷新验证码
      refreshCaptcha();
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card title="灵简平台" style={{ width: 400 }}>
        <Form
          form={form}
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Form.Item
                name="captchaVal"
                noStyle
                rules={[{ required: true, message: '请输入验证码' }]}
              >
                <Input
                  prefix={<SafetyCertificateOutlined />}
                  placeholder="验证码"
                  size="large"
                  style={{ flex: 1 }}
                  autoComplete="off"
                />
              </Form.Item>
              <Button
                type="text"
                onClick={refreshCaptcha}
                style={{ padding: 0, height: 'auto' }}
                aria-label="刷新验证码"
              >
                {captcha.captchaImg && (
                  <img 
                    src={`data:image/svg+xml;base64,${captcha.captchaImg}`} 
                    alt="验证码" 
                    style={{ height: '32px' }}
                  />
                )}
              </Button>
            </div>
          </Form.Item>

          <Form.Item
            name="captchaId"
            initialValue={captcha.captchaId}
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
