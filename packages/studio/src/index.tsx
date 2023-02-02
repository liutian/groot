
import { ConfigProvider } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { LocalAPIPath } from "./api/API.path";
import App from "./App";
import request from "./util/request";

// import 'antd/dist/reset.css';
import './index.less'
import { StudioParams } from "@grootio/common";

type PropsType = {
  appEnv: string,
  appName: string,
  rootId: string,

  groot: {
    params: StudioParams
  }
}

const appName = 'studio';

// 1.获取运行时必要参数，2.加载账户信息包括组织架构
const Main: React.FC<PropsType> = (props) => {
  const [account, setAccount] = useState<any>();
  const [searchParams] = useSearchParams();

  const [params] = useState(() => {
    if (props.groot) {
      return props.groot.params;
    } else {
      return {
        solutionId: +searchParams.get('solutionId'),
        appId: +searchParams.get('appId'),
        componentId: +searchParams.get('componentId'),
        instanceId: +searchParams.get('instanceId'),
        releaseId: +searchParams.get('releaseId'),
        prototypeMode: !!searchParams.get('prototypeMode')
      }
    }
  })
  useState(() => {
    document.body.classList.add(appName);
    document.head.title = 'groot';
  });

  useEffect(() => {
    return () => {
      document.body.classList.remove(appName);
      document.head.title = '';
      document.head.querySelector('groot-studio')?.remove();
    }
  }, [])

  useEffect(() => {
    request(LocalAPIPath.account).then(() => {
      setAccount({});
    })
  }, []);

  return <ConfigProvider>
    {account ? <App account={account} params={params} /> : null}
  </ConfigProvider>
}


export default Main;