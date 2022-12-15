import React, { useState } from "react";
import { useEffect } from "react";
import { RemotePlugin, loadRemoteModule, WorkbenchInstanceComponentType } from "@grootio/common";

const Workbench: React.FC<{ config: RemotePlugin, instanceId: number }> = ({ config, instanceId }) => {
  const [Component, setComponent] = useState<WorkbenchInstanceComponentType>();

  useEffect(() => {
    if (!config) {
      return;
    }

    if (typeof config !== 'string') {
      setComponent(React.lazy(loadRemoteModule(config.package, config.module, config.url)));
    }
  }, [config]);

  return <>{
    !!Component ? (
      <React.Suspense fallback="loading plugin" >
        <Component appId={1} releaseId={1} instanceId={instanceId} monacoConfig={{ baseUrl: 'http://localhost:10004' }} />
      </React.Suspense >
    ) : null
  }</>
}

export default Workbench;