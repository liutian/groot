import { useRoutes } from 'react-router-dom';
import zhCN from 'antd/es/locale/zh_CN';


import Editor from 'pages/Editor';
import Scaffold from './pages/Scaffold';
import { ConfigProvider } from 'antd';
import moment from 'moment';

moment.locale('zh-cn');

function App() {
  const element = useRoutes([
    {
      path: '/scaffold',
      element: <Scaffold />,
    }, {
      path: '/editor',
      element: <Editor />,
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
