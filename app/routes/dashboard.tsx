import React, { useEffect } from 'react';
import { Outlet, useLocation } from '@remix-run/react';
import MainLayout from '~/components/layout/MainLayout';
import AppList from '~/components/apps/AppList';
import { useAppDispatch, useAppSelector } from '~/stores';
import { setCurrentApp, setApps } from '~/stores/slices/appSlice';
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
    const loadApp = async (appCode: string) => {
      try {
        // 先获取所有应用列表
        const appsResponse = await AppService.getApps();
        if (appsResponse.code === 200) {
          const apps = appsResponse.data.items;
          dispatch(setApps(apps));
          
          // 根据code找到对应的app
          const app = apps.find(app => app.code === appCode);
          if (app) {
            // 如果找到了app且与当前不同，设置为当前app
            if (!currentApp || currentApp.id !== app.id) {
              dispatch(setCurrentApp(app));
            }
          } else {
            message.error('未找到对应的应用');
          }
        } else {
          message.error('获取应用列表失败');
        }
      } catch (error) {
        console.error('Failed to load app:', error);
        message.error('加载应用信息失败');
      }
    };

    // 从URL中提取appCode
    const pathParts = location.pathname.split('/');
    const appCodeIndex = pathParts.indexOf('dashboard') + 1;
    const appCode = pathParts[appCodeIndex];

    // 如果URL中有appCode且与当前不同,获取应用信息
    if (appCode && appCode !== 'undefined' && appCode !== currentApp?.code) {
      loadApp(appCode);
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
