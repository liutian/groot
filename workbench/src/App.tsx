import { useRoutes, useSearchParams } from 'react-router-dom';
import zhCN from 'antd/es/locale/zh_CN';
import { ConfigProvider } from 'antd';
import moment from 'moment';


import Instance from 'pages/Instance';
import Prototype from 'pages/Prototype';

moment.locale('zh-cn');

function App() {
  const [searchParams] = useSearchParams();

  const element = useRoutes([
    {
      path: '/prototype',
      element: <Prototype orgId={+searchParams.get('org')} componentId={+searchParams.get('component')} versionId={+searchParams.get('version')} />,
    }, {
      path: '/instance',
      element: <Instance appId={+searchParams.get('app')} releaseId={+searchParams.get('release')} instanceId={+searchParams.get('page')} />,
    }, {
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

export default App;
