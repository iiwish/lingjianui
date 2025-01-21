import React from 'react';
import { Card, Typography, Space, Tag, Tooltip, Badge } from 'antd';
import { TableOutlined, DownOutlined, RightOutlined, DatabaseOutlined } from '@ant-design/icons';
import type { ModelConfigItem } from '~/types/config/model';

const { Text } = Typography;

interface TreeNodeProps {
  node: ModelConfigItem;
  onSelect: () => void;
  isSelected: boolean;
  tables?: {
    value: string;
    title: string;
    data?: {
      id: number;
      source_id: number;
      menu_name: string;
    };
  }[];
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  onSelect,
  isSelected,
  tables = [],
}) => {
  return (
    <Card
      size="small"
      style={{
        marginBottom: 8,
        border: isSelected ? '2px solid #1890ff' : '1px solid #f0f0f0',
        cursor: 'pointer',
      }}
      bodyStyle={{ padding: '8px 12px' }}
      onClick={onSelect}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Space>
          <DatabaseOutlined style={{ color: '#1890ff' }} />
          <Text strong>
            {node.name || (node.source_id 
              ? (tables.find(t => t.data?.source_id === node.source_id)?.data?.menu_name || `表格 ${node.source_id}`)
              : '未选择表格'
            )}
          </Text>
        </Space>
      </div>
    </Card>
  );
};

export default TreeNode;
