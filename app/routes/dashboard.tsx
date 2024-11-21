import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Typography, Spin, Empty, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from '@remix-run/react';
import MainLayout from '~/components/layouts/MainLayout';
import CreateAppModal from '~/components/apps/CreateAppModal';
import { useAppDispatch, useAppSelector } from '~/stores';
import { setApps, setLoading, setError } from '~/stores/slices/appSlice';
import { AppService } from '~/services/app';
import { logout } from '~/stores/slices/authSlice';

const { Title, Paragraph } = Typography;

const EMOJI_LIST = ['📊', '📈', '📱', '💼', '👥', '📦', '🔧', '📝', '📅', '📚'];

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { apps, loading, error } = useAppSelector((state) => state.app);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // 获取应用列表
  const fetchApps = async () => {
    try {
      dispatch(setLoading(true));
      const response = await AppService.getApps();
      
      // 只处理成功的响应
      if (response.code === 200) {
        dispatch(setApps(response.data.items || []));
      }
      // 401错误由http拦截器统一处理
    } catch (err: any) {
      // 只处理非401错误
      if (err?.code !== 401) {
        const errorMessage = err?.message || '获取应用列表失败';
        dispatch(setError(errorMessage));
        message.error(errorMessage);
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const loadApps = async () => {
      try {
        if (mounted) {
          await fetchApps();
        }
      } catch (error) {
        // 如果不是401错误，5秒后重试
        if ((error as any)?.code !== 401 && mounted) {
          retryTimeout = setTimeout(loadApps, 5000);
        }
      }
    };

    loadApps();

    // 清理函数
    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, []);

  const handleAppClick = (appId: string) => {
    navigate(`/dashboard/${appId}`);
  };

  // 创建新应用
  const handleCreate = async (values: any) => {
    try {
      // 随机选择一个emoji作为图标
      const icon = EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];
      const data = {
        ...values,
        icon,
      };

      console.log('Creating app with data:', data);
      const response = await AppService.createApp(data);
      if (response.code === 200) {
        message.success('创建成功');
        setCreateModalVisible(false);
        fetchApps(); // 刷新应用列表
      } else {
        message.error(response.message || '创建失败');
      }
    } catch (err) {
      console.error('Create app error:', err);
      message.error('创建失败');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%' 
        }}>
          <Spin size="large" fullscreen tip="加载中..." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto',
        minHeight: 'calc(100vh - 120px)' // 减去头部和页脚的高度
      }}>
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            欢迎, {user?.nickname || user?.username}
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            选择一个应用开始工作，或创建新的应用
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {apps.length > 0 ? (
            <>
              {apps.map((app) => (
                <Col xs={24} sm={12} md={8} key={app.id}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    onClick={() => handleAppClick(app.id)}
                    styles={{ body: { height: '100%' } }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      height: '100%' 
                    }}>
                      <div style={{ 
                        fontSize: '32px', 
                        marginBottom: '16px',
                        color: '#1890ff'
                      }}>
                        {app.icon}
                      </div>
                      <Title level={4} style={{ marginBottom: 8 }}>
                        {app.name}
                      </Title>
                      <Paragraph 
                        type="secondary"
                        style={{ 
                          flex: 1,
                          marginBottom: 0 
                        }}
                      >
                        {app.description}
                      </Paragraph>
                    </div>
                  </Card>
                </Col>
              ))}
            </>
          ) : (
            <Col span={24}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    {error || '暂无应用，点击下方按钮创建您的第一个应用'}
                  </span>
                }
              />
            </Col>
          )}
          
          <Col xs={24} sm={12} md={8}>
            <Card
              hoverable
              style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed #d9d9d9',
                background: '#fafafa'
              }}
              styles={{
                body: {
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              }}
              onClick={() => setCreateModalVisible(true)}
            >
              <div style={{ textAlign: 'center' }}>
                <Button 
                  type="dashed"
                  icon={<PlusOutlined />}
                  size="large"
                  style={{ 
                    height: 'auto',
                    padding: '8px 16px',
                    marginBottom: 8
                  }}
                >
                  创建新应用
                </Button>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  创建一个新的应用来开始您的工作
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <CreateAppModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreate}
      />
    </MainLayout>
  );
}
