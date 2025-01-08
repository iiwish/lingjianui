import React from 'react';
import { Authorized } from '~/utils/permission';
import ModelConfigComponent from './model';

interface Props {
  elementId: string;
  appCode: string;
  parentId?: string | null;
}

const ModelConfig: React.FC<Props> = (props) => {
  return (
    <Authorized permission="btn:element_manage">
      <ModelConfigComponent {...props} />
    </Authorized>
  );
};

export default ModelConfig;
