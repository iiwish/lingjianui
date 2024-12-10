import React, { Suspense } from 'react';
import { useParams } from '@remix-run/react';
import { Result, Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '~/stores';
import { addTab, setActiveTab } from '~/stores/slices/tabSlice';
import { setCurrentMenuGroup } from '~/stores/slices/menuSlice';

// 懒加载组件
const Table = React.lazy(() => import('~/components/elements/Table'));
const Dimension = React.lazy(() => import('~/components/elements/Dimension'));
const Menu = React.lazy(() => import('~/components/elements/Menu'));
const Model = React.lazy(() => import('~/components/elements/Model'));
const Form = React.lazy(() => import('~/components/elements/Form'));

// 元素类型映射
const ELEMENT_TYPES = {
    '2': Table,
    '3': Dimension,
    '4': Menu,
    '5': Model,
    '6': Form,
} as const;

const ElementRoute: React.FC = () => {
    const params = useParams();
    const { type, id, appId } = params;
    const dispatch = useAppDispatch();
    const { menus, loading, error } = useAppSelector((state) => state.menu);

    console.log('ElementRoute params:', { type, id, appId });
    console.log('Current menus:', menus);

    // 如果必要参数不存在,显示404
    if (!type || !id || !appId || !(type in ELEMENT_TYPES)) {
        console.log('Missing required params or invalid type');
        return (
            <Result
                status="404"
                title="404"
                subTitle="对不起,您访问的页面不存在"
            />
        );
    }

    // 获取对应的组件
    const ElementComponent = ELEMENT_TYPES[type as keyof typeof ELEMENT_TYPES];

    // 如果正在加载菜单数据,显示加载状态
    if (loading) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <Spin size="large" tip="加载中..." />
            </div>
        );
    }

    // 如果加载出错,显示错误信息
    if (error) {
        return (
            <Result
                status="error"
                title="加载失败"
                subTitle={error}
            />
        );
    }

    // 在菜单数据中查找对应的菜单项
    const findMenuItem = (menus: any[]): any | null => {
        for (const menu of menus) {
            // 直接比较menu_type和type，因为都是字符串类型的数字
            if (menu.source_id?.toString() === id && menu.menu_type === type) {
                console.log('Found matching menu item:', menu);
                return menu;
            }
            if (menu.children) {
                const found = findMenuItem(menu.children);
                if (found) return found;
            }
        }
        return null;
    };

    // 遍历所有菜单组查找
    let foundMenuItem = null;
    let foundGroup = null;
    for (const group of menus) {
        if (group.children) {
            const found = findMenuItem(group.children);
            if (found) {
                foundMenuItem = found;
                foundGroup = group;
                console.log('Found menu item in group:', group.menu_name);
                break;
            }
        }
    }

    // 如果找不到对应的菜单项,显示404
    if (!foundMenuItem) {
        console.log('Menu item not found');
        return (
            <Result
                status="404"
                title="404"
                subTitle="找不到对应的菜单项"
            />
        );
    }

    // 设置当前菜单组和tab
    if (foundGroup) {
        dispatch(setCurrentMenuGroup(foundGroup));
        const menuPath = `/dashboard/${appId}/element/${type}/${id}`;
        dispatch(addTab({
            key: menuPath,
            title: foundMenuItem.menu_name,
            closable: true
        }));
        dispatch(setActiveTab(menuPath));
    }

    // 生成唯一的key,确保组件在参数变化时重新渲染
    const elementKey = `${appId}-${type}-${id}`;

    console.log('Rendering ElementComponent with props:', {
        elementId: id,
        elementType: type,
        appId,
        menuItem: foundMenuItem
    });

    return (
        <Suspense
            fallback={
                <div style={{ padding: '24px', textAlign: 'center' }}>
                    <Spin size="large" tip="加载中..." />
                </div>
            }
        >
            <ErrorBoundary>
                <ElementComponent 
                    key={elementKey}
                    elementId={id} 
                    elementType={type} 
                    appId={appId}
                    menuItem={foundMenuItem}
                />
            </ErrorBoundary>
        </Suspense>
    );
};

// 错误边界组件
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Element error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Result
                    status="error"
                    title="出错了"
                    subTitle={this.state.error?.message || '页面加载失败,请稍后重试'}
                    extra={
                        <a onClick={() => window.location.reload()}>刷新页面</a>
                    }
                />
            );
        }

        return this.props.children;
    }
}

export default ElementRoute;
