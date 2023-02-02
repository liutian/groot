import React from 'react';

export * from './entities';
export * from './runtime';
export * from './internal';
export * from './extension';
export * from './fetch-remote-module';
export { useRegisterModel, useModel, registerModel } from './robot';
export * from './request-factory';
export * from './api/API.common';
export * from './api/API.path';
export * from './api/API.store';
export * from './util';
export * from './data';


export type WorkbenchInstanceComponentType = React.FC<{
  appId: number,
  releaseId?: number,
  instanceId?: number,
  monacoConfig?: {
    baseUrl: string
  }
}>;