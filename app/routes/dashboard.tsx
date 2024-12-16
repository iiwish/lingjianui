import React, { useEffect } from 'react';
import { Outlet, useLocation } from '@remix-run/react';
import MainLayout from '~/components/layouts/MainLayout';
import AppList from '~/components/apps/AppList';
import { useAppDispatch, useAppSelector } from '~/stores';
import { addTab, setActiveTab } from '~/stores/slices/tabSlice';
import { setCurrentApp } from '~/stores/slices/appSlice';
import { AppService } from '~/services/app';
import { message } from 'antd';

export default function Dashboard() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const tabs = useAppSelector(state => state.tab.tabs);
  const activeKey = useAppSelector(state => state.tab.activeKey);
  const currentApp = useAppSelector(state => state.app.currentApp);

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

    // 只在首次渲染时添加tab并设置为激活状态
    if (location.pathname === '/dashboard' && !tabs.find(tab => tab.key === '/dashboard')) {
      dispatch(addTab({
        key: '/dashboard',
        title: '应用列表',
        closable: false
      }));
      dispatch(setActiveTab('/dashboard'));
    }
  }, [dispatch, location.pathname, tabs, currentApp]);

  useEffect(() => {
    console.log('activeKey changed:', activeKey);
  }, [activeKey]);

  useEffect(() => {
    console.log('Dashboard component re-rendered');
  });

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