import { CodeMetadata } from '@grootio/core';
import { AMDModuleOption } from './amd';
import { Page } from './Page';
import { Application } from './Application';

export type WebWorkerInputMessage = {
  type: 'transformCode';
  path: string;
  metadata: CodeMetadata;
};

export type WebWorkerOutputMessage = {
  type: 'emitCode';
  path: string;
  code: string;
};

/**
 * 配置项
 */
export type UIManagerOption = {
  /**
   * 服务器地址
   */
  cloudServer?: string;
  /**
   * 应用key
   */
  applicationKey?: string;
  /**
   * 是否提前加载WebWorker
   */
  preLoadWebWorker?: boolean;
  /**
   * 懒加载应用信息
   */
  lazyLoadApplication?: boolean | Promise<void>;
  AMD: AMDModuleOption;
  webWorker?: WebWorkerType;
  debug?: boolean;
  internalPages?: Page[];
};

export type UIManagerInstance = {
  worker?: Worker;
  workerOk: boolean;
  application?: Application;
  applicationLoading: boolean;
};

export type ApplicationDataType = {
  name: string,
  key: string,
  pages: Page[]
}

export type WebWorkerType = {
  tsWorkerUrl: string;
};