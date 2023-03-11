import { StudioMode } from "./enum";
import { UIManagerConfig } from "./runtime";

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
  data: ComponentValueType | null,
}

export enum PropMetadataType {
  Component = 'component',
  Json = 'json',
  Function = 'function'
}







export const iframeNamePrefix = 'groot_';

export type IframeDebuggerConfig = {
  runtimeConfig?: Partial<UIManagerConfig>,
  controlView?: string,
}








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
  parentId: number,
  propKeyChain: string,
  propItemId: number,
  abstractValueIdChain?: string,
} & ComponentValueType







export type StudioParams = {
  solutionId: number,
  appId: number,
  componentId: number,
  instanceId: number,
  mode: StudioMode,
  versionId: number
}