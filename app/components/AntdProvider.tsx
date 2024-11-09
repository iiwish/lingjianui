import { ConfigProvider, App } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import ClientOnly from './ClientOnly';

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClientOnly>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            motion: false, // 禁用动画效果
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </ClientOnly>
  );
}
