import { 
  Links, 
  Meta, 
  Outlet, 
  Scripts, 
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useLocation,
  useNavigate
} from '@remix-run/react';
import { useEffect } from 'react';
import type { LinksFunction } from '@remix-run/node';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './stores';
import AntdProvider from './components/AntdProvider';
import ClientOnly from './components/ClientOnly';
import { App as AntdApp } from 'antd';

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/antd/5.11.1/reset.css"
  }
];

// 将 AppWithAuth 组件移到 ClientOnly 中，仅在客户端渲染
function AppWithAuth() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = store.getState().auth;

  useEffect(() => {
    const { token, user } = auth;
    // console.log('Current auth state:', { token, user, path: location.pathname });
    
    // 修改路由判断逻辑
    if (!token && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    } else if (token && user && location.pathname === '/login') {
      navigate('/', { replace: true });
    } else if (token && !user && location.pathname !== '/login') {
      // 如���有token但没有用户信息，也重定向到登录页
      navigate('/login', { replace: true });
    }
  }, [location.pathname, auth]);

  return <Outlet />;
}

// 包装主应用组件
function AppWithProviders() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AntdProvider>
          <AntdApp>
            <ClientOnly>
              <AppWithAuth />
            </ClientOnly>
          </AntdApp>
        </AntdProvider>
      </PersistGate>
    </Provider>
  );
}

// 主应用组件
export default function App() {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AppWithProviders />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Document 组件用于错误边界
function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Provider store={store}>
          <AntdProvider>
            {children}
          </AntdProvider>
        </Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <Document>
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <h1>{isRouteErrorResponse(error) ? error.status : '错误'}</h1>
        <p>
          {isRouteErrorResponse(error) 
            ? error.data 
            : (error instanceof Error ? error.message : '发生了未知错误')}
        </p>
        <a href="/" style={{ color: '#1890ff' }}>返回首页</a>
      </div>
    </Document>
  );
}
