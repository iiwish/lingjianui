
import React from 'react';
import { useAppSelector } from '~/stores';

export default function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div>
      <h1>仪表盘</h1>
      <p>欢迎, {user?.nickname || user?.username}</p>
    </div>
  );
}