import { useRoutes } from 'react-router-dom';
import zhCN from 'antd/es/locale/zh_CN';
import { ConfigProvider } from 'antd';
import moment from 'moment';


import Instance from 'pages/Instance';
import Prototype from 'pages/Prototype';

moment.locale('zh-cn');

function App() {
  const element = useRoutes([
    {
      path: '/prototype',
      element: <Prototype />,
    }, {
      path: '/instance',
      element: <Instance />,
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
