import React from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface TableField {
  name: string;
  type: string;
  comment?: string;
}

interface TableFieldsProps {
  fields: TableField[];
  selectedFields?: string[];
  onFieldSelect?: (field: TableField) => void;
}

const TableFields: React.FC<TableFieldsProps> = ({
  fields,
  selectedFields = [],
  onFieldSelect,
}) => {
  const columns: ColumnsType<TableField> = [
    {
      title: '字段名',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: '20%',
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'comment',
      key: 'comment',
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={fields}
      size="small"
      pagination={false}
      rowKey="name"
      onRow={(record) => ({
        onClick: () => onFieldSelect?.(record),
        style: {
          cursor: onFieldSelect ? 'pointer' : 'default',
          backgroundColor: selectedFields.includes(record.name) ? '#e6f7ff' : undefined,
        },
      })}
    />
  );
};

export default TableFields;
