import React, { useEffect, useState } from 'react';
import { Table as AntTable, Input, Space, message, Button, Modal, Form, Row, Col } from 'antd';
import FilterArea from './common/FilterArea';
import type { ColumnsType } from 'antd/es/table';
import { getTableConfig, getTableData, createTableItems, updateTableItems, deleteTableItems, type TableConfig } from '~/services/element';
import type { ElementProps } from '~/types/element';
import { useDispatch } from 'react-redux';
import { addTab } from '~/stores/slices/tabSlice';
import { Authorized } from '~/utils/permission';
import { useNavigate } from '@remix-run/react';
import { menuTypeToRouteType } from '~/constants/elementType';

export interface Condition {
  field: string;
  operator: string;
  value: any;
}

export interface ConditionGroup {
  logic: 'AND' | 'OR';
  conditions: Array<Condition | ConditionGroup>;
}

export interface OrderBy {
  field: string;
  desc: boolean;
}

export interface TableFunc {
  queryCondition?: {
    root: ConditionGroup;
    orderBy?: OrderBy[];
    groupBy?: string[];
  };
  custom_filter?: boolean;
  query_cols?: string[];
  hide_cols?: string[];
}

interface DataType {
  id: number | string;
  [key: string]: any;
}

const Table: React.FC<ElementProps> = ({ elementId, appCode, elementType }) => {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<TableConfig | null>(null);
  const [func, setFunc] = useState<TableFunc | null>(null);
  const [data, setData] = useState<DataType[]>([]);
  const [columns, setColumns] = useState<ColumnsType<DataType>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataType | null>(null);
  const [form] = Form.useForm();
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tableHeight, setTableHeight] = useState(window.innerHeight - 200);
  const [conditions, setConditions] = useState<any>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setTableHeight(window.innerHeight - 330);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 更新columns
  useEffect(() => {
    if (config) {
      const sortedFields = config.fields.sort((a, b) => a.sort - b.sort);
      const cols: ColumnsType<DataType> = sortedFields
        .filter(field => !func?.hide_cols?.includes(field.name))
        .map(field => ({
          title: field.comment,
          dataIndex: field.name,
          key: field.name,
        }));
      setColumns(cols);
    }
  }, [config, func?.hide_cols]);

  // 加载表格配置和数据
  useEffect(() => {
    loadData(currentPage, pageSize, conditions);
  }, [elementId, appCode, currentPage, pageSize, conditions]);

  const loadData = async (page = 1, size = 10, conditions?: any) => {
    if (!elementId || !appCode) {
      setError('缺少必要参数');
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
  
      // 构造查询条件
      const queryCondition = conditions ? {
        root: conditions
      } : undefined;
  
      // 获取表格配置
      const configRes = await getTableConfig(elementId);
      if (configRes.code === 200 && configRes.data) {
        setConfig(configRes.data);
  
        // 解析func字段
        if (configRes.data.func && configRes.data.func !== '') {
          try {
            const funcData = JSON.parse(configRes.data.func);
            setFunc(funcData);
          } catch (e) {
            console.error('解析func字段失败:', e);
            setFunc(null);
          }
        } else {
          setFunc(null);
        }
  
      } else {
        throw new Error(configRes.message || '获取表格配置失败');
      }
  
      // 获取表格数据
      const dataRes = await getTableData(elementId, page, size, queryCondition);
      if (dataRes.code === 200 && dataRes.data) {
        // 确保每条数据都有id字段
        const processedData = (dataRes.data.items || []).map((item, index) => ({
          id: item.id || `row-${index}`,
          ...item
        }));
        setData(processedData);
        setTotal(dataRes.data.total);
        setCurrentPage(page);
        setPageSize(size);
      } else {
        throw new Error(dataRes.message || '获取表格数据失败');
      }
    } catch (error) {
      console.error('加载表格数据失败:', error);
      setError(error instanceof Error ? error.message : '加载表格数据失败');
      message.error('加载表格数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: DataType) => {
    setEditingRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue(record);
  };

  const handleDelete = (record: DataType) => {
    Modal.confirm({
      title: '确认删除',
      content: '你确定要删除这条记录吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const primaryKeys = config?.fields.filter(field => field.primary_key).map(field => field.name);
          if (!primaryKeys || primaryKeys.length === 0) {
            throw new Error('未找到主键列');
          }
          const deleteItems = primaryKeys.reduce((acc, key) => {
            acc[key] = record[key];
            return acc;
          }, {} as Record<string, any>);
          await deleteTableItems(elementId, [deleteItems]);
          setData(data.filter(item => !primaryKeys.every(key => item[key] === record[key])));
          message.success('删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const primaryKeys = config?.fields.filter(field => field.primary_key).map(field => field.name);
      if (!primaryKeys || primaryKeys.length === 0) {
        throw new Error('未找到主键列');
      }
      if (editingRecord) {
        const updateItems = primaryKeys.reduce((acc, key) => {
          acc[key] = editingRecord[key];
          return acc;
        }, {} as Record<string, any>);
        await updateTableItems(elementId, {
          primary_key_columns: primaryKeys,
          items: [{ ...updateItems, ...values }]
        });
        setData(data.map(item => (primaryKeys.every(key => item[key] === editingRecord[key]) ? { ...item, ...values } : item)));
        message.success('编辑成功');
      } else {
        const createRes = await createTableItems(elementId, [values]);
        if (createRes.code === 200) {
          message.success('新增成功');
        } else {
          throw new Error(createRes.message || '新增失败');
        }
        // 重新获取数据
        const dataRes = await getTableData(elementId, currentPage, pageSize, conditions);
        if (dataRes.code === 200 && dataRes.data) {
          const processedData = dataRes.data.items.map((item, index) => ({
            id: item.id || `row-${index}`,
            ...item
          }));
          setData(processedData);
          setTotal(dataRes.data.total);
        } else {
          throw new Error(dataRes.message || '获取表格数据失败');
        }
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleConfig = () => {
    const configPath = `/dashboard/${appCode}/config/${menuTypeToRouteType[elementType]}/${elementId}`;
    // 先导航到新的URL
    navigate(configPath);
    // 然后添加和激活tab
    dispatch(addTab({
      key: configPath,
      title: `${config?.display_name || '表格'}配置`,
      closable: true
    }));
  };

  const handleGlobalSearch = (value: string) => {
    if (!value.trim()) {
      setConditions(null);
      return;
    }
    if (func?.query_cols && func.query_cols.length > 0) {
      const orConditions = func.query_cols.map(col => ({
        field: col,
        operator: 'like',
        value,
      }));
      setConditions({
        logic: 'OR',
        conditions: orConditions,
      });
      setCurrentPage(1);
    }
  };

  if (error) {
    return <div style={{ padding: '24px', color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '0px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col flex="auto">
          {config && func && func?.custom_filter && (
            <FilterArea
              config={config}
              func={func}
              onSearch={(values) => {
                setConditions(values);
                setCurrentPage(1);
              }}
            />
          )}
        </Col>
        <Col>
          <Space>
            {func && func.query_cols && Array.isArray(func.query_cols) && func.query_cols.length > 0 && config && (
              <Input.Search
                placeholder={`搜索 ${func.query_cols
                  .map(col => config.fields.find(f => f.name === col)?.comment || col)
                  .join('/')} 字段`}
                allowClear
                onSearch={handleGlobalSearch}
                style={{ width: 200 }}
              />
            )}
            <Button type="primary" onClick={handleAdd}>
              新增
            </Button>
            <Authorized permission="btn:element_manage">
              <Button onClick={handleConfig}>配置</Button>
            </Authorized>
          </Space>
        </Col>
      </Row>
      <AntTable
        loading={loading}
        columns={[
          ...columns,
          {
            title: '操作',
            key: 'action',
            fixed: 'right',
            render: (_, record) => (
              <Space size="middle">
                <a onClick={() => handleEdit(record)}>编辑</a>
                <a onClick={() => handleDelete(record)}>删除</a>
              </Space>
            ),
          },
        ]}
        dataSource={data}
        rowKey="id"
        scroll={{ x: 1500, y: tableHeight }}
        size="small"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: () => `共 ${total} 条`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
            loadData(page, size, conditions);
          },
        }}
      />
      <Modal
        title={editingRecord ? '编辑记录' : '新增记录'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="horizontal" labelCol={{ span: 6 }}>
          {config?.fields
            .filter(field => !func?.hide_cols?.includes(field.name)) // 过滤掉在 hide_cols 中的字段
            .map(field => (
              <Form.Item
                key={field.name}
                name={field.name}
                label={field.comment}
                rules={[
                  {
                    required: field.not_null,
                    message: `请输入${field.comment}`,
                    validator: (_, value) => {
                      if (field.not_null && value === '') {
                        return Promise.resolve();
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input />
              </Form.Item>
            ))}
        </Form>
      </Modal>
    </div>
  );
};

export default Table;
