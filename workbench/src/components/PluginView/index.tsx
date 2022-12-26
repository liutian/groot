import React, { useEffect, useState } from "react";
import { PluginViewComponent, RemotePlugin, loadRemoteModule, useModel } from "@grootio/common";

import request from "@util/request";
import { APIPath } from "api/API.path";
import WorkbenchModel from "@model/WorkbenchModel";

const remoteModuleMap = new Map<string, RemotePlugin>();

const PluginView: React.FC<{ config: RemotePlugin | string }> = ({ config }) => {
  const [Component, setComponent] = useState<PluginViewComponent>();

  useEffect(() => {
    if (!config) {
      return;
    }

    let promise;
    if (typeof config === 'string') {
      if (remoteModuleMap.has(config)) {
        const data = remoteModuleMap.get(config);
        promise = Promise.resolve(data);
      } else {
        promise = request(APIPath.remote_module_list, { keys: [config] }).then(([data]) => {
          remoteModuleMap.set(config, data);
          return data;
        })
      }
    } else {
      promise = Promise.resolve(config);
    }

    promise.then((config) => {
      setComponent(React.lazy(loadRemoteModule(config.package, config.module, config.url)));
    })
  }, [config]);

  return <>{
    !!Component ? (
      <React.Suspense fallback="loading plugin" >
        <Component useModel={useModel} WorkbenchModel={WorkbenchModel} />
      </React.Suspense >
    ) : null
  }</>
}

export default PluginView;