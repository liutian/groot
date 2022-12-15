import Demo from "pages/Demo";
import Home from "pages/Home";

const routes = [
  {
    path: '/',
    element: <Home />,
  }, {
    path: '/demo',
    element: <Demo />
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