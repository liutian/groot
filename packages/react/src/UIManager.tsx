import React, { useReducer } from 'react';

import { ApplicationStatus, View, ApplicationInstance, bootstrap } from '@grootio/runtime';
import { UIManagerConfig } from '@grootio/common';
import { defaultConfig } from './config';

let app: ApplicationInstance;

export const UIManager: IUIManager<{ viewKey: string }> = ({ viewKey }) => {
  const [, refresh] = useReducer((bool) => !bool, true);

  // 确保首先执行 UIManager.init
  if (!app) {
    return (<p style={{ color: 'red' }}>请先执行<b>UIManager.init</b>!!!</p>);
  }

  // 加载应用
  if (app.status === ApplicationStatus.Init) {
    app.loadApp(() => {
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

  if (!app.hasView(viewKey)) {
    // todo 设计统一404页面
    return <>页面找不到</>;
  }

  if (app.viewLoading(viewKey)) {
    // todo 设计统一加载动画
    return <>页面加载中...</>;
  }

  // 加载页面
  const loadPageResult = app.loadView(viewKey);

  if (loadPageResult instanceof View) {

    // 渲染页面组件
    return loadPageResult.rootComponent;
  } else {
    loadPageResult.then(() => {
      refresh();
    }, (error) => {
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
  app = bootstrap(config, defaultConfig as any);

  console.log('UIManager.init .....');
  return app;
};

interface IUIManager<T> extends React.FC<T> {
  init: (config: UIManagerConfig) => ApplicationInstance;
}
