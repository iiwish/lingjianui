import React, { useState, useRef } from 'react';
import { Modal, Form, Input, message, Row, Col } from 'antd';
import { useNavigate } from '@remix-run/react';
import { useAppDispatch } from '~/stores';
import { addTab, setActiveTab } from '~/stores/slices/tabSlice';
import { MenuService } from '~/services/menu';
import { routeTypeToMenuType } from '~/constants/elementType';
import { elementTypes } from '../assets/element-types';
import styled from '@emotion/styled';

const ElementTypeCard = styled.div`
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;

  &:hover {
    border-color: #1890ff;
    background: #f6f8ff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  .icon {
    font-size: 32px;
    margin-bottom: 12px;
    color: #1890ff;
  }

  .title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .description {
    font-size: 14px;
    color: #666;
  }
`;

enum Step {
  SelectType,
  InputForm
}

interface Props {
  open: boolean;
  onCancel: () => void;
  appCode: string;
  parentId: number;
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
        app_id: appCode,
        menu_name: values.name,
        menu_code: values.code,
        menu_type: routeTypeToMenuType[selectedType],
        parent_id: parentId,
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

  const renderContent = () => {
    if (currentStep === Step.SelectType) {
      return (
        <Row gutter={[16, 16]}>
          {elementTypes.map(type => (
            <Col span={8} key={type.type}>
              <ElementTypeCard onClick={() => handleTypeSelect(type.type)}>
                <div className="icon">
                  {React.createElement(type.icon)}
                </div>
                <div className="title">{type.name}</div>
                <div className="description">{type.description}</div>
              </ElementTypeCard>
            </Col>
          ))}
        </Row>
      );
    }

    const [form] = Form.useForm();
    formRef.current = form;
    
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
    >
      {renderContent()}
    </Modal>
  );
};

export default ElementCreateModal;
