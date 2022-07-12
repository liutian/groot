import { CodeMetadata } from '@grootio/core';
import { initAMDModules } from './amd';
import { Page } from './Page';
import { Application } from './Application';
import { UIManagerOption, UIManagerInstance, ApplicationDataType } from './types';
import { debugInfo, errorInfo } from './util';
import { globalOptions, setOptions } from './config';


let managerInstance: UIManagerInstance = {
  applicationLoading: false,
  workerOk: false
} as any;


/**
 * 管理器实例引导程序
 * @param customOption 配置项
 * @returns 管理器实例
 */
export function bootstrap(customOption: UIManagerOption): UIManagerInstance {
  setOptions(customOption);
  initAMDModules(globalOptions.AMD);

  // 是否提前加载WebWorker
  if (globalOptions.preLoadWebWorker) {
    loadWebWorker();
  }

  if (typeof globalOptions.lazyLoadApplication === 'boolean') {
    // 立即加载应用信息
    if (globalOptions.lazyLoadApplication === false) {
      loadApplication();
    }
  } else {
    // 延迟加载应用信息
    globalOptions.lazyLoadApplication?.then(() => {
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
    throw new Error('application already existed');
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
  if (globalOptions.cloudServer && globalOptions.applicationKey) {
    return window.fetch(globalOptions.cloudServer + '/application/detail/' + globalOptions.applicationKey).then(response => response.json());
  } else if (window._grootApplicationInfo) {
    return Promise.resolve(window._grootApplicationInfo);
  } else {
    return Promise.reject(new Error('no application info'));
  }
}

