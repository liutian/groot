
declare module '*.less';

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly APP: 'online' | 'pl' | 'qa' | 'dev';
  }
}

interface Window {
  define: (
    moduleName: string,
    depsKey: string[],
    wrapper: (...defaultModule: any) => void
  ) => void;
  _moduleCallback: (module: any) => void;
}

/**
 * 描述代码元数据配置的属性分组类型
 */
type PropGroup = {
  id: number,
  name: string,
  root: boolean,
  propKey?: string,
  propBlockList: PropBlock[],
  relativeItemId?: number,
  templateBlock?: PropBlock,
  templateBlockId?: number,
  order: number,
  componentId?: number,
  componentVersionId?: number,
  highlight?: boolean,
  struct: 'List' | 'Map' | 'Default'
}

/**
 * 描述代码元数据配置的属性配置块类型
 */
type PropBlock = {
  id: number,
  name: string,
  propKey?: string,
  propItemList: PropItem[],
  groupId: number,
  relativeItemId?: number,
  rootPropKey?: boolean,
  order: number,
  componentId?: number,
  isTemplate?: boolean,
  highlight?: boolean
}

/**
 * 描述代码元数据配置的属性配置项类型
 */
type PropItem = {
  id: number,
  label: string,
  propKey: string,
  type: PropItemType,
  defaultValue?: any,
  optionList?: [{
    label: string,
    value: string
  }],
  blockId: number,
  groupId: number,
  span?: number,
  valueOfGroupId?: number,
  valueOfGroup?: PropGroup,
  templateBlockId?: number,
  templateBlock?: PropBlock,
  rootPropKey?: boolean,
  order: number,
  componentId?: number,
  highlight?: boolean
}



type CodeMeta = {
  id: number,
  key: string,
  defaultValue: any,
  type: PropItemType
}

type PropItemType = 'input' | 'date-picker' | 'switch' | 'select' | 'radio' | 'checkbox' | 'array-object';


type ComponentVersion = {
  id: number,
  name: string,
  publish: boolean,
  groupList: PropGroup[],
  blockList: PropBlock[],
  itemList: PropItem[],

  rootGroupList?: PropGroup[]
}

type ComponentInstance = {
  id: number,
  name: string,
  path?: string,
  propValueList: PropValue[],
}

type Release = {
  id: number,
  name: string,
  freeze: boolean
}

type PropValue = {
  id: number,
  keyChain?: string,
  value: string,
}

type Component = {
  id: number,
  name: string,
  packageName: string,
  componentName: string,
  page: boolean,
  version: ComponentVersion,
  instance?: ComponentInstance,
  release?: Release,
  releaseList: Release[],
  project: Project,
  versionList: ComponentVersion[]
}

type Project = {
  name: string,
  devRelease: Release;
  qaRelease?: Release;
  plRelease?: Release;
  onlineRelease: Release;
}
