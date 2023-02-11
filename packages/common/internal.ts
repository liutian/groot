import { UIManagerConfig } from "./runtime";
import { PropMetadataType } from './data';
import { StudioMode } from "./extension";

export type IframeDebuggerConfig = {
  runtimeConfig?: Partial<UIManagerConfig>,
  controlView?: string,
}

export type ApplicationData = {
  name: string,
  key: string,
  views: ViewData[],
  envData: Record<string, any>
}

export type ViewData = {
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

export const iframeNamePrefix = 'groot_';


export type RequestFnType<Store extends Record<string, any[]>> =
  <T extends keyof Store & string, P extends Store[T][0], R extends Promise<Store[T][1]>>(
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
  hitEle?: HTMLElement,
  slotRect: DOMRect
}

export enum ViewportMode {
  PC = 'pc',
  H5 = 'h5'
}

export type StudioParams = {
  solutionId: number,
  appId: number,
  releaseId: number,
  componentId: number,
  instanceId: number,
  studioMode: StudioMode,
  versionId: number
}