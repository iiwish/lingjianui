// 字段类型选项
export const FIELD_TYPES = [
  { label: 'varchar', value: 'varchar' },
  { label: 'int', value: 'int' },
  { label: 'bigint', value: 'bigint' },
  { label: 'double', value: 'double' },
  { label: 'decimal', value: 'decimal' },
  { label: 'date', value: 'date' },
  { label: 'datetime', value: 'datetime' },
  { label: 'boolean', value: 'boolean' },
  { label: 'text', value: 'text' },
  { label: 'json', value: 'json' },
];

// 索引类型选项
// export const INDEX_TYPES = [
//   { label: 'normal', value: 'normal' },
//   { label: 'unique', value: 'unique' },
//   { label: 'fulltext', value: 'fulltext' },
// ];

export const INDEX_MONTHODS = [
  { label: 'BTREE', value: 'BTREE' },
  { label: 'HASH', value: 'HASH' },
];