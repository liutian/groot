import { GrootType, iframeNamePrefix, UIManagerConfig, StudioMode } from "@grootio/common";

export const appControlMode = window.self !== window.top && window.self.name.startsWith(iframeNamePrefix);
export const appControlType: StudioMode = (appControlMode ? window.self.name.replace(iframeNamePrefix, '') : '') as StudioMode;

// 运行时配置项
export const globalConfig: UIManagerConfig = {
  useWrapper: true,
  modules: {}
  // ...
} as any;

export const setConfig = (customConfig: UIManagerConfig, defaultConfig: UIManagerConfig = {} as any) => {
  Object.assign(globalConfig, defaultConfig, customConfig);
  Object.assign(globalConfig.modules, defaultConfig.modules, customConfig.modules);
  return globalConfig;
}

export const groot = {
  version: '0.0.1',
  appControlMode,
  appControlType,
  globalConfig
} as GrootType;


