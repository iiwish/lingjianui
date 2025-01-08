import React from 'react';
import { Card, Typography, Space } from 'antd';
import { TableOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import type { ModelConfigItem } from '~/types/element_model';

const { Text } = Typography;

interface TreeNodeProps {
  node: ModelConfigItem;
  fields: any[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
  isSelected: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  fields,
  isExpanded,
  onToggleExpand,
  onSelect,
  isSelected,
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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: fields.length > 0 ? 8 : 0 }}>
        <Space>
          <TableOutlined />
          <Text strong>表格 {node.table_id}</Text>
        </Space>
        {fields.length > 0 && (
          <div
            style={{ marginLeft: 'auto', cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
          >
            {isExpanded ? <DownOutlined /> : <RightOutlined />}
          </div>
        )}
      </div>
      
      {isExpanded && fields.length > 0 && (
        <div style={{ marginLeft: 24 }}>
          {fields.map((field: any, index: number) => (
            <div key={index} style={{ fontSize: 12, color: '#666' }}>
              {field.comment || field.name}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TreeNode;
