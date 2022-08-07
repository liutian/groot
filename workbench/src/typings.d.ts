
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
  layout: 'horizontal' | 'vertical',
  struct: 'list' | 'default',
  group: PropGroup,

  // 分割线下面时界面属性
  highlight?: boolean,
  // 保存首要显示的PropItem ID
  listStructData: number[],
  // 首要显示的PropItem
  primaryShowPropItemList: PropItem[]
} & Omit<import("../../cloud/src/entities/PropBlock").PropBlock, 'propItemList' | 'layout' | 'struct' | 'listStructData' | 'group'>;

/**
 * 描述代码元数据配置的属性配置项类型
 */
type PropItem = {
  childGroup?: PropGroup,
  type: 'text' | 'textarea' | 'number' | 'slider' | 'button_group' | 'switch' | 'select' | 'radio' | 'checkbox' | 'date_picker' | 'time_picker' | 'hierarchy' | 'flat' | 'json' | 'function',
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
  parentPropValueId: number,
  noSetting: boolean
} & Omit<import("../../cloud/src/entities/PropItem").PropItem, 'type' | 'childGroup' | 'block'>;

type PropValueOption = {
  label: string,
  value: PropItemType,
  title?: string,
  icon?: string
};

type ComponentVersion = {
  groupList: PropGroup[],
  blockList: PropBlock[],
  itemList: PropItem[],
  valueList: PropValue[]
} & Omit<import("../../cloud/src/entities/ComponentVersion").ComponentVersion, 'groupList' | 'blockList' | 'itemList'>;

type ComponentInstance = {

} & Omit<import("../../cloud/src/entities/ComponentInstance").ComponentInstance, ''>;

type Release = {
  instanceList: ComponentInstance[]
} & Omit<import("../../cloud/src/entities/Release").Release, ''>;

type PropValue = {

} & Omit<import("../../cloud/src/entities/PropValue").PropValue, ''>;

type Component = {
  version: ComponentVersion,
  recentVersionId: number

  versionList: ComponentVersion[]
} & Omit<import("../../cloud/src/entities/Component").Component, 'version'>;

type Application = {

  release: Release
} & Omit<import("../../cloud/src/entities/Application").Application, ''>;

type Scaffold = {

  componentList: Component[]
} & Omit<import("../../cloud/src/entities/Scaffold").Scaffold, ''>;



