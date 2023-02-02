
import { ConfigProvider } from "antd";
import { LocalAPIPath } from "api/API.path";
import App from "App";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { StudioParams } from "typings";
import request from "util/request";

// import 'antd/dist/reset.css';
import './index.less';

type PropsType = {
  appEnv: string,
  appName: string,
  rootId: string,

  groot: {
    params: StudioParams
  }
}

const Main: React.FC<PropsType> = ({ groot }) => {
  const [account, setAccount] = useState<any>();
  const [searchParams] = useSearchParams();

  const [params] = useState(() => {
    if (groot) {
      return groot.params;
    } else {
      return {
        solutionId: +searchParams.get('solutionId'),
        appId: +searchParams.get('appId'),
        componentId: +searchParams.get('componentId'),
        instanceId: +searchParams.get('instanceId'),
        prototypeMode: !!searchParams.get('prototypeMode')
      }
    }
  })
  useState(() => {
    document.body.classList.add('studio');
    document.head.title = 'groot';
  });

  useEffect(() => {
    return () => {
      document.body.classList.remove('studio');
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