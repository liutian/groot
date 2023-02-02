
/**
 * 描述代码元数据配置的属性分组类型
 */
export type PropGroup = {
  propBlockList: PropBlock[],
  parentItem?: PropItem,

  // ************************** 分割线已下是界面属性 **************************
  highlight?: boolean,
  expandBlockIdList: number[],
  templateDesignMode?: boolean
} & Omit<import("../../cloud/src/entities/PropGroup").PropGroup, 'propBlockList' | 'parentItem'>;

/**
 * 描述代码元数据配置的属性配置块类型
 */
export type PropBlock = {
  propItemList: PropItem[],
  group: PropGroup,
  // 保存首要显示的PropItem ID
  listStructData: number[],

  // ************************** 分割线已下是界面属性 **************************
  highlight?: boolean,
  // 首要显示的PropItem
  primaryShowPropItemList: PropItem[]
} & Omit<import("../../cloud/src/entities/PropBlock").PropBlock, 'propItemList' | 'listStructData' | 'group'>;

/**
 * 描述代码元数据配置的属性配置项类型
 */
export type PropItem = {
  childGroup?: PropGroup,
  block: PropBlock,
  defaultValue: any,

  groupId: number,
  childGroupId?: number,
  // ************************** 分割线已下是界面属性 **************************
  highlight?: boolean,
  optionList: PropValueOption[],
  extraUIData?: {
    type: 'BlockListPrefs',
    data?: any
  },
  // 上级block struct为List时，所有分组valueId
  valueList: PropValue[],
  tempAbstractValueId: number,
  noSetting: boolean
} & Omit<import("../../cloud/src/entities/PropItem").PropItem, 'childGroup' | 'block' | 'defaultValue'>;

export type PropValueOption = {
  label: string,
  value: string,
  title?: string,
  icon?: string
};

export type ComponentVersion = {

} & Omit<import("../../cloud/src/entities/ComponentVersion").ComponentVersion, ''>;

export type ComponentInstance = {
  component: Component,
  componentVersion: ComponentVersion,
  groupList: PropGroup[],
  blockList: PropBlock[],
  itemList: PropItem[],
  valueList: PropValue[],
  stateList: State[],

  // ************************** 分割线已下是界面属性 **************************
  propTree: PropGroup[],
  empty: boolean
} & Omit<import("../../cloud/src/entities/ComponentInstance").ComponentInstance, 'component' | 'componentVersion' | 'groupList' | 'blockList' | 'itemList' | 'valueList'>;

export type Release = {
  instanceList: ComponentInstance[]
} & Omit<import("../../cloud/src/entities/Release").Release, ''>;

export type PropValue = {

} & Omit<import("../../cloud/src/entities/PropValue").PropValue, ''>;

export type State = {
  isRuntime?: boolean
} & Omit<import("../../cloud/src/entities/State").State, 'componentInstance' | 'release'>;

export type Component = {
  componentVersion: ComponentVersion,
  versionList: ComponentVersion[],
  groupList: PropGroup[],
  blockList: PropBlock[],
  itemList: PropItem[],
  valueList: PropValue[],
  recentVersionId: number,

  componentId: number
} & Omit<import("../../cloud/src/entities/Component").Component, 'componentVersion' | 'groupList' | 'blockList' | 'itemList' | 'valueList' | 'versionList'>;

export type Application = {
  release: Release,
  extensionList: Extension[]
} & Omit<import("../../cloud/src/entities/Application").Application, ''>;

export type Organization = {
  componentList: Component[],
  extensionList: Extension[]
} & Omit<import("../../cloud/src/entities/Organization").Organization, ''>;

export type Deploy = {
} & Omit<import("../../cloud/src/entities/Deploy").Deploy, ''>;

export type Extension = {
} & Omit<import("../../cloud/src/entities/Extension").Extension, ''>;
