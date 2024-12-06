import React, { Suspense } from 'react';
import { useParams } from '@remix-run/react';
import { Result, Spin } from 'antd';

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

export default function ElementRoute() {
    const params = useParams();
    const { type, id } = params;

    // 如果type或id不存在,显示404
    if (!type || !id || !(type in ELEMENT_TYPES)) {
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

    return (
        <Suspense
            fallback={
                <div style={{ padding: '24px', textAlign: 'center' }}>
                    <Spin size="large" tip="加载中..." />
                </div>
            }
        >
            <ErrorBoundary>
                <ElementComponent />
            </ErrorBoundary>
        </Suspense>
    );
}

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