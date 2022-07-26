import { useState } from 'react';
import React from 'react';

import { errorInfo } from './util';
import { ApplicationStatus } from './types';
import { Page } from './Page';
import { ApplicationInstance, bootstrap } from './application';
import { UIManagerConfig } from '@grootio/common';

let app: ApplicationInstance;
// 保持最新的函数引用
let refresh: () => void;

export const UIManager: IUIManager<{ path: string }> = ({ path }) => {
  const [, switchBool] = useState(true);
  refresh = () => switchBool(b => !b);

  // 确保首先执行 UIManager.init
  if (!app) {
    return (
      <p style={{ color: 'red' }}><b>UIManager.init</b> must execute first!!!</p>
    );
  }

  // 加载应用
  if (app.status === ApplicationStatus.Unset) {
    app.load(() => {
      refresh();
    })
  }

  if (app.status === ApplicationStatus.Loading) {
    // todo 设计统一加载动画
    return <>application loading...</>;
  }

  if (app.status === ApplicationStatus.Fail) {
    // todo 设计统一加载动画
    return <>application load fail</>;
  }

  if (!app.hasPage(path)) {
    // todo 设计统一404页面
    return <>page not found</>;
  }

  if (app.pageLoading(path)) {
    // todo 设计统一加载动画
    return <>page loading...</>;
  }

  // 加载页面
  const loadPageResult = app.loadPage(path);

  if (loadPageResult instanceof Page) {
    // 渲染页面组件
    return loadPageResult.rootComponent;
  } else {
    loadPageResult.then(() => {
      refresh();
    }, (error) => {
      errorInfo(error, 'UIManager');
    });
  }

  // todo 设计统一加载动画
  return <>page loading...</>;
};

UIManager.init = (config: UIManagerConfig) => {
  if (app) {
    throw new Error('UIManager.init have been executed');
  }
  app = bootstrap(config);

  console.log('UIManager.init .....');
  return app;
};

interface IUIManager<T> extends React.FC<T> {
  init: (config: UIManagerConfig) => ApplicationInstance;
}
