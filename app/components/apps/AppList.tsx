import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Modal, 
  Form, 
  Input, 
  message, 
  Spin,
  Empty,
  Typography 
} from 'antd';
import { 
  PlusOutlined, 
  AppstoreOutlined,
  SettingOutlined,
  ArrowRightOutlined 
} from '@ant-design/icons';
import { useNavigate } from '@remix-run/react';
import { useAppSelector, useAppDispatch } from '~/stores';
import { AppService } from '~/services/app';
import { setApps, setLoading, setError } from '~/stores/slices/appSlice';
import type { App, CreateAppDto } from '~/types/app';
import styles from './AppList.module.css';
import CreateAppModal from './CreateAppModal';
import { Authorized } from '~/utils/permission';

const { Title, Paragraph } = Typography;
const EMOJI_LIST = ['📊', '📈', '📱', '💼', '👥', '📦', '🔧', '📝', '📅', '📚'];

const AppList: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { apps, loading, error } = useAppSelector((state) => state.app);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // 使用useCallback缓存函数
  const loadApps = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await AppService.getApps();
      console.log('API Response:', response); // 调试日志
      
      if (response.code === 200 && response.data) {
        const items = response.data.items || [];
        dispatch(setApps(items));
      } else {
        dispatch(setError(response.message || '获取应用列表失败'));
      }
    } catch (err) {
      console.error('Load apps error:', err);
      dispatch(setError('获取应用列表失败'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // 创建新应用
  const handleCreate = useCallback(async (values: CreateAppDto) => {
    try {
      const icon = EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];
      const data = {
        ...values,
        icon,
      };

      const response = await AppService.createApp(data);
      if (response.code === 200) {
        message.success('创建成功');
        setCreateModalVisible(false);
        loadApps();
      } else {
        message.error(response.message || '创建失败');
      }
    } catch (err) {
      console.error('Create app error:', err);
      message.error('创建失败');
    }
  }, [loadApps]);

  // 进入应用
  const handleEnterApp = useCallback((app: App) => {
    navigate(`/dashboard/${app.id}`);
  }, [navigate]);

  useEffect(() => {
    console.log('Loading apps...'); // 调试日志
    loadApps();
  }, [loadApps]);

  if (loading) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '48px'
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            欢迎使用灵简低代码平台
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 0 }}>
            选择一个应用开始工作，或创建新的应用
          </Paragraph>
        </div>
        <Authorized permission="btn:app_manage">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
            size="large"
          >
            创建应用
          </Button>
        </Authorized>
      </div>

      <div className={styles.content}>
        {apps && apps.length > 0 ? (
          <div className={styles.cardGrid}>
            {apps.map((app: App) => (
              <Card 
                key={app.id}
                className={styles.card}
                hoverable
              >
                <div className={styles.cardMeta}>
                  <div className={styles.cardIcon}>
                    {app.icon || <AppstoreOutlined />}
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{app.name}</h3>
                    <p className={styles.cardDescription}>
                      {app.description || '暂无描述'}
                    </p>
                  </div>
                </div>
                <div className={styles.cardActions}>
                    <Button 
                      type="primary" 
                      icon={<ArrowRightOutlined />}
                      onClick={() => handleEnterApp(app)}
                    >
                      进入应用
                    </Button>
                  <Authorized permission="btn:app_manage">
                    <Button 
                      icon={<SettingOutlined />}
                      onClick={() => navigate(`/dashboard/${app.id}/settings`)}
                    >
                      设置
                    </Button>
                  </Authorized>
                </div>
              </Card>
            ))}
            <Authorized permission="btn:app_manage">
              <Card
                className={styles.card}
                hoverable
                onClick={() => setCreateModalVisible(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed #d9d9d9',
                  background: '#fafafa'
                }}
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
            </Authorized>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Empty 
              description={error || "暂无应用，点击上方按钮创建您的第一个应用"} 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>

      <CreateAppModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default AppList;
