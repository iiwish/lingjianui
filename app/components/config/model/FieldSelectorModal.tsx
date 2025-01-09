import React, { useState } from 'react';
import { Modal, Table, Space, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Field {
  name: string;
  type: string;
  comment?: string;
}

interface FieldSelectorModalProps {
  visible: boolean;
  leftFields: Field[];
  rightFields: Field[];
  selectedFields: { left?: string; right?: string };
  onCancel: () => void;
  onOk: (selected: { left?: string; right?: string }) => void;
}

const columns: ColumnsType<Field> = [
  {
    title: '字段名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: '注释',
    dataIndex: 'comment',
    key: 'comment',
    render: (text) => text || '-',
  },
];

const FieldSelectorModal: React.FC<FieldSelectorModalProps> = ({
  visible,
  leftFields,
  rightFields,
  selectedFields,
  onCancel,
  onOk,
}) => {
  const [leftSelected, setLeftSelected] = useState<string | undefined>(selectedFields.left);
  const [rightSelected, setRightSelected] = useState<string | undefined>(selectedFields.right);

  const handleRowClick = (side: 'left' | 'right', record: Field) => {
    if (side === 'left') {
      setLeftSelected(record.name);
    } else {
      setRightSelected(record.name);
    }
  };

  return (
    <Modal
      title="选择关联字段"
      visible={visible}
      width={800}
      onCancel={onCancel}
      onOk={() => onOk({ left: leftSelected, right: rightSelected })}
      okText="确定"
      cancelText="取消"
    >
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h4>父表字段</h4>
          <Table
            columns={columns}
            dataSource={leftFields}
            rowKey="name"
            rowSelection={{
              type: 'radio',
              selectedRowKeys: leftSelected ? [leftSelected] : [],
              onChange: (selectedRowKeys) => setLeftSelected(selectedRowKeys[0] as string),
            }}
            onRow={(record) => ({
              onClick: () => handleRowClick('left', record),
            })}
            pagination={false}
            scroll={{ y: 300 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <h4>当前表字段</h4>
          <Table
            columns={columns}
            dataSource={rightFields}
            rowKey="name"
            rowSelection={{
              type: 'radio',
              selectedRowKeys: rightSelected ? [rightSelected] : [],
              onChange: (selectedRowKeys) => setRightSelected(selectedRowKeys[0] as string),
            }}
            onRow={(record) => ({
              onClick: () => handleRowClick('right', record),
            })}
            pagination={false}
            scroll={{ y: 300 }}
          />
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <h4>已选字段</h4>
        <Space>
          <span>父表字段: {leftSelected || '未选择'}</span>
          <span>当前表字段: {rightSelected || '未选择'}</span>
        </Space>
      </div>
    </Modal>
  );
};

export default FieldSelectorModal;
