import React from 'react';
import { Button, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ModelConfigItem } from '~/types/element_model';
import TreeNode from '../TreeNode';
import type { TreeSelectNode } from '../types';

interface ModelTreeProps {
  loading: boolean;
  modelData: ModelConfigItem | null;
  selectedNode: { path: string[]; node: ModelConfigItem } | null;
  tables: TreeSelectNode[];
  onAddRootNode: () => void;
  onAddChildNode: () => void;
  onDeleteNode: () => void;
  onNodeSelect: (node: ModelConfigItem, path: string[]) => void;
}

const ModelTree: React.FC<ModelTreeProps> = ({
  loading,
  modelData,
  selectedNode,
  tables,
  onAddRootNode,
  onAddChildNode,
  onDeleteNode,
  onNodeSelect,
}) => {
  const renderNode = (node: ModelConfigItem, path: string[]) => {
    return (
      <div key={path.join('-')} style={{ marginBottom: 8 }}>
        <TreeNode
          node={node}
          onSelect={() => onNodeSelect(node, path)}
          isSelected={selectedNode?.path.join('-') === path.join('-')}
          tables={tables}
        />
        {node.childrens?.map((child, index) => (
          <div key={index} style={{ marginLeft: '24px' }}>
            {renderNode(child, [...path, index.toString()])}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        {!modelData && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAddRootNode}
          >
            添加根节点
          </Button>
        )}
        {modelData && (
          <Button
            icon={<PlusOutlined />}
            onClick={onAddChildNode}
            disabled={!selectedNode}
          >
            添加子节点
          </Button>
        )}
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={onDeleteNode}
          disabled={!selectedNode}
        >
          删除节点
        </Button>
      </div>
      {modelData && renderNode(modelData, [])}
    </div>
  );
};

export default ModelTree;
