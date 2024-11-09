import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from '@remix-run/react';
import { useAppSelector } from '~/stores';
import MainLayout from '~/components/layout/MainLayout';

/**
 * 需要认证的路由布局组件
 * 所有需要登录才能访问的页面都应该放在这个布局下
 */
export default function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAppSelector((state) => state.auth);

  // 检查登录状态
  useEffect(() => {
    if (!token || !user) {
      // 保存当前路径，登录后跳回
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?returnUrl=${returnUrl}`);
    }
  }, [token, user, navigate, location]);

  // 未登录时不渲染内容
  if (!token || !user) {
    return null;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
