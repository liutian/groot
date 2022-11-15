import { useEffect, useRef } from "react";

import { IframeControlType, iframeNamePrefix, PostMessageType, WorkbenchViewConfig } from "@grootio/common";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";

import styles from './index.module.less';
import Loading from "@components/Loading";

type PropType = {
  finish: (config: WorkbenchViewConfig) => void,
}

const PluginLoader: React.FC<PropType> = ({ finish }) => {
  const [workbenchModel] = useModel(WorkbenchModel);
  const iframeEleRef = useRef<HTMLIFrameElement>();

  useEffect(() => {
    if (workbenchModel.prototypeMode) {
      iframeEleRef.current.contentWindow.name = `${iframeNamePrefix}${IframeControlType.FetchPrototypeViewConfig}`;
    } else {
      iframeEleRef.current.contentWindow.name = `${iframeNamePrefix}${IframeControlType.FetchInstanceViewConfig}`;
    }

    window.self.addEventListener('message', onMessage);
    iframeEleRef.current.src = workbenchModel.iframeBasePath;

    function onMessage(event) {
      const messageData = (event as MessageEvent).data;
      if (messageData.type === PostMessageType.InnerSetViewConfig) {
        finish(messageData.data);
      }
    }

    return () => {
      window.self.removeEventListener('message', onMessage);
    }
  }, []);

  // 如果对iframe节点进行移动追加到其他DOM会导致iframe重写刷新，所以只做一次行取配置的动作
  return <div className={styles.container}>
    <Loading text="loading plugin ..." />
    <iframe ref={iframeEleRef} ></iframe>
  </div>
}

export default PluginLoader;