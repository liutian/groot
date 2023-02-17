import { StudioMode } from "./extension";
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

  // 由外部设置
  _prototypeMode?: boolean;
  // 分为react和vue实现
  _createComponent?: (metadata: Metadata, isRoot: boolean, viewEleMap: Map<number, HTMLElement>, viewMetadataMap: Map<number, Metadata>) => any,
  _refreshComponent?: (metadataId: number) => void;
};


export type GrootType = {
  version: string,
  appControlMode: boolean,
  appControlType: StudioMode,
  globalConfig: UIManagerConfig
}