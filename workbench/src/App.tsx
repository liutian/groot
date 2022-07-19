import React from 'react';
import { useRoutes } from 'react-router-dom';
import Home from './Home';

function App() {
  const element = useRoutes([
    {
      path: '/component/prototype/:componentId',
      element: React.createElement(() => <Home prototypeMode />),
    }, {
      path: '/component/instance/:componentId',
      element: React.createElement(() => <Home />),
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
