import { useReducer, useState } from 'react';
import React from 'react';
import { UIManagerConfig } from '@grootio/common';

import { errorInfo } from './util';
import { ApplicationStatus } from './types';
import { Page } from './Page';
import { ApplicationInstance, bootstrap } from './application';
import { startWrapperMonitor } from './wrapper';

let app: ApplicationInstance;
// 保持最新的函数引用
let refresh: () => void;

export const UIManager: IUIManager<{ path: string }> = ({ path }) => {
  // const [, switchBool] = useState(true);
  // refresh = () => switchBool(b => !b);
  const [, _refresh] = useReducer((bool) => !bool, true);
  refresh = _refresh;


  // 确保首先执行 UIManager.init
  if (!app) {
    return (
      <p style={{ color: 'red' }}><b>UIManager.init</b> 必须首先执行!!!</p>
    );
  }

  // 加载应用
  if (app.status === ApplicationStatus.Unset) {
    app.load(() => {
      refresh();
    })
  }

  if (app.status === ApplicationStatus.BeforeLoading) {
    return <>应用准备加载</>
  }

  if (app.status === ApplicationStatus.Loading) {
    // todo 设计统一加载动画
    return <>应用加载中...</>;
  }

  if (app.status === ApplicationStatus.Fail) {
    // todo 设计统一加载动画
    return <>应用加载失败</>;
  }

  if (!app.hasPage(path)) {
    // todo 设计统一404页面
    return <>页面找不到</>;
  }

  if (app.pageLoading(path)) {
    // todo 设计统一加载动画
    return <>页面努力加载中...</>;
  }

  // 加载页面
  const loadPageResult = app.loadPage(path);

  if (loadPageResult instanceof Page) {
    // 推迟到页面加载时执行监听
    startWrapperMonitor();
    // 渲染页面组件
    return loadPageResult.rootComponent;
  } else {
    loadPageResult.then(() => {
      refresh();
    }, (error) => {
      errorInfo(error, 'UIManager');
      throw error;
    });
  }

  // todo 设计统一加载动画
  return <>页面加载中...</>;
};

UIManager.init = (config: UIManagerConfig) => {
  if (app) {
    throw new Error('UIManager.init不能重复执行');
  }
  app = bootstrap(config);

  console.log('UIManager.init .....');
  return app;
};

interface IUIManager<T> extends React.FC<T> {
  init: (config: UIManagerConfig) => ApplicationInstance;
}
