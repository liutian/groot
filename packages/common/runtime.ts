import { ReactElement } from "react";
import { Metadata } from "./internal";

export type UIManagerConfig = {
  appKey: string;
  appEnv: string;
  modules: { [packageName: string]: { [moduleName: string]: any } };
  appDataUrl?: string;
  serverUrl?: string;
  lazyLoadApplication?: boolean;
  beforeLoadApplication?: Promise<void> | Function;
  debug?: boolean;
  useWrapper?: boolean;
  shared?: Record<string, any>;

  // 反向设置配置信息
  hostConfig?: Omit<HostConfig, 'plugin'> & {
    plugin?: (controlType: IframeControlType) => PluginConfig | Promise<PluginConfig>;
  },

  // 由外部设置
  _prototypeMode?: boolean;
  // 分为react和vue实现
  _createComponent?: (metadata: Metadata, isRoot: boolean, viewEleMap: Map<number, HTMLElement>, viewMetadataMap: Map<number, Metadata>) => any,
  _refreshComponent?: (metadataId: number) => void;
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

export type GrootType = {
  version: string,
  appControlMode: boolean,
  appControlType: IframeControlType,
  globalConfig: UIManagerConfig
}