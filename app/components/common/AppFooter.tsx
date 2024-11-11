import React from 'react';
import { GithubOutlined, BilibiliOutlined } from '@ant-design/icons';

interface AppFooterProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function AppFooter({ className, style }: AppFooterProps) {
  return (
    <div style={{
      textAlign: 'center',
      color: '#666',
      fontSize: '12px',
      ...style
    }} className={className}>
      <div style={{ marginBottom: '4px' }}>
        <a 
          href="https://github.com/iiwish/lingjian" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#666', margin: '0 12px' }}
        >
          <GithubOutlined /> GitHub
        </a>
        <a 
          href="https://space.bilibili.com/11618958/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#666', margin: '0 12px' }}
        >
          <BilibiliOutlined /> BiliBili
        </a>
      </div>
      <div>Copyright © 北京未生科技有限公司</div>
    </div>
  );
}