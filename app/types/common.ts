// Desc: 定义通用类型

export interface ApiResponse<T = unknown> {
    code: number;  // 值为200表示成功
    message: string;
    data: T;
}

export interface ElementProps {
    elementId: string;
    appCode: string;
    parentId?: string | null;
}

export interface OneID {
    id: number;
}

export type IDResponse = ApiResponse<OneID>;