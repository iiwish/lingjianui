import React from 'react';
import { Card, Form, TreeSelect } from 'antd';
import type { ModelConfigItem } from '~/types/element_model';
import type { TreeSelectNode } from '../types';
import TableFields from '../TableFields';
import RelationConfig from '../RelationConfig';
import DimensionConfig from '../DimensionConfig';

interface ModelConfigPanelProps {
  selectedNode: { path: string[]; node: ModelConfigItem } | null;
  tables: TreeSelectNode[];
  nodeStates: {
    [key: string]: {
      isExpanded: boolean;
      fields: any[];
    };
  };
  parentFields: any[];
  dimensions: any[];
  onNodeUpdate: (updatedNode: ModelConfigItem) => void;
  onLoadTableFields: (tableId: number, nodePath: string) => Promise<void>;
}

const ModelConfigPanel: React.FC<ModelConfigPanelProps> = ({
  selectedNode,
  tables,
  nodeStates,
  parentFields,
  dimensions,
  onNodeUpdate,
  onLoadTableFields,
}) => {
  if (!selectedNode) {
    return (
      <div style={{ 
        textAlign: 'center', 
        color: '#999',
        marginTop: 100 
      }}>
        请选择一个节点进行配置
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card size="small" title="表格配置" bordered={false}>
        <Form.Item
          label="关联表格"
          required
          tooltip="选择要关联的数据表"
        >
          <TreeSelect
            value={selectedNode.node.table_id?.toString()}
            onChange={async (value: string | null) => {
              if (value) {
                const tableId = parseInt(value);
                const updatedNode = {
                  ...selectedNode.node,
                  table_id: tableId,
                };
                onNodeUpdate(updatedNode);
                await onLoadTableFields(tableId, selectedNode.path.join('-'));
              } else {
                const updatedNode = {
                  ...selectedNode.node,
                  table_id: 0,
                };
                onNodeUpdate(updatedNode);
                await onLoadTableFields(0, selectedNode.path.join('-'));
              }
            }}
            style={{ width: '100%' }}
            placeholder="请选择关联表格"
            allowClear
            showSearch
            treeNodeFilterProp="title"
            treeData={tables}
          />
        </Form.Item>

        {nodeStates[selectedNode.path.join('-')]?.fields && (
          <TableFields
            fields={nodeStates[selectedNode.path.join('-')].fields}
          />
        )}
      </Card>

      {selectedNode.path.length > 0 && (
        <RelationConfig
          fields={nodeStates[selectedNode.path.join('-')]?.fields || []}
          parentFields={parentFields}
          value={selectedNode.node.relationships}
          onChange={(value) =>
            onNodeUpdate({
              ...selectedNode.node,
              relationships: value,
            })
          }
        />
      )}

      <DimensionConfig
        fields={nodeStates[selectedNode.path.join('-')]?.fields || []}
        dimensions={dimensions}
        value={selectedNode.node.dimensions}
        onChange={(value) =>
          onNodeUpdate({
            ...selectedNode.node,
            dimensions: value,
          })
        }
      />
    </div>
  );
};

export default ModelConfigPanel;
