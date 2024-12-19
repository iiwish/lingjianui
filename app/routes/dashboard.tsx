import React, { useEffect } from 'react';
import { Outlet, useLocation } from '@remix-run/react';
import MainLayout from '~/components/layout/MainLayout';
import AppList from '~/components/apps/AppList';
import { useAppDispatch, useAppSelector } from '~/stores';
import { setCurrentApp } from '~/stores/slices/appSlice';
import { AppService } from '~/services/app';
import { message } from 'antd';

export default function Dashboard() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const tabs = useAppSelector(state => state.tab.tabs);
  const activeKey = useAppSelector(state => state.tab.activeKey);
  const currentApp = useAppSelector(state => state.app.currentApp);

  // 处理应用信息加载
  useEffect(() => {
    const loadApp = async (appId: string) => {
      try {
        const response = await AppService.getApp(appId);
        if (response.code === 200) {
          dispatch(setCurrentApp(response.data));
        } else {
          message.error('获取应用信息失败');
        }
      } catch (error) {
        console.error('Failed to load app:', error);
        message.error('加载应用信息失败');
      }
    };

    // 从URL中提取appId
    const pathParts = location.pathname.split('/');
    const appIdIndex = pathParts.indexOf('dashboard') + 1;
    const appId = pathParts[appIdIndex];

    // 如果URL中有appId且与当前不同,获取应用信息
    if (appId && appId !== 'undefined' && appId !== currentApp?.id.toString()) {
      loadApp(appId);
    }
  }, [dispatch, location.pathname, currentApp]);

  // 如果是根路径,渲染AppList
  if (location.pathname === '/dashboard') {
    return (
      <MainLayout>
        <div style={{ padding: '24px', height: '100%', overflow: 'auto' }}>
          <AppList />
        </div>
      </MainLayout>
    );
  }

  // 其他路由使用Outlet
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
