import React, { useEffect } from 'react';
import { useParams } from '@remix-run/react';
import { Spin, message } from 'antd';
import { useAppDispatch, useAppSelector } from '~/stores';
import { setCurrentApp, setLoading, setError } from '~/stores/slices/appSlice';
import { AppService } from '~/services/app';

export default function AppDetail() {
  const { appId } = useParams();
  const dispatch = useAppDispatch();
  const { currentApp, loading, error } = useAppSelector((state) => state.app);

  const fetchAppDetail = async () => {
    if (!appId) return;
    
    try {
      dispatch(setLoading(true));
      const response = await AppService.getApp(appId);
      dispatch(setCurrentApp(response.data));
    } catch (err) {
      if (err instanceof Error) {
        dispatch(setError(err.message));
        message.error(err.message);
      } else {
        dispatch(setError('获取应用详情失败'));
        message.error('获取应用详情失败');
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchAppDetail();
  }, [appId]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        position: 'relative'
      }}>
        <Spin 
          size="large" 
          tip="加载中..." 
          style={{
            maxHeight: '100%'
          }}
          wrapperClassName="custom-spin-wrapper"
        >
          <div style={{ padding: '50px 0' }} />
        </Spin>
      </div>
    );
  }

  if (!currentApp) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%' 
      }}>
        {error || '应用不存在'}
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }}>
        <span style={{ fontSize: '32px' }}>{currentApp.icon}</span>
        <div>
          <h2 style={{ margin: 0 }}>{currentApp.name}</h2>
          <p style={{ margin: 0, color: '#666' }}>{currentApp.description}</p>
        </div>
      </div>
    </div>
  );
}
