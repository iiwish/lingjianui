import { Outlet } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

/**
 * 从cookie字符串中获取指定名称的cookie值
 */
const getCookieValue = (cookieString: string, name: string): string | null => {
  const match = cookieString.match(new RegExp(`${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * 应用路由加载器
 * 验证用户是否已登录
 */
export const loader: LoaderFunction = async ({ request }) => {
  const cookie = request.headers.get('Cookie') || '';
  const token = getCookieValue(cookie, 'token');

  // 只检查token是否存在，具体的token验证交给客户端处理
  if (!token) {
    return redirect('/login');
  }

  return null;
};

export default function AppLayout() {
  return <Outlet />;
}
