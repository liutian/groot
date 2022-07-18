import { Page } from './Page';
import { ApplicationStatus } from './types';
import { ApplicationData, IframeHostConnfig, PostMessageType, UIManagerConfig } from '@grootio/types';
import { designMode, iframeNamePrefix } from './util';
import { globalConfig, setConfig } from './config';


// 应用实例对象
const instance = {
  status: ApplicationStatus.Unset,
  load: loadApplication,
  hasPage,
  pageLoading,
  loadPage
};

export type ApplicationInstance = typeof instance;

let iframeApplicationLoadResolve: (info: Object) => void;
let iframeHostConfig: IframeHostConnfig;
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

  if (designMode) {
    // 从父级iframe的name中获取配置信息，这样可以即时获取数据
    // todo 父级重置iframe name时是否可以获取最新数据
    iframeHostConfig = JSON.parse(window.self.name.replace(new RegExp('^' + iframeNamePrefix), ''));
    if (iframeHostConfig.runtimeConfig) {
      setConfig(iframeHostConfig.runtimeConfig);
    }
    window.parent.postMessage(PostMessageType.OK, '*');
    window.addEventListener('message', (event: any) => {
      const messageType = event.data.type;
      if (messageType === PostMessageType.Init_Application) {
        iframeApplicationLoadResolve(event.data.data);
      } else if (messageType === PostMessageType.Update_Component) {
        updateComponentProp(event.data.data);
      }
    });
  }

  // 立即加载应用信息
  if (globalConfig.lazyLoadApplication === false) {
    loadApplication();
  }

  return instance as ApplicationInstance;
}

function loadApplication(success = () => { }, fail = () => { }) {
  if (globalConfig.beforeLoadApplication instanceof Promise) {
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
    throw new Error('application already existed');
  }

  instance.status = ApplicationStatus.Loading;
  return getApplicationData().then((data) => {
    initApplication(data);
    instance.status = ApplicationStatus.OK;
  });
}

function getApplicationData() {
  if (designMode && iframeHostConfig.rewriteApplicationData) {
    return new Promise((resolve, reject) => {
      iframeApplicationLoadResolve = resolve;
      window.parent.postMessage(PostMessageType.Fetch_Application, '*');
      setTimeout(() => {
        reject(new Error('load application timeout'))
      }, 3000);
    });
  }

  if (globalConfig.cloudServer && globalConfig.applicationKey) {
    return window.fetch(globalConfig.cloudServer + '/application/detail/' + globalConfig.applicationKey).then(response => response.json());
  } else if (window._grootApplicationData) {
    return Promise.resolve(window._grootApplicationData);
  } else {
    return Promise.reject(new Error('not found cloudServer and applicationKey'));
  }
}

function initApplication(data: ApplicationData) {
  // 初始化pages
  data.pages.forEach((pageData) => {
    const page = new Page(pageData);
    if (designMode && page.path === iframeHostConfig.designPage) {
      page.designMode = true;
    }
    allPageMap.set(page.path, page);
  });
  if (designMode) {
    window.parent.postMessage(PostMessageType.Ready_Applicationn, '*');
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
    return Promise.reject(new Error('not found page'));
  }

  if (loadedPageMap.has(path)) {
    return loadedPageMap.get(path)!;
  }

  loadingPages.add(path);
  return page.loadMetadata().then(() => {
    loadingPages.delete(path);
    loadedPageMap.set(path, page);
    page.compile();

    if (designMode && page.designMode) {
      window.parent.postMessage(PostMessageType.Ready_Page, '*',);
    }
    return page;
  });
}

function updateComponentProp(data) {
  const path = data.path as string;
  if (path === activePage.path) {
    activePage.incrementUpdate(data.metadata);
  }
}