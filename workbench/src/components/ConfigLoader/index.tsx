import { useEffect, useRef } from "react";

import { RuntimeHostConfig, IframeControlType, iframeNamePrefix, PostMessageType, HostConfig } from "@grootio/common";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";

import styles from './index.module.less';
import Loading from "@components/Loading";
import request from "@util/request";
import { APIPath } from "api/API.path";

type PropType = {
  finish: (config?: RuntimeHostConfig) => void,
}

const ConfigLoader: React.FC<PropType> = ({ finish }) => {
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

    function onMessage(event: MessageEvent) {
      const messageData = event.data;
      if (messageData.type === PostMessageType.InnerSetConfig) {
        const configData = messageData.data as HostConfig;
        if (!configData || !configData.plugin) {
          finish(configData as RuntimeHostConfig);
          return;
        }

        const keys = [
          ...(configData.plugin.sidebarView || []).filter(item => typeof item.view === 'string').map(item => (item.view as string)),
          ...(configData.plugin.propSettingView || []).filter(item => typeof item === 'string').map(item => (item as string)),
        ];

        if (keys.length) {
          request(APIPath.remote_module_list, { keys }).then((list) => {
            configData.plugin.sidebarView = (configData.plugin.sidebarView || []).map(viewConfig => {
              if (typeof viewConfig.view === 'string') {
                viewConfig.view = list.find(item => item.key === viewConfig.view)
              }

              return viewConfig;
            });
            configData.plugin.propSettingView = (configData.plugin.propSettingView || []).map(viewConfig => {
              if (typeof viewConfig === 'string') {
                return list.find(item => item.key === viewConfig)
              }

              return viewConfig;
            })

            finish(configData as RuntimeHostConfig);
          })
        } else {
          finish(configData as RuntimeHostConfig);
        }

      }
    }

    return () => {
      window.self.removeEventListener('message', onMessage);
    }
  }, []);

  // 如果对iframe节点进行移动追加到其他DOM会导致iframe重写刷新，所以只做一次行取配置的动作
  return <div className={styles.container}>
    <Loading text="loading config ..." />
    <iframe ref={iframeEleRef} ></iframe>
  </div>
}

export default ConfigLoader;