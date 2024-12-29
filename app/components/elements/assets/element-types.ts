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
    needConfig: false,
    code: '1'
  },
  {
    type: 'menu',
    name: '菜单',
    description: '用于导航和链接',
    icon: MenuOutlined,
    needConfig: false,
    code: '4'
  },
  {
    type: 'table',
    name: '表格',
    description: '用于数据展示和管理',
    icon: TableOutlined,
    needConfig: true,
    code: '2'
  },
  {
    type: 'dim',
    name: '维度',
    description: '用于数据分析和统计',
    icon: PartitionOutlined,
    needConfig: true,
    code: '3'
  },
  {
    type: 'model',
    name: '模型',
    description: '用于数据建模和关系管理',
    icon: DeploymentUnitOutlined,
    needConfig: true,
    code: '5'
  },
  {
    type: 'form',
    name: '表单',
    description: '用于数据录入和编辑',
    icon: SnippetsOutlined,
    needConfig: true,
    code: '6'
  }
];
