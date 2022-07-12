import { CodeMetadata } from '@grootio/core';
import { initAMDModules } from './amd';
import { Page } from './Page';
import { Application } from './Application';
import { UIManagerOption, UIManagerInstance, ApplicationDataType } from './types';
import { debugInfo, errorInfo } from './util';

const defaultOption: UIManagerOption = {} as any;
let managerInstance: UIManagerInstance = {
  applicationLoading: false,
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
  initAMDModules(bootstrapOptions.AMD);

  // 立即加载WebWorker
  if (bootstrapOptions.loadWebWorkerOnInit) {
    loadWebWorker();
  }

  if (typeof bootstrapOptions.lazyLoadApplication === 'boolean') {
    // 立即加载项目信息
    if (bootstrapOptions.lazyLoadApplication === false) {
      loadApplication();
    }
  } else {
    // 延迟加载项目信息
    bootstrapOptions.lazyLoadApplication?.then(() => {
      loadApplication();
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
      'https://typescript.azureedge.net/cdn/4.4.4/monaco/min/vs/language/typescript/tsWorker.js',
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

export function loadApplication(): Promise<void> {
  if (managerInstance.application) {
    throw new Error('application has loaded');
  }

  managerInstance.applicationLoading = true;
  return getApplicationInfo().then((applicationData: ApplicationDataType) => {
    managerInstance.applicationLoading = false;
    const pages = applicationData.pages.map((orignPage) => {
      const page = new Page(orignPage.name, orignPage.path, managerInstance);
      if (orignPage.resourceUrl) {
        page.resourceUrl = orignPage.resourceUrl;
      } else if (orignPage.metadata) {
        page.metadata = orignPage.metadata as CodeMetadata;
      } else {
        errorInfo('resourceUrl and metadata can not be empty');
      }

      return page;
    })
    managerInstance.application = Application.create({ ...applicationData, pages }, managerInstance);
  });
}

function getApplicationInfo() {
  if (bootstrapOptions.cloudServer && bootstrapOptions.applicationKey) {
    return window.fetch(bootstrapOptions.cloudServer + '/application/detail/' + bootstrapOptions.applicationKey).then(response => response.json());
  } else if (window._grootApplicationInfo) {
    return Promise.resolve(window._grootApplicationInfo);
  } else {
    return Promise.reject(new Error('no application info'));
  }
}

export { bootstrapOptions };
