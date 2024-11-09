import type { EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { store } from './stores';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const markup = renderToString(
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <RemixServer context={remixContext} url={request.url} />
      </ConfigProvider>
    </Provider>
  );

  responseHeaders.set('Content-Type', 'text/html');

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
