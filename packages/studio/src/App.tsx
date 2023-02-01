import { ConfigProvider } from "antd";
import { Route, useRoutes } from "react-router-dom";
import Studio from "Studio";

const App: React.FC = () => {

  const element = useRoutes([
    {
      path: '/prototype',
      element: <Studio />,
    }, {
      path: '/instance',
      element: <Studio />,
    }, {
      path: '*',
      element: <NoMatch />
    }
  ]);

  return <ConfigProvider >
    <Route path="/prototype" element={<Studio />} />
    <Route path="/instance" element={<Studio />} />
  </ConfigProvider>
}

function NoMatch() {
  return (<>not found</>)
}

export default App;