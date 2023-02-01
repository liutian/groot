import ReactDOM from 'react-dom/client';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import zhCN from 'antd/locale/zh_CN';
import { ConfigProvider } from 'antd';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import React from 'react';

import { PanguConfig } from '../pangu';
import { loadRemoteModule } from '@grootio/common';

const panguConfig = process.env.panguConfig as any as PanguConfig;

const bootstrap = () => {
  dayjs.locale('zh-cn');

  ReactDOM.createRoot(document.getElementById(panguConfig.rootId) as HTMLElement).render(
    <BrowserRouter>
      <App />
    </BrowserRouter >
  );
}

const routes = Object.keys(panguConfig.appConfig).map((appName) => {
  const appConfig = panguConfig.appConfig[appName];
  const Component = React.lazy(() => {
    return loadRemoteModule(appConfig.packageName, 'Main', appConfig.packageUrl)
  });

  const element = <React.Suspense  >
    <Component appEnv={process.env.APP_ENV} />
  </React.Suspense >

  return {
    path: appName,
    element
  }
})

const App = () => {

  const element = useRoutes([
    ...routes,
    , {
      path: '*',
      element: <NoMatch />
    }
  ]);

  return <ConfigProvider locale={zhCN}>
    {element}
  </ConfigProvider>
}

function NoMatch() {
  return (<>not found</>)
}

export default bootstrap;