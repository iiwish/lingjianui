import React, { useEffect } from 'react';
import { Form, Input, Button, Card, ConfigProvider, App } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined, GithubOutlined } from '@ant-design/icons';
import { useNavigate } from '@remix-run/react';
import { useAppDispatch, useAppSelector } from '~/stores';
import { login, fetchUserInfo } from '~/stores/slices/authSlice';
import type { LoginParams, CaptchaResult } from '~/types/api';
import { AuthService } from '~/services';

export default function LoginPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  // 获取验证码
  // 修改验证码state的类型定义，匹配后端字段名
  const [captcha, setCaptcha] = React.useState<CaptchaResult | null>(null);

  // 刷新验证码
  const refreshCaptcha = async () => {
    try {
      const result = await AuthService.getCaptcha();
      console.log('验证码数据:', result); // 添加调试日志
      setCaptcha(result);
      // 自动设置 captchaId
      form.setFieldValue('captcha_id', result.captcha_id);
    } catch (err) {
      console.error('获取验证码失败:', err); // 添加错误日志
      App.useApp().message.error('获取验证码失败');
    }
  };

  // ��始化获取验证码
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
    <ConfigProvider
      theme={{
        components: {
          Card: {
            borderRadius: 8,
          },
          Button: {
            borderRadius: 4,
          },
          Input: {
            borderRadius: 4,
          },
        },
      }}
    >
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
        position: 'relative',
      }}>
        <Card
          title={<div style={{ textAlign: 'center', fontSize: '24px', color: '#1a1a1a' }}>灵简低代码平台</div>}
          style={{
            width: 400,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none',
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Form
            form={form}
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
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
                  name="captcha_val"  // 修改字段名
                  noStyle
                  rules={[{ required: true, message: '请输入验证码' }]}
                >
                  <Input
                    prefix={<SafetyCertificateOutlined />}
                    placeholder="验证码"
                    style={{ flex: 1 }}
                  />
                </Form.Item>
                <div 
                  onClick={refreshCaptcha}
                  style={{ 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    minWidth: '100px', // 添加最小宽度
                    height: '32px',    // 确保高度固定
                  }}
                >
                  {captcha?.captcha_img ? (
                    <img 
                      src={captcha.captcha_img}
                      alt="验证码"
                      style={{ height: '100%' }}
                    />
                  ) : (
                    <span>加载中...</span>
                  )}
                </div>
              </div>
            </Form.Item>

            <Form.Item
              name="captcha_id"  // 修改字段名
              initialValue={captcha?.captcha_id || ''}
              hidden
            >
              <Input />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={{ height: '40px' }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <div style={{
          position: 'absolute',
          bottom: '24px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <a 
              href="https://github.com/iiwish/lingjian" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#666', margin: '0 12px' }}
            >
              <GithubOutlined /> GitHub
            </a>
            <a 
              href="https://space.bilibili.com/11618958/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#666', margin: '0 12px' }}
            >
              <span style={{ fontWeight: 'bold' }}>B</span> BiliBili
            </a>
          </div>
          <div>Copyright © Beijing Wish Technology Co., Ltd</div>
        </div>
      </div>
    </ConfigProvider>
  );
}
