
import { ConfigProvider } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import App from "./App";

// import 'antd/dist/reset.css';
import './index.less'
import { StudioMode, StudioParams } from "@grootio/common";

type PropsType = {
  appEnv: string,
  appName: string,
  rootId: string,

  groot: {
    params: StudioParams
  }
}

// 获取运行时必要参数，
const Main: React.FC<PropsType> = (props) => {
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
        studioMode: searchParams.get('studioMode') as StudioMode
      }
    }
  })
  useState(() => {
    document.head.title = 'groot';
  });

  useEffect(() => {
    return () => {
      document.head.title = '';
      document.head.querySelector('groot-studio')?.remove();
    }
  }, [])

  return <ConfigProvider>
    {params ? <App {...params} /> : <>必须提供参数信息</>}
  </ConfigProvider>
}


export default Main;