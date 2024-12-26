import React, { useEffect } from 'react';
import { useParams, useLocation, useSearchParams } from '@remix-run/react';
import TabContent from '~/components/layout/TabContent';
import { routeTypeToMenuType } from '~/constants/elementType';
import { useAppDispatch, useAppSelector } from '~/stores';
import { addTab, setActiveTab } from '~/stores/slices/tabSlice';
import { elementTypes } from '~/components/elements/assets/element-types';

export default function ConfigRoute() {
  const params = useParams();
  const { type: typeCode, id, appCode } = params;
  const dispatch = useAppDispatch();
  const location = useLocation();
  const tabs = useAppSelector(state => state.tab.tabs);
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get('parentId');
  const isNew = id === 'new';
  
  console.log('ConfigRoute params:', params);

  if (!typeCode || !id || !appCode) {
    return null;
  }

  const type = routeTypeToMenuType[typeCode];
  if (!type) {
    return null;
  }

  // 在组件挂载或路由变化时更新tab
  useEffect(() => {
    const tabExists = tabs.some(tab => tab.key === location.pathname);
    if (!tabExists) {
      const elementType = elementTypes.find(item => item.type === typeCode);
      dispatch(addTab({
        key: location.pathname,
        title: isNew ? `新建${elementType?.name || typeCode}` : `${elementType?.name || typeCode}配置`,
        closable: true
      }));
      dispatch(setActiveTab(location.pathname));
    }
  }, [dispatch, location.pathname, typeCode, id]);

  return (
    <TabContent
      type="config"
      elementType={type}
      elementId={id}
      appCode={appCode}
      parentId={parentId}
    />
  );
}

// 添加loader函数来处理数据加载
export async function loader({ params }: { params: { type: string; id: string; appCode: string } }) {
  console.log('ConfigRoute loader params:', params); // 添加日志
  return { ok: true };
}
