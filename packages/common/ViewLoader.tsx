import React, { useEffect, useState } from "react";
import { loadRemoteModule } from "./fetch-remote-module";

type PropsType = {
  remotePackage: string,
  remoteModule: string,
  remoteUrl: string,
  fallback?: React.ReactNode
}
export const ViewLoader: React.FC<PropsType> = (config) => {
  const [Component, setComponent] = useState<React.FC>();

  useEffect(() => {
    if (!config) {
      return;
    }

    setComponent(React.lazy(() => loadRemoteModule(config.remotePackage, config.remoteModule, config.remoteUrl)));
  }, [config]);

  return <>{
    !!Component ? (
      <React.Suspense fallback={config.fallback} >
        <Component />
      </React.Suspense >
    ) : null
  }</>
}

export default ViewLoader;