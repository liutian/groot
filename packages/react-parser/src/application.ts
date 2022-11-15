import { ApplicationData, IframeControlType, IframeDebuggerConfig, PostMessageType, UIManagerConfig } from '@grootio/common';

import { Page } from './Page';
import { ApplicationStatus } from './types';
import { controlMode, controlType } from './util';
import { globalConfig, setConfig } from './config';
import { resetWatch, outerSelected, updateActiveRect, respondDragOver, respondDragEnter, respondDragLeave, respondDragDrop } from './monitor';


// 应用实例对象
export const instance = {
  status: ApplicationStatus.Unset,
  load: loadApplication,
  hasPage,
  pageLoading,
  loadPage,
};

export type ApplicationInstance = typeof instance;

let iframeApplicationLoadResolve: (info: ApplicationData) => void;
let iframeDebuggerConfig: IframeDebuggerConfig;
// 当前路由导航激活的页面
let activePage: Page;
// 当前应用包含的页面
const allPageMap = new Map<string, Page>();
// 已经加载过metadata的页面
const loadedPageMap = new Map<string, Page>();
// 正在加载中的页面
const loadingPages = new Set();


export function bootstrap(customConfig: UIManagerConfig): ApplicationInstance {
  setConfig(customConfig);

  if (controlType === IframeControlType.FetchInstanceViewConfig || controlType === IframeControlType.FetchPrototypeViewConfig) {
    if (globalConfig.viewConfig) {
      globalConfig.viewConfig(controlType).then((config) => {
        window.parent.postMessage({
          type: PostMessageType.InnerSetViewConfig,
          config
        }, '*');
      }).catch(() => {
        throw new Error('get view config error');
      })
    } else {
      window.parent.postMessage({
        type: PostMessageType.InnerSetViewConfig,
      }, '*');
    }
  } else {
    if (controlMode) {
      window.parent.postMessage(PostMessageType.InnerReady, '*');
      window.addEventListener('message', onMessage);
    }

    // 立即加载应用信息
    if (globalConfig.lazyLoadApplication === false) {
      loadApplication();
    }
  }

  return instance as ApplicationInstance;
}

function onMessage(event: any) {
  const messageType = event.data.type;
  if (messageType === PostMessageType.OuterSetConfig) {
    iframeDebuggerConfig = event.data.data;
    if (iframeDebuggerConfig.runtimeConfig) {
      setConfig(iframeDebuggerConfig.runtimeConfig as any);
    }
  } else if (messageType === PostMessageType.OuterSetApplication) {
    iframeApplicationLoadResolve(event.data.data);
  } else if (messageType === PostMessageType.OuterUpdateComponent) {
    if (activePage.path !== event.data.data.path) {
      return
    }

    activePage.update(event.data.data.data);
    setTimeout(updateActiveRect);
  } else if (messageType === PostMessageType.OuterRefreshPage) {
    window.location.reload();
  } else if (messageType === PostMessageType.OuterDragComponentOver) {
    respondDragOver(event.data.data.positionX, event.data.data.positionY);
  } else if (messageType === PostMessageType.OuterDragComponentEnter) {
    respondDragEnter();
  } else if (messageType === PostMessageType.OuterDragComponentLeave) {
    respondDragLeave();
  } else if (messageType === PostMessageType.OuterDragComponentDrop) {
    respondDragDrop(event.data.data.positionX, event.data.data.positionY, event.data.data.componentId);
  } else if (messageType === PostMessageType.OuterOutlineReset) {
    resetWatch(event.data.data)
  } else if (messageType === PostMessageType.OuterWrapperSelect) {
    outerSelected(event.data.data)
  }
}

function loadApplication(success = () => { }, fail = () => { }) {
  if (globalConfig.beforeLoadApplication instanceof Promise) {
    instance.status = ApplicationStatus.BeforeLoading;
    globalConfig.beforeLoadApplication.then(() => {
      loadApplicationData().then(success, fail);
    });
  } else {
    globalConfig.beforeLoadApplication && globalConfig.beforeLoadApplication();
    loadApplicationData().then(success, fail);
  }
}

function loadApplicationData(): Promise<void> {
  if (instance.status === ApplicationStatus.OK) {
    throw new Error('应用重复加载');
  }

  instance.status = ApplicationStatus.Loading;
  return fetchApplicationData().then((data) => {
    initApplication(data);
    instance.status = ApplicationStatus.OK;
  });
}

function fetchApplicationData(): Promise<ApplicationData> {
  if (controlMode) {
    return new Promise((resolve, reject) => {
      iframeApplicationLoadResolve = resolve;
      window.parent.postMessage(PostMessageType.InnerFetchApplication, '*');
      setTimeout(() => {
        reject(new Error('load application timeout'))
      }, 3000);
    });
  } else if (window._grootApplicationData) {
    return Promise.resolve(window._grootApplicationData);
  } else if (globalConfig.appDataUrl) {
    return window.fetch(globalConfig.appDataUrl).then(response => response.json());
  } else {
    const serverUrl = globalConfig.serverUrl || 'https://api.groot.com';
    const appDataUrl = `${serverUrl}/asset/application/${globalConfig.appKey}/${globalConfig.appEnv}`;
    return window.fetch(appDataUrl).then(response => response.json());
  }
}

function initApplication(data: ApplicationData) {
  // 初始化pages
  data.instances.forEach((pageData) => {
    const page = new Page(pageData);
    if (controlMode && page.path === iframeDebuggerConfig.controlPage) {
      page.controlMode = true;
    }
    allPageMap.set(page.path, page);
  });
  if (controlMode) {
    window.parent.postMessage(PostMessageType.InnerApplicationnReady, '*');
  }
}

function hasPage(path: string) {
  return allPageMap.has(path);
}

function pageLoading(path: string) {
  return loadingPages.has(path);
}

function loadPage(path: string): Promise<Page> | Page {
  const page = allPageMap.get(path);
  activePage = page;

  if (!page) {
    return Promise.reject(new Error('页面未找到'));
  }

  if (loadedPageMap.has(path)) {
    return loadedPageMap.get(path)!;
  }

  loadingPages.add(path);
  return page.loadMetadata().then(() => {
    loadingPages.delete(path);
    loadedPageMap.set(path, page);
    page.init();
    return page;
  });
}


