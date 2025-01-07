import React, { useEffect } from 'react';
import { useParams, useLoaderData, useLocation } from '@remix-run/react';
import TabContent from '~/components/layout/TabContent';
import { routeTypeToMenuType } from '~/constants/elementType';
import { MenuService } from '~/services/element_menu';
import type { Menu as AppMenu } from '~/types/menu';
import { useAppDispatch, useAppSelector } from '~/stores';
import { addTab, setActiveTab, updateFolderState } from '~/stores/slices/tabSlice';

export default function ElementRoute() {
  const params = useParams();
  const { type: typeCode, id, appCode } = params;
  const { breadcrumbs, menuName } = useLoaderData<{ breadcrumbs: any[], menuName: string }>();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const tabs = useAppSelector(state => state.tab.tabs);
  
  console.log('ElementRoute params:', params);

  // 在组件挂载或路由变化时更新tab
  useEffect(() => {
    if (!typeCode || !id || !appCode) {
      return;
    }

    const type = routeTypeToMenuType[typeCode];
    if (!type) {
      return;
    }

    // 确保menuName已经加载
    if (menuName === undefined) {
      return;
    }

    // 每次都尝试添加tab，让reducer处理存在性检查
    const title = menuName && menuName.trim() !== '' ? menuName : `${typeCode}-${id}`;
    
    // 先添加或更新tab
    dispatch(addTab({
      key: location.pathname,
      title,
      closable: true
    }));

    // 如果是folder类型，更新tabState
    if (typeCode === 'folder' && breadcrumbs) {
      dispatch(updateFolderState({
        key: location.pathname,
        state: {
          currentFolder: Number(id),
          breadcrumbs
        }
      }));
    }
    
    // 最后设置为激活状态
    dispatch(setActiveTab(location.pathname));
  }, [dispatch, location.pathname, menuName, typeCode, id, appCode]);

  // 如果基本参数缺失，不渲染内容
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
      elementId={id.toString()}
      appCode={appCode}
      initialState={typeCode === 'folder' ? { breadcrumbs } : undefined}
    />
  );
}

// 添加loader函数来处理数据加载
export async function loader({ params }: { params: { type: string; id: number; appCode: string } }) {
  console.log('ElementRoute loader params:', params);
  
  try {
    // 如果是folder类型，直接获取对应的菜单配置
    if (params.type === 'folder' && params.id) {
      const menuConfigResponse = await MenuService.getMenuConfigByID(params.id.toString());
      if (menuConfigResponse.code === 200 && menuConfigResponse.data) {
        return {
          breadcrumbs: [
            { 
              id: 0, 
              name: '目录', 
              menu_type: Number(routeTypeToMenuType['folder'])
            },
            { 
              id: Number(menuConfigResponse.data.id), 
              name: menuConfigResponse.data.display_name, 
              menu_type: Number(routeTypeToMenuType['folder'])
            }
          ],
          menuName: menuConfigResponse.data.display_name
        };
      }
    } else {
      // 先获取菜单列表
      const menuListResponse = await MenuService.getMenuList();
      if (menuListResponse.code === 200) {
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

            const currentMenu = findMenu(menuResponse.data);
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
