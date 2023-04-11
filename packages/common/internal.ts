import { PropMetadataType } from "./enum";

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
  // postPropTasks的key和advancedProps的type关联对应
  postPropTasks: Record<string, string>,

  $$runtime?: {
    propItemId: number,
    abstractValueIdChain?: string
  }
}

export type PropMetadata = {
  keyChain: string,
  type: string,
  data?: any
}


export type PropMetadataComponent = {
  setting: PropMetadataComponentSetting,
  list: PropMetadataComponentItem[],

  $$runtime?: {
    parentId: number,
    propKeyChain: string,
    propItemId: number,
    abstractValueIdChain?: string,
  }
}


export type PropMetadataComponentItem = {
  instanceId: number,
  componentId: number,
  componentName: string,
  order: number
}

export type PropMetadataComponentSetting = {
}








