import { CodeMetadata } from '@grootio/core';
import { initAMDModules } from './amd';
import { Page } from './page';
import { Project } from './project';
import { UIManagerOption, UIManagerInstance, ProjectDataType } from './types';
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

export function loadProject(): Promise<void> {
  if (managerInstance.project) {
    throw new Error('project has loaded');
  }

  managerInstance.projectLoading = true;
  return getProjectInfo().then((projectData: ProjectDataType) => {
    managerInstance.projectLoading = false;
    const pages = projectData.pages.map((orignPage) => {
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
    managerInstance.project = Project.create({ ...projectData, pages }, managerInstance);
  });
}

function getProjectInfo() {
  if (bootstrapOptions.cloudServer && bootstrapOptions.projectKey) {
    return window.fetch(bootstrapOptions.cloudServer + '/project/detail/' + bootstrapOptions.projectKey).then(response => response.json());
  } else if (window._grootProjectInfo) {
    return Promise.resolve(window._grootProjectInfo);
  } else {
    return Promise.reject(new Error('no project info'));
  }
}

export { bootstrapOptions };
