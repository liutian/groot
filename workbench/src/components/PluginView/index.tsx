import { PluginViewConfig } from "@grootio/common";
import { loadRemoteModule } from "@util/fetch-remote-module";
import React from "react";

const PluginView: React.FC<{ config: PluginViewConfig }> = ({ config }) => {
  if (!config) {
    return null;
  }

  const Component = React.lazy(loadRemoteModule(config.key, config.module, config.url));

  return (
    <React.Suspense fallback="loading plugin">
      <Component />
    </React.Suspense>
  );
}

export default PluginView;