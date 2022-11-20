import { ReactElement } from "react";

/**
 * 配置项
 */
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
  viewConfig?: (controlType: IframeControlType) => Promise<WorkbenchViewConfig>;
  shared?: Record<string, any>
};

export type IframeDebuggerConfig = {
  runtimeConfig?: Partial<UIManagerConfig>,
  controlPage?: string,
}

export type ApplicationData = {
  name: string,
  key: string,
  instances: InstanceData[],
  envData: Record<string, any>
}

export type InstanceData = {
  key: string;
  metadataUrl?: string;
  metadataList?: Metadata[];
}

export type Metadata = {
  id: number,
  packageName: string,
  componentName: string,
  rootId: number,
  parentId?: number,

  advancedProps?: PropMetadata[],
  propsObj: {
    [key: string]: any
  },

  $$runtime?: {
    propItemId: number,
    abstractValueIdChain?: string
  }
}

export type PropMetadata = {
  keyChain: string,
  type: PropMetadataType,
  data?: RuntimeComponentValueType,
}

export enum PropMetadataType {
  Component = 'component',
  Json = 'json',
  Function = 'function'
}

export enum PostMessageType {
  InnerSetViewConfig = 'inner_set_view_config',

  InnerReady = 'inner_ready',
  OuterSetConfig = 'outer_set_config',
  InnerFetchApplication = 'inner_fetch_application',
  OuterSetApplication = 'outer_set_application',
  InnerApplicationnReady = 'inner_applicationn_ready',
  InnerFetchPageComponents = 'inner_fetch_page_components',
  OuterUpdateComponent = 'outer_update_component',
  OuterRefreshPage = 'outer_refresh_page',

  OuterDragComponentOver = 'outer_drag_component_over',
  OuterDragComponentEnter = 'outer_drag_component_enter',
  OuterDragComponentLeave = 'outer_drag_component_leave',
  OuterDragComponentDrop = 'outer_drag_component_drop',
  InnerDragHitSlot = 'inner_drag_hit_slot',
  InnerDragLine = 'inner_drag_line',

  InnerOutlineHover = 'inner_outline_hover',
  InnerOutlineSelect = 'inner_outline_Select',
  InnerOutlineUpdate = 'inner_outline_update',
  OuterOutlineReset = 'outer_outline_reset',
  OuterWrapperSelect = 'outer_wrapper_select',
}

export const iframeNamePrefix = 'groot_';

export enum PropItemType {
  Text = 'text',
  Textarea = 'textarea',
  Number = 'number',
  Slider = 'slider',
  ButtonGroup = 'button_group',
  Switch = 'switch',
  Select = 'select',
  Radio = 'radio',
  Checkbox = 'checkbox',
  DatePicker = 'date_picker',
  TimePicker = 'time_picker',
  Hierarchy = 'hierarchy',
  Flat = 'flat',
  Json = 'json',
  Function = 'function',
  Component = 'component',
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

export enum EnvType {
  Dev = 'dev',
  Qa = 'qa',
  Pl = 'pl',
  Ol = 'online'
}

export interface IPropGroup {
  id: number,
  propKey?: string,
  propBlockList: IPropBlock[],
  root: boolean,
  order: number,
  parentItem?: IPropItem
}

export interface IPropBlock {
  id: number,
  propKey?: string,
  rootPropKey: boolean,
  struct: PropBlockStructType,
  propItemList: IPropItem[],
  groupId?: number,
  order: number,
  group: IPropGroup,
}

export interface IPropItem {
  id: number,
  propKey?: string,
  rootPropKey: boolean,
  valueList: IPropValue[],
  childGroup?: IPropGroup,
  type: PropItemType,
  defaultValue: string,
  groupId: number,
  blockId?: number,
  order: number,
  block: IPropBlock,
  childGroupId?: number,
}

export interface IPropValue {
  id: number,
  abstractValueIdChain?: string,
  value?: string,
  propItemId?: number,
  type: PropValueType
}

export interface IComponent {
  id: number,
  packageName: string,
  componentName: string,
}

export enum DeployStatusType {
  Approval = 'approval',
  Online = 'online',
  Archive = 'archive'
}

export const PropItemTypeNameMap = [
  { name: '文本', key: PropItemType.Text },
  { name: '多行文本', key: PropItemType.Textarea },
  { name: '数字', key: PropItemType.Number },
  { name: '滑块', key: PropItemType.Slider },
  { name: '按钮组', key: PropItemType.ButtonGroup },
  { name: '开关', key: PropItemType.Switch },
  { name: '下拉框', key: PropItemType.Select },
  { name: '多选', key: PropItemType.Checkbox },
  { name: '单选', key: PropItemType.Radio },
  { name: '日期', key: PropItemType.DatePicker },
  { name: '时间', key: PropItemType.TimePicker },
  { name: '配置项平铺', key: PropItemType.Flat },
  { name: '层级', key: PropItemType.Hierarchy },
  { name: 'json', key: PropItemType.Json },
  { name: '函数', key: PropItemType.Function },
  { name: '组件', key: PropItemType.Component },
];

export type requestFnType<Store extends Record<string, any[]>> =
  <T extends keyof Store, P extends Store[T][0], R extends Promise<Store[T][1]>>(
    path: T,
    params?: P,
    config?: any,
  ) => R;

export type ComponentValueItemType = { instanceId: number, componentId: number, componentName: string, order: number }

export type ComponentValueSettingType = {
}

export type ComponentValueType = {
  setting: ComponentValueSettingType,
  list: ComponentValueItemType[]
}


export type RuntimeComponentValueType = {
  setting: ComponentValueSettingType,
  list: ComponentValueItemType[],

  parentId: number,
  propKeyChain: string,
  propItemId: number,
  abstractValueIdChain?: string,
}

export type DragAddComponentEventDataType = {
  propItemId: number,
  abstractValueIdChain?: string,
  parentInstanceId: number
  componentId: number,
  currentInstanceId?: number,
  direction?: 'next' | 'pre'
}

export enum ComponentParserType {
  ReactComponent = 'react_component',
  VueComponent = 'vue_component',
  Http = 'http',
  DataSource = 'data_source',
}


export enum ValueStruct {
  Common = 'common',
  ChildComponentList = 'child_component_list'
}

export type MarkerInfo = {
  clientRect: DOMRect,
  tagName: string,
  instanceId: number,
  parentInstanceId?: number,
  rootInstanceId: number,
  propItemId?: number,
  abstractValueIdChain?: string
}

export type DragLineInfo = {
  direction: 'bottom' | 'top',
  left: number,
  width: number,
  top: number,
  hitEle?: HTMLElement
}

export type WorkbenchViewConfig = {
  sidebar?: ({
    key: string,
    title: string,
  } & ({
    icon: ReactElement,
    view: ReactElement
  } | {
    icon: string,
    view: PluginViewConfig
  }))[]
}

export type PluginViewConfig = {
  key: string,
  url: string,
  module: string
}

export enum IframeControlType {
  Proptotype = 'prototype',
  Instance = 'instance',
  FetchPrototypeViewConfig = 'fetch_prototype_view_config',
  FetchInstanceViewConfig = 'fetch_instance_view_config'
}