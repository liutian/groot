import { CodeMetadata } from '@groot-elf/core';
import { AMDModuleOption } from './amd';
import { Page } from './page';
import { Project } from './project';

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
   * 拉取代码元数据的服务器地址
   */
  cloudServer?: string;
  /**
   * 项目key
   */
  projectKey?: string;
  /**
   * 是否立即加载WebWorker
   */
  loadWebWorkerOnInit?: boolean;
  /**
   * 懒加载项目信息
   */
  lazyLoadProject?: boolean | Promise<void>;
  amd: AMDModuleOption;
  webWorker?: WebWorkerType;
  debug?: boolean;
  internalPages?: Page[];
};

export type UIManagerInstance = {
  worker?: Worker;
  workerOk: boolean;
  project?: Project;
  projectLoading: boolean;
};

export type ProjectDataType = {
  name: string,
  key: string,
  pages: Page[]
}

export type WebWorkerType = {
  tsWorkerUrl: string;
};