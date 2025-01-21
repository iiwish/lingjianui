import { useEffect, useState } from 'react';
import { useModelData } from './useModelData';
import type { ModelConfigItem } from '~/types/config/model';

interface DimensionItem {
  id: number;
  name: string;
  type: string;
  children?: DimensionItem[];
}

interface UseDimensionDataProps {
  elementId: string;
}

export const useDimensionData = ({ elementId }: UseDimensionDataProps) => {
  const { modelData } = useModelData({ elementId });
  const [dimensions, setDimensions] = useState<DimensionItem[]>([]);

  useEffect(() => {
    if (modelData) {
      const processData = (data: ModelConfigItem[]): DimensionItem[] => {
        return data.map(item => ({
          id: item.source_id || 0, // 使用source_id作为id
          name: item.name || '',
          type: 'dimension', // 默认类型
          children: item.childrens ? processData(item.childrens) : undefined
        }));
      };

      setDimensions(processData([modelData]));
    }
  }, [modelData]);

  return { dimensions };
};
