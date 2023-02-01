import { ConfigProvider } from "antd";
import { Route, Routes } from "react-router-dom";
import Studio from "Studio";

const App: React.FC = () => {

  return <ConfigProvider >
    <Routes>
      <Route path="prototype" element={<Studio />} />
      <Route path="instance" element={<Studio />} />
    </Routes>
  </ConfigProvider>
}


export default App;