
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
  propBlockList: PropBlock[],
  templateBlock?: PropBlock,

  relativeItemId?: number,
  templateBlockId?: number,

  // 分割线下面时界面属性
  highlight?: boolean,
} & Omit<import("../../cloud/src/entities/PropGroup").PropGroup, 'propBlockList' | 'templateBlock'>;

/**
 * 描述代码元数据配置的属性配置块类型
 */
type PropBlock = {
  propItemList: PropItem[],
  // 分割线下面时界面属性
  highlight?: boolean
} & Omit<import("../../cloud/src/entities/PropBlock").PropBlock, 'propItemList'>;

/**
 * 描述代码元数据配置的属性配置项类型
 */
type PropItem = {
  valueOfGroup?: PropGroup,
  templateBlock?: PropBlock,
  directBlock?: PropBlock,
  optionList: PropValueOption[],

  groupId: number,
  valueOfGroupId?: number,

  // 分割线下面时界面属性
  highlight?: boolean,
} & Omit<import("../../cloud/src/entities/PropItem").PropItem, 'valueOfGroup' | 'templateBlock' | 'directBlock' | 'optionList'>;

type PropValueOption = {
  label: string,
  value: PropItemType
};

type ComponentVersion = {
  groupList: PropGroup[],
  blockList: PropBlock[],
  itemList: PropItem[],

  rootGroupList?: PropGroup[]
} & Omit<import("../../cloud/src/entities/ComponentVersion").ComponentVersion, 'groupList' | 'blockList' | 'itemList'>;

type ComponentInstance = {

} & Omit<import("../../cloud/src/entities/ComponentInstance").ComponentInstance, ''>;

type Release = {

} & Omit<import("../../cloud/src/entities/Release").Release, ''>;

type PropValue = {

} & Omit<import("../../cloud/src/entities/PropValue").PropValue, ''>;

type Component = {
  version: ComponentVersion,

  versionList: ComponentVersion[]
} & Omit<import("../../cloud/src/entities/Component").Component, 'version'>;

type Project = {

} & Omit<import("../../cloud/src/entities/Project").Project, ''>;

type CodeMeta = {
  id: number,
  key: string,
  defaultValue: any,
  type: PropItemType
}

type PropItemType = import("../../cloud/src/entities/PropItem").PropItemType;

