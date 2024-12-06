import React, { useEffect } from 'react';
import { Outlet, useLocation } from '@remix-run/react';
import MainLayout from '~/components/layouts/MainLayout';
import AppList from '~/components/apps/AppList';
import { useAppDispatch, useAppSelector } from '~/stores';
import { addTab, setActiveTab } from '~/stores/slices/tabSlice';
 
export default function Dashboard() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { tabs } = useAppSelector(state => state.tab);

  useEffect(() => {
      // 只在首次渲染时添加tab并设置为激活状态
    if (location.pathname === '/dashboard' && !tabs.find(tab => tab.key === '/dashboard')) {
        dispatch(addTab({
          key: '/dashboard',
          title: '应用列表',
          closable: false
        }));
        dispatch(setActiveTab('/dashboard'));
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

