import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  List, 
  Modal, 
  Form, 
  Input, 
  message, 
  Spin 
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
import { setApps, setLoading } from '~/stores/slices/appSlice';
import type { App, CreateAppDto } from '~/types/app';
import styles from './AppList.module.css';

const AppList: FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { apps, loading } = useAppSelector((state) => state.app);

  // 模态框状态
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // 加载应用列表
  const loadApps = async () => {
    try {
      dispatch(setLoading(true));
      const response = await AppService.getApps();
      if (response.code === 200) {
        dispatch(setApps(response.data.list));
      } else {
        message.error(response.message || '获取应用列表失败');
      }
    } catch (err) {
      message.error('获取应用列表失败');
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  // 创建新应用
  const handleCreate = async (values: CreateAppDto) => {
    try {
      const response = await AppService.createApp(values);
      if (response.code === 200) {
        message.success('创建成功');
        setCreateModalVisible(false);
        form.resetFields();
        loadApps();
      } else {
        message.error(response.message || '创建失败');
      }
    } catch (err) {
      message.error('创建失败');
    }
  };

  // 进入应用
  const handleEnterApp = (app: App) => {
    navigate(`/dashboard/${app.id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>我的应用</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          创建应用
        </Button>
      </div>

      <div className={styles.content}>
        <Spin spinning={loading}>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={apps}
            renderItem={(item: App) => (
              <List.Item>
                <Card 
                  className={styles.card}
                  hoverable
                >
                  <div className={styles.cardMeta}>
                    <AppstoreOutlined className={styles.cardIcon} />
                    <div className={styles.cardContent}>
                      <h3 className={styles.cardTitle}>{item.name}</h3>
                      <p className={styles.cardDescription}>
                        {item.description || '暂无描述'}
                      </p>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <Button 
                      type="primary" 
                      icon={<ArrowRightOutlined />}
                      onClick={() => handleEnterApp(item)}
                    >
                      进入应用
                    </Button>
                    <Button 
                      icon={<SettingOutlined />}
                      onClick={() => navigate(`/dashboard/${item.id}/settings`)}
                    >
                      设置
                    </Button>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Spin>
      </div>

      {/* 创建应用模态框 */}
      <Modal
        title="创建应用"
        open={createModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          onFinish={handleCreate}
          layout="vertical"
          className={styles.modalForm}
        >
          <Form.Item
            name="name"
            label="应用名称"
            rules={[{ required: true, message: '请输入应用名称' }]}
          >
            <Input placeholder="请输入应用名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="应用描述"
          >
            <Input.TextArea placeholder="请输入应用描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AppList;
