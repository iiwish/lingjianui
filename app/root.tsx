import { 
  Links, 
  Meta, 
  Outlet, 
  Scripts, 
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from '@remix-run/react';
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
        <ClientOnly>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <AntdProvider>
                <AntdApp>
                  <Outlet />
                </AntdApp>
              </AntdProvider>
            </PersistGate>
          </Provider>
        </ClientOnly>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// 错误边界
export function ErrorBoundary() {
  const error = useRouteError();

  // 处理404错误
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <html lang="zh-CN">
        <head>
          <title>页面未找到</title>
          <Meta />
          <Links />
        </head>
        <body>
          <ClientOnly>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <AntdProvider>
                  <div
                    style={{
                      height: '100vh',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <h1>404</h1>
                    <p>抱歉，您访问的页面不存在</p>
                    <a href="/" style={{ color: '#1890ff' }}>
                      返回首页
                    </a>
                  </div>
                </AntdProvider>
              </PersistGate>
            </Provider>
          </ClientOnly>
          <Scripts />
        </body>
      </html>
    );
  }

  // 处理其他错误
  return (
    <html lang="zh-CN">
      <head>
        <title>系统错误</title>
        <Meta />
        <Links />
      </head>
      <body>
        <ClientOnly>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <AntdProvider>
                <div
                  style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <h1>系统错误</h1>
                  <p>{error instanceof Error ? error.message : '发生了未知错误'}</p>
                  <a href="/" style={{ color: '#1890ff' }}>
                    返回首页
                  </a>
                </div>
              </AntdProvider>
            </PersistGate>
          </Provider>
        </ClientOnly>
        <Scripts />
      </body>
    </html>
  );
}
