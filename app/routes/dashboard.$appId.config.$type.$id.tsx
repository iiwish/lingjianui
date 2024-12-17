import React from 'react';
import { useParams } from '@remix-run/react';
import TabContent from '~/components/layout/TabContent';

const ConfigRoute: React.FC = () => {
  const params = useParams();
  const { type, id, appId } = params;

  if (!type || !id || !appId) {
    return null;
  }

  return (
    <TabContent
      type="config"
      elementType={type}
      elementId={id}
      appId={appId}
    />
  );
};

export default ConfigRoute;
