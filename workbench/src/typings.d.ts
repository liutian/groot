
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
  parentItem?: PropItem,

  // 分割线下面时界面属性
  highlight?: boolean,
  expandBlockIdList: number[],
  templateDesignMode?: boolean
} & Omit<import("../../cloud/src/entities/PropGroup").PropGroup, 'propBlockList' | 'parentItem'>;

/**
 * 描述代码元数据配置的属性配置块类型
 */
type PropBlock = {
  propItemList: PropItem[],
  group: PropGroup,

  // 分割线下面时界面属性
  highlight?: boolean,
  // 保存首要显示的PropItem ID
  listStructData: number[],
  // 首要显示的PropItem
  primaryShowPropItemList: PropItem[]
} & Omit<import("../../cloud/src/entities/PropBlock").PropBlock, 'propItemList' | 'listStructData' | 'group'>;

/**
 * 描述代码元数据配置的属性配置项类型
 */
type PropItem = {
  childGroup?: PropGroup,
  block: PropBlock,
  groupId: number,
  childGroupId?: number,

  // 分割线下面时界面属性
  highlight?: boolean,
  optionList: PropValueOption[],
  extraUIData?: {
    type: 'BlockListPrefs',
    data?: any
  },
  defaultValue: any,
  // 上级block struct为List时，所有分组valueId
  valueList: PropValue[],
  tempAbstractValueId: number,
  noSetting: boolean
} & Omit<import("../../cloud/src/entities/PropItem").PropItem, 'childGroup' | 'block'>;

type PropValueOption = {
  label: string,
  value: string,
  title?: string,
  icon?: string
};

type ComponentVersion = {
  groupList: PropGroup[],
  blockList: PropBlock[],
  itemList: PropItem[],
  valueList: PropValue[]
} & Omit<import("../../cloud/src/entities/ComponentVersion").ComponentVersion, 'groupList' | 'blockList' | 'itemList' | 'valueList'>;

type ComponentInstance = {
  component: Component,
  componentVersion: ComponentVersion,

  groupList: PropGroup[],
  blockList: PropBlock[],
  itemList: PropItem[],
  valueList: PropValue[]
} & Omit<import("../../cloud/src/entities/ComponentInstance").ComponentInstance, 'valueList'>;

type Release = {
  instanceList: ComponentInstance[]
} & Omit<import("../../cloud/src/entities/Release").Release, ''>;

type PropValue = {

} & Omit<import("../../cloud/src/entities/PropValue").PropValue, ''>;

type Component = {
  version: ComponentVersion,
  instance: ComponentInstance,
  recentVersionId: number,

  versionList: ComponentVersion[],
  groupList: PropGroup[],
  blockList: PropBlock[],
  itemList: PropItem[],
  valueList: PropValue[]
} & Omit<import("../../cloud/src/entities/Component").Component, 'version'>;

type Application = {

  release: Release
} & Omit<import("../../cloud/src/entities/Application").Application, ''>;

type Scaffold = {

  componentList: Component[]
} & Omit<import("../../cloud/src/entities/Scaffold").Scaffold, ''>;



