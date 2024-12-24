import React, { useEffect, useState } from 'react';
import { Tabs, Spin, Button, Result } from 'antd';
import type { TabsProps } from 'antd';
import type { TableConfig as ITableConfig } from '~/services/element';
import { getTableConfig } from '~/services/element';
import BasicInfo from './table/BasicInfo';
import FieldInfo from './table/FieldInfo';
import IndexInfo from './table/IndexInfo';
import FuncConfig from './table/FuncConfig';

interface Props {
  elementId: string;
  appCode: string;
}

const TableConfig: React.FC<Props> = ({ elementId, appCode }) => {
  const [config, setConfig] = useState<ITableConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState('1');

  useEffect(() => {
    loadConfig();
  }, [elementId, appCode]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading config for:', { elementId, appCode });
      const res = await getTableConfig(elementId);
      console.log('Config response:', res);
      
      if (res.code === 200 && res.data) {
        setConfig(res.data);
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
  if (!config) {
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

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '基础信息',
      children: <BasicInfo elementId={elementId} appCode={appCode} config={config} onReload={loadConfig} />,
    },
    {
      key: '2',
      label: '字段信息',
      children: <FieldInfo elementId={elementId} appCode={appCode} config={config} onReload={loadConfig} />,
    },
    {
      key: '3',
      label: '索引',
      children: <IndexInfo elementId={elementId} appCode={appCode} config={config} onReload={loadConfig} />,
    },
    {
      key: '4',
      label: 'Func配置',
      children: <FuncConfig elementId={elementId} appCode={appCode} config={config} onReload={loadConfig} />,
    },
  ];

  return (
    <div style={{ padding: '0px' }}>
      <Tabs activeKey={activeKey} onChange={setActiveKey} items={items} />
    </div>
  );
};

export default TableConfig;
