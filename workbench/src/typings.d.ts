
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
type CodeMetaStudioGroup = {
  id: number,
  name: string,
  isRoot: boolean,
  propKey?: string,
  propBlocks: CodeMetaStudioBlock[],
  relativeItemId?: number,
  componentStudioId?: number,
  order: number,
  templateBlock?: CodeMetaStudioBlock
}

/**
 * 描述代码元数据配置的属性配置块类型
 */
type CodeMetaStudioBlock = {
  id: number,
  name: string,
  propKey?: string,
  propItems: CodeMetaStudioItem[],
  groupId: number,
  relativeItemId?: number,
  isRootPropKey?: boolean,
  componentStudioId?: number,
  order: number
}

/**
 * 描述代码元数据配置的属性配置项类型
 */
type CodeMetaStudioItem = {
  id: number,
  label: string,
  propKey: string,
  type: StudioItemType,
  value?: any,
  defaultValue?: any,
  options?: [{
    label: string,
    value: string
  }],
  blockId: number,
  groupId: number,
  span?: number,
  isRootPropKey?: boolean,
  valueOfGroupId?: number,
  valueOfGroup?: CodeMetaStudioGroup,
  templateBlockId?: number,
  templateBlock?: CodeMetaStudioBlock,
  componentStudioId?: number,
  order: number
}



type CodeMeta = {
  id: number,
  key: string,
  defaultValue: any,
  type: StudioItemType
}

type StudioItemType = 'input' | 'date-picker' | 'switch' | 'select' | 'radio' | 'checkbox' | 'array-object';

/**
 * 组件配置类型
 */
type ComponentStudio = {
  id: number,
  name: string,
  packageName: string,
  moduleName: string,
  componentName: string,
  rootGroups: CodeMetaStudioGroup[],
  allGroups: CodeMetaStudioGroup[],
  allBlocks: CodeMetaStudioBlock[],
  allItems: CodeMetaStudioItem[],
}

type ComponentVersion = {
  id: number,
  name: string,
  publish: boolean,
  // groupList?: StudioGroup[],
  // blockList?: StudioBlock[],
  // itemList?: StudioItem[]
}

type ComponentInstance = {
  id: number,
  name: string,
  path?: string,
  valueList: StudioValue[],
}

type Release = {
  id: number,
  name: string,
  lock: boolean
}

type StudioValue = {
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

  codeMetaData: CodeMeta[],
  studio: ComponentStudio,
}

type Page = {
  id: number,
  name: string,
  url: string,
  path: string,
  component: Component
}


type Project = {
  name: string,
}
