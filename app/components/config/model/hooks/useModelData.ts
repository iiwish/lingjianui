import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getModel, createModel, updateModel } from '~/services/element_model';
import { useAppDispatch } from '~/stores';
import { setParentId, setConfig } from '~/stores/slices/modelConfigSlice';
import type { ModelConfigItem } from '~/types/element_model';

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

  const handleSave = async (storeParentId: string | null) => {
    if (!modelData) {
      message.error('请先添加根节点');
      return;
    }

    try {
      const modelConfig = {
        id: elementId === 'new' ? 0 : parseInt(elementId),
        model_name: 'model',
        display_name: 'Model',
        description: '',
        status: 1,
        configuration: modelData,
        parent_id: storeParentId ? parseInt(storeParentId) : 0,
      };

      if (elementId === 'new') {
        await createModel(modelConfig);
      } else {
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
