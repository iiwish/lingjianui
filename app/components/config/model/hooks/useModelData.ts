import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getModel, createModel, updateModel } from '~/services/element_model';
import { useAppDispatch } from '~/stores';
import { setParentId, setConfig } from '~/stores/slices/modelConfigSlice';
import type { ModelConfigItem, CreateModelRequest, UpdateModelRequest } from '~/types/element_model';

interface UseModelDataProps {
  elementId: string;
  parentId?: string | null;
}

export const useModelData = ({ elementId, parentId }: UseModelDataProps) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [modelData, setModelData] = useState<ModelConfigItem | null>(null);

  useEffect(() => {
    if (parentId) {
      dispatch(setParentId(parentId));
    }
    if (elementId !== 'new') {
      loadModelData();
    }
  }, [elementId, parentId]);

  const loadModelData = async () => {
    try {
      setLoading(true);
      const res = await getModel(elementId);
      if (res.code === 200 && res.data) {
        setModelData(res.data.configuration);
        dispatch(setConfig(res.data.configuration));
      }
    } catch (error) {
      console.error('加载模型数据失败:', error);
      message.error('加载模型数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (storeParentId: string | null, formValues: {
    model_code: string;
    display_name: string;
    description: string;
  }) => {
    if (!modelData) {
      message.error('请先添加根节点');
      return;
    }

    try {
      const isNew = elementId === 'new';
      if (isNew) {
        const modelConfig: CreateModelRequest = {
          model_code: formValues.model_code,
          display_name: formValues.display_name,
          description: formValues.description,
          status: 1,
          configuration: modelData,
          parent_id: parseInt(storeParentId || '0'),
        };
        await createModel(modelConfig);
      } else {
        const modelConfig: UpdateModelRequest = {
          id: parseInt(elementId),
          model_code: formValues.model_code,
          display_name: formValues.display_name,
          description: formValues.description,
          status: 1,
          configuration: modelData,
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
    modelData,
    setModelData,
    handleSave,
  };
};
