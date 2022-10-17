import Container from "./modules/Container";
import { UIManagerConfig } from "@grootio/common";
import PageContainer from "./modules/PageContainer";

const internalModules = {
  groot: {
    Container,
    PageContainer
  }
}

// 运行时配置项
export const globalConfig: UIManagerConfig = {
  useWrapper: true
  // ...
} as any;

export const setConfig = (customConfig: UIManagerConfig) => {
  Object.assign(globalConfig, customConfig);
  Object.assign(globalConfig.modules, internalModules);
  return globalConfig;
}

