import App from "App";
import ReactDOM from 'react-dom/client';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import zhCN from 'antd/locale/zh_CN';
import { ConfigProvider } from "antd";

// import 'antd/dist/reset.css';
// import './index.css';

dayjs.locale('zh-cn');

const Main = (context: { rootId: string }) => {
  ReactDOM.createRoot(document.getElementById(context.rootId) as HTMLElement).render(
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  );
}


export default Main;