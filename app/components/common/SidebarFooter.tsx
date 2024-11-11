
import React from 'react';
import { GithubOutlined } from '@ant-design/icons';

export default function SidebarFooter() {
  return (
    <div style={{
      padding: '12px 8px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center',
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.45)',
    }}>
      <div>
        <a 
          href="https://github.com/iiwish/lingjian" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'rgba(255, 255, 255, 0.45)' }}
        >
          <GithubOutlined />
        </a>
      </div>
      <div style={{ marginTop: '4px' }}>
        未生科技 © 2024
      </div>
    </div>
  );
}