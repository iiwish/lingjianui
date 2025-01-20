import React from 'react';
import { Card, Form, TreeSelect } from 'antd';
import type { ModelConfigItem } from '~/types/element_model';
import type { TreeSelectNode } from '../types';

// 递归查找表格
const findTableInTree = (tables: TreeSelectNode[], value: string): TreeSelectNode | undefined => {
  for (const table of tables) {
    if (table.value === value) {
      return table;
    }
    if (table.children) {
      const found = findTableInTree(table.children, value);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};
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
            value={tables.flatMap(t => [t, ...(t.children || [])]).find(node => node.data?.source_id.toString() === selectedNode.node.source_id?.toString())?.value}
            onChange={async (value: string | null) => {
              if (value) {
                const selectedTable = findTableInTree(tables, value);
                if (!selectedTable?.data) return;
                
                // 先加载表格字段
                await onLoadTableFields(selectedTable.data.source_id, selectedNode.path.join('-'));
                
                // 更新节点，使用menu_name作为节点名称
                const updatedNode = {
                  ...selectedNode.node,
                  source_id: selectedTable.data.source_id,
                  name: selectedTable.data.menu_name,
                };
                onNodeUpdate(updatedNode);
              } else {
                // 清空表格字段
                await onLoadTableFields(0, selectedNode.path.join('-'));
                
                // 更新节点，清空表格相关信息
                const updatedNode = {
                  ...selectedNode.node,
                  source_id: 0,
                  name: '未选择表格',
                };
                onNodeUpdate(updatedNode);
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
            fields={[...nodeStates[selectedNode.path.join('-')].fields].sort((a, b) => (a.sort || 0) - (b.sort || 0))}
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
        tables={tables}
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
