import Container from "./modules/Container";
import { UIManagerConfig } from "@grootio/types";

const internalModules = {
  groot: {
    Container
  }
}

// 运行时配置项
export const globalConfig: UIManagerConfig = {
  // ...
} as any;

export const setConfig = (customConfig: UIManagerConfig) => {
  Object.assign(globalConfig, customConfig);
  Object.assign(globalConfig.modules, internalModules);
  return globalConfig;
}

