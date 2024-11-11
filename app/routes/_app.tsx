import { Outlet } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

/**
 * 应用路由加载器
 * 验证用户是否已登录
 */
export const loader: LoaderFunction = async ({ request }) => {
  // 从cookie中获取token
  const cookie = request.headers.get('Cookie') || '';
  const token = cookie.split(';').find(item => item.trim().startsWith('token='));

  if (!token) {
    return redirect('/login');
  }

  return null;
};

export default function AppLayout() {
  return <Outlet />;
}
