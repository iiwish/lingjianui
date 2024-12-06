import React, { useEffect, useState } from 'react';
import { Table as AntTable, Input, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'react';
import { useParams } from '@remix-run/react';
import { getTableConfig, getTableData, type TableConfig } from '~/services/element';

interface TableFunc {
  filter?: Array<{
    col: string;
    type: string;
  }>;
  query_cols?: string[];
  hide_cols?: string[];
}

interface DataType {
  id: number | string;
  [key: string]: any;
}

export default function Table() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<TableConfig | null>(null);
  const [func, setFunc] = useState<TableFunc | null>(null);
  const [data, setData] = useState<DataType[]>([]);
  const [columns, setColumns] = useState<ColumnsType<DataType>>([]);

  // 加载表格配置和数据
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // 获取表格配置
        const configRes = await getTableConfig(id);
        if (configRes.code === 200 && configRes.data) {
          setConfig(configRes.data);
          
          // 解析func字段
          if (configRes.data.func) {
            try {
              const funcData = JSON.parse(configRes.data.func);
              setFunc(funcData);
            } catch (e) {
              console.error('解析func字段失败:', e);
            }
          }
        } else {
          message.error('获取表格配置失败');
          return;
        }

        // 获取表格数据
        const dataRes = await getTableData(id);
        if (dataRes.code === 200 && dataRes.data) {
          // 确保每条数据都有id字段
          const processedData = dataRes.data.map((item, index) => ({
            id: item.id || `row-${index}`,
            ...item
          }));
          setData(processedData);
          
          // 如果有数据,根据第一条数据生成列配置
          if (processedData.length > 0) {
            const firstRow = processedData[0];
            const cols: ColumnsType<DataType> = Object.keys(firstRow)
              .filter(key => !func?.hide_cols?.includes(key))
              .map(key => {
                const baseColumn = {
                  title: key,
                  dataIndex: key,
                  key: key,
                };

                // 如果是快速查询列,添加筛选功能
                if (func?.query_cols?.includes(key)) {
                  return {
                    ...baseColumn,
                    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                      <div style={{ padding: 8 }}>
                        <Input
                          placeholder={`搜索 ${key}`}
                          value={selectedKeys[0]}
                          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                          onPressEnter={() => confirm()}
                          style={{ width: 188, marginBottom: 8, display: 'block' }}
                        />
                        <Space>
                          <a onClick={() => confirm()}>确定</a>
                          <a onClick={() => clearFilters && clearFilters()}>重置</a>
                        </Space>
                      </div>
                    ),
                    onFilter: (value: Key | boolean, record: DataType) => {
                      const recordValue = record[key];
                      if (recordValue == null) return false;
                      return recordValue.toString().toLowerCase()
                        .includes(value.toString().toLowerCase());
                    },
                    filterIcon: (filtered: boolean) => (
                      <span style={{ color: filtered ? '#1890ff' : undefined }}>🔍</span>
                    )
                  };
                }

                return baseColumn;
              });
            setColumns(cols);
          }
        } else {
          message.error('获取表格数据失败');
        }
      } catch (error) {
        console.error('加载表格数据失败:', error);
        message.error('加载表格数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  return (
    <div style={{ padding: '24px' }}>
      <AntTable
        loading={loading}
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`
        }}
      />
    </div>
  );
}
