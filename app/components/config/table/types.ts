import type { TableConfig as ITableConfig } from '~/services/element';

export interface FieldConfig {
  name: string;
  comment: string;
  column_type: string;
  sort: number;
  primary_key?: boolean;
  auto_increment?: boolean;
  not_null?: boolean;
  default?: string;
}

export interface IndexConfig {
  name: string;
  type: string;
  fields: string[];
}

export interface Props {
  elementId: string;
  appId: string;
}

export interface TabComponentProps extends Props {
  config: ITableConfig;
  onReload: () => void;
}

export type { ITableConfig };
