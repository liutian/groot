
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
 * 描述代码元数据配置的类型
 */
type CodeMetaStudio = {
  propGroups: CodeMetaStudioGroup[],
  allGroups: CodeMetaStudioGroup[],
  allBlocks: CodeMetaStudioBlock[],
  allItems: CodeMetaStudioItem[],
  propGroupIds: number[]
}

/**
 * 描述代码元数据配置的属性分组类型
 */
type CodeMetaStudioGroup = {
  id: number,
  name: string,
  propKey?: string,
  propBlocks: CodeMetaStudioBlock[],
  relativeItemId?: number,
}

/**
 * 描述代码元数据配置的属性配置块类型
 */
type CodeMetaStudioBlock = {
  id: number,
  name: string,
  propKey?: string,
  propItems: CodeMetaStudioItem[],
  groupId: number
  relativeItemId?: number,
  isRootPropKey?: boolean,
}

/**
 * 描述代码元数据配置的属性配置项类型
 */
type CodeMetaStudioItem = {
  id: number,
  label: string,
  propKey: string,
  type: CodeMetaStudioPropItemType,
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
}

type CodeMeta = {
  key: string,
  defaultValue: any,
  type: CodeMetaStudioPropItemType
}

type CodeMetaStudioPropItemType = 'input' | 'date-picker' | 'switch' | 'select' | 'radio' | 'checkbox' | 'array-object';

/**
 * 组件配置类型
 */
type ComponentStudio = {
  id: number,
  name: string,
  codeMetaStudio: CodeMetaStudio,
  packageName: string,
  moduleName: string,
  componentName: string,
}

type ComponentInstance = {
  id: number,
  name: string,
  codeMetaData: CodeMeta[],
  studio: ComponentStudio,
}

type PageData = {
  id: number,
  name: string,
  url: string,
  path: string,
  component: ComponentInstance
}

