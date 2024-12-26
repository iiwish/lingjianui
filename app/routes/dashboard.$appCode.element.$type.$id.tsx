import React, { useEffect } from 'react';
import { useParams, useLoaderData, useLocation } from '@remix-run/react';
import TabContent from '~/components/layout/TabContent';
import { routeTypeToMenuType } from '~/constants/elementType';
import { MenuService } from '~/services/menu';
import type { Menu as AppMenu } from '~/types/menu';
import { useAppDispatch, useAppSelector } from '~/stores';
import { addTab, setActiveTab } from '~/stores/slices/tabSlice';

export default function ElementRoute() {
  const params = useParams();
  const { type: typeCode, id, appCode } = params;
  const { breadcrumbs, menuName } = useLoaderData<{ breadcrumbs: any[], menuName: string }>();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const tabs = useAppSelector(state => state.tab.tabs);
  
  console.log('ElementRoute params:', params);

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
      dispatch(addTab({
        key: location.pathname,
        title: menuName || `${typeCode}-${id}`,
        closable: true
      }));
      dispatch(setActiveTab(location.pathname));
    }
  }, [dispatch, location.pathname, menuName, typeCode, id]);

  return (
    <TabContent
      type="element"
      elementType={type}
      elementId={id}
      appCode={appCode}
      initialState={typeCode === 'folder' ? { breadcrumbs } : undefined}
    />
  );
}

// 添加loader函数来处理数据加载
export async function loader({ params }: { params: { type: string; id: string; appCode: string } }) {
  console.log('ElementRoute loader params:', params);
  
  try {
    const response = await MenuService.getMenus(params.appCode);
    if (response.code === 200) {
      const findMenu = (items: AppMenu[]): AppMenu | null => {
        for (const item of items) {
          // 对于folder类型，使用id匹配；对于其他类型，使用source_id匹配
          if ((params.type === 'folder' && item.id === Number(params.id)) || 
              (params.type !== 'folder' && item.source_id === params.id)) {
            return item;
          }
          if (item.children) {
            const found = findMenu(item.children);
            if (found) return found;
          }
        }
        return null;
      };

      // 构建面包屑路径
      const buildBreadcrumbs = (items: AppMenu[], targetId: number): Array<{id: number, name: string, menu_type: string}> | null => {
        for (const item of items) {
          if (item.id === targetId) {
            return [{ id: item.id, name: item.menu_name, menu_type: item.menu_type }];
          }
          if (item.children) {
            const childPath = buildBreadcrumbs(item.children, targetId);
            if (childPath) {
              return [{ id: item.id, name: item.menu_name, menu_type: item.menu_type }, ...childPath];
            }
          }
        }
        return null;
      };

      // 在所有菜单组中查找
      let currentMenu = null;
      let breadcrumbPath = null;
      for (const group of response.data.items) {
        // 先检查组本身
        if (params.type === 'folder' && group.id === Number(params.id)) {
          currentMenu = group;
          breadcrumbPath = [{ id: group.id, name: group.menu_name, menu_type: group.menu_type }];
          break;
        }
        // 然后在组的子项中查找
        if (group.children) {
          currentMenu = findMenu(group.children);
          if (currentMenu) {
            breadcrumbPath = buildBreadcrumbs(group.children, currentMenu.id);
            if (breadcrumbPath) {
              breadcrumbPath = [
                { id: group.id, name: group.menu_name, menu_type: group.menu_type },
                ...breadcrumbPath
              ];
            }
            break;
          }
        }
      }

      if (currentMenu) {
        return {
          breadcrumbs: params.type === 'folder' ? (breadcrumbPath || []) : [],
          menuName: currentMenu.menu_name
        };
      }
    }
  } catch (error) {
    console.error('Failed to load menu data:', error);
  }
  
  return { breadcrumbs: [], menuName: '' };
}
