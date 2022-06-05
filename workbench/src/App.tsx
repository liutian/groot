import { useRoutes } from 'react-router-dom';
import Home from './Home';

function App() {
  const element = useRoutes([
    {
      path: '/component/:componentId',
      element: <Home />,
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
