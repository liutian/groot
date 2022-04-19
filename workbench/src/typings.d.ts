
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
  name: string;
  propGroups: CodeMetaStudioPropGroup[]
}

/**
 * 描述代码元数据配置的属性分组类型
 */
type CodeMetaStudioPropGroup = {
  id: string,
  title: string,
  propKey?: string,
  propBlocks: CodeMetaStudioPropBlock[]
}

/**
 * 描述代码元数据配置的属性分组块类型
 */
type CodeMetaStudioPropBlock = {
  id: string,
  title: string,
  propKey?: string,
  propItems: CodeMetaStudioPropItem[],
  groupId?: string
}

/**
 * 描述代码元数据配置的属性分组项类型
 */
type CodeMetaStudioPropItem = {
  id: string,
  label: string,
  propKey: string,
  type: CodeMetaStudioPropItemType,
  blockId?: string,
  groupId?: string,
  value?: any,
  defaultValue?: any,
  span: number,
  options?: [{
    label: string,
    value: string
  }],
  valueOfArrayObject?: CodeMetaStudioPropBlock[],
  templateBlockOfArrayObject?: CodeMetaStudioPropBlock
}

type CodeMetaStudioPropItemType = 'input' | 'date-picker' | 'switch' | 'select' | 'radio' | 'checkbox' | 'array-object';

/**
 * 组件配置类型
 */
type ComponentStudio = {
  id: number,
  name: string,
  codeMetadata: string,
  codeMetaStudio: CodeMetaStudio,
  packageName: string,
  moduleName: string,
  componentName: string,
}

type PageComponentStudio = ComponentStudio & {
  url: string,
  path: string,
}