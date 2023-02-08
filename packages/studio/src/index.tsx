
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import App from "./App";

// import 'antd/dist/reset.css';
import './index.less'
import { StudioMode, StudioParams } from "@grootio/common";
import { message } from "antd";

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
    }

    const studioMode = searchParams.get('studioMode') as StudioMode || StudioMode.Instance;
    const solutionId = +searchParams.get('solutionId')
    const appId = +searchParams.get('appId')
    const componentId = +searchParams.get('componentId')
    const instanceId = +searchParams.get('instanceId')
    const releaseId = +searchParams.get('releaseId')

    if (studioMode === StudioMode.Instance) {
      if (!appId) {
        setTimeout(() => {
          message.warning('参数appId为空');
        })
        return null;
      }
    } else if (studioMode === StudioMode.Prototype) {
      if (!solutionId) {
        setTimeout(() => {
          message.warning('参数solutionId为空');
        })
        return null;
      }
    }

    return {
      solutionId,
      appId,
      instanceId,
      releaseId,
      componentId,
      studioMode: studioMode
    }
  })


  if (!props.groot) {
    useState(() => {
      document.head.title = 'groot';
      return () => {
        document.head.title = '';
      }
    });
  }

  useEffect(() => {
    return () => {
      document.head.querySelector('#groot-studio')?.remove();
    }
  }, [])

  return <>
    {params ? <App {...params} /> : <>必须提供参数信息</>}
  </>
}


export default Main;