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

export type IframeHostConnfig = {
  rewriteApplicationData: boolean,
  runtimeConfig: UIManagerConfig,
  designPage: string,
}

export type ApplicationData = {
  name: string,
  key: string,
  pages: PageData[]
}

export type PageData = {
  path: string;
  metadataUrl: string;
  metadataList: Metadata[];
}

export type Metadata = {
  id: number,
  packageName: string,
  moduleName: string,
  parentId: number,

  advancedProps: PropMetadata[],

  propsObj: {
    [key: string]: any
  }

  refresh?: Function
}

export type PropMetadata = {
  keyChain: string,
  type: 'component',
  data: any,
}

export enum PostMessageType {
  Ready_Applicationn = 'ready::applicationn',
  Fetch_Application = 'fetch::application',
  OK = 'ok',
  Ready_Page = 'ready::page',
  Init_Application = 'init::application',
  Update_Component = 'update::component'
}