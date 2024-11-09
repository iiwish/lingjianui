import { Button, Result } from 'antd';
import { useNavigate } from '@remix-run/react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，您访问的页面不存在"
      extra={
        <Button 
          type="primary" 
          onClick={() => navigate('/')}
        >
          返回首页
        </Button>
      }
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    />
  );
}
