import { useState } from 'react';
import { message, Modal } from 'antd';
import type { ModelConfigItem } from '~/types/element_model';
import { useAppDispatch } from '~/stores';
import { setConfig } from '~/stores/slices/modelConfigSlice';

export const useModelOperations = (
  modelData: ModelConfigItem | null,
  setModelData: React.Dispatch<React.SetStateAction<ModelConfigItem | null>>,
  selectedNode: { path: string[]; node: ModelConfigItem } | null,
  setSelectedNode: (node: { path: string[]; node: ModelConfigItem } | null) => void,
) => {
  const dispatch = useAppDispatch();

  const handleAddRootNode = () => {
    if (modelData) {
      message.error('根节点已存在');
      return;
    }
    setModelData({
      source_id: 0,
      relationships: undefined,
      dimensions: [],
      childrens: [],
    });
  };

  const handleAddChildNode = () => {
    if (!selectedNode) {
      message.error('请先选择一个节点');
      return;
    }

    const newNode: ModelConfigItem = {
      source_id: 0,
      relationships: {
        type: '1:1',
        fields: [],
      },
      dimensions: [],
      childrens: [],
    };

    const updateNodeAtPath = (
      node: ModelConfigItem,
      path: string[],
      depth: number
    ): ModelConfigItem => {
      if (depth === path.length) {
        return {
          ...node,
          childrens: [...(node.childrens || []), newNode],
        };
      }

      const index = parseInt(path[depth]);
      const newChildren = [...(node.childrens || [])];
      
      if (!newChildren[index]) {
        console.error(`Node at index ${index} does not exist`);
        return node;
      }
      
      newChildren[index] = updateNodeAtPath(
        newChildren[index],
        path,
        depth + 1
      );

      return {
        ...node,
        childrens: newChildren,
      };
    };

    setModelData((prev: ModelConfigItem | null) => {
      if (!prev) return newNode;
      return updateNodeAtPath(prev, selectedNode.path, 0);
    });
  };

  const handleDeleteNode = () => {
    if (!selectedNode) {
      message.error('请先选择一个节点');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该节点及其所有子节点吗？',
      onOk: () => {
        const deleteNodeAtPath = (
          node: ModelConfigItem,
          path: string[],
          depth: number
        ): ModelConfigItem | null => {
          // 处理根节点删除
          if (path.length === 0) {
            return null;
          }

          if (depth === path.length - 1) {
            const index = parseInt(path[depth]);
            
            const newChildren = [...(node.childrens || [])];
            if (index >= 0 && index < newChildren.length) {
              newChildren.splice(index, 1);
            }
            return {
              ...node,
              childrens: newChildren.length > 0 ? newChildren : undefined,
            };
          }

          const index = parseInt(path[depth]);
          const newChildren = [...(node.childrens || [])];
          
          if (!newChildren[index]) {
            console.error(`Node at index ${index} does not exist`);
            return node;
          }
          
          const updatedChild = deleteNodeAtPath(
            newChildren[index],
            path,
            depth + 1
          );
          
          if (updatedChild === null) {
            newChildren.splice(index, 1);
          } else {
            newChildren[index] = updatedChild;
          }

          return {
            ...node,
            childrens: newChildren.length > 0 ? newChildren : undefined,
          };
        };

        setModelData((prev: ModelConfigItem | null) => {
          if (!prev) return null;
          const result = deleteNodeAtPath(prev, selectedNode.path, 0);
          return result;
        });
        setSelectedNode(null);
      },
    });
  };

  const handleNodeUpdate = (updatedNode: ModelConfigItem) => {
    if (!selectedNode || !modelData) return;

    let newModelData: ModelConfigItem;

    if (selectedNode.path.length === 0) {
      newModelData = {
        ...modelData,
        ...updatedNode,
        childrens: modelData.childrens || [],
      };
    } else {
      const updateNodeAtPath = (
        node: ModelConfigItem,
        path: string[],
        depth: number
      ): ModelConfigItem => {
        if (depth === path.length) {
          return {
            ...node,
            ...updatedNode,
            childrens: node.childrens || [],
          };
        }

        const index = parseInt(path[depth]);
        const newChildren = [...(node.childrens || [])];
        
        if (!newChildren[index]) {
          console.error(`Node at index ${index} does not exist in handleNodeUpdate`);
          return node;
        }
        
        newChildren[index] = updateNodeAtPath(
          newChildren[index],
          path,
          depth + 1
        );

        return {
          ...node,
          childrens: newChildren,
        };
      };

      newModelData = updateNodeAtPath(modelData, selectedNode.path, 0);
    }

    setModelData(newModelData);

    let updatedSelectedNode = newModelData;
    for (const index of selectedNode.path) {
      updatedSelectedNode = updatedSelectedNode.childrens?.[parseInt(index)] || updatedSelectedNode;
    }

    setSelectedNode({
      path: selectedNode.path,
      node: updatedSelectedNode,
    });

    dispatch(setConfig(newModelData));
  };

  return {
    handleAddRootNode,
    handleAddChildNode,
    handleDeleteNode,
    handleNodeUpdate,
  };
};
