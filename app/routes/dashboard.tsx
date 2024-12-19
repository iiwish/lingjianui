import React, { useEffect } from 'react';
import { Outlet, useLocation } from '@remix-run/react';
import MainLayout from '~/components/layout/MainLayout';
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

  // 处理tab的添加和激活
  useEffect(() => {
    const currentPath = location.pathname;
    const existingTab = tabs.find(tab => tab.key === currentPath);

    // 如果是dashboard根路径
    if (currentPath === '/dashboard') {
      if (!tabs.find(tab => tab.key === '/dashboard')) {
        dispatch(addTab({
          key: '/dashboard',
          title: '应用列表',
          closable: false
        }));
      }
      // 只有当activeKey不是dashboard时才设置
      if (activeKey !== '/dashboard') {
        dispatch(setActiveTab('/dashboard'));
      }
      return;
    }

    // 如果tab不存在，添加新tab
    if (!existingTab) {
      let title = '未知页面';
      const pathType = currentPath.includes('/config/') ? 'config' : 
                      currentPath.includes('/element/') ? 'element' : null;

      if (pathType === 'config') {
        title = '配置页面';
      } else if (pathType === 'element') {
        title = '元素页面';
      }
      
      dispatch(addTab({
        key: currentPath,
        title,
        closable: true
      }));
    }

    // 只有当activeKey不是当前路径时才设置
    if (activeKey !== currentPath) {
      dispatch(setActiveTab(currentPath));
    }
  }, [dispatch, location.pathname, tabs]);

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
