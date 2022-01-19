import { CodeMetadata } from '@groot/core';
import { AMDOptions } from './amd';
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


export type Options = AMDOptions & {
  server: string;
  lazyLoadWorker?: boolean | Promise<void>;
  lazyLoadProject?: boolean | Promise<void>;
  debug?: boolean;
};

export type GrootInstance = {
  worker: Worker;
  workerOk: boolean;
  project: Project;
  projectLoading: boolean;
};
