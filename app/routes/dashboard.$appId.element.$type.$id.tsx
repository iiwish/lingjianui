import React from 'react';
import { useParams } from '@remix-run/react';
import TabContent from '~/components/layout/TabContent';

export default function ElementRoute() {
  const params = useParams();
  const { type, id, appId } = params;

  console.log('ElementRoute params:', params); // 添加日志

  if (!type || !id || !appId) {
    return null;
  }

  return (
    <TabContent
      type="element"
      elementType={type}
      elementId={id}
      appId={appId}
    />
  );
}

// 添加loader函数来处理数据加载
export async function loader({ params }: { params: { type: string; id: string; appId: string } }) {
  console.log('ElementRoute loader params:', params); // 添加日志
  return { ok: true };
}
