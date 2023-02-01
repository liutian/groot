import React, { useEffect, useState } from "react";
import { PluginViewComponent, RemotePlugin, loadRemoteModule } from "@grootio/common";


const PluginView: React.FC<{ config: RemotePlugin }> = ({ config }) => {
  const [Component, setComponent] = useState<PluginViewComponent>();

  useEffect(() => {
    if (!config) {
      return;
    }

    setComponent(React.lazy(() => loadRemoteModule(config.package, config.module, config.url)));
  }, [config]);

  return <>{
    !!Component ? (
      <React.Suspense fallback="loading plugin" >
        <Component />
      </React.Suspense >
    ) : null
  }</>
}

export default PluginView;