
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
  isRoot: boolean,
  propKey?: string,
  propBlockList: PropBlock[],
  relativeItemId?: number,
  componentId?: number,
  order: number,
  templateBlock?: PropBlock
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
  isRootPropKey?: boolean,
  componentId?: number,
  order: number
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
  isRootPropKey?: boolean,
  valueOfGroupId?: number,
  valueOfGroup?: PropGroup,
  templateBlockId?: number,
  templateBlock?: PropBlock,
  componentId?: number,
  order: number
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
  groupList?: PropGroup[],
  blockList?: PropBlock[],
  itemList?: PropItem[],

  rootGroupList?: PropGroup[]
}

type ComponentInstance = {
  id: number,
  name: string,
  path?: string,
  valueList: PropValue[],
}

type Release = {
  id: number,
  name: string,
  lock: boolean
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
  moduleName: string,
  componentName: string,
  isPage: boolean,
  version?: ComponentVersion,
  instance?: ComponentInstance,
  release?: Release,
}

type Project = {
  name: string,
}
