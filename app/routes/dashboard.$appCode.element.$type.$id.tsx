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
export async function loader({ params }: { params: { type: string; id: number; appCode: string } }) {
  console.log('ElementRoute loader params:', params);
  
  try {
    // 先获取菜单列表
    const menuListResponse = await MenuService.getMenuList();
    if (menuListResponse.code === 200) {
      // 如果是folder类型，直接获取对应的菜单详情
      if (params.type === 'folder' && params.id) {
        const menuResponse = await MenuService.getMenus(params.id.toString());
        if (menuResponse.code === 200 && menuResponse.data) {
          return {
            breadcrumbs: [{ 
              id: menuResponse.data.id, 
              name: menuResponse.data.menu_name, 
              menu_type: menuResponse.data.menu_type 
            }],
            menuName: menuResponse.data.menu_name
          };
        }
      } else {
        // 对于其他类型，需要遍历菜单列表找到对应的菜单配置
        for (const menuConfig of menuListResponse.data) {
          const menuResponse = await MenuService.getMenus(menuConfig.id.toString());
          if (menuResponse.code === 200 && menuResponse.data) {
            // 在菜单树中查找匹配的项
            const findMenu = (items: AppMenu[]): AppMenu | null => {
              for (const item of items) {
                if (item.source_id === params.id) {
                  return item;
                }
                if (item.children) {
                  const found = findMenu(item.children);
                  if (found) return found;
                }
              }
              return null;
            };

            const currentMenu = findMenu([menuResponse.data]);
            if (currentMenu) {
              return {
                breadcrumbs: [],
                menuName: currentMenu.menu_name
              };
            }
          }
        }
      }

    }
  } catch (error) {
    console.error('Failed to load menu data:', error);
  }
  
  return { breadcrumbs: [], menuName: '' };
}
