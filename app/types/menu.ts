export interface Menu {
  id: string;
  appId: string;
  menuName: string;
  menuCode: string;
  menuType: string;
  icon: string;
  path: string;
  parentId: string;
  level: number;
  sort: number;
  status: number;
  nodeId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuResponse {
  code: number;
  data: Menu;
  message: string;
}

export interface MenusResponse {
  code: number;
  data: {
    items: Menu[];
    total: number;
  };
  message: string;
}
