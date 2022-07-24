import { useRoutes } from 'react-router-dom';

import Editor from 'pages/Editor';
import Scaffold from './pages/Scaffold';

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

  return element;
}

function NoMatch() {
  return (<>not found</>)
}

export default App;
