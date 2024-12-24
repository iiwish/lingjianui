import React from 'react';
import { useParams } from '@remix-run/react';
import TabContent from '~/components/layout/TabContent';
import { routeTypeToMenuType } from '~/constants/elementType';

export default function ElementRoute() {
  const params = useParams();
  const { type: typeCode, id, appCode } = params;
  
  console.log('ElementRoute params:', params); // 添加日志

  if (!typeCode || !id || !appCode) {
    return null;
  }

  const type = routeTypeToMenuType[typeCode];
  if (!type) {
    return null;
  }

  return (
    <TabContent
      type="element"
      elementType={type}
      elementId={id}
      appCode={appCode}
    />
  );
}

// 添加loader函数来处理数据加载
export async function loader({ params }: { params: { type: string; id: string; appCode: string } }) {
  console.log('ElementRoute loader params:', params); // 添加日志
  return { ok: true };
}
