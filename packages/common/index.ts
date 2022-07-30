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
  componentName: string,
  parentId?: number,

  advancedProps?: PropMetadata[],

  propsObj: {
    [key: string]: any
  }

  refresh?: Function
}

export type PropMetadata = {
  keyChain: string,
  type: PropMetadataType,
  data?: any,
}

export enum PropMetadataType {
  Component = 'component',
  Json = 'json',
  Function = 'function'
}

export enum PostMessageType {
  OK = 'ok',
  Init_Config = 'init::config',
  Fetch_Application = 'fetch::application',
  Init_Application = 'init::application',
  Ready_Applicationn = 'ready::applicationn',
  Fetch_Page = 'fetch::page',
  Init_Page = 'init::page',
  Update_Component = 'update::component',
  Reload_Page = 'reload::page'
}

export const iframeNamePrefix = 'groot::';

export enum PropItemType {
  TEXT = 'Text',
  TEXTAREA = 'Textarea',
  NUMBER = 'Number',
  SLIDER = 'Slider',
  BUTTON_GROUP = 'Button_Group',
  SWITCH = 'Switch',
  SELECT = 'Select',
  RADIO = 'Radio',
  CHECKBOX = 'Checkbox',
  DATE_PICKER = 'Date_Picker',
  TIME_PICKER = 'Time_Picker',
  LIST = 'List',
  ITEM = 'Item',
  HIERARCHY = 'Hierarchy',
  JSON = 'Json',
  FUNCTION = 'Function',
}

export enum PropBlockLayout {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

export enum PropBlockStructType {
  List = 'list',
  Default = 'default'
}