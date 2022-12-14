import Home from "pages/Home";

const routes = [
  {
    path: '/',
    element: <Home />,
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