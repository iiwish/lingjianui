import React, { useEffect } from 'react';
import { Outlet, useLocation } from '@remix-run/react';
import MainLayout from '~/components/layouts/MainLayout';
import AppList from '~/components/apps/AppList';
import { useAppDispatch } from '~/stores';
import { addTab } from '~/stores/slices/tabSlice';

export default function Dashboard() {
  const location = useLocation();
  const dispatch = useAppDispatch();

  // 判断是否显示应用列表
  const showAppList = location.pathname === '/dashboard';

  useEffect(() => {
    // 如果是首页,添加应用列表tab
    if (showAppList) {
      dispatch(addTab({
        key: '/dashboard',
        title: '应用列表',
        closable: false
      }));
    }
  }, [showAppList]);

  return (
    <MainLayout>
      {showAppList ? (
        <div style={{ 
          height: '100%',
          overflow: 'auto',
          padding: '24px'
        }}>
          <AppList />
        </div>
      ) : (
        <div style={{ 
          height: '100%',
          overflow: 'auto',
          padding: '24px'
        }}>
          <Outlet />
        </div>
      )}
    </MainLayout>
  );
}
