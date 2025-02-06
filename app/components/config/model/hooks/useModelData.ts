import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import { getModel, createModel, updateModel } from '~/services/config/model';
import { useAppDispatch, RootState } from '~/stores';
import { setModelData, setParentId } from '~/components/config/model/modelConfigSlice';
import type { ModelData, CreateModelRequest, UpdateModelRequest } from '~/components/config/model/modelConfigTypes';
import { ElementProps } from '~/types/common';

// 类型定义
interface ModelFormValues {
  model_code: string;
  display_name: string;
  description: string;
}

interface SaveModelConfig {
  model_code: string;
  display_name: string;
  description: string;
  status: number;
  configuration: ModelData['configuration'];
}

export const useModelData = ({ elementId, parentId }: ElementProps) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const modelData = useSelector((state: RootState) => state.modelConfig);

  useEffect(() => {
    if (parentId) {
      dispatch(setParentId(parentId));
    }
    if (elementId === 'new') {
      // 初始化新模型数据
      dispatch(setModelData({
        id: 0,
        parent_id: parseInt(parentId || '0'),
        model_code: '',
        display_name: '',
        description: '',
        status: 1,
        configuration: {
          source_id: 0,
          name: '',
          relationships: {
            type: '1:1',
            fields: []
          },
          dimensions: [],
          childrens: []
        }
      }));
    } else {
      loadModelData();
    }
  }, [elementId, parentId]);

  const loadModelData = async () => {
    try {
      setLoading(true);
      const res = await getModel(elementId);
      if (res.code === 200 && res.data) {
        // 只需调用一次 dispatch，Redux 会处理状态更新
        dispatch(setModelData(res.data));
      }
    } catch (error) {
      console.error('加载模型数据失败:', error);
      message.error('加载模型数据失败');
    } finally {
      setLoading(false);
    }
  };

  const createBaseModelConfig = (formValues: ModelFormValues): SaveModelConfig => ({
    model_code: formValues.model_code,
    display_name: formValues.display_name,
    description: formValues.description,
    status: 1,
    configuration: modelData.configuration,
  });

  const handleSave = async (parentId: string, formValues: ModelFormValues) => {
    try {
      const baseConfig = createBaseModelConfig(formValues);
      const isNew = elementId === 'new';

      if (isNew) {
        const modelConfig: CreateModelRequest = {
          ...baseConfig,
          parent_id: parseInt(parentId || '0'),
        };
        await createModel(modelConfig);
      } else {
        const modelConfig: UpdateModelRequest = {
          ...baseConfig,
          id: parseInt(elementId),
        };
        await updateModel(elementId, modelConfig);
      }

      message.success('保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  return {
    loading,
    handleSave,
    modelData: modelData,
  };
};
