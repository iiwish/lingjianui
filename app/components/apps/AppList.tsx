import type { FC } from 'react';
import { useState } from 'react';
import { 
  Card, 
  Button, 
  List, 
  Modal, 
  Form, 
  Input, 
  message, 
  Tabs,
  Empty,
  Spin 
} from 'antd';
import { 
  PlusOutlined, 
  AppstoreOutlined,
  SettingOutlined,
  ArrowRightOutlined 
} from '@ant-design/icons';
import { useAppSelector } from '~/stores';
import { AppService } from '~/services';
import type { AppInfo, AppTemplate } from '~/types/api';
import styles from './AppList.module.css';

const { TabPane } = Tabs;

interface CreateAppValues {
  name: string;
  code: string;
  description?: string;
}

interface CreateFromTemplateValues {
  name: string;
  code: string;
}

const AppList: FC = () => {
  const [form] = Form.useForm();
  const { appList, templates, loading } = useAppSelector((state) => state.app);

  // 模态框状态
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AppTemplate | null>(null);

  // 创建新应用
  const handleCreate = async (values: CreateAppValues) => {
    try {
      await AppService.createApp(values);
      message.success('创建成功');
      setCreateModalVisible(false);
      form.resetFields();
      // 刷新列表由父组件处理
    } catch (err) {
      message.error('创建失败');
    }
  };

  // 从模板创建应用
  const handleCreateFromTemplate = async (values: CreateFromTemplateValues) => {
    if (!selectedTemplate) return;
    
    try {
      await AppService.createFromTemplate(selectedTemplate.id, values);
      message.success('创建成功');
      setTemplateModalVisible(false);
      form.resetFields();
      setSelectedTemplate(null);
      // 刷新列表由父组件处理
    } catch (err) {
      message.error('创建失败');
    }
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

      <Tabs defaultActiveKey="apps" className={styles.tabs}>
        <TabPane tab="我的应用" key="apps">
          <div className={styles.tabContent}>
            <Spin spinning={loading}>
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                dataSource={appList}
                renderItem={(item: AppInfo) => (
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
                        >
                          进入应用
                        </Button>
                        <Button 
                          icon={<SettingOutlined />}
                        >
                          设置
                        </Button>
                      </div>
                    </Card>
                  </List.Item>
                )}
                locale={{
                  emptyText: (
                    <Empty
                      className={styles.emptyState}
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="暂无应用"
                    />
                  )
                }}
              />
            </Spin>
          </div>
        </TabPane>

        <TabPane tab="应用模板" key="templates">
          <div className={styles.tabContent}>
            <Spin spinning={loading}>
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                dataSource={templates}
                renderItem={(item: AppTemplate) => (
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
                          onClick={() => {
                            setSelectedTemplate(item);
                            setTemplateModalVisible(true);
                          }}
                        >
                          使用模板
                        </Button>
                      </div>
                    </Card>
                  </List.Item>
                )}
                locale={{
                  emptyText: (
                    <Empty
                      className={styles.emptyState}
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="暂无模板"
                    />
                  )
                }}
              />
            </Spin>
          </div>
        </TabPane>
      </Tabs>

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
            name="code"
            label="应用编码"
            rules={[
              { required: true, message: '请输入应用编码' },
              { pattern: /^[a-z0-9-]+$/, message: '只能包含小写字母、数字和连字符' }
            ]}
          >
            <Input placeholder="请输入应用编码" />
          </Form.Item>
          <Form.Item
            name="description"
            label="应用描述"
          >
            <Input.TextArea placeholder="请输入应用描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 使用模板模态框 */}
      <Modal
        title={`使用模板：${selectedTemplate?.name || ''}`}
        open={templateModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setTemplateModalVisible(false);
          setSelectedTemplate(null);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          onFinish={handleCreateFromTemplate}
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
            name="code"
            label="应用编码"
            rules={[
              { required: true, message: '请输入应用编码' },
              { pattern: /^[a-z0-9-]+$/, message: '只能包含小写字母、数字和连字符' }
            ]}
          >
            <Input placeholder="请输入应用编码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AppList;
