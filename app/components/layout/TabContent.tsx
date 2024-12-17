import React, { Suspense } from 'react';
import { Result, Spin } from 'antd';
import { useLocation } from '@remix-run/react';

// 懒加载组件
const Table = React.lazy(() => import('~/components/elements/Table'));
const TableConfig = React.lazy(() => import('~/components/config/TableConfig'));

interface Props {
  appId: string;
  elementId: string;
  elementType: string;
  type: 'element' | 'config';
}

const TabContent: React.FC<Props> = ({ appId, elementId, elementType, type }) => {
  const location = useLocation();

  // 根据路径类型和元素类型选择要渲染的组件
  const getComponent = () => {
    if (type === 'element') {
      switch (elementType) {
        case '2':
          return <Table elementId={elementId} appId={appId} elementType={elementType} />;
        default:
          return (
            <Result
              status="404"
              title="404"
              subTitle="对不起，该元素类型暂不支持"
            />
          );
      }
    } else if (type === 'config') {
      switch (elementType) {
        case '2':
          return <TableConfig elementId={elementId} appId={appId} />;
        default:
          return (
            <Result
              status="404"
              title="404"
              subTitle="对不起，该配置类型暂不支持"
            />
          );
      }
    }

    return (
      <Result
        status="404"
        title="404"
        subTitle="对不起，该页面不存在"
      />
    );
  };

  return (
    <Suspense
      fallback={
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      }
    >
      {getComponent()}
    </Suspense>
  );
};

export default TabContent;
