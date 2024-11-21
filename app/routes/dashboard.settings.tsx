import React from 'react';
import { Outlet } from '@remix-run/react';
import MainLayout from '~/components/layouts/MainLayout';

export default function Settings() {
  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Outlet />
      </div>
    </MainLayout>
  );
}
