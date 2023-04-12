import { ExtensionStatus } from "./enum";
import { ExtScriptModule } from "./extension";

/**
 * 属性配置组
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
 * 属性配置块
 */
export type PropBlock = {
  propItemList: PropItem[],
  group: PropGroup,
  // 保存首要显示的PropItem ID
  listStructData: number[],

  // ************************** 分割线已下是界面属性 **************************
  highlight?: boolean,
} & Omit<import("../../cloud/src/entities/PropBlock").PropBlock, 'propItemList' | 'listStructData' | 'group'>;

/**
 * 属性配置项
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
} & Omit<import("../../cloud/src/entities/ComponentInstance").ComponentInstance, 'component' | 'componentVersion' | 'groupList' | 'blockList' | 'itemList' | 'valueList' | 'stateList'>;

export type Release = {

} & Omit<import("../../cloud/src/entities/Release").Release, ''>;

export type PropValue = {

} & Omit<import("../../cloud/src/entities/PropValue").PropValue, ''>;

export type State = {

  // ************************** 分割线已下是界面属性 **************************
  isReadonly: boolean
} & Omit<import("../../cloud/src/entities/State").State, 'componentInstance' | 'release'>;

export type Component = {
  componentVersion: ComponentVersion,
  versionList: ComponentVersion[],
  groupList: PropGroup[],
  blockList: PropBlock[],
  itemList: PropItem[],
  valueList: PropValue[],

  recentVersionId: number,
  componentVersionId: number,
  // ************************** 分割线已下是界面属性 **************************
  propTree: PropGroup[]
} & Omit<import("../../cloud/src/entities/Component").Component, 'componentVersion' | 'groupList' | 'blockList' | 'itemList' | 'valueList' | 'versionList'>;

export type Application = {
  extensionInstanceList: ExtensionInstance[]

  // ************************** 分割线已下是界面属性 **************************
} & Omit<import("../../cloud/src/entities/Application").Application, ''>;

export type Organization = {

} & Omit<import("../../cloud/src/entities/Organization").Organization, ''>;

export type Deploy = {

} & Omit<import("../../cloud/src/entities/Deploy").Deploy, ''>;

export type Extension = {

} & Omit<import("../../cloud/src/entities/Extension").Extension, ''>;


export type ExtensionVersion = {

} & Omit<import("../../cloud/src/entities/ExtensionVersion").ExtensionVersion, ''>;

export type ExtensionInstance = {
  extension: Extension,
  extensionVersion: ExtensionVersion,

  // ************************** 分割线已下是界面属性 **************************
  status: ExtensionStatus,
  propItemPipeline: ExtScriptModule
} & Omit<import("../../cloud/src/entities/ExtensionInstance").ExtensionInstance, ''>;

export type Solution = {
  extensionInstanceList: ExtensionInstance[]

  // ************************** 分割线已下是界面属性 **************************
} & Omit<import("../../cloud/src/entities/Solution").Solution, ''>;

export type SolutionVersion = {

} & Omit<import("../../cloud/src/entities/SolutionVersion").SolutionVersion, ''>;

export type SolutionInstance = {

  extensionInstanceList: ExtensionInstance[]
} & Omit<import("../../cloud/src/entities/SolutionInstance").SolutionInstance, ''>;


