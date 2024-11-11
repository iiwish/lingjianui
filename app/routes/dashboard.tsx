import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Typography, Spin, Empty, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from '@remix-run/react';
import MainLayout from '~/components/layouts/MainLayout';
import CreateAppModal from '~/components/apps/CreateAppModal';
import { useAppDispatch, useAppSelector } from '~/stores';
import { setApps, setLoading, setError } from '~/stores/slices/appSlice';
import { appService } from '~/services/app';

const { Title, Paragraph } = Typography;

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
      const response = await appService.getApps();
      dispatch(setApps(response.data.list));
    } catch (err) {
      if (err instanceof Error) {
        dispatch(setError(err.message));
        message.error(err.message);
      } else {
        dispatch(setError('获取应用列表失败'));
        message.error('获取应用列表失败');
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleAppClick = (appId: string) => {
    navigate(`/dashboard/${appId}`);
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
          <Spin size="large" tip="加载中..." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
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
                    bodyStyle={{ height: '100%' }}
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
              bodyStyle={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
      />
    </MainLayout>
  );
}
