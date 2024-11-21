import React from 'react';
import { Outlet } from '@remix-run/react';

export default function Settings() {
  return (
    <div style={{ padding: '24px' }}>
      <Outlet />
    </div>
  );
}
