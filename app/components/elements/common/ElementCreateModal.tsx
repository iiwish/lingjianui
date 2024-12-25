import React, { useState, useRef } from 'react';
import { Modal, Form, Input, message, Row, Col, Card } from 'antd';
import { useNavigate } from '@remix-run/react';
import { useAppDispatch, store } from '~/stores';
import { addTab, setActiveTab } from '~/stores/slices/tabSlice';
import { MenuService } from '~/services/menu';
import { routeTypeToMenuType } from '~/constants/elementType';
import { elementTypes } from '../assets/element-types';

enum Step {
  SelectType,
  InputForm
}

interface Props {
  open: boolean;
  onCancel: () => void;
  appCode: string;
  parentId: string;
  onSuccess: () => void;
}

const ElementCreateModal: React.FC<Props> = ({
  open,
  onCancel,
  appCode,
  parentId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(Step.SelectType);
  const [selectedType, setSelectedType] = useState<string>('');
  const formRef = useRef<any>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const state = store.getState();

  // 重置状态
  const handleCancel = () => {
    setSelectedType('');
    setCurrentStep(Step.SelectType);
    onCancel();
  };

  // 处理元素类型选择
  const handleTypeSelect = (type: string) => {
    const elementType = elementTypes.find(item => item.type === type);
    if (!elementType) return;

    setSelectedType(type);

    if (elementType.needConfig) {
      // 对于需要配置的类型,直接打开配置tab
      const path = `/dashboard/${appCode}/config/${type}/new?parentId=${parentId}`;
      dispatch(addTab({
        key: path,
        title: `新建${elementType.name}`,
        closable: true
      }));
      dispatch(setActiveTab(path));
      navigate(path);
      handleCancel();
    } else {
      // 对于folder和menu,进入下一步填写表单
      setCurrentStep(Step.InputForm);
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // 构建创建菜单的参数
      const params = {
        app_id: state.app.currentApp?.id?.toString() || '',
        menu_name: values.name,
        menu_code: values.code,
        menu_type: routeTypeToMenuType[selectedType],
        parent_id: Number(parentId),
        icon: selectedType,
        status: 1
      };

      // 调用创建接口
      const res = await MenuService.createMenu(params);
      if (res.code === 200) {
        message.success('创建成功');
        onSuccess();
        handleCancel();
      } else {
        message.error(res.message || '创建失败');
      }
    } catch (error) {
      console.error('创建失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const [form] = Form.useForm();
  
  React.useEffect(() => {
    formRef.current = form;
  }, [form]);

  const renderContent = () => {
    if (currentStep === Step.SelectType) {
      return (
        <Row gutter={[16, 16]}>
          {elementTypes.map(type => (
            <Col span={8} key={type.type}>
              <Card
                hoverable
                onClick={() => handleTypeSelect(type.type)}
                style={{ textAlign: 'center', height: '100%' }}
                styles={{ 
                  body: {
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    padding: '24px 16px'
                  }
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12, color: '#1890ff' }}>
                  {React.createElement(type.icon)}
                </div>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                  {type.name}
                </div>
                <div style={{ fontSize: 14, color: '#666' }}>
                  {type.description}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      );
    }
    
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ padding: '8px 0' }}
      >
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入名称' }]}
        >
          <Input placeholder="请输入名称" />
        </Form.Item>

        <Form.Item
          name="code"
          label="编码"
          rules={[{ required: true, message: '请输入编码' }]}
        >
          <Input placeholder="请输入编码" />
        </Form.Item>
      </Form>
    );
  };

  return (
    <Modal
      title="新建元素"
      open={open}
      onCancel={handleCancel}
      onOk={currentStep === Step.InputForm ? () => formRef.current?.submit() : undefined}
      confirmLoading={loading}
      footer={currentStep === Step.SelectType ? null : undefined}
      width={currentStep === Step.SelectType ? 800 : 520}
      centered
    >
      {renderContent()}
    </Modal>
  );
};

export default ElementCreateModal;
