import { LoaderFunction, redirect } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';
import { useEffect } from 'react';

/**
 * 根路由加载器
 * 未登录时重定向到登录页面
 * 已登录时重定向到应用列表页面
 */
export const loader: LoaderFunction = async () => {
  return redirect('/dashboard');
};

// 客户端重定向
export default function Index() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, []);

  return null;
}
