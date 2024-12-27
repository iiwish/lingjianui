import React, { useEffect, useState } from 'react';
import { Tabs, Spin, Button, Result, message, Space } from 'antd';
import type { TabsProps } from 'antd';
import { useAppDispatch, useAppSelector } from '~/stores';
import { setConfig, resetModifiedState, setParentId } from '~/stores/slices/tableConfigSlice';
import { useNavigate, useLocation } from '@remix-run/react';
import { 
  getTableConfig,
  createTableConfig,
  updateTableConfig,
  TableConfig as ITableConfig,
  TableUpdateRequest,
  FieldConfig,
  IndexConfig
} from '~/services/element';
import BasicInfo from './table/BasicInfo';
import FieldInfo from './table/FieldInfo';
import IndexInfo from './table/IndexInfo';
import FuncConfig from './table/FuncConfig';

interface Props {
  elementId: string;
  appCode: string;
  parentId?: string | null;
}

const TableConfig: React.FC<Props> = ({ elementId, appCode, parentId }) => {
  const [localConfig, setLocalConfig] = useState<ITableConfig | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    isBasicInfoModified,
    isFieldsModified,
    isIndexesModified,
    isFuncModified,
    modifiedBasicInfo,
    modifiedFields,
    modifiedIndexes,
    modifiedFunc,
    parentId: storeParentId
  } = useAppSelector(state => state.tableConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState('1');

  const location = useLocation();
  const isNew = elementId === 'new';

  // 空的初始配置
  const emptyConfig: ITableConfig = {
    table_name: '',
    display_name: '',
    description: '',
    fields: [],
    indexes: [],
    func: ''
  };

  useEffect(() => {
    // 保存parentId到redux中
    if (parentId) {
      dispatch(setParentId(parentId));
    }

    if (isNew) {
      setLocalConfig(emptyConfig);
      dispatch(setConfig(emptyConfig));
      setLoading(false);
    } else {
      loadConfig();
    }
  }, [elementId, appCode, isNew, parentId]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading config for:', { elementId, appCode });
      const res = await getTableConfig(elementId);
      if (res.code === 200 && res.data) {
        setLocalConfig(res.data);
        dispatch(setConfig(res.data));
      } else {
        throw new Error(res.message || '加载配置失败');
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      setError(error instanceof Error ? error.message : '加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={error}
        extra={[
          <Button key="retry" type="primary" onClick={loadConfig}>
            重试
          </Button>
        ]}
      />
    );
  }

  // 如果没有配置数据，显示空状态
  if (!localConfig) {
    return (
      <Result
        status="warning"
        title="无数据"
        subTitle="未找到配置信息"
        extra={[
          <Button key="retry" type="primary" onClick={loadConfig}>
            重试
          </Button>
        ]}
      />
    );
  }

  const handleSave = async () => {
    try {
      if (isNew) {
        // 确保在新建时必须有基础信息
        if (!modifiedBasicInfo || !modifiedBasicInfo.table_name) {
          message.error('请填写表格基本信息');
          return;
        }

        // 新建表格时的配置
        const configToCreate = {
          ...modifiedBasicInfo,  // 直接使用 modifiedBasicInfo，因为新建时这是必需的
          parent_id: storeParentId ? parseInt(storeParentId) : undefined,
          fields: modifiedFields || [],
          indexes: modifiedIndexes || [],
          func: modifiedFunc || ''
        };

        const res = await createTableConfig(configToCreate);
        if (res.code === 200) {
          message.success('创建成功');
          if (res.data?.id) {
            navigate(`/dashboard/${appCode}/config/table/${res.data.id}`);
          }
        } else {
          throw new Error(res.message || '创建失败');
        }
      } else {
        // 更新表格时，始终包含基础信息和func
        const updateRequest: TableUpdateRequest = {
          // 始终包含基础信息
          table_name: modifiedBasicInfo?.table_name || localConfig.table_name,
          display_name: modifiedBasicInfo?.display_name || localConfig.display_name,
          description: modifiedBasicInfo?.description || localConfig.description,
          // 始终包含func
          func: modifiedFunc || localConfig.func || ''
        };

        if (isFieldsModified && localConfig) {
          const originalFields = localConfig.fields || [];
          const updatedFields = modifiedFields || [];
          
          // 找出实际修改的字段
          const fieldUpdates: Array<{
            field: FieldConfig;
            oldFieldName?: string;
            updateType: 'add' | 'modify' | 'drop';
          }> = [];

          // 1. 找出新增的字段
          const addedFields = updatedFields.filter(field => 
            !originalFields.some(f => f.name === field.name)
          );
          addedFields.forEach(field => {
            fieldUpdates.push({
              field,
              updateType: 'add'
            });
          });

          // 2. 找出修改的字段
          updatedFields.forEach(field => {
            const originalField = originalFields.find(f => f.name === field.name);
            if (originalField && JSON.stringify(field) !== JSON.stringify(originalField)) {
              fieldUpdates.push({
                field,
                updateType: 'modify',
                oldFieldName: originalField.name
              });
            }
          });

          // 3. 找出删除的字段 - 只有在modifiedFields中不存在的字段才被视为删除
          if (updatedFields.length < originalFields.length) {
            const deletedFields = originalFields.filter(field =>
              !updatedFields.some(f => f.name === field.name)
            );
            deletedFields.forEach(field => {
              fieldUpdates.push({
                field,
                updateType: 'drop',
                oldFieldName: field.name
              });
            });
          }

          if (fieldUpdates.length > 0) {
            updateRequest.fields = fieldUpdates;
          }
        }

        if (isIndexesModified && localConfig) {
          const originalIndexes = localConfig.indexes || [];
          const updatedIndexes = modifiedIndexes || [];
          
          // 找出实际修改的索引
          const indexUpdates: Array<{
            index: IndexConfig;
            oldIndexName?: string;
            updateType: 'add' | 'modify' | 'drop';
          }> = [];

          // 1. 找出新增的索引
          const addedIndexes = updatedIndexes.filter(index => 
            !originalIndexes.some(i => i.name === index.name)
          );
          addedIndexes.forEach(index => {
            indexUpdates.push({
              index,
              updateType: 'add'
            });
          });

          // 2. 找出修改的索引
          const modifiedIndexNames = updatedIndexes
            .filter(index => 
              originalIndexes.some(i => 
                i.name === index.name && 
                JSON.stringify(i) !== JSON.stringify(index)
              )
            )
            .map(index => index.name);

          modifiedIndexNames.forEach(name => {
            const index = updatedIndexes.find(i => i.name === name)!;
            indexUpdates.push({
              index,
              updateType: 'modify',
              oldIndexName: name
            });
          });

          // 3. 找出删除的索引
          const deletedIndexes = originalIndexes.filter(index =>
            !updatedIndexes.some(i => i.name === index.name)
          );
          deletedIndexes.forEach(index => {
            indexUpdates.push({
              index,
              updateType: 'drop',
              oldIndexName: index.name
            });
          });

          if (indexUpdates.length > 0) {
            updateRequest.indexes = indexUpdates;
          }
        }

        if (isFuncModified && modifiedFunc) {
          updateRequest.func = modifiedFunc;
        }

        const res = await updateTableConfig(elementId, updateRequest);
        if (res.code !== 200) {
          throw new Error(res.message);
        }

        message.success('保存成功');
        dispatch(resetModifiedState());
        loadConfig();
      }
    } catch (error: any) {
      if (error.response?.data) {
        message.error('保存失败: ' + (error.response.data.message || '未知错误'));
      } else {
        message.error('保存失败: ' + (error.message || '未知错误'));
      }
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '基础信息',
      children: <BasicInfo 
        elementId={elementId} 
        appCode={appCode} 
        config={localConfig} 
        onReload={loadConfig}
        isNew={isNew}
        parentId={parentId || undefined}
      />,
    },
    {
      key: '2',
      label: '字段信息',
      children: <FieldInfo elementId={elementId} appCode={appCode} config={localConfig} onReload={loadConfig} />,
    },
    {
      key: '3',
      label: '索引',
      children: <IndexInfo elementId={elementId} appCode={appCode} config={localConfig} onReload={loadConfig} />,
    },
    {
      key: '4',
      label: 'Func配置',
      children: <FuncConfig elementId={elementId} appCode={appCode} config={localConfig} onReload={loadConfig} />,
    },
  ];

  const saveButton = (
    <Button 
      type="primary" 
      onClick={handleSave}
      disabled={!isBasicInfoModified && !isFieldsModified && !isIndexesModified && !isFuncModified}
    >
      保存
    </Button>
  );

  return (
    <div style={{ padding: '0px' }}>
      <Tabs 
        activeKey={activeKey} 
        onChange={setActiveKey} 
        items={items} 
        tabBarExtraContent={{ right: saveButton }}
      />
    </div>
  );
};

export default TableConfig;
