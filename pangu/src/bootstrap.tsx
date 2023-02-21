import ReactDOM from 'react-dom/client';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import zhCN from 'antd/locale/zh_CN';
import { ConfigProvider } from 'antd';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { PanguConfig } from '../pangu';
import { loadRemoteModule } from '@grootio/common';

const panguConfig = process.env.panguConfig as any as PanguConfig;

const bootstrap = () => {
  dayjs.locale('zh-cn');

  ReactDOM.createRoot(document.getElementById(panguConfig.rootId) as HTMLElement).render(
    <ConfigProvider locale={zhCN} theme={{ token: { borderRadius: 1 } }}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

const router = createBrowserRouter(Object.keys(panguConfig.appConfig).map((appName) => {
  const appConfig = panguConfig.appConfig[appName];
  const Component = React.lazy(() => {
    return loadRemoteModule(appConfig.packageName, 'Main', appConfig.packageUrl)
  });

  const element = <React.Suspense  >
    <Component appEnv={process.env.APP_ENV} appName={appName} rootId={panguConfig.rootId} />
  </React.Suspense >


  const Wrapper = () => {
    useState(() => {
      document.body.classList.add(appName);
      document.documentElement.classList.add(appName);
    })

    useEffect(() => {
      return () => {
        document.body.classList.remove(appName);
        document.documentElement.classList.remove(appName);
      }
    }, [])

    return element
  }

  return {
    path: `/${appName}/*`,
    element: <Wrapper />
  }
}).concat({
  path: '*',
  element: <NoMatch />
}))


function NoMatch() {
  return (<>not found</>)
}

export default bootstrap;