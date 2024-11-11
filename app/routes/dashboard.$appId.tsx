import React, { useEffect } from 'react';
import { useParams } from '@remix-run/react';
import { Tabs, Spin, message } from 'antd';
import type { TabsProps } from 'antd';
import MainLayout from '~/components/layouts/MainLayout';
import { useAppDispatch, useAppSelector } from '~/stores';
import { setCurrentApp, setLoading, setError } from '~/stores/slices/appSlice';
import { appService } from '~/services/app';

const items: TabsProps['items'] = [
  {
    key: 'overview',
    label: '概览',
    children: '应用概览（待开发）',
  },
  {
    key: 'tables',
    label: '数据表',
    children: '数据表配置（待开发）',
  },
  {
    key: 'models',
    label: '数据模型',
    children: '数据模型配置（待开发）',
  },
  {
    key: 'forms',
    label: '表单配置',
    children: '表单配置（待开发）',
  },
  {
    key: 'menus',
    label: '菜单配置',
    children: '菜单配置（待开发）',
  },
  {
    key: 'roles',
    label: '角色权限',
    children: '角色权限配置（待开发）',
  },
  {
    key: 'tasks',
    label: '定时任务',
    children: '定时任务配置（待开发）',
  },
  {
    key: 'settings',
    label: '应用设置',
    children: '应用设置（待开发）',
  },
];

export default function AppDetail() {
  const { appId } = useParams();
  const dispatch = useAppDispatch();
  const { currentApp, loading, error } = useAppSelector((state) => state.app);

  const fetchAppDetail = async () => {
    if (!appId) return;
    
    try {
      dispatch(setLoading(true));
      const response = await appService.getApp(appId);
      dispatch(setCurrentApp(response.data));
    } catch (err) {
      if (err instanceof Error) {
        dispatch(setError(err.message));
        message.error(err.message);
      } else {
        dispatch(setError('获取应用详情失败'));
        message.error('获取应用详情失败');
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchAppDetail();
  }, [appId]);

  if (loading) {
    return (
      <MainLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%' 
        }}>
          <Spin size="large" tip="加载中..." />
        </div>
      </MainLayout>
    );
  }

  if (!currentApp) {
    return (
      <MainLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%' 
        }}>
          {error || '应用不存在'}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '0 24px' }}>
        <div style={{ 
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <span style={{ fontSize: '32px' }}>{currentApp.icon}</span>
          <div>
            <h2 style={{ margin: 0 }}>{currentApp.name}</h2>
            <p style={{ margin: 0, color: '#666' }}>{currentApp.description}</p>
          </div>
        </div>

        <Tabs
          defaultActiveKey="overview"
          items={items}
          style={{ 
            background: '#fff',
            padding: '16px',
            borderRadius: '8px'
          }}
        />
      </div>
    </MainLayout>
  );
}
