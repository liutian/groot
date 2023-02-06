import React, { useEffect, useState } from "react";
import { loadRemoteModule } from "@grootio/common";

type PropsType = {
  packageName: string,
  module: string,
  packageUrl: string,
  fallback?: React.ReactNode
}
export const ViewLoader: React.FC<PropsType> = (config) => {
  const [Component, setComponent] = useState<React.FC>();

  useEffect(() => {
    if (!config) {
      return;
    }

    setComponent(React.lazy(() => loadRemoteModule(config.packageName, config.module, config.packageUrl)));
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