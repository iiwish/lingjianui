import {
  FolderOpenTwoTone,
  TableOutlined,
  DeploymentUnitOutlined,
  MenuOutlined,
  PartitionOutlined,
  SnippetsOutlined,
} from '@ant-design/icons';

export const elementTypes = [
  {
    type: 'folder',
    name: '文件夹',
    description: '用于组织和管理其他元素',
    icon: FolderOpenTwoTone,
    needConfig: false
  },
  {
    type: 'menu',
    name: '菜单',
    description: '用于导航和链接',
    icon: MenuOutlined,
    needConfig: false
  },
  {
    type: 'table',
    name: '表格',
    description: '用于数据展示和管理',
    icon: TableOutlined,
    needConfig: true
  },
  {
    type: 'dim',
    name: '维度',
    description: '用于数据分析和统计',
    icon: PartitionOutlined,
    needConfig: true
  },
  {
    type: 'model',
    name: '模型',
    description: '用于数据建模和关系管理',
    icon: DeploymentUnitOutlined,
    needConfig: true
  },
  {
    type: 'form',
    name: '表单',
    description: '用于数据录入和编辑',
    icon: SnippetsOutlined,
    needConfig: true
  }
];
