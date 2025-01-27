import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import { getModel, createModel, updateModel } from '~/services/config/model';
import { useAppDispatch, RootState } from '~/stores';
import { setModelData, setParentId } from '~/components/config/model/modelConfigSlice';
import type { ModelData, CreateModelRequest, UpdateModelRequest } from '~/components/config/model/modelConfigTypes';
import { ElementProps } from '~/types/common'

export const useModelData = ({ elementId, parentId }: ElementProps) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const modelData = useSelector((state: RootState) => state.modelConfig);

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
        dispatch(setModelData(res.data));
        setModelData(res.data);
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

    try {
      const isNew = elementId === 'new';
      if (isNew) {
        const modelConfig: CreateModelRequest = {
          model_code: formValues.model_code,
          display_name: formValues.display_name,
          description: formValues.description,
          status: 1,
          configuration: modelData.configuration,
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
          configuration: modelData.configuration,
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
  };
};
