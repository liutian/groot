/**
 * 配置项
 */
export type UIManagerConfig = {
  /**
   * 服务器地址
   */
  cloudServer?: string;
  applicationKey?: string;
  applicationSecret?: string;
  lazyLoadApplication?: boolean;
  beforeLoadApplication?: Promise<void> | Function;
  debug?: boolean;
  modules: { [packageName: string]: { [moduleName: string]: any } };
};

export type IframeDebuggerConfig = {
  runtimeConfig?: UIManagerConfig,
  // 页面启动那一刻调试页面就已经确定，如果要更改iframe src一定会导致页面重新加载，然后重新执行应用启动过程
  controlPage?: string,
}

export type ApplicationData = {
  name: string,
  key: string,
  pages: PageData[],
}

export type PageData = {
  path: string;
  metadataUrl?: string;
  metadataList?: Metadata[];
}

export type Metadata = {
  id: number,
  packageName: string,
  moduleName: string,
  parentId?: number,

  advancedProps?: PropMetadata[],

  propsObj: {
    [key: string]: any
  }

  refresh?: Function
}

export type PropMetadata = {
  keyChain: string,
  type: 'component',
  data?: any,
}

export enum PostMessageType {
  OK = 'ok',
  Init_Config = 'init::config',
  Fetch_Application = 'fetch::application',
  Init_Application = 'init::application',
  Ready_Applicationn = 'ready::applicationn',
  Ready_Page = 'ready::page',
  Update_Component = 'update::component'
}

export const iframeNamePrefix = 'groot::';