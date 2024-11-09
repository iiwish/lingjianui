import { 
  Links, 
  LiveReload, 
  Meta, 
  Outlet, 
  Scripts, 
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from '@remix-run/react';
import { Provider } from 'react-redux';
import { store } from './stores';
import { ConfigProvider, Result, Button } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// 导入antd样式
import 'antd/dist/reset.css';

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
        <Provider store={store}>
          <ConfigProvider locale={zhCN}>
            <Outlet />
          </ConfigProvider>
        </Provider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
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
          <Provider store={store}>
            <ConfigProvider locale={zhCN}>
              <Result
                status="404"
                title="404"
                subTitle="抱歉，您访问的页面不存在"
                extra={
                  <Button type="primary" href="/">
                    返回首页
                  </Button>
                }
                style={{
                  height: '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              />
            </ConfigProvider>
          </Provider>
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
        <Provider store={store}>
          <ConfigProvider locale={zhCN}>
            <Result
              status="error"
              title="系统错误"
              subTitle={error instanceof Error ? error.message : '发生了未知错误'}
              extra={
                <Button type="primary" href="/">
                  返回首页
                </Button>
              }
              style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            />
          </ConfigProvider>
        </Provider>
        <Scripts />
      </body>
    </html>
  );
}
