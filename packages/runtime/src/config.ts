import { CodeMetadata } from '@groot/core';
import { initAMDModules } from './amd';
import { Page } from './page';
import { Project } from './project';
import { UIManagerOption, UIManagerInstance } from './types';
import { debugInfo, errorInfo } from './util';

const defaultOption: UIManagerOption = {} as any;
let managerInstance: UIManagerInstance = {
  projectLoading: false,
  workerOk: false
} as any;
let bootstrapOptions: UIManagerOption;


/**
 * 管理器实例引导程序
 * @param customOption 配置项
 * @returns 管理器实例
 */
export function bootstrap(customOption: UIManagerOption): UIManagerInstance {
  bootstrapOptions = Object.assign({ ...defaultOption }, customOption);
  initAMDModules(bootstrapOptions.amd);

  // 立即加载WebWorker
  if (bootstrapOptions.loadWebWorkerOnInit) {
    loadWebWorker();
  }

  if (typeof bootstrapOptions.lazyLoadProject === 'boolean') {
    // 立即加载项目信息
    if (bootstrapOptions.lazyLoadProject === false) {
      loadProject();
    }
  } else {
    // 延迟加载项目信息
    bootstrapOptions.lazyLoadProject?.then(() => {
      loadProject();
    });
  }

  return managerInstance;
}

export function loadWebWorker(): void {
  if (managerInstance.worker) {
    return;
  }

  const workerOptions = JSON.stringify({
    tsWorkerUrl:
      'https://typescript.azureedge.net/cdn/4.3.4/monaco/min/vs/language/typescript/tsWorker.js',
  });


  const workerInstance = new Worker(new URL('./webworker', import.meta.url), {
    name: workerOptions,
  });
  workerInstance.addEventListener('message', (e) => {
    if (e.data === 'ok') {
      managerInstance.workerOk = true;
      debugInfo('ready', 'webworker');
    } else {
      debugInfo(`new message \n\n${JSON.stringify(e.data)}`, 'webworker');
    }
  });

  workerInstance.addEventListener('error', (e) => {
    errorInfo(e.message, 'webworker');
  });
  managerInstance.worker = workerInstance;
}

export function loadProject(): Promise<void> {
  if (managerInstance.project) {
    throw new Error('project has loaded');
  }

  managerInstance.projectLoading = true;
  return Promise.resolve({
    /** mock - 请求项目信息 */
    name: 'mockName',
    key: 'mockKey',
    pages: [
      {
        name: 'demo1',
        path: '/groot/page1',
        metadata: {
          moduleName: 'Button_text',
          packageName: 'antd',
          componentName: 'Button',
          props: [{ key: 'children', defaultValue: 'hello world!' }]
        }
      }
    ]
  }).then((projectData) => {
    managerInstance.projectLoading = false;
    const pages = projectData.pages.map((orignPage) => {
      const page = new Page(orignPage.name, orignPage.path, managerInstance);
      if (orignPage.metadata) {
        page.metadata = orignPage.metadata as CodeMetadata;
      }
      return page;
    })
    managerInstance.project = Project.create({ ...projectData, pages }, managerInstance);
  });
}

export { bootstrapOptions };
