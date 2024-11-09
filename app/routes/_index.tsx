import { redirect } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';

/**
 * 根路由加载器
 * 未登录时重定向到登录页面
 * 已登录时重定向到应用列表页面
 */
export const loader: LoaderFunction = async ({ request }) => {
  // 从请求中获取token（这里假设token存储在cookie中）
  const cookie = request.headers.get('Cookie') || '';
  const hasToken = cookie.includes('token=');

  // 未登录时重定向到登录页面
  if (!hasToken) {
    return redirect('/login');
  }

  // 已登录时重定向到应用列表页面
  return redirect('/apps');
};
