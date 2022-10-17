import { useRoutes } from 'react-router-dom';
import zhCN from 'antd/es/locale/zh_CN';


import Instance from 'pages/Instance';
import Prototype from './pages/Prototype';
import { ConfigProvider } from 'antd';
import moment from 'moment';

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
