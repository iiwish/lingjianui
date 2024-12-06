import React, { useEffect, useState } from 'react';
import { Tree, Spin, message } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useParams } from '@remix-run/react';
import { 
  getDimensionConfig, 
  getDimensionData,
  type DimensionConfig,
  type DimensionItem 
} from '~/services/element';

export default function Dimension() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<DimensionConfig | null>(null);
  const [treeData, setTreeData] = useState<DataNode[]>([]);

  // 将维度数据转换为Tree组件需要的格式
  const transformToTreeData = (items: DimensionItem[]): DataNode[] => {
    return items.map(item => ({
      key: item.id.toString(),
      title: item.name,
      children: item.children ? transformToTreeData(item.children) : undefined
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // 获取维度配置
        const configRes = await getDimensionConfig(id);
        if (configRes.code === 200 && configRes.data) {
          setConfig(configRes.data);
        } else {
          message.error('获取维度配置失败');
          return;
        }

        // 获取维度数据
        const dataRes = await getDimensionData(id);
        if (dataRes.code === 200 && Array.isArray(dataRes.data)) {
          const treeData = transformToTreeData(dataRes.data);
          setTreeData(treeData);
        } else {
          message.error('获取维度数据失败');
        }
      } catch (error) {
        console.error('加载维度数据失败:', error);
        message.error('加载维度数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {config && (
        <div style={{ marginBottom: '16px' }}>
          <h2>{config.display_name}</h2>
          {config.description && <p>{config.description}</p>}
        </div>
      )}
      <Tree
        treeData={treeData}
        defaultExpandAll
        showLine
        showIcon
      />
    </div>
  );
}
