import React from 'react';
import { Card, Typography, Space, Tag, Tooltip, Badge } from 'antd';
import { TableOutlined, DownOutlined, RightOutlined, DatabaseOutlined } from '@ant-design/icons';
import type { ModelConfigItem } from '~/types/element_model';

const { Text } = Typography;

interface TreeNodeProps {
  node: ModelConfigItem;
  fields: any[];
  isExpanded: boolean;
  onToggleExpand: () => void;
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
  fields,
  isExpanded,
  onToggleExpand,
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Space>
            <DatabaseOutlined style={{ color: '#1890ff' }} />
            <Text strong>
              {node.name || (node.table_id 
                ? (tables.find(t => t.data?.source_id === node.table_id)?.data?.menu_name || `表格 ${node.table_id}`)
                : '未选择表格'
              )}
            </Text>
          </Space>
          {fields.length > 0 && (
            <>
              <Badge 
                count={fields.length} 
                style={{ 
                  backgroundColor: '#52c41a',
                  marginLeft: 8 
                }} 
              />
              <div
                style={{ marginLeft: 'auto', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand();
                }}
              >
                {isExpanded ? <DownOutlined /> : <RightOutlined />}
              </div>
            </>
          )}
        </div>
        
        {isExpanded && fields.length > 0 && (
          <div style={{ 
            marginLeft: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '4px 0'
          }}>
            {fields.map((field: any, index: number) => (
              <Tooltip 
                key={index}
                title={field.comment}
                placement="right"
              >
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 13,
                  padding: '2px 0'
                }}>
                  <Text style={{ 
                    color: '#666',
                    marginRight: 8,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {field.name}
                  </Text>
                  <Tag 
                    color="blue" 
                    style={{ 
                      marginRight: 0,
                      fontSize: 11,
                      lineHeight: '16px',
                      padding: '0 4px'
                    }}
                  >
                    {field.type}
                  </Tag>
                </div>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TreeNode;
