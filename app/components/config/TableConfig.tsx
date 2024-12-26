import React, { useEffect, useState } from 'react';
import { Tabs, Spin, Button, Result, message, Space } from 'antd';
import type { TabsProps } from 'antd';
import { useAppDispatch, useAppSelector } from '~/stores';
import { setConfig, resetModifiedState } from '~/stores/slices/tableConfigSlice';
import { useNavigate, useLocation } from '@remix-run/react';
import { 
  getTableConfig,
  createTableConfig,
  updateTableConfig,
  updateTableFields,
  updateTableIndexes,
  updateTableFunc,
  TableConfig as ITableConfig
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
    modifiedFunc
  } = useAppSelector(state => state.tableConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState('1');

  const location = useLocation();
  const isNew = elementId === 'new';

  // 空的初始配置
  const emptyConfig: ITableConfig = {
    app_id: 0,
    table_name: '',
    display_name: '',
    description: '',
    fields: [],
    indexes: [],
    func: ''
  };

  useEffect(() => {
    if (isNew) {
      setLocalConfig(emptyConfig);
      dispatch(setConfig(emptyConfig));
      setLoading(false);
    } else {
      loadConfig();
    }
  }, [elementId, appCode, isNew]);

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
        if (isBasicInfoModified && modifiedBasicInfo) {
          const res = await createTableConfig(modifiedBasicInfo);
          if (res.code === 200) {
            message.success('创建成功');
            if (res.data?.id) {
              navigate(`/dashboard/${appCode}/config/table/${res.data.id}`);
            }
          } else {
            throw new Error(res.message);
          }
        }
      } else {
        if (isBasicInfoModified && modifiedBasicInfo) {
          const res = await updateTableConfig(elementId, modifiedBasicInfo);
          if (res.code !== 200) {
            throw new Error(res.message);
          }
        }
        
        if (isFieldsModified) {
          const res = await updateTableFields(elementId, modifiedFields);
          if (res.code !== 200) {
            throw new Error(res.message);
          }
        }

        if (isIndexesModified) {
          const res = await updateTableIndexes(elementId, modifiedIndexes);
          if (res.code !== 200) {
            throw new Error(res.message);
          }
        }

        if (isFuncModified) {
          const res = await updateTableFunc(elementId, modifiedFunc);
          if (res.code !== 200) {
            throw new Error(res.message);
          }
        }

        message.success('保存成功');
        dispatch(resetModifiedState());
        loadConfig();
      }
    } catch (error) {
      message.error('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
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
