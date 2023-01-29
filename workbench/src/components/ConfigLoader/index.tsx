import { HostConfig, useModel, loadRemoteModule, pick, MainType } from "@grootio/common";
import { useEffect, useRef, useState } from "react";

import WorkbenchModel from "@model/WorkbenchModel";
import Loading from "@components/Loading";
import styles from './index.module.less';
import request from "@util/request";

type PropType = {
  finish: (config?: HostConfig) => void,
  customPluginList?: string[]
}

const ConfigLoader: React.FC<PropType> = ({ finish, customPluginList }) => {
  const workbenchModel = useModel(WorkbenchModel);
  const iframeEleRef = useRef<HTMLIFrameElement>();

  useEffect(() => {
    const config = {
      contributes: {
        sidebarView: [],
        propSettingView: []
      }
    } as HostConfig;

    let pluginList: { key: string, url: string }[] = [];
    if (customPluginList) {
      pluginList = customPluginList.map(str => {
        const [key, url] = str.split('@')
        return { key, url }
      });
    } else {
      pluginList = workbenchModel.prototypeMode ? workbenchModel.org.pluginList : workbenchModel.application.pluginList;
    }

    Promise.all(pluginList.map(item => {
      return loadRemoteModule(item.key, 'Main', item.url)();
    }))
      .then(
        moduleList => moduleList.map(m => m.default),
        (error) => {
          console.error('加载插件失败');
          return Promise.reject(error);
        })
      .then((mainList: MainType[]) => {

        mainList.reduce((config, main, index) => {
          const requestClone = request.clone((type) => {
            if (type === 'request') {
              console.log(`[${pluginList[index].key} request]`);
            }
          });

          const newConfig = main({
            request: requestClone,
            workbenchModel
          }, config);

          if (newConfig === config) {
            return config;
          }

          Object.assign(config, pick(newConfig, ['viewportMode']));
          config.contributes.sidebarView.push(...(newConfig.contributes.sidebarView || []));
          config.contributes.propSettingView.push(...(newConfig.contributes.propSettingView || []));
          return config;
        }, config);

        return config;
      }).then((config) => {
        finish(config);
      });

  }, []);

  // 如果对iframe节点进行移动追加到其他DOM会导致iframe重写刷新，所以只做一次行取配置的动作
  return <div className={styles.container}>
    <Loading text="loading config ..." />
    <iframe ref={iframeEleRef} ></iframe>
  </div>
}

export default ConfigLoader;