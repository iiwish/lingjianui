import { redirect } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';

/**
 * 根路由加载器
 * 将根路径重定向到应用列表页面
 */
export const loader: LoaderFunction = async () => {
  return redirect('/apps');
};
