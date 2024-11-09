import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '~/stores';
import { fetchAppList, fetchTemplates } from '~/stores/slices/appSlice';
import AppList from '~/components/apps/AppList';

/**
 * 应用列表页面（需要认证）
 */
export default function AuthenticatedAppsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // 加载应用列表和模板数据
  useEffect(() => {
    if (user?.id) {
      void dispatch(fetchAppList(user.id));
      void dispatch(fetchTemplates());
    }
  }, [dispatch, user?.id]);

  return <AppList />;
}

// 添加页面元数据
export function meta() {
  return [
    { title: '应用列表 - 灵简平台' },
    { name: 'description', content: '灵简平台应用列表页面' },
  ];
}
