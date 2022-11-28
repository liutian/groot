import { ReactElement } from "react";

export type UIManagerConfig = {
  appKey: string;
  appEnv: string;
  modules: { [packageName: string]: { [moduleName: string]: any } };
  prototypeMode?: boolean;
  appDataUrl?: string;
  serverUrl?: string;
  lazyLoadApplication?: boolean;
  beforeLoadApplication?: Promise<void> | Function;
  debug?: boolean;
  useWrapper?: boolean;
  hostConfig?: Omit<HostConfig, 'plugin'> & {
    plugin?: (controlType: IframeControlType) => PluginConfig | Promise<PluginConfig>;
  },
  shared?: Record<string, any>,
};

export enum IframeControlType {
  Proptotype = 'prototype',
  Instance = 'instance',
  FetchPrototypeViewConfig = 'fetch_prototype_view_config',
  FetchInstanceViewConfig = 'fetch_instance_view_config'
}

export type HostConfig = {
  viewportMode?: ViewportMode,
  plugin?: PluginConfig
}

export type PluginConfig = {
  sidebarView?: SidebarViewType[],
  propSettingView?: (RemotePlugin | string)[]
}

export enum ViewportMode {
  PC = 'pc',
  H5 = 'h5'
}

export type SidebarViewType = {
  key: string,
  title: string,
  order?: number,
} & ({
  icon: ReactElement,
  view: ReactElement
} | {
  icon: string,
  view: RemotePlugin | string
})

export type RemotePlugin = {
  key?: string,
  package: string,
  title: string,
  url: string,
  module: string
}


export type Groot = {
  controlMode: boolean,
  controlType: IframeControlType
}


export type GrootPropsType = {
  version: string,
  controlMode: boolean,
  controlType: IframeControlType
}