import Demo from "pages/Demo";
import Page1 from "pages/Page1";
import Home from "pages/Home";

const routes = [
  {
    path: '/',
    element: <Home />,
  }, {
    path: '/page1',
    element: <Page1 />,
  },
  // {
  //   path: '/admin',
  //   element: <Layout />,
  //   children: [{
  //     path: 'groot',
  //     children: [{ path: '*', element: <Demo /> }]
  //   }]
  // },
  {
    path: '/groot',
    children: [{ path: '*', element: <Demo /> }]
  },
  {
    path: '*',
    element: <NoMatch />
  }
];

function NoMatch() {
  return (<>not found</>)
}

export default routes;