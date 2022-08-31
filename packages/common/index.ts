/**
 * 配置项
 */
export type UIManagerConfig = {
  /**
   * 服务器地址
   */
  appDataUrl?: string;
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
  Text = 'text',
  Textarea = 'textarea',
  Number = 'number',
  Slider = 'slider',
  Button_Group = 'button_group',
  Switch = 'switch',
  Select = 'select',
  Radio = 'radio',
  Checkbox = 'checkbox',
  Date_Picker = 'date_picker',
  Time_Picker = 'time_picker',
  Hierarchy = 'hierarchy',
  Flat = 'flat',
  Json = 'json',
  Function = 'function',
}

export enum PropBlockLayout {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

export enum PropGroupStructType {
  Flat = 'flat',
  Default = 'default'
}

export enum PropBlockStructType {
  List = 'list',
  Default = 'default'
}

export enum PropValueType {
  Instance = 'instance',
  Prototype = 'prototype',
}

export enum AssetType {
  Application = 'application',
  Instance = 'instance'
}

export interface IPropGroup {
  propKey?: string,
  propBlockList: IPropBlock[]
}

export interface IPropBlock {
  propKey?: string,
  rootPropKey: boolean,
  struct: PropBlockStructType,
  propItemList: IPropItem[],
}

export interface IPropItem {
  propKey?: string,
  rootPropKey: boolean,
  valueList: IPropValue[],
  childGroup?: IPropGroup,
  type: PropItemType,
  defaultValue: string
}

export interface IPropValue {
  id: number,
  abstractValueIdChain?: string,
  value?: string,
}

export interface IComponent {
  id: number,
  packageName: string,
  componentName: string
}
