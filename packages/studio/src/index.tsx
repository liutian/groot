
import { useEffect, useState } from "react";

import App from "./App";

// import 'antd/dist/reset.css';
import './index.less'
import { StudioMode } from "@grootio/common";
import Studio from "./Studio";

export type StudioParams = {
  solutionId: number,
  appId: number,
  componentId: number,
  instanceId: number,
  mode: StudioMode,
  versionId: number
}

type PropsType = {
  appEnv: string,
  appName: string,
  rootId: string,

  groot: {
    params: StudioParams,
    account: any
  }
}

let styleEle: HTMLStyleElement;

// 获取运行时必要参数，
const Main: React.FC<PropsType> = (props) => {

  if (props.groot) {
    return <Studio {...props.groot.params} account={props.groot.account} />
  } else {
    useState(() => {
      document.head.title = 'groot';
      if (styleEle) {
        document.head.appendChild(styleEle)
      } else {
        styleEle = document.head.querySelector<HTMLStyleElement>('#pangu-studio');
      }
    });

    useEffect(() => {
      return () => {
        document.head.title = '';
        styleEle.remove();
      }
    }, [])

    return <App />
  }

}


export default Main;