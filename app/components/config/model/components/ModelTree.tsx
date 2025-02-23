import React from 'react';
import { Button, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ModelConfigItem,ModelTreeProps } from '~/components/config/model/modelConfigTypes';
import TreeNode from '../TreeNode';

const ModelTree: React.FC<ModelTreeProps> = ({
  loading,
  modelData,
  selectedNode,
  tables,
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
