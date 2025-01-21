import { get,put,post,del } from '~/utils/http';

export interface FormConfig {
  id: number;
  form_name: string;
  form_type: string;
  display_name: string;
  description: string;
  configuration: string;
  model_id: number;
  version: number;
  app_id: number;
  status: number;
  created_at: string;
  updated_at: string;
  creator_id: number;
  updater_id: number;
}

export interface FormConfiguration {
  fields: Array<{
    name: string;
    type: string;
    label: string;
    required?: boolean;
    rules?: Array<{
      type: string;
      message: string;
      pattern?: string;
      min?: number;
      max?: number;
    }>;
    props?: {
      placeholder?: string;
      maxLength?: number;
      min?: number;
      max?: number;
      step?: number;
      options?: Array<{
        label: string;
        value: string | number;
      }>;
    };
  }>;
  layout?: {
    columns?: number;
    gutter?: number;
    labelCol?: { span: number };
    wrapperCol?: { span: number };
  };
  actions?: Array<{
    type: string;
    label: string;
    props?: Record<string, any>;
  }>;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 获取表单配置
export const getFormConfig = async (appId: string, formId: string): Promise<ApiResponse<FormConfig>> => {
  return get(`/config/forms/${formId}`,);
};

// 获取表单数据
export const getFormData = async (appId: string, formId: string): Promise<ApiResponse<Record<string, any>>> => {
  return get(`/config/forms/${formId}`,);
};
