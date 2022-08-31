import { useCallback, useState } from 'react';
import React from 'react';

import { bootstrap, loadApplication } from './bootstrap';
import { errorInfo } from './util';
import { UIManagerOption, UIManagerInstance } from './types';
import { Page } from './Page';

let instanceReady = false;
let managerInstance: UIManagerInstance;
const loadingPages: Set<string> = new Set();

let refresh: Function;

let refreshListenerMap = new Map<string, { page: Page, listener: Function }>();

function watchRefreshOnlyOne(page: Page, listener: Function) {
  if (refreshListenerMap.has(page.path)) {
    const oldListener = refreshListenerMap.get(page.path)?.listener;
    page.removeEventListener('refresh', oldListener as any);
  }
  page.addEventListener('refresh', listener as any);
  refreshListenerMap.set(page.path, { page, listener });
}

export const UIManager: IUIManager<{ path: string }> = ({ path }) => {
  refresh = useRefresh();

  // 确保首先执行 UIManager.init
  if (instanceReady === false) {
    return (
      <p style={{ color: 'red' }}><b>UIManager.init</b> must be performed first!!!</p>
    );
  }

  if (!managerInstance.application && managerInstance.applicationLoading !== true) {
    loadApplication().then(() => {
      refresh();
    });
  }

  if (managerInstance.applicationLoading) {
    return <>application loading...</>;
  }

  if (!managerInstance.application.hasPage(path)) {
    // todo 支持动态路由
    return <>page not found</>;
  }

  if (loadingPages.has(path)) {
    return <>page loading...</>;
  }

  const loadPageResult = managerInstance.application.loadPage(path);
  if (loadPageResult instanceof Page) {
    // 热更新
    watchRefreshOnlyOne(loadPageResult, () => {
      refresh();
    });
    // 渲染页面组件
    return React.createElement(loadPageResult.module.default);
  } else {
    loadingPages.add(path);
    loadPageResult.then(
      () => {
        loadingPages.delete(path);
        refresh();
      },
      (error) => {
        errorInfo(error, 'PageManager');
      }
    );
  }

  return <>page loading...</>;
};

/**
 * 强制刷新渲染
 */
function useRefresh() {
  const [, refresh] = useState(true);
  return useCallback(() => {
    refresh((bool) => !bool);
  }, []);
}

/**
 * 管理器初始化
 * @param options 配置对象
 * @returns 管理器实例
 */
UIManager.init = (options: UIManagerOption) => {
  if (instanceReady) {
    throw new Error('UIManager.init have been performed');
  }
  managerInstance = bootstrap(options);
  instanceReady = true;
  return managerInstance;
};


interface IUIManager<T> extends React.FC<T> {
  init: (options: UIManagerOption) => UIManagerInstance;
}
