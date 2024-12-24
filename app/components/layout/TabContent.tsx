import React, { Suspense } from 'react';
import { Result, Spin } from 'antd';
import { menuTypeToRouteType, routeTypeToMenuType } from '~/constants/elementType';
import { useAppSelector } from '~/stores';

// 懒加载组件
const Table = React.lazy(() => import('~/components/elements/Table'));
const Folder = React.lazy(() => import('~/components/elements/Folder'));
const TableConfig = React.lazy(() => import('~/components/config/TableConfig'));

interface Props {
  appCode: string;
  elementId: string;
  elementType: string;
  type: 'element' | 'config';
}

const TabContent: React.FC<Props> = ({ appCode, elementId, elementType, type }) => {
  console.log('TabContent render:', {
    appCode,
    elementId,
    elementType,
    elementTypeCode: menuTypeToRouteType[elementType],
    type,
    pathname: window.location.pathname
  });

  // 根据路径类型和元素类型选择要渲染的组件
  const getComponent = () => {
    if (type === 'element') {
      switch (elementType) {
        case '1':
          return <Folder elementId={elementId} appCode={appCode} />;
        case '2':
          return <Table elementId={elementId} appCode={appCode} elementType={elementType} />;
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
      console.log('Rendering config component for type:', elementType);
      switch (elementType) {
        case '2':
          return <TableConfig elementId={elementId} appCode={appCode} />;
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
