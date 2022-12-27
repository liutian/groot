import React from 'react';

export * from './entities';
export * from './runtime';
export * from './internal';
export * from './plugin';
export * from './fetch-remote-module';
export { useRegisterModel, useModel, registerModel } from './robot';




export type WorkbenchInstanceComponentType = React.FC<{
  appId: number,
  releaseId?: number,
  instanceId?: number,
  monacoConfig?: {
    baseUrl: string
  }
}>;