import { useCallback, useEffect, useState } from 'react';
import React from 'react';

import { configBootstrap, instance, loadProject } from './config';
import { Options } from './types';
import { errorInfo } from './util';

interface IPageManager<T> extends React.FC<T> {
  config: (options: Options) => void;
}

let configReady = false;

export const PageManager: IPageManager<{ path: string }> = ({ path }) => {
  const refresh = useRefresh();
  console.log('render');

  useEffect(() => {
    if (!instance.project || instance.projectLoading) {
      return;
    }

    instance.project.loadPage(path).then(
      () => {
        refresh();
      },
      (error) => {
        errorInfo(error, 'PageManager');
      }
    );
  }, [path]);

  if (configReady === false) {
    return (
      <p style={{ color: 'red' }}>Configuration must be performed first!!!</p>
    );
  }

  if (!instance.project) {
    loadProject().then(refresh);
  }

  if (instance.projectLoading) {
    return <>project loading...</>;
  }

  const page = instance.project.getPage(path);
  if (page) {
    return React.createElement(page.module.default);
  }

  return <>page loading...</>;
};

function useRefresh() {
  const [, refresh] = useState(0);
  return useCallback(() => {
    refresh((count) => ++count);
  }, []);
}

PageManager.config = (options) => {
  const instance = configBootstrap(options);
  configReady = true;
  return instance;
};
